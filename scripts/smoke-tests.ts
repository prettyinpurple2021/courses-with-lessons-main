#!/usr/bin/env tsx
/**
 * Production Smoke Tests
 * 
 * Quick smoke tests to verify production deployment is working.
 * Tests critical user flows without requiring full E2E setup.
 * 
 * Usage: npm run test:smoke
 * 
 * Set FRONTEND_URL environment variable to test production:
 * FRONTEND_URL=https://yourdomain.com npm run test:smoke
 */

import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'https://intel-academy-api.fly.dev/api';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'skip', message: string, duration?: number) {
  results.push({ name, status, message, duration });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(`${icon} ${name}: ${message}${durationStr}`);
}

async function testBackendHealth() {
  const start = Date.now();
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    const duration = Date.now() - start;
    
    if (response.data.status === 'healthy') {
      addResult('Backend Health', 'pass', 'Backend is healthy', duration);
      return true;
    } else {
      addResult('Backend Health', 'fail', `Unexpected status: ${response.data.status}`, duration);
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - start;
    addResult('Backend Health', 'fail', `Error: ${error.message}`, duration);
    return false;
  }
}

async function testBackendDatabase() {
  const start = Date.now();
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    const duration = Date.now() - start;
    
    if (response.data.database === 'connected') {
      addResult('Database Connection', 'pass', 'Database is connected', duration);
      return true;
    } else {
      addResult('Database Connection', 'fail', `Database status: ${response.data.database}`, duration);
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - start;
    addResult('Database Connection', 'fail', `Error: ${error.message}`, duration);
    return false;
  }
}

async function testBackendEnvironment() {
  const start = Date.now();
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    const duration = Date.now() - start;
    
    if (response.data.environment === 'production') {
      addResult('Backend Environment', 'pass', 'Running in production mode', duration);
      return true;
    } else {
      addResult('Backend Environment', 'fail', `Environment: ${response.data.environment}`, duration);
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - start;
    addResult('Backend Environment', 'fail', `Error: ${error.message}`, duration);
    return false;
  }
}

async function testFrontendAccessible() {
  const start = Date.now();
  try {
    const response = await axios.get(FRONTEND_URL, { 
      timeout: 10000,
      validateStatus: (status) => status < 500, // Accept redirects and client errors
    });
    const duration = Date.now() - start;
    
    if (response.status === 200 || response.status === 301 || response.status === 302) {
      addResult('Frontend Accessible', 'pass', `Status: ${response.status}`, duration);
      return true;
    } else {
      addResult('Frontend Accessible', 'fail', `Status: ${response.status}`, duration);
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - start;
    addResult('Frontend Accessible', 'fail', `Error: ${error.message}`, duration);
    return false;
  }
}

async function testCoursesEndpoint() {
  const start = Date.now();
  try {
    const response = await axios.get(`${API_URL}/courses`, { timeout: 10000 });
    const duration = Date.now() - start;
    
    if (response.data && Array.isArray(response.data.data)) {
      const courseCount = response.data.data.length;
      if (courseCount >= 7) {
        addResult('Courses Endpoint', 'pass', `Found ${courseCount} courses`, duration);
        return true;
      } else {
        addResult('Courses Endpoint', 'fail', `Only ${courseCount} courses found (expected 7)`, duration);
        return false;
      }
    } else {
      addResult('Courses Endpoint', 'fail', 'Invalid response format', duration);
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - start;
    if (error.response?.status === 401) {
      addResult('Courses Endpoint', 'skip', 'Requires authentication (expected)', duration);
      return true; // This is expected for protected routes
    }
    addResult('Courses Endpoint', 'fail', `Error: ${error.message}`, duration);
    return false;
  }
}

async function testExamsHaveQuestions() {
  const start = Date.now();
  try {
    // This would require authentication, so we'll skip for now
    // In a real scenario, you'd authenticate first
    addResult('Exam Questions', 'skip', 'Requires authentication - verify manually', 0);
    return true;
  } catch (error: any) {
    addResult('Exam Questions', 'skip', 'Requires authentication', 0);
    return true;
  }
}

async function main() {
  console.log('\n🚀 Production Smoke Tests');
  console.log('='.repeat(70));
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(70) + '\n');

  // Run tests
  await testBackendHealth();
  await testBackendDatabase();
  await testBackendEnvironment();
  await testFrontendAccessible();
  await testCoursesEndpoint();
  await testExamsHaveQuestions();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`⏭️  Skipped: ${skipped}/${total}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Review the errors above.');
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Production is healthy.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

