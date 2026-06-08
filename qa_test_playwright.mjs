import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';
const SCREENSHOTS = 'C:/Users/Amal Varghese/Desktop/New folder/rentsaathi-connect/qa_output/screenshots';

const TEST_ACCOUNTS = {
  user: { email: 'user@test.com', password: 'User@123456', role: 'renter' },
  broker: { email: 'broker@test.com', password: 'Broker@123456', role: 'broker' },
  admin: { email: 'admin@test.com', password: 'Admin@123456', role: 'admin' },
};

const results = { passed: [], failed: [], errors: [] };

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true });
}

function record(name, condition) {
  if (condition) {
    results.passed.push(name);
  } else {
    results.failed.push(name);
  }
}

async function login(page, account) {
  try {
    if (account.role === 'admin') {
      await page.goto(`${BASE}/auth/admin`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button:has-text("Sign in to operations")');
    } else {
      await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button:has-text("Sign in")');
    }
    await page.waitForTimeout(3000);
    return true;
  } catch (e) {
    results.errors.push(`login-error-${account.email}: ${e.message}`);
    return false;
  }
}

async function navigateAndScreenshot(page, path, name, waitMs = 1000) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(waitMs);
    await screenshot(page, name);
    return true;
  } catch (e) {
    results.errors.push(`nav-error-${name}: ${e.message}`);
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  const errorLog = [];
  context.on('page', page => {
    page.on('console', msg => {
      if (msg.type() === 'error') errorLog.push(msg.text());
    });
    page.on('pageerror', err => errorLog.push(`PAGE ERROR: ${err.message}`));
  });

  // ==================== PUBLIC PAGES ====================
  console.log('=== PUBLIC PAGES ===');

  // Landing page
  const sitePage = await context.newPage();
  record('landing-page', await navigateAndScreenshot(sitePage, '/', 'landing-page'));

  // Auth pages
  for (const [path, name] of [
    ['/auth/login', 'auth-login'],
    ['/auth/register', 'auth-register'],
    ['/auth/broker', 'auth-broker-register'],
    ['/auth/forgot', 'auth-forgot-password'],
    ['/auth/admin', 'auth-admin-login'],
  ]) {
    record(`page-${name}`, await navigateAndScreenshot(sitePage, path, name));
  }

  // Docs pages
  for (const [path, name] of [
    ['/docs/api', 'docs-api'],
    ['/docs/stack', 'docs-stack'],
    ['/docs/security', 'docs-security'],
    ['/docs/integration', 'docs-integration'],
    ['/docs/readiness', 'docs-readiness'],
  ]) {
    record(`page-${name}`, await navigateAndScreenshot(sitePage, path, name));
  }

  await sitePage.close();
  console.log(`Public pages: ${results.passed.length} passed, ${results.failed.length} failed`);

  // ==================== USER ROLE TESTING ====================
  console.log('=== USER ROLE TESTING ===');
  const userPage = await context.newPage();

  record('user-login', await login(userPage, TEST_ACCOUNTS.user));
  record('user-dashboard', await navigateAndScreenshot(userPage, '/dashboard', 'user-dashboard'));

  // New requirement wizard
  record('user-post-requirement', await navigateAndScreenshot(userPage, '/requirements/new', 'user-post-requirement'));

  // Requirements list
  record('user-requirements-list', await navigateAndScreenshot(userPage, '/requirements', 'user-requirements'));

  // Matches
  record('user-matches', await navigateAndScreenshot(userPage, '/matches', 'user-matches'));

  // Notifications
  record('user-notifications', await navigateAndScreenshot(userPage, '/notifications', 'user-notifications'));

  console.log(`User tests done`);

  // ==================== BROKER ROLE TESTING ====================
  console.log('=== BROKER ROLE TESTING ===');
  const brokerPage = await context.newPage();

  record('broker-login', await login(brokerPage, TEST_ACCOUNTS.broker));
  record('broker-workspace', await navigateAndScreenshot(brokerPage, '/broker', 'broker-workspace'));
  record('broker-add-property', await navigateAndScreenshot(brokerPage, '/broker/properties/new', 'broker-add-property'));
  record('broker-matches', await navigateAndScreenshot(brokerPage, '/matches', 'broker-matches'));

  console.log(`Broker tests done`);

  // ==================== ADMIN ROLE TESTING ====================
  console.log('=== ADMIN ROLE TESTING ===');
  const adminPage = await context.newPage();

  record('admin-login', await login(adminPage, TEST_ACCOUNTS.admin));
  record('admin-dashboard', await navigateAndScreenshot(adminPage, '/admin', 'admin-dashboard'));

  for (const [path, name] of [
    ['/admin/matches', 'admin-matches'],
    ['/admin/complaints', 'admin-complaints'],
    ['/admin/brokers/pending', 'admin-brokers-pending'],
    ['/admin/properties/pending', 'admin-properties-pending'],
    ['/admin/audit', 'admin-audit'],
    ['/admin/ops', 'admin-ops'],
    ['/admin/schema', 'admin-schema'],
  ]) {
    record(`admin-${name.split('-').pop()}`, await navigateAndScreenshot(adminPage, path, name));
  }

  console.log(`Admin tests done`);

  // ==================== SUMMARY ====================
  console.log('\n=== QA TEST SUMMARY ===');
  console.log(`Total: ${results.passed.length + results.failed.length} tests`);
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Errors: ${errorLog.length}`);

  if (results.failed.length > 0) {
    console.log('\nFAILED TESTS:');
    results.failed.forEach(f => console.log(`  ❌ ${f}`));
  }

  if (errorLog.length > 0) {
    console.log('\nCONSOLE ERRORS:');
    const unique = [...new Set(errorLog)];
    unique.slice(0, 20).forEach(e => console.log(`  ⚠️ ${e}`));
    if (errorLog.length > 20) console.log(`  ... and ${errorLog.length - 20} more`);
  }

  results.allErrors = [...new Set(errorLog)];

  writeFileSync(
    'C:/Users/Amal Varghese/Desktop/New folder/rentsaathi-connect/qa_output/results.json',
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  console.log('\nPlaywright tests complete. Results saved to qa_output/results.json');
})();
