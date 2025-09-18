import fetch from 'node-fetch';

async function testRegistrationAPI() {
  console.log('Testing Registration API...\n');

  try {
    // Test health endpoint first
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is healthy:', healthData.message);
    } else {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    // Test registration with new user
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      location: 'Test City'
    };

    console.log('Registration data:', JSON.stringify(testUser, null, 2));

    const registerResponse = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log('Registration response status:', registerResponse.status);

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', registerData.message);
    } else {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.log('❌ Registration failed:', registerResponse.status, errorData);
    }

    // Test duplicate registration (should fail with 409)
    console.log('\n3. Testing duplicate registration...');
    const duplicateResponse = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser), // Same user data
    });

    console.log('Duplicate registration response status:', duplicateResponse.status);
    
    if (duplicateResponse.status === 409) {
      const duplicateError = await duplicateResponse.json();
      console.log('✅ Correctly rejected duplicate:', duplicateError.message);
    } else {
      console.log('❌ Unexpected response for duplicate registration');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegistrationAPI();