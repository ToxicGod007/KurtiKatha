import { describe, test, expect, jest } from '@jest/globals';
import { generateUniqueOrderNumber } from '../src/controllers/paymentController.js';
import { Order } from '../src/models/Order.js';

describe('Unique Order Number Generation Tests', () => {
  test('generates order number with KK-YYYYMMDD-XXXXXX format', async () => {
    // Mock Order.exists to return false (no collision)
    jest.spyOn(Order, 'exists').mockResolvedValue(false);

    const orderNumber = await generateUniqueOrderNumber();
    expect(orderNumber).toMatch(/^KK-\d{8}-\d{6}$/);

    Order.exists.mockRestore();
  });

  test('successive calls generate distinct order numbers', async () => {
    jest.spyOn(Order, 'exists').mockResolvedValue(false);

    const set = new Set();
    for (let i = 0; i < 50; i++) {
      const num = await generateUniqueOrderNumber();
      set.add(num);
    }
    // High entropy: 50 distinct numbers
    expect(set.size).toBe(50);

    Order.exists.mockRestore();
  });

  test('avoids collision when candidate number already exists in DB', async () => {
    let callCount = 0;
    // Simulate first candidate already exists, second candidate is free
    jest.spyOn(Order, 'exists').mockImplementation(async () => {
      callCount++;
      return callCount === 1; // Collision on 1st attempt, success on 2nd
    });

    const orderNumber = await generateUniqueOrderNumber();
    expect(orderNumber).toMatch(/^KK-\d{8}-\d{6}$/);
    expect(callCount).toBe(2);

    Order.exists.mockRestore();
  });
});

