import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  isAuthorizedChat,
  getAuthorizedChatIds,
  formatOrderCard,
  buildOrderActionButtons,
  handleTelegramMessage,
  sendTelegramNewOrderAlert,
  sendTelegramLowStockAlert,
} from '../src/services/telegramService.js';
import { Order } from '../src/models/Order.js';
import { Settings } from '../src/models/Settings.js';
import { Product } from '../src/models/Product.js';

describe('Telegram Bot Admin Service & Alerts Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: 'mock_test_token',
      TELEGRAM_ADMIN_CHAT_ID: '123456789,987654321',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  test('correctly parses authorized chat IDs list', () => {
    const ids = getAuthorizedChatIds();
    expect(ids).toEqual(['123456789', '987654321']);
  });

  test('authorization check allows authorized chat IDs and denies others', () => {
    expect(isAuthorizedChat('123456789')).toBe(true);
    expect(isAuthorizedChat(123456789)).toBe(true);
    expect(isAuthorizedChat('987654321')).toBe(true);
    expect(isAuthorizedChat('999999999')).toBe(false);
    expect(isAuthorizedChat('')).toBe(false);
  });

  test('formats order summary card with complete customer and items details', () => {
    const mockOrder = {
      orderNumber: 'KK-20261015-112233',
      orderStatus: 'placed',
      createdAt: new Date('2026-10-15T10:00:00Z'),
      payment: { method: 'cod', status: 'pending' },
      shippingAddress: {
        name: 'Aritra Biswas',
        phone: '9876543210',
        addressLine: '123 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700016',
      },
      items: [
        {
          title: 'Kashmiri Cotton Kurti',
          variant: { size: 'L' },
          quantity: 2,
          price: 599,
          subtotal: 1198,
        },
      ],
      amounts: {
        subtotal: 1198,
        discount: 100,
        shippingFee: 0,
        total: 1098,
      },
    };

    const card = formatOrderCard(mockOrder);
    expect(card).toContain('KK-20261015-112233');
    expect(card).toContain('Aritra Biswas');
    expect(card).toContain('9876543210');
    expect(card).toContain('Kashmiri Cotton Kurti');
    expect(card).toContain('₹1098');
    expect(card).toContain('Cash on Delivery');
  });

  test('builds appropriate action buttons based on order status', () => {
    const placedBtns = buildOrderActionButtons('6ad082e1d38bafbf3d1e05f3', 'placed');
    expect(placedBtns.inline_keyboard.length).toBeGreaterThanOrEqual(1);

    // Delivered orders cannot be cancelled or marked shipped
    const deliveredBtns = buildOrderActionButtons('6ad082e1d38bafbf3d1e05f3', 'delivered');
    expect(deliveredBtns.inline_keyboard.length).toBe(0);
  });

  test('unauthorized message politely rejects and provides chat ID instructions', async () => {
    // Mock global fetch
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ ok: true }),
    });

    await handleTelegramMessage({
      chat: { id: 555666777 },
      text: '/stats',
      from: { first_name: 'Stranger' },
    });

    expect(fetchSpy).toHaveBeenCalled();
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(requestBody.text).toContain('Unauthorized Access');
    expect(requestBody.text).toContain('555666777');
    expect(requestBody.text).toContain('TELEGRAM_ADMIN_CHAT_ID');
  });

  test('authorized /help command returns complete admin command menu', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ ok: true }),
    });

    await handleTelegramMessage({
      chat: { id: 123456789 },
      text: '/help',
      from: { first_name: 'Admin' },
    });

    expect(fetchSpy).toHaveBeenCalled();
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(requestBody.text).toContain('/stats');
    expect(requestBody.text).toContain('/orders');
    expect(requestBody.text).toContain('/lowstock');
    expect(requestBody.text).toContain('/togglecod');
  });

  test('authorized /togglecod command toggles COD state in Settings model', async () => {
    const mockSettings = {
      codEnabled: true,
      save: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(Settings, 'findOne').mockResolvedValue(mockSettings);

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ ok: true }),
    });

    await handleTelegramMessage({
      chat: { id: 123456789 },
      text: '/togglecod',
      from: { first_name: 'Admin' },
    });

    expect(mockSettings.codEnabled).toBe(false);
    expect(mockSettings.save).toHaveBeenCalled();
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(requestBody.text).toContain('DISABLED');
  });

  test('fails gracefully when TELEGRAM_BOT_TOKEN is missing without throwing errors', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '';
    // Neither of these should throw or reject
    await expect(sendTelegramNewOrderAlert({ amounts: { total: 500 } })).resolves.not.toThrow();
    await expect(sendTelegramLowStockAlert('Cotton Kurti', 'M', 2)).resolves.not.toThrow();
  });
});
