/**
 * Supabase Connection Test
 * Run this to verify your database is accessible and has the correct structure
 * 
 * Usage: cd mobile && npx ts-node test-supabase-connection.ts
 */

// Note: This is a standalone test file. Copy contents to a real file if needed.

console.log('\n🔍 Testing Supabase Connection...\n');

const SUPABASE_URL = 'https://kzqqeodwdpqlsgvydqyb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXFlb2R3ZHBxbHNndnlkcXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODQ5MTQsImV4cCI6MjA3ODI2MDkxNH0.tDYMxOsIlIso-478XVgbP91zt13O3M_j9Xc7PGyzEX4';

async function testConnection() {
  try {
    console.log('✓ Connecting to:', SUPABASE_URL);
    
    // Test 1: Simple query
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/medications?select=*&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    console.log('✓ Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Error:', error);
      return;
    }

    const data = await response.json();
    console.log('✓ Found', data.length, 'medications');
    console.log('\nMedications in database:');
    data.forEach((med) => {
      console.log(`  - ${med.brand_name} (${med.generic_name})`);
    });

    // Test 2: Search for Panadol
    console.log('\n🔍 Searching for "Panadol"...');
    const searchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/medications?or=(brand_name.ilike.*panadol*,generic_name.ilike.*panadol*)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const searchData = await searchResponse.json();
    console.log('✓ Found', searchData.length, 'matches for "Panadol"');
    
    if (searchData.length > 0) {
      console.log('\n✅ SUCCESS! Your Supabase database is set up correctly.\n');
      console.log('Panadol data:');
      console.log(JSON.stringify(searchData[0], null, 2));
    } else {
      console.log('\n⚠️  No Panadol found in database.');
      console.log('Add Panadol using the SQL in supabase-setup.sql\n');
    }

  } catch (error) {
    console.error('\n✗ Connection failed:', error);
    console.log('\nCheck:');
    console.log('1. Internet connection');
    console.log('2. Supabase URL and API key in .env');
    console.log('3. Table named "medications" exists\n');
  }
}

// Only run if this file is executed directly
testConnection();
