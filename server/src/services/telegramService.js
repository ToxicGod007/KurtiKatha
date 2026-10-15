import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Settings } from '../models/Settings.js';
import { restoreStock } from './stockService.js';

let isPolling = false;
let pollingAbortController = null;

/**
 * Returns authorized admin chat IDs from environment variable
 */
export function getAuthorizedChatIds() {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Check if a given chat ID is authorized to access admin commands and alerts
 */
export function isAuthorizedChat(chatId) {
  const allowed = getAuthorizedChatIds();
  if (!allowed.length) return false;
  return allowed.includes(String(chatId));
}

/**
 * Low-level Telegram Bot API caller using native fetch
 */
export async function callTelegramApi(method, body = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn(`[Telegram API Error] ${method}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[Telegram Network Error] ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Send an HTML formatted message to a specific Telegram chat
 */
export async function sendTelegramMessage(chatId, text, options = {}) {
  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options,
  });
}

/**
 * Broadcast an HTML message to all authorized admin chats
 */
export async function broadcastToAdmins(text, options = {}) {
  const chatIds = getAuthorizedChatIds();
  if (!chatIds.length) {
    console.log('[Telegram] No TELEGRAM_ADMIN_CHAT_ID configured. Alert skipped.');
    return [];
  }

  const results = [];
  for (const chatId of chatIds) {
    const res = await sendTelegramMessage(chatId, text, options);
    results.push(res);
  }
  return results;
}

/**
 * Edit an existing message's text and inline buttons
 */
export async function editMessageText(chatId, messageId, text, options = {}) {
  return await callTelegramApi('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options,
  });
}

/**
 * Acknowledge an inline keyboard callback query
 */
export async function answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
  return await callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

/**
 * Build inline action buttons for an order
 */
export function buildOrderActionButtons(orderId, currentStatus) {
  const buttons = [];
  const row1 = [];
  const row2 = [];

  if (currentStatus !== 'processing' && currentStatus !== 'delivered' && currentStatus !== 'cancelled') {
    row1.push({ text: '📦 Processing', callback_data: `ord_processing_${orderId}` });
  }
  if (currentStatus !== 'shipped' && currentStatus !== 'delivered' && currentStatus !== 'cancelled') {
    row1.push({ text: '🚚 Shipped', callback_data: `ord_shipped_${orderId}` });
  }
  if (currentStatus !== 'delivered' && currentStatus !== 'cancelled') {
    row2.push({ text: '✅ Delivered', callback_data: `ord_delivered_${orderId}` });
  }
  if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
    row2.push({ text: '❌ Cancel', callback_data: `ord_cancelled_${orderId}` });
  }

  if (row1.length) buttons.push(row1);
  if (row2.length) buttons.push(row2);

  return { inline_keyboard: buttons };
}

/**
 * Format a rich order summary message
 */
export function formatOrderCard(order) {
  const methodLabel = order.payment?.method === 'cod' ? '💵 Cash on Delivery' : '💳 Razorpay Prepaid';
  const paymentStatus = order.payment?.status?.toUpperCase() || 'PENDING';
  const orderStatus = order.orderStatus?.toUpperCase() || 'PLACED';

  const itemsList = (order.items || [])
    .map((it, idx) => {
      const variantInfo = it.variant?.size ? ` [Size: ${it.variant.size}]` : '';
      return `  ${idx + 1}. <b>${it.title}</b>${variantInfo}\n     └ Qty: ${it.quantity} × ₹${it.price} = <b>₹${it.subtotal || it.quantity * it.price}</b>`;
    })
    .join('\n');

  const address = order.shippingAddress || {};
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Just now';

  return `🛍 <b>KURTIKATHA ORDER ALERT</b>
━━━━━━━━━━━━━━━━━━━━
<b>Order ID:</b> <code>${order.orderNumber}</code>
<b>Date:</b> ${dateStr} IST
<b>Status:</b> <b>${orderStatus}</b> | Payment: <b>${paymentStatus}</b>

<b>👤 Customer:</b>
• Name: <b>${address.name || 'N/A'}</b>
• Phone: <code>${address.phone || 'N/A'}</code>
• Delivery Address:
  ${address.addressLine || ''}${address.locality ? `, ${address.locality}` : ''}
  ${address.city || ''}, ${address.state || ''} - <code>${address.pincode || ''}</code>

<b>📦 Ordered Items:</b>
${itemsList}

<b>💰 Price Breakdown:</b>
• Subtotal: ₹${order.amounts?.subtotal || 0}
• Discount: -₹${order.amounts?.discount || 0}
• Shipping: ${order.amounts?.shippingFee === 0 ? 'FREE' : `₹${order.amounts?.shippingFee || 0}`}
• <b>Grand Total: ₹${order.amounts?.total || 0}</b> (${methodLabel})
━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Send real-time New Order Alert to Telegram Admins
 */
export async function sendTelegramNewOrderAlert(order) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const text = formatOrderCard(order);
  const replyMarkup = buildOrderActionButtons(order._id, order.orderStatus);

  try {
    await broadcastToAdmins(text, { reply_markup: replyMarkup });
  } catch (err) {
    console.error('[Telegram Alert Error]:', err.message);
  }
}

/**
 * Send real-time Low Stock Alert to Telegram Admins
 */
export async function sendTelegramLowStockAlert(productTitle, size, remainingStock) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const urgency = remainingStock === 0 ? '🚨 <b>OUT OF STOCK!</b>' : '⚠️ <b>LOW INVENTORY WARNING</b>';
  const text = `${urgency}
━━━━━━━━━━━━━━━━━━━━
<b>Product:</b> <b>${productTitle}</b>
<b>Variant:</b> Size <code>${size}</code>
<b>Stock Remaining:</b> <b>${remainingStock}</b> unit(s)

<i>Update inventory in your KurtiKatha Admin Panel to avoid missed orders.</i>`;

  try {
    await broadcastToAdmins(text);
  } catch (err) {
    console.error('[Telegram Low Stock Alert Error]:', err.message);
  }
}

/**
 * Send real-time Payment Event Alert to Telegram Admins
 */
export async function sendTelegramPaymentAlert({ orderNumber, amount, method, status, note }) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const text = `💳 <b>PAYMENT NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━━
<b>Order:</b> <code>#${orderNumber}</code>
<b>Amount:</b> <b>₹${amount}</b>
<b>Method:</b> ${method || 'Razorpay'}
<b>Status:</b> <b>${status.toUpperCase()}</b>
${note ? `<b>Note:</b> ${note}\n` : ''}━━━━━━━━━━━━━━━━━━━━`;

  try {
    await broadcastToAdmins(text);
  } catch (err) {
    console.error('[Telegram Payment Alert Error]:', err.message);
  }
}

/**
 * Handle incoming admin commands
 */
export async function handleTelegramMessage(message) {
  const chatId = message.chat?.id;
  const text = (message.text || '').trim();
  const userName = message.from?.first_name || 'Admin';

  if (!chatId) return;

  // 1. Authorization check
  if (!isAuthorizedChat(chatId)) {
    const unauthorizedReply = `🔒 <b>Unauthorized Access</b>

Hello ${userName}, this KurtiKatha Admin Bot is restricted to authorized administrators.

Your Telegram Chat ID is:
<code>${chatId}</code>

<b>To authorize this chat:</b>
Add your Chat ID to your server's <code>.env</code> file:
<code>TELEGRAM_ADMIN_CHAT_ID=${chatId}</code>

Then restart your server to gain full remote admin access.`;
    return await sendTelegramMessage(chatId, unauthorizedReply);
  }

  const [rawCommand, ...args] = text.split(/\s+/);
  const command = rawCommand.toLowerCase();

  // 2. /start or /help
  if (command === '/start' || command === '/help') {
    const helpText = `🌸 <b>KurtiKatha Admin Bot Console</b>
Welcome back, ${userName}! Manage your boutique remotely directly from Telegram.

<b>Available Commands:</b>
📊 /stats - Today's sales, revenue & order metrics
📦 /orders - View recent 5 store orders
🔍 /order &lt;number&gt; - Inspect specific order details
✏️ /status &lt;order_id&gt; &lt;new_status&gt; - Update order status
⚠️ /lowstock - Check products running low on inventory
💵 /togglecod - Enable or disable Cash on Delivery
🏪 /togglestore - Open or close the online storefront
❓ /help - Show this command menu

<i>You will also receive instant alerts here whenever a customer places an order or inventory runs low.</i>`;
    return await sendTelegramMessage(chatId, helpText);
  }

  // 3. /stats or /today
  if (command === '/stats' || command === '/today') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayOrders, allTimeCount, settings] = await Promise.all([
        Order.find({ createdAt: { $gte: today } }),
        Order.countDocuments(),
        Settings.findOne(),
      ]);

      const todayRevenue = todayOrders
        .filter((o) => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (o.amounts?.total || 0), 0);

      const placedCount = todayOrders.filter((o) => o.orderStatus === 'placed').length;
      const processingCount = todayOrders.filter((o) => o.orderStatus === 'processing').length;
      const shippedCount = todayOrders.filter((o) => o.orderStatus === 'shipped').length;
      const deliveredCount = todayOrders.filter((o) => o.orderStatus === 'delivered').length;

      const statsText = `📊 <b>STORE PERFORMANCE METRICS</b>
━━━━━━━━━━━━━━━━━━━━
<b>📅 Today's Performance (${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}):</b>
• Orders Placed Today: <b>${todayOrders.length}</b>
• Revenue Today: <b>₹${todayRevenue.toLocaleString('en-IN')}</b>

<b>📦 Today's Order Breakdown:</b>
• New / Placed: <b>${placedCount}</b>
• In Processing: <b>${processingCount}</b>
• In Transit (Shipped): <b>${shippedCount}</b>
• Completed (Delivered): <b>${deliveredCount}</b>

<b>🏪 Store Status:</b>
• Total Lifetime Orders: <b>${allTimeCount}</b>
• Cash on Delivery: <b>${settings?.codEnabled ? '✅ ACTIVE' : '❌ DISABLED'}</b>
• Storefront Status: <b>${settings?.isStoreOpen ? '🟢 OPEN' : '🔴 CLOSED'}</b>
━━━━━━━━━━━━━━━━━━━━`;
      return await sendTelegramMessage(chatId, statsText);
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Error fetching statistics: ${err.message}`);
    }
  }

  // 4. /orders
  if (command === '/orders') {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
      if (!orders.length) {
        return await sendTelegramMessage(chatId, '📦 No orders found in the database yet.');
      }

      for (const order of orders) {
        const text = formatOrderCard(order);
        const replyMarkup = buildOrderActionButtons(order._id, order.orderStatus);
        await sendTelegramMessage(chatId, text, { reply_markup: replyMarkup });
      }
      return;
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Error retrieving orders: ${err.message}`);
    }
  }

  // 5. /order <number>
  if (command === '/order') {
    const query = args[0];
    if (!query) {
      return await sendTelegramMessage(chatId, 'Usage: <code>/order KK-20261015-123456</code>');
    }

    try {
      const order = await Order.findOne({
        $or: [
          { orderNumber: query.trim() },
          { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null },
        ],
      });

      if (!order) {
        return await sendTelegramMessage(chatId, `❌ Order <code>${query}</code> not found.`);
      }

      const text = formatOrderCard(order);
      const replyMarkup = buildOrderActionButtons(order._id, order.orderStatus);
      return await sendTelegramMessage(chatId, text, { reply_markup: replyMarkup });
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Error: ${err.message}`);
    }
  }

  // 6. /status <orderNumber> <newStatus>
  if (command === '/status') {
    const [orderQuery, newStatusRaw] = args;
    if (!orderQuery || !newStatusRaw) {
      return await sendTelegramMessage(
        chatId,
        'Usage: <code>/status &lt;order_number&gt; &lt;new_status&gt;</code>\nValid statuses: <code>placed</code>, <code>processing</code>, <code>shipped</code>, <code>delivered</code>, <code>cancelled</code>'
      );
    }

    const newStatus = newStatusRaw.toLowerCase();
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'pending_payment'];
    if (!validStatuses.includes(newStatus)) {
      return await sendTelegramMessage(
        chatId,
        `❌ Invalid status: <code>${newStatus}</code>.\nValid options: ${validStatuses.map((s) => `<code>${s}</code>`).join(', ')}`
      );
    }

    try {
      const order = await Order.findOne({
        $or: [
          { orderNumber: orderQuery.trim() },
          { _id: orderQuery.match(/^[0-9a-fA-F]{24}$/) ? orderQuery : null },
        ],
      });

      if (!order) {
        return await sendTelegramMessage(chatId, `❌ Order <code>${orderQuery}</code> not found.`);
      }

      const prevStatus = order.orderStatus;
      order.orderStatus = newStatus;
      order.statusHistory.push({
        status: newStatus,
        note: `Status updated remotely from Telegram by ${userName}`,
        updatedBy: `telegram_${chatId}`,
      });

      if (newStatus === 'cancelled' && prevStatus !== 'cancelled') {
        await restoreStock(order.items);
      }

      await order.save();

      return await sendTelegramMessage(
        chatId,
        `✅ Order <code>${order.orderNumber}</code> status updated:\n<b>${prevStatus.toUpperCase()}</b> ➔ <b>${newStatus.toUpperCase()}</b>`
      );
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Failed to update status: ${err.message}`);
    }
  }

  // 7. /lowstock
  if (command === '/lowstock') {
    try {
      const products = await Product.find({ 'variants.stock': { $lte: 5 } });
      const lowStockList = [];

      for (const prod of products) {
        for (const variant of prod.variants || []) {
          if (variant.stock <= 5) {
            lowStockList.push({
              title: prod.title,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            });
          }
        }
      }

      if (!lowStockList.length) {
        return await sendTelegramMessage(chatId, '✅ <b>Inventory Healthy:</b> No products currently have stock below 5 units.');
      }

      const itemsText = lowStockList
        .slice(0, 15)
        .map((it) => `• <b>${it.title}</b> (${it.size}${it.color ? ` - ${it.color}` : ''}): <b>${it.stock}</b> left`)
        .join('\n');

      return await sendTelegramMessage(
        chatId,
        `⚠️ <b>LOW STOCK PRODUCTS (${lowStockList.length})</b>\n━━━━━━━━━━━━━━━━━━━━\n${itemsText}`
      );
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Error: ${err.message}`);
    }
  }

  // 8. /togglecod
  if (command === '/togglecod') {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }

      settings.codEnabled = !settings.codEnabled;
      await settings.save();

      const stateText = settings.codEnabled ? '✅ <b>ENABLED</b>' : '⏸ <b>DISABLED</b>';
      return await sendTelegramMessage(
        chatId,
        `💵 Cash on Delivery (COD) is now ${stateText}.\nShoppers ${settings.codEnabled ? 'can now' : 'can no longer'} place COD orders.`
      );
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Failed to toggle COD: ${err.message}`);
    }
  }

  // 9. /togglestore
  if (command === '/togglestore') {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }

      settings.isStoreOpen = !settings.isStoreOpen;
      await settings.save();

      const stateText = settings.isStoreOpen ? '🟢 <b>OPEN</b>' : '🔴 <b>CLOSED</b>';
      return await sendTelegramMessage(
        chatId,
        `🏪 Storefront is now ${stateText}.`
      );
    } catch (err) {
      return await sendTelegramMessage(chatId, `❌ Failed to toggle store state: ${err.message}`);
    }
  }

  // Unknown command fallback
  return await sendTelegramMessage(
    chatId,
    `❓ Unrecognized command: <code>${text}</code>\nType /help to see all available admin commands.`
  );
}

/**
 * Handle inline button tap callbacks
 */
export async function handleTelegramCallback(callbackQuery) {
  const queryId = callbackQuery.id;
  const chatId = callbackQuery.message?.chat?.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data || '';

  if (!chatId || !isAuthorizedChat(chatId)) {
    return await answerCallbackQuery(queryId, 'Unauthorized chat.', true);
  }

  // Match pattern: ord_<status>_<orderId>
  const match = data.match(/^ord_([a-z_]+)_([0-9a-fA-F]{24})$/);
  if (!match) {
    return await answerCallbackQuery(queryId, 'Unknown action.');
  }

  const [, newStatus, orderId] = match;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return await answerCallbackQuery(queryId, 'Order not found in database.', true);
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: `Updated to ${newStatus} via Telegram inline button`,
      updatedBy: `telegram_btn_${chatId}`,
    });

    if (newStatus === 'cancelled' && prevStatus !== 'cancelled') {
      await restoreStock(order.items);
    }

    await order.save();

    await answerCallbackQuery(queryId, `Order #${order.orderNumber} marked as ${newStatus.toUpperCase()}`);

    // Update message text and buttons in-place
    const updatedText = formatOrderCard(order);
    const updatedButtons = buildOrderActionButtons(order._id, order.orderStatus);
    await editMessageText(chatId, messageId, updatedText, { reply_markup: updatedButtons });
  } catch (err) {
    console.error('[Telegram Callback Error]:', err.message);
    await answerCallbackQuery(queryId, `Error: ${err.message}`, true);
  }
}

/**
 * Long-polling loop for receiving Telegram Bot updates without needing a webhook domain
 */
export async function startTelegramPolling() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('[Telegram Bot] TELEGRAM_BOT_TOKEN not provided. Bot service is inactive.');
    return;
  }

  if (isPolling) {
    return;
  }

  isPolling = true;
  pollingAbortController = new AbortController();
  let offset = 0;

  console.log('[Telegram Bot] Starting long polling for admin commands...');

  // Delete any existing webhook to ensure long-polling works smoothly
  await callTelegramApi('deleteWebhook', { drop_pending_updates: false });

  (async () => {
    while (isPolling) {
      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
        const res = await fetch(url, { signal: pollingAbortController.signal });
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;

            if (update.message) {
              await handleTelegramMessage(update.message);
            } else if (update.callback_query) {
              await handleTelegramCallback(update.callback_query);
            }
          }
        } else if (!data.ok) {
          // If token is invalid or rate limited, wait a bit
          console.warn('[Telegram Polling Warning]:', data.description);
          await new Promise((r) => setTimeout(r, 5000));
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          break;
        }
        // Network drop recovery
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    console.log('[Telegram Bot] Polling loop terminated.');
  })();
}

/**
 * Stop Telegram polling cleanly
 */
export function stopTelegramPolling() {
  if (isPolling && pollingAbortController) {
    isPolling = false;
    pollingAbortController.abort();
    pollingAbortController = null;
  }
}

