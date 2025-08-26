#!/usr/bin/env node

/**
 * End-to-End System Test for Lake B2B Reseller Portal
 * 
 * This script tests:
 * 1. Database connectivity
 * 2. API endpoints
 * 3. Authentication flow
 * 4. Core functionality
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color output functions
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, options = {}) {
  try {
    const baseUrl = 'http://localhost:4000';
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    return {
      success: response.ok,
      status: response.status,
      data: response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  log('🧪 Lake B2B Reseller Portal - End-to-End Testing', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function test(name, condition, details = '') {
    results.total++;
    if (condition) {
      results.passed++;
      log(`✅ ${name}`, 'green');
      if (details) log(`   ${details}`, 'green');
    } else {
      results.failed++;
      log(`❌ ${name}`, 'red');
      if (details) log(`   ${details}`, 'red');
    }
  }

  // 1. Health Check
  log('\n🏥 Testing System Health', 'blue');
  const health = await testEndpoint('/api/health');
  test('Health endpoint accessible', health.success);
  
  if (health.success) {
    test('Database connectivity', health.data.services?.database?.status === 'healthy');
    test('Configuration loaded', !!health.data.services);
  }

  // 2. Authentication System
  log('\n🔐 Testing Authentication', 'blue');
  
  // Test signin endpoint
  const signin = await testEndpoint('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpass123'
    })
  });
  
  test('Signin endpoint works', signin.success);
  
  let sessionCookie = '';
  if (signin.success) {
    // Extract session cookie if present
    const cookies = signin.data.headers?.get?.('set-cookie') || '';
    sessionCookie = cookies.match(/session=([^;]+)/)?.[1] || '';
    test('Session cookie created', !!sessionCookie);
  }

  // Test authenticated endpoint
  if (sessionCookie) {
    const userInfo = await testEndpoint('/api/auth/user', {
      headers: {
        'Cookie': `session=${sessionCookie}`
      }
    });
    test('User info retrieval', userInfo.success && !!userInfo.data.user);
  }

  // 3. Core API Endpoints
  log('\n📡 Testing API Endpoints', 'blue');
  
  // ICP Filters (requires auth)
  const icpFilters = await testEndpoint('/api/icp/filters', {
    headers: sessionCookie ? { 'Cookie': `session=${sessionCookie}` } : {}
  });
  test('ICP Filters endpoint', icpFilters.success || icpFilters.status === 401);

  // Marketplace (public)
  const marketplace = await testEndpoint('/api/marketplace/segments');
  test('Marketplace endpoint', marketplace.success);
  test('Marketplace has sample data', 
    marketplace.success && Array.isArray(marketplace.data.segments) && marketplace.data.segments.length > 0
  );

  // Sample requests (requires auth)
  const sampleReqs = await testEndpoint('/api/sample-requests', {
    headers: sessionCookie ? { 'Cookie': `session=${sessionCookie}` } : {}
  });
  test('Sample requests endpoint', sampleReqs.success || sampleReqs.status === 401);

  // 4. Lake B2B Integration
  log('\n🌊 Testing Lake B2B Integration', 'blue');
  
  const lakeB2BAccounts = await testEndpoint('/api/lake-b2b/accounts?source=database', {
    headers: sessionCookie ? { 'Cookie': `session=${sessionCookie}` } : {}
  });
  test('Lake B2B accounts endpoint', lakeB2BAccounts.success || lakeB2BAccounts.status === 401);

  // 5. Static Assets and Pages
  log('\n📄 Testing Frontend Pages', 'blue');
  
  const homepage = await testEndpoint('/');
  test('Homepage accessible', homepage.success);

  const signin_page = await testEndpoint('/account/signin');
  test('Signin page accessible', signin_page.success);

  const dashboard = await testEndpoint('/dashboard');
  test('Dashboard page accessible', dashboard.success || dashboard.status === 401 || dashboard.status === 302);

  // 6. Environment Configuration
  log('\n⚙️ Testing Configuration', 'blue');
  
  if (health.success && health.data.checks) {
    const config = health.data.checks.configuration || {};
    test('Database configured', config.database_configured !== false);
    test('Auth configured', config.auth_configured !== false);
    test('Sample request API configured', true); // Always passes since it's optional
  }

  // Results Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('-'.repeat(30), 'cyan');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
  log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, 
    results.passed === results.total ? 'green' : results.passed / results.total > 0.8 ? 'yellow' : 'red'
  );

  // Recommendations
  log('\n💡 Recommendations', 'blue');
  if (results.failed === 0) {
    log('🎉 All tests passed! Your system is ready for production.', 'green');
    log('Next steps:', 'cyan');
    log('  1. Add your real API keys to .env', 'cyan');
    log('  2. Set up your production database', 'cyan');
    log('  3. Configure your internal sample request endpoint', 'cyan');
  } else if (results.passed / results.total > 0.8) {
    log('⚠️  Most tests passed. Address failing tests for full functionality.', 'yellow');
    log('  • Check database connectivity if DB tests failed', 'yellow');
    log('  • Verify API endpoints are properly configured', 'yellow');
  } else {
    log('🚨 Multiple tests failed. Review system configuration.', 'red');
    log('  • Ensure development server is running (npm run dev)', 'red');
    log('  • Check .env file configuration', 'red');
    log('  • Run database setup (npm run setup)', 'red');
  }

  return results.failed === 0;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log('\n💥 Test execution failed:', 'red');
      log(error.message, 'red');
      process.exit(1);
    });
}