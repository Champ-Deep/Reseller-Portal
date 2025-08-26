#!/usr/bin/env node

/**
 * Database Setup Script for Lake B2B Reseller Portal
 * 
 * This script:
 * 1. Validates environment variables
 * 2. Creates database tables
 * 3. Seeds initial data
 * 4. Runs health checks
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Client } = pg;

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

async function main() {
  log('🚀 Lake B2B Reseller Portal - Database Setup', 'cyan');
  log('='.repeat(50), 'cyan');

  // 1. Validate environment
  log('\n📋 Checking environment variables...', 'blue');
  
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL is required but not set', 'red');
    log('💡 Please add your Neon database URL to the .env file', 'yellow');
    log('   Example: DATABASE_URL="postgresql://username:password@host:port/database"', 'yellow');
    process.exit(1);
  }

  log('✅ DATABASE_URL found', 'green');

  // 2. Test database connection
  log('\n🔌 Testing database connection...', 'blue');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time');
    log(`✅ Database connected successfully at ${result.rows[0].current_time}`, 'green');
  } catch (error) {
    log('❌ Database connection failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // 3. Run schema migration
  log('\n🏗️  Creating database schema...', 'blue');
  
  try {
    const schemaSQL = readFileSync(join(__dirname, '../db/schema.sql'), 'utf8');
    await client.query(schemaSQL);
    log('✅ Database schema created successfully', 'green');
  } catch (error) {
    log('❌ Schema creation failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // 4. Check if we should seed data
  log('\n🌱 Checking if seeding is needed...', 'blue');
  
  try {
    const orgCount = await client.query('SELECT COUNT(*) as count FROM organizations');
    const hasData = parseInt(orgCount.rows[0].count) > 0;
    
    if (hasData) {
      log('ℹ️  Database already has data, skipping seed', 'yellow');
    } else {
      log('📦 Seeding initial data...', 'blue');
      const seedSQL = readFileSync(join(__dirname, '../db/seed.sql'), 'utf8');
      await client.query(seedSQL);
      log('✅ Initial data seeded successfully', 'green');
    }
  } catch (error) {
    log('❌ Seeding failed:', 'red');
    log(error.message, 'red');
    // Don't exit here, seeding is optional
  }

  // 5. Verify setup
  log('\n🔍 Verifying database setup...', 'blue');
  
  try {
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(t => t.table_name);
    const expectedTables = [
      'organizations', 'users', 'icp_filters', 'enrichment_jobs', 
      'data_segments', 'campaigns', 'sample_requests', 'lake_b2b_accounts', 'audit_logs'
    ];
    
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length === 0) {
      log('✅ All required tables created:', 'green');
      tableNames.forEach(table => log(`   - ${table}`, 'green'));
    } else {
      log('⚠️  Some tables are missing:', 'yellow');
      missingTables.forEach(table => log(`   - ${table}`, 'red'));
    }

    // Check sample data
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    log(`📊 Users in database: ${userCount.rows[0].count}`, 'cyan');

  } catch (error) {
    log('❌ Verification failed:', 'red');
    log(error.message, 'red');
  }

  // 6. Configuration summary
  log('\n⚙️  Configuration Summary', 'blue');
  log('-'.repeat(30), 'blue');
  
  const envVars = [
    'DATABASE_URL',
    'AUTH_SECRET', 
    'LAKE_B2B_API_KEY',
    'LAKE_B2B_CAMPAIGN_API_KEY',
    'RESELLER_API_KEY'
  ];

  envVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      const masked = envVar.includes('SECRET') || envVar.includes('KEY') 
        ? value.substring(0, 8) + '...' 
        : value;
      log(`✅ ${envVar}: ${masked}`, 'green');
    } else {
      log(`⚠️  ${envVar}: Not set`, 'yellow');
    }
  });

  log('\n🎉 Database setup completed successfully!', 'green');
  log('\n💡 Next steps:', 'cyan');
  log('   1. Update your .env file with actual API keys', 'cyan');
  log('   2. Run: npm run dev', 'cyan');
  log('   3. Visit: http://localhost:4000', 'cyan');
  
  await client.end();
  process.exit(0);
}

// Run the setup
main().catch(error => {
  log('\n💥 Unexpected error:', 'red');
  log(error.message, 'red');
  console.error(error);
  process.exit(1);
});