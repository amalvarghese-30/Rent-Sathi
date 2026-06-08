import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const results = [];

async function login(page, url, email, password, buttonText) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click(`button:has-text("${buttonText}")`);
  await page.waitForTimeout(3000);
  return page.url();
}

async function test(name, condition, detail) {
  results.push({ name, passed: !!condition, detail });
  console.log(`  ${condition ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // ===== TEST 1: BROKER LOGIN → /broker =====
  console.log('\n=== TEST 1: Broker should land on /broker ===');
  const brokerPage = await context.newPage();
  const brokerUrl = await login(brokerPage, `${BASE}/auth/login`, 'broker@test.com', 'Broker@123456', 'Sign in');
  await test('Broker redirects to /broker', brokerUrl.includes('/broker'), brokerUrl);

  // Check logout button
  const logoutBtn = await brokerPage.$('button:has-text("Logout")');
  await test('Broker dashboard has logout button', !!logoutBtn);

  // ===== TEST 2: BROKER CANNOT ACCESS /dashboard =====
  console.log('\n=== TEST 2: Broker should not access /dashboard ===');
  await brokerPage.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
  await brokerPage.waitForTimeout(1000);
  await test('Broker auto-redirected away from /dashboard', !brokerPage.url().includes('/dashboard'), brokerPage.url());

  // ===== TEST 3: USER LOGIN → /dashboard =====
  console.log('\n=== TEST 3: User (renter) should land on /dashboard ===');
  const userPage = await context.newPage();
  const userUrl = await login(userPage, `${BASE}/auth/login`, 'user@test.com', 'User@123456', 'Sign in');
  await test('User redirects to /dashboard', userUrl.includes('/dashboard'), userUrl);

  // Check logout button
  const userLogoutBtn = await userPage.$('button:has-text("Logout")');
  await test('User dashboard has logout button', !!userLogoutBtn);

  // ===== TEST 4: USER CANNOT ACCESS /broker =====
  console.log('\n=== TEST 4: User should not access /broker ===');
  await userPage.goto(`${BASE}/broker`, { waitUntil: 'networkidle', timeout: 10000 });
  await userPage.waitForTimeout(1000);
  await test('User auto-redirected away from /broker', !userPage.url().includes('/broker'), userPage.url());

  // ===== TEST 5: ADMIN LOGIN → /admin =====
  console.log('\n=== TEST 5: Admin should land on /admin ===');
  const adminPage = await context.newPage();
  const adminUrl = await login(adminPage, `${BASE}/auth/admin`, 'admin@test.com', 'Admin@123456', 'Sign in to operations');
  await test('Admin redirects to /admin', adminUrl.includes('/admin'), adminUrl);

  // ===== TEST 6: LOGOUT WORKS =====
  console.log('\n=== TEST 6: Logout should work ===');
  const logoutBtn2 = await userPage.$('button:has-text("Logout")');
  if (logoutBtn2) {
    await logoutBtn2.click();
    await userPage.waitForTimeout(2000);
    await test('After logout redirects to home', userPage.url() === `${BASE}/` || userPage.url().includes('/auth/login'), userPage.url());
  } else {
    await test('Logout button present', false);
  }

  // ===== TEST 7: NOTIFICATIONS PAGE HAS LOGOUT =====
  console.log('\n=== TEST 7: Notifications page has logout ===');
  const notifPage = await context.newPage();
  await login(notifPage, `${BASE}/auth/login`, 'user@test.com', 'User@123456', 'Sign in');
  await notifPage.goto(`${BASE}/notifications`, { waitUntil: 'networkidle', timeout: 10000 });
  await notifPage.waitForTimeout(1000);
  const notifLogout = await notifPage.$('button:has-text("Logout")');
  await test('Notifications page has logout button', !!notifLogout);

  // ===== SUMMARY =====
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  results.filter(r => !r.passed).forEach(r => console.log(`  ❌ ${r.name}: ${r.detail}`));

  await browser.close();
})();
