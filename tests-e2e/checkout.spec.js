import { test, expect } from '@playwright/test';

test.describe('Mobile E-Commerce Flow (390px Viewport)', () => {
  test('Complete Customer Journey: Browse -> PDP -> Cart -> Checkout (COD) -> Order Success', async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('response', (res) => {
      if (res.url().includes('/api/')) console.log('API RESPONSE:', res.url(), res.status());
    });

    // 1. Visit Home Page
    await page.goto('/');
    await expect(page).toHaveTitle(/KurtiKatha/i);

    // 2. Navigate to Shop Catalog
    await page.goto('/shop');
    await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 });

    // Click on the first product card
    const firstProductLink = page.locator('a[href*="/product/"]').first();
    await expect(firstProductLink).toBeVisible();
    await firstProductLink.click();

    // 3. Product Detail Page
    await page.waitForURL(/\/product\//, { timeout: 10000 });
    await expect(page.locator('text=₹').first()).toBeVisible();

    // Select size if size button exists
    const sizeBtn = page.locator('button:has-text("M"), button:has-text("S"), button:has-text("Free Size")').first();
    if (await sizeBtn.isVisible()) {
      await sizeBtn.click();
    }

    // Click "Add to Bag" from the mobile sticky bottom bar
    const mobileAddBtn = page.locator('div.fixed button:has-text("Add to Bag"), button:visible:has-text("Add to Bag")').first();
    await expect(mobileAddBtn).toBeVisible({ timeout: 5000 });
    await mobileAddBtn.click();

    // 4. Cart Drawer opens -> Click "Proceed to Checkout"
    const checkoutBtn = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutBtn).toBeVisible({ timeout: 8000 });
    await checkoutBtn.click();

    // 5. Checkout Page
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await expect(page.locator('text=Choose Payment Method')).toBeVisible();

    // Fill customer shipping details
    await page.fill('input[name="name"]', 'Priya Sen');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="email"]', 'priya.sen@example.com');
    await page.fill('input[name="pincode"]', '700029');
    await page.fill('input[name="addressLine"]', '12 Lake View Road, Ballygunge');
    await page.fill('input[name="city"]', 'Kolkata');
    await page.fill('input[name="state"]', 'West Bengal');

    // Select Cash on Delivery by clicking the label
    await page.locator('label:has-text("Cash on Delivery")').click();
    await page.waitForTimeout(500);

    // Submit order
    const submitBtn = page.getByRole('button', { name: /Confirm COD Order/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    // 6. Verify Order Confirmation Page
    await page.waitForURL(/\/order-success\//, { timeout: 20000 });
    await expect(page.locator('text=Order Confirmed').first()).toBeVisible();
    await expect(page.locator('text=KK-')).toBeVisible();
    await expect(page.locator('text=Priya Sen')).toBeVisible();
  });
});
