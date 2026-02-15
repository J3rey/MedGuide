import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../services/supabase';

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...\n');
  console.log(`Using URL: ${process.env.SUPABASE_URL}\n`);

  // Test connection with detailed error info
  const { error: testError } = await supabase
    .from('drugs')
    .select('*')
    .limit(1);

  if (testError) {
    console.error('❌ Query Error:', testError);
    console.error('\n⚠️  This might be a Row Level Security (RLS) issue.');
    console.error('   Check if RLS is enabled and add a policy to allow SELECT.');
    return;
  }

  console.log('✅ Connection successful!\n');

  // Get total count
  const { count, error: countError } = await supabase
    .from('drugs')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting records:', countError);
    return;
  }

  console.log(`📊 Total drugs in database: ${count}\n`);

  // Get sample data (first 5 records)
  const { data: sampleData, error: sampleError } = await supabase
    .from('drugs')
    .select('id, drug_name, indications, adverse_effects')
    .limit(5);

  if (sampleError) {
    console.error('❌ Error fetching sample data:', sampleError.message);
    return;
  }

  console.log('📋 Sample data (first 5 records):');
  console.log(JSON.stringify(sampleData, null, 2));

  // Get column structure
  const { data: structureData, error: structureError } = await supabase
    .from('drugs')
    .select('*')
    .limit(1);

  if (structureError) {
    console.error('❌ Error fetching structure:', structureError.message);
    return;
  }

  if (structureData && structureData.length > 0) {
    console.log('\n🏗️  Available columns:');
    console.log(Object.keys(structureData[0]).join(', '));
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ Database check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
