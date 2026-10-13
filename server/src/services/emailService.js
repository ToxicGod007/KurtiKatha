import nodemailer from 'nodemailer';

export async function sendOrderConfirmationEmail(order) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  const emailSubject = `Order Confirmed! ${order.orderNumber} - KurtiKatha (কুর্টিকথা)`;
  const customerEmail = order.guestInfo?.email || order.user?.email;
  const customerName = order.shippingAddress?.name || order.guestInfo?.name || 'Valued Customer';

  const itemsListHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0e7df;">${item.title} (Size: ${item.variant.size})</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0e7df; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0e7df; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0e7df; text-align: right;">₹${item.subtotal}</td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1E1E24; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #D62828; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Kurti<span style="color: #E9C46A;">কথা</span></h1>
        <p style="margin: 8px 0 0; font-size: 14px;">Thank you for your order!</p>
      </div>
      <div style="padding: 24px;">
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your order <strong>#${order.orderNumber}</strong> has been received and confirmed. We are preparing your pieces with love in Kolkata.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #FAF6ED; color: #D62828;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 8px; text-align: right;">₹${order.amounts.subtotal}</td>
            </tr>
            ${
              order.amounts.discount > 0
                ? `<tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: green;">Discount:</td>
                    <td style="padding: 8px; text-align: right; color: green;">-₹${order.amounts.discount}</td>
                  </tr>`
                : ''
            }
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right;">Shipping:</td>
              <td style="padding: 8px; text-align: right;">${order.amounts.shippingFee === 0 ? 'FREE' : `₹${order.amounts.shippingFee}`}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; font-size: 15px; color: #D62828;">Grand Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 15px; color: #D62828;">₹${order.amounts.total}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #FAF6ED; padding: 16px; border-radius: 8px; margin-top: 20px; font-size: 12px;">
          <h4 style="margin: 0 0 8px; color: #D62828;">Shipping Address:</h4>
          <p style="margin: 0;">${order.shippingAddress.name}</p>
          <p style="margin: 0;">${order.shippingAddress.addressLine}, ${order.shippingAddress.locality || ''}</p>
          <p style="margin: 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          <p style="margin: 4px 0 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #666;">
          For any order queries, WhatsApp or call us at <strong>+91 86974 49885</strong>.
        </p>
      </div>
      <div style="background-color: #1E1E24; color: #fff; padding: 12px; text-align: center; font-size: 11px;">
        © ${new Date().getFullYear()} KurtiKatha (কুর্টিকথা) • Handcrafted Indian Wear
      </div>
    </div>
  `;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_USER !== 'support@kurtikatha.com') {
    try {
      const transporter = nodemailer.createTransporter({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10) || 587,
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: EMAIL_FROM || 'KurtiKatha <orders@kurtikatha.com>',
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Email] Order confirmation sent successfully to ${customerEmail}`);
    } catch (err) {
      console.error(`[Email Error] Failed to send email to ${customerEmail}:`, err.message);
    }
  } else {
    console.log(`[Email Mock] Order confirmation generated for order #${order.orderNumber} to ${customerEmail || 'customer'}`);
  }
}

