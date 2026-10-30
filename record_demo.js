const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothMove(page, targetX, targetY, steps = 20) {
  const currentPos = page._currentMousePos || { x: 640, y: 360 };
  for (let i = 1; i <= steps; i++) {
    const x = currentPos.x + ((targetX - currentPos.x) * i) / steps;
    const y = currentPos.y + ((targetY - currentPos.y) * i) / steps;
    await page.mouse.move(x, y);
    await sleep(12);
  }
  page._currentMousePos = { x: targetX, y: targetY };
}

async function smoothClick(page, selector) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
  await sleep(150);
  const box = await element.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(page, targetX, targetY, 18);
    await sleep(180);
    await page.mouse.down();
    await sleep(100);
    await page.mouse.up();
    await sleep(250);
  } else {
    await element.click();
  }
}

async function smoothScroll(page, distance, steps = 14) {
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await sleep(30);
  }
  await sleep(400);
}

// Minimal valid PNG generator
function createSamplePNG(filePath) {
  // 1x1 black png base64
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  fs.writeFileSync(filePath, Buffer.from(base64Png, 'base64'));
}

async function record() {
  const outputDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sampleImgPath = path.join(outputDir, 'sample_item.png');
  createSamplePNG(sampleImgPath);

  console.log('Launching Chromium for demo recording...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  // Inject professional cursor pointer for screencast presentation
  await context.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 22px;
        height: 22px;
        background: rgba(99, 102, 241, 0.85);
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease, background 0.12s ease;
        box-shadow: 0 0 14px rgba(99, 102, 241, 0.65);
      `;
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.background = 'rgba(236, 72, 153, 0.95)';
      });
      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(99, 102, 241, 0.85)';
      });
    });
  });

  const page = await context.newPage();
  page._currentMousePos = { x: 640, y: 360 };

  console.log('--- SCENE 1: Campus Feed, Live Search & Dynamic Filtering ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Smooth scroll down to showcase active campus items feed
  await smoothScroll(page, 320, 15);
  await sleep(1000);
  await smoothScroll(page, -320, 15);
  await sleep(800);

  // Live Search Demonstration
  const searchInput = 'input[placeholder*="Search items"]';
  await smoothClick(page, searchInput);
  await page.locator(searchInput).pressSequentially('AirPods', { delay: 100 });
  await sleep(1600);

  // Clear Search
  const clearBtn = 'button:has(svg.lucide-x)';
  if (await page.locator(clearBtn).isVisible()) {
    await smoothClick(page, clearBtn);
    await sleep(800);
  }

  // Filter: Lost Items
  await smoothClick(page, 'button:has-text("Lost")');
  await sleep(1400);

  // Filter: Found Items
  await smoothClick(page, 'button:has-text("Found")');
  await sleep(1400);

  // Reset to All Items
  await smoothClick(page, 'button:has-text("All Items")');
  await sleep(1000);

  // Category filter dropdown
  const catSelect = page.locator('select').first();
  await smoothClick(page, 'select');
  await catSelect.selectOption({ label: 'IDs & Cards' });
  await sleep(1400);
  await catSelect.selectOption({ label: 'All Categories' });
  await sleep(1000);

  console.log('--- SCENE 2: Reporting a Found Campus Item ---');
  // Click Post Item in Top Navigation
  await smoothClick(page, 'nav a:has-text("Post Item")');
  await page.waitForURL('**/items/new');
  await sleep(1200);

  // Toggle to "I Found Something"
  await smoothClick(page, 'button:has-text("I Found Something")');
  await sleep(800);

  // Title input
  await smoothClick(page, 'input[placeholder*="Black AirPods Pro"]');
  await page.locator('input[placeholder*="Black AirPods Pro"]').pressSequentially('Sony WH-1000XM4 Noise-Cancelling Headphones', { delay: 40 });
  await sleep(400);

  // Select Category: Electronics
  const formCatSelect = page.locator('select').first();
  await formCatSelect.selectOption({ label: 'Electronics' });
  await sleep(500);

  // Select Zone: Central Library
  const formZoneSelect = page.locator('select').nth(1);
  await formZoneSelect.selectOption({ label: 'Central Library' });
  await sleep(500);

  // Color & Brand
  const colorInput = page.locator('input[placeholder*="Matte Black"]');
  if (await colorInput.isVisible()) {
    await colorInput.click();
    await colorInput.pressSequentially('Midnight Black', { delay: 35 });
    await sleep(300);
  }

  const brandInput = page.locator('input[placeholder*="Apple, Nike"]');
  if (await brandInput.isVisible()) {
    await brandInput.click();
    await brandInput.pressSequentially('Sony', { delay: 35 });
    await sleep(300);
  }

  // Safe Custody Location
  const custodyInput = page.locator('input[placeholder*="Library Helpdesk"]');
  if (await custodyInput.isVisible()) {
    await custodyInput.click();
    await custodyInput.pressSequentially('Central Library Circulation Desk - 2nd Floor', { delay: 35 });
    await sleep(400);
  }

  // Detailed Description
  const descInput = page.locator('textarea[placeholder*="Describe distinctive identifiers"]');
  if (await descInput.isVisible()) {
    await descInput.click();
    await descInput.pressSequentially('Found inside silent study cubicle #14 with black carrying case and USB-C cable.', { delay: 30 });
    await sleep(500);
  }

  // Upload Photograph
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(sampleImgPath);
  await sleep(1000);

  // Smooth scroll down to submit button
  await smoothScroll(page, 280, 10);
  await sleep(600);

  // Submit Report
  await smoothClick(page, 'button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await sleep(2500);

  console.log('--- SCENE 3: Item Detail & Ownership Verification Claim ---');
  // Navigate to an existing item (e.g. Herschel Backpack - ID 6)
  await page.goto('http://localhost:3000/items/6', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Smooth scroll to inspect item metadata, custody info, and verification banner
  await smoothScroll(page, 320, 12);
  await sleep(1400);

  // Click Claim This Item
  const claimButton = page.locator('button:has-text("Claim This Item")');
  if (await claimButton.isVisible()) {
    await smoothClick(page, 'button:has-text("Claim This Item")');
    await sleep(1000);

    // Proof description
    const proofArea = page.locator('textarea[placeholder*="Unique scratches"]');
    if (await proofArea.isVisible()) {
      await proofArea.click();
      await proofArea.pressSequentially('Initials "AS" written on inside tag. Contains my TI-84 Plus graphing calculator and engineering notebook.', { delay: 30 });
      await sleep(500);
    }

    // Contact info
    const contactField = page.locator('input[placeholder*="alex@college.edu"]');
    if (await contactField.isVisible()) {
      await contactField.click();
      await contactField.pressSequentially('alex.student@college.edu | (555) 0192', { delay: 35 });
      await sleep(600);
    }

    // Submit Verification Claim
    await smoothClick(page, 'button:has-text("Submit Claim")');
    await sleep(2500);
  }

  console.log('--- SCENE 4: Student Profile & Karma Reputation Dashboard ---');
  // Navigate to My Profile
  await smoothClick(page, 'nav a:has-text("My Profile")');
  await page.waitForURL('**/profile');
  await sleep(1500);

  // Showcase Alex Student Profile & 150 Karma Reputation points
  await smoothScroll(page, 200, 10);
  await sleep(1400);

  // Switch to My Claims tab
  const claimsTab = page.locator('button:has-text("My Claims")');
  if (await claimsTab.isVisible()) {
    await smoothClick(page, 'button:has-text("My Claims")');
    await sleep(1800);
  }

  // Smooth scroll up and return to Feed
  await smoothScroll(page, -200, 10);
  await sleep(800);
  await smoothClick(page, 'nav a:has-text("L&F Portal")');
  await page.waitForURL('http://localhost:3000/');
  await sleep(2000);

  console.log('Demo finished. Closing context...');
  await page.close();
  await context.close();
  await browser.close();

  console.log('Locating recorded video file...');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    // Sort by mod time descending
    files.sort((a, b) => fs.statSync(path.join(outputDir, b)).mtimeMs - fs.statSync(path.join(outputDir, a)).mtimeMs);
    const latestFile = path.join(outputDir, files[0]);
    const finalWebm = path.join(outputDir, 'demo_lost_and_found.webm');
    fs.copyFileSync(latestFile, finalWebm);
    console.log(`WebM video saved to: ${finalWebm}`);
    console.log(`Video size: ${(fs.statSync(finalWebm).size / (1024 * 1024)).toFixed(2)} MB`);
  }
}

record().catch((err) => {
  console.error('Error during recording:', err);
  process.exit(1);
});
