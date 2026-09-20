const test = require('node:test');
const assert = require('node:assert/strict');

const uniqueEmail = `regression-${Date.now()}@example.com`;

const payload = {
  name: 'Regression User',
  email: uniqueEmail,
  password: 'Test@1234',
  gender: 'Male',
  date_of_birth: '2006-05-06',
  mobile: '6353037390',
  aadhar_last_4: '8282'
};

test('register endpoint stores aadhaar last 4 and returns a successful payload', async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  assert.equal(response.status, 201, `Expected 201 but got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.email, payload.email);
  assert.equal(body.person?.aadhar_last_4, payload.aadhar_last_4, 'Aadhaar last 4 should be stored and returned in the registration response');
});
