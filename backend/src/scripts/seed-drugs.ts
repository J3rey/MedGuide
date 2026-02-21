import { supabase } from '../services/supabase';
import * as dotenv from 'dotenv';

dotenv.config();

const sampleDrugs = [
  {
    drug_name: 'Panadol',
    indications:
      'Pain relief and fever reduction. Used for headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.',
    adverse_effects:
      'Rare: allergic reactions (rash, itching, swelling), liver damage with overdose',
    counseling:
      'Take with or without food. Do not exceed 4000mg per day. Avoid alcohol while taking this medication.',
    precautions_pregnancy:
      'Generally considered safe during pregnancy when used as directed.',
    precautions_children:
      'Safe for children when dosed appropriately by weight. Do not give to children under 2 without medical advice.',
    precautions_breastfeeding:
      'Safe to use while breastfeeding in recommended doses.',
  },
  {
    drug_name: 'Paracetamol',
    indications: 'Pain relief and fever reduction',
    adverse_effects: 'Hepatotoxicity with overdose, rare allergic reactions',
    counseling:
      'Take with food if stomach upset occurs. Maximum daily dose: 4g for adults.',
    precautions_pregnancy: 'Category A - Safe in pregnancy',
    precautions_children: 'Dose by weight: 10-15mg/kg every 4-6 hours',
    precautions_breastfeeding: 'Compatible with breastfeeding',
  },
  {
    drug_name: 'Ibuprofen',
    indications:
      'Pain, inflammation, and fever. Used for arthritis, menstrual cramps, headaches, minor injuries.',
    adverse_effects:
      'Stomach upset, heartburn, nausea, dizziness. Serious: stomach bleeding, kidney problems, increased blood pressure.',
    counseling:
      'Take with food or milk. Drink plenty of water. Avoid alcohol. Do not use if you have stomach ulcers.',
    precautions_pregnancy:
      'Avoid in third trimester. Use lowest effective dose in first two trimesters only if necessary.',
    precautions_children:
      'Not recommended for children under 6 months. Dose carefully by weight.',
    precautions_breastfeeding:
      'Small amounts pass into breast milk. Generally considered safe for short-term use.',
  },
  {
    drug_name: 'Aspirin',
    indications:
      'Pain relief, fever reduction, anti-inflammatory, blood thinner for heart health',
    adverse_effects:
      'Stomach upset, heartburn, increased bleeding risk, allergic reactions',
    counseling:
      'Take with food. Do not crush enteric-coated tablets. Avoid if allergic to NSAIDs.',
    precautions_pregnancy: 'Avoid in third trimester due to bleeding risk',
    precautions_children:
      'Do not give to children under 16 due to Reye syndrome risk',
    precautions_breastfeeding: 'Use with caution, may affect infant',
  },
  {
    drug_name: 'Amoxicillin',
    indications:
      'Bacterial infections including ear infections, pneumonia, strep throat, urinary tract infections',
    adverse_effects: 'Diarrhea, nausea, vomiting, rash, allergic reactions',
    counseling:
      'Complete full course even if feeling better. Take at evenly spaced intervals. Can be taken with or without food.',
    precautions_pregnancy: 'Category B - Generally safe',
    precautions_children: 'Safe for children when dosed appropriately',
    precautions_breastfeeding: 'Compatible with breastfeeding',
  },
  {
    drug_name: 'Metformin',
    indications:
      'Type 2 diabetes management. Helps control blood sugar levels.',
    adverse_effects:
      'Diarrhea, nausea, vomiting, gas, stomach upset, weakness, metallic taste',
    counseling:
      'Take with meals to reduce stomach upset. Do not crush extended-release tablets. Monitor blood sugar regularly.',
    precautions_pregnancy:
      'Consult doctor. Insulin often preferred during pregnancy.',
    precautions_children:
      'Approved for children 10 years and older with type 2 diabetes.',
    precautions_breastfeeding:
      'Consult doctor. Small amounts may pass into breast milk.',
  },
  {
    drug_name: 'Omeprazole',
    indications:
      'Gastroesophageal reflux disease (GERD), stomach and intestinal ulcers, acid reflux',
    adverse_effects: 'Headache, stomach pain, nausea, diarrhea, vomiting',
    counseling:
      'Take before meals, usually before breakfast. Swallow whole, do not crush. May take several days to work fully.',
    precautions_pregnancy: 'Category C - Use only if clearly needed',
    precautions_children:
      'Approved for children 1 year and older for certain conditions',
    precautions_breastfeeding: 'May pass into breast milk. Consult doctor.',
  },
  {
    drug_name: 'Lisinopril',
    indications:
      'High blood pressure, heart failure, post-heart attack treatment',
    adverse_effects: 'Dizziness, headache, persistent dry cough, fatigue',
    counseling:
      'Can be taken with or without food. Rise slowly from sitting/lying position. Monitor blood pressure regularly.',
    precautions_pregnancy: 'Contraindicated - Can cause harm to fetus',
    precautions_children: 'Safety not established for children under 6',
    precautions_breastfeeding: 'Consult doctor before use',
  },
  {
    drug_name: 'Atorvastatin',
    indications: 'High cholesterol, prevention of cardiovascular disease',
    adverse_effects: 'Muscle pain, diarrhea, upset stomach, joint pain',
    counseling:
      'Can be taken with or without food, usually once daily. Avoid grapefruit juice. Report unexplained muscle pain immediately.',
    precautions_pregnancy: 'Contraindicated - Can harm fetus',
    precautions_children:
      'Approved for children 10-17 years with familial hypercholesterolemia',
    precautions_breastfeeding:
      'Contraindicated - Do not breastfeed while taking',
  },
  {
    drug_name: 'Cetirizine',
    indications: 'Allergies, hay fever, hives, itching, runny nose, sneezing',
    adverse_effects: 'Drowsiness, dry mouth, fatigue, dizziness',
    counseling:
      'Can be taken with or without food. May cause drowsiness - avoid driving until you know how it affects you.',
    precautions_pregnancy: 'Category B - Generally considered safe',
    precautions_children:
      'Approved for children 6 months and older with appropriate dosing',
    precautions_breastfeeding:
      'Small amounts pass into breast milk. Generally considered compatible.',
  },
  {
    drug_name: 'Panadol Osteo',
    indications: 'Osteoarthritis pain, persistent pain relief',
    adverse_effects: 'Rare: allergic reactions, liver damage with overdose',
    counseling:
      'Extended release formula. Take with food. Do not exceed recommended dose. Contains paracetamol 665mg.',
    precautions_pregnancy: 'Generally considered safe during pregnancy',
    precautions_children: 'Not recommended for children under 12 years',
    precautions_breastfeeding: 'Safe to use while breastfeeding',
  },
  {
    drug_name: 'Salbutamol',
    indications:
      'Asthma, bronchospasm, chronic obstructive pulmonary disease (COPD)',
    adverse_effects:
      'Tremor, nervousness, headache, increased heart rate, throat irritation',
    counseling:
      'Inhaler technique is important. Rinse mouth after use. Use before exercise if prescribed for exercise-induced asthma.',
    precautions_pregnancy: 'Category C - Use if benefits outweigh risks',
    precautions_children: 'Safe for children when used as directed',
    precautions_breastfeeding: 'Generally considered safe',
  },
];

async function seedDrugs() {
  console.log('🌱 Starting to seed drugs database...\n');

  try {
    // Check connection
    const { error: testError } = await supabase
      .from('drugs')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`);
    }

    console.log('✅ Connected to database\n');

    // Insert drugs
    for (let i = 0; i < sampleDrugs.length; i++) {
      const drug = sampleDrugs[i];
      console.log(
        `📦 Inserting ${i + 1}/${sampleDrugs.length}: ${drug.drug_name}...`
      );

      const { error } = await supabase.from('drugs').insert([drug]);

      if (error) {
        console.error(`❌ Failed to insert ${drug.drug_name}:`, error.message);
      } else {
        console.log(`✅ Successfully inserted ${drug.drug_name}`);
      }
    }

    console.log('\n🎉 Seeding completed!');

    // Verify results
    const { data: allDrugs, error: countError } = await supabase
      .from('drugs')
      .select('drug_name')
      .order('drug_name');

    if (!countError && allDrugs) {
      console.log(`\n📊 Total drugs in database: ${allDrugs.length}`);
      console.log('\n📋 Drugs available:');
      allDrugs.forEach((drug: { drug_name: string }) =>
        console.log(`  - ${drug.drug_name}`)
      );
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDrugs();
