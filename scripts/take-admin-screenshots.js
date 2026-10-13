import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/aritrabiswas/.gemini/antigravity/brain/db1af520-6ce7-4566-9ab7-fdfa98aab517/screenshots';
const LOCAL_DIR = path.resolve('docs/screenshots');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(LOCAL_DIR, { recursive: true });

async function capture() {
  console.log('Launching browser to capture Admin Panel screenshots...');
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile viewport (390px x 844px)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(500);

  // If login button is present, click it
  const loginBtnMobile = await mobilePage.$('button[type="submit"]');
  if (loginBtnMobile) {
    console.log('Logging in as admin on mobile...');
    await loginBtnMobile.click();
    await mobilePage.waitForTimeout(2000);
  }

  const mobileFile = 'phase5-mobile-390px.png';
  const mobileArtifactPath = path.join(ARTIFACT_DIR, mobileFile);
  const mobileLocalPath = path.join(LOCAL_DIR, mobileFile);

  await mobilePage.screenshot({ path: mobileArtifactPath, fullPage: false });
  fs.copyFileSync(mobileArtifactPath, mobileLocalPath);
  console.log(`Saved mobile screenshot: ${mobileArtifactPath}`);
  await mobileContext.close();

  // 2. Desktop viewport (1280px x 800px)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(500);

  const loginBtnDesktop = await desktopPage.$('button[type="submit"]');
  if (loginBtnDesktop) {
    console.log('Logging in as admin on desktop...');
    await loginBtnDesktop.click();
    await desktopPage.waitForTimeout(2000);
  }

  const desktopFile = 'phase5-desktop-1280px.png';
  const desktopArtifactPath = path.join(ARTIFACT_DIR, desktopFile);
  const desktopLocalPath = path.join(LOCAL_DIR, desktopFile);

  await desktopPage.screenshot({ path: desktopArtifactPath, fullPage: false });
  fs.copyFileSync(desktopArtifactPath, desktopLocalPath);
  console.log(`Saved desktop screenshot: ${desktopArtifactPath}`);

  // Also capture Products page on desktop for comprehensive artifact
  await desktopPage.goto('http://localhost:5173/admin/products', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);
  const productsFile = 'phase5-products-desktop-1280px.png';
  const productsArtifactPath = path.join(ARTIFACT_DIR, productsFile);
  await desktopPage.screenshot({ path: productsArtifactPath, fullPage: false });
  fs.copyFileSync(productsArtifactPath, path.join(LOCAL_DIR, productsFile));
  console.log(`Saved products desktop screenshot: ${productsArtifactPath}`);

  // Also capture Orders page on desktop
  await desktopPage.goto('http://localhost:5173/admin/orders', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);
  const ordersFile = 'phase5-orders-desktop-1280px.png';
  const ordersArtifactPath = path.join(ARTIFACT_DIR, ordersFile);
  await desktopPage.screenshot({ path: ordersArtifactPath, fullPage: false });
  fs.copyFileSync(ordersArtifactPath, path.join(LOCAL_DIR, ordersFile));
  console.log(`Saved orders desktop screenshot: ${ordersArtifactPath}`);

  await desktopContext.close();
  await browser.close();
  console.log('All Phase 5 screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing admin screenshots:', err);
  process.exit(1);
});
