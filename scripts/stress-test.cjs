const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const SLUG = 'test1'; 

async function sendRequest(question) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/view/${SLUG}/kb/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const duration = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      console.log(`[SUCCESS] Duration: ${duration}ms | Match: ${data.matchedEntryId ? 'Yes' : 'No'}`);
      return true;
    } else {
      console.log(`[ERROR] Duration: ${duration}ms | Status: ${res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`[FAILED] Error: ${err.message}`);
    return false;
  }
}

async function runStressTest() {
  console.log('--- STARTING STRESS TEST ---');

  console.log('\n1. Rapid sequential requests (5 requests)');
  for (let i = 0; i < 5; i++) {
    await sendRequest(`Sequential test question ${i}`);
  }

  console.log('\n2. Parallel requests (3 simultaneous)');
  await Promise.all([
    sendRequest('Parallel test 1'),
    sendRequest('Parallel test 2'),
    sendRequest('Parallel test 3')
  ]);

  console.log('\n3. Extremely long input (2000 characters)');
  const longInput = 'A'.repeat(2000);
  await sendRequest(longInput);

  console.log('\n4. Special characters and emojis');
  await sendRequest('How do I do this? 🚀 @#$%^&*()_+ 👋');

  console.log('\n5. Gibberish/Non-English');
  await sendRequest('asdfghjkl qwertyuiop');
  await sendRequest('你好，你能帮我吗？');

  console.log('\n--- STRESS TEST COMPLETE ---');
}

runStressTest();
