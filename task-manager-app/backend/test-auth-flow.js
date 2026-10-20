const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';

async function runAuthReviewTests() {
  console.log('=== STARTING DAY 30 AUTHENTICATION REVIEW TESTS ===\n');

  const testUser = {
    email: 'review_test@kodex.com',
    password: 'password123',
  };

  // Ensure test user exists first
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });

  // ---------------------------------------------------------
  // TEST 1: VALID LOGIN
  // ---------------------------------------------------------
  const validLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  const validLoginData = await validLoginRes.json();
  console.log(`1. [Valid Login] Status: ${validLoginRes.status} (Expected: 200)`);
  console.log(`   Message: ${validLoginData.message}\n`);

  const validToken = validLoginData.access_token;

  // ---------------------------------------------------------
  // TEST 2: INVALID LOGIN (Wrong Password)
  // ---------------------------------------------------------
  const invalidPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
  });
  const invalidPassData = await invalidPassRes.json();
  console.log(`2. [Invalid Login - Wrong Password] Status: ${invalidPassRes.status} (Expected: 401)`);
  console.log(`   Error: ${invalidPassData.message}\n`);

  // ---------------------------------------------------------
  // TEST 3: UNAUTHORIZED ACCESS (No Token Provided)
  // ---------------------------------------------------------
  const noTokenRes = await fetch(`${BASE_URL}/tasks`);
  const noTokenData = await noTokenRes.json();
  console.log(`3. [Unauthorized Access - No Token] Status: ${noTokenRes.status} (Expected: 401)`);
  console.log(`   Error: ${noTokenData.message}\n`);

  // ---------------------------------------------------------
  // TEST 4: INVALID TOKEN (Tampered / Fake Token)
  // ---------------------------------------------------------
  const invalidTokenRes = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: 'Bearer fake.tampered.token123' },
  });
  const invalidTokenData = await invalidTokenRes.json();
  console.log(`4. [Invalid Token] Status: ${invalidTokenRes.status} (Expected: 401)`);
  console.log(`   Error: ${invalidTokenData.message}\n`);

  // ---------------------------------------------------------
  // TEST 5: EXPIRED TOKEN
  // ---------------------------------------------------------
  // Sign a token that expires in 1 second
  const shortLivedToken = jwt.sign(
    { sub: 1, email: testUser.email, role: 'user' },
    SECRET,
    { expiresIn: '1s' }
  );

  console.log('   Waiting 2 seconds for token to expire...');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const expiredTokenRes = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${shortLivedToken}` },
  });
  const expiredTokenData = await expiredTokenRes.json();
  console.log(`5. [Expired Token] Status: ${expiredTokenRes.status} (Expected: 401)`);
  console.log(`   Error: ${expiredTokenData.message}\n`);

  // ---------------------------------------------------------
  // TEST 6: AUTHORIZED ACCESS WITH VALID TOKEN
  // ---------------------------------------------------------
  const validAccessRes = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${validToken}` },
  });
  console.log(`6. [Protected Route - Valid Token] Status: ${validAccessRes.status} (Expected: 200)`);
  console.log('\n=== ALL DAY 30 AUTH REVIEW TESTS COMPLETED ===');
}

runAuthReviewTests();