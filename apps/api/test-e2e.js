import { createServer } from './dist/server.js';

async function testApi() {
  const app = createServer();
  const server = app.listen(5999);
  const baseUrl = 'http://localhost:5999/api';

  try {
    console.log('1. Testing Health Endpoint...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('   Health response:', healthData);
    if (healthRes.status !== 200 || healthData.status !== 'healthy') throw new Error('Health check failed');

    console.log('2. Testing Registration...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mufeed Test', email: 'mufeed.test@example.com', password: 'password123' }),
    });
    const regData = await regRes.json();
    console.log('   Registration status:', regRes.status, 'User:', regData.user?.name);
    if (regRes.status !== 201) throw new Error('Registration failed');
    const token = regData.tokens.accessToken;

    console.log('3. Testing /api/auth/me...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('   Me response:', meData);
    if (meRes.status !== 200) throw new Error('/auth/me failed');

    console.log('4. Testing Sync Push...');
    const pushRes = await fetch(`${baseUrl}/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        notes: [
          {
            id: 'test-note-1',
            title: 'Test Note Title',
            content: 'Handwritten test note content',
            color: 'yellow',
            position: { x: 100, y: 150, zIndex: 5 },
            rotation: 2,
            size: 'md',
            isPinned: false,
            isArchived: false,
            pinType: 'red',
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        tasks: [
          {
            id: 'test-task-1',
            title: 'Test Task Title',
            description: 'Sub-task details',
            completed: false,
            priority: 'urgent',
            category: 'Today',
            position: 0,
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });
    const pushData = await pushRes.json();
    console.log('   Sync Push status:', pushRes.status, pushData);
    if (pushRes.status !== 200) throw new Error('Sync Push failed');

    console.log('5. Testing Sync Pull...');
    const pullRes = await fetch(`${baseUrl}/sync/pull`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pullData = await pullRes.json();
    console.log('   Sync Pull notes count:', pullData.notes?.length, 'tasks count:', pullData.tasks?.length);
    if (pullRes.status !== 200 || pullData.notes.length === 0) throw new Error('Sync Pull failed');

    console.log('\n✅ ALL API & SYNC END-TO-END TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

testApi().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
