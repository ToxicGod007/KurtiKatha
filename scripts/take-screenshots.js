import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/aritrabiswas/.gemini/antigravity/brain/db1af520-6ce7-4566-9ab7-fdfa98aab517/screenshots';
const LOCAL_DIR = path.resolve('docs/screenshots');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(LOCAL_DIR, { recursive: true });

async function capture() {
  const phase = process.argv[2] || 'phase1';
  const url = process.argv[3] || 'http://localhost:5173';

  console.log(`Launching browser to capture screenshots for ${phase} at ${url}...`);
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile viewport (390px x 844px - iPhone 12/13/14 standard mobile width)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1000); // Allow fonts and animations to settle

  const mobileFile = `${phase}-mobile-390px.png`;
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
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);

  const desktopFile = `${phase}-desktop-1280px.png`;
  const desktopArtifactPath = path.join(ARTIFACT_DIR, desktopFile);
  const desktopLocalPath = path.join(LOCAL_DIR, desktopFile);

  await desktopPage.screenshot({ path: desktopArtifactPath, fullPage: false });
  fs.copyFileSync(desktopArtifactPath, desktopLocalPath);
  console.log(`Saved desktop screenshot: ${desktopArtifactPath}`);
  await desktopContext.close();

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

