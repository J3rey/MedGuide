-- Sample drug data for testing the chatbot
-- Run this in your Supabase SQL editor to populate test data

-- Insert sample medications
INSERT INTO drugs (drug_name, counseling, adverse_effects, indications, precautions_pregnancy, precautions_children, precautions_breastfeeding)
VALUES 
  (
    'Acetaminophen (Paracetamol)',
    'Take with or without food. Do not exceed 4000mg per day. Avoid alcohol while taking this medication. Store at room temperature.',
    'Common: Nausea, stomach pain, loss of appetite, headache. Rare: Severe allergic reactions, liver damage (with overdose), skin rash.',
    'Used to treat mild to moderate pain and to reduce fever. Effective for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
    'Generally considered safe during pregnancy when used at recommended doses. Category B. Consult your doctor before use.',
    'Safe for children when dosed appropriately based on weight and age. Follow pediatric dosing guidelines carefully.',
    'Small amounts pass into breast milk but generally considered safe. Consult healthcare provider.'
  ),
  (
    'Ibuprofen',
    'Take with food or milk to minimize stomach upset. Drink plenty of water. Do not take if allergic to aspirin or NSAIDs.',
    'Common: Upset stomach, nausea, vomiting, headache, diarrhea, constipation, dizziness. Serious: Stomach bleeding, kidney problems, increased blood pressure, heart attack risk.',
    'Used to reduce fever and treat pain or inflammation caused by conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.',
    'Not recommended during pregnancy, especially in the third trimester. May cause harm to unborn baby. Category C (first/second trimester), D (third trimester).',
    'Can be used in children over 6 months. Dose carefully based on weight. Not for infants under 6 months without doctor supervision.',
    'Passes into breast milk in small amounts. Generally considered safe but monitor infant for side effects. Consult healthcare provider.'
  ),
  (
    'Amoxicillin',
    'Take with or without food. Complete the full course even if you feel better. Can be taken with food if it upsets your stomach.',
    'Common: Nausea, vomiting, diarrhea, rash. Rare: Severe allergic reactions (difficulty breathing, swelling), severe diarrhea (Clostridioides difficile), liver problems.',
    'Antibiotic used to treat various bacterial infections including ear infections, pneumonia, bronchitis, urinary tract infections, skin infections, and H. pylori.',
    'Category B - Generally considered safe during pregnancy. Benefits usually outweigh risks. Inform your doctor if pregnant.',
    'Safe for use in children including infants. Dose based on weight. Commonly prescribed pediatric antibiotic.',
    'Passes into breast milk in small amounts. Generally considered safe but may cause diarrhea or thrush in nursing infant.'
  ),
  (
    'Lisinopril',
    'Take once daily with or without food. Take at the same time each day. Stand up slowly from sitting/lying position to prevent dizziness.',
    'Common: Dizziness, headache, persistent dry cough, fatigue. Serious: High potassium levels, kidney problems, severe allergic reactions, angioedema (swelling).',
    'Used to treat high blood pressure (hypertension), heart failure, and to improve survival after heart attack. ACE inhibitor class.',
    'Category D - Can cause harm to unborn baby. Do NOT use during pregnancy. Use effective contraception and notify doctor immediately if pregnant.',
    'Safety not established in children under 6 years. Can be used in children 6+ for hypertension under medical supervision.',
    'Unknown if passes into breast milk. Consult healthcare provider. Alternative medications may be preferred.'
  ),
  (
    'Metformin',
    'Take with meals to reduce stomach upset. Swallow tablets whole, do not crush or chew. Stay well hydrated. Avoid excessive alcohol.',
    'Common: Nausea, vomiting, diarrhea, stomach pain, loss of appetite, metallic taste. Rare: Lactic acidosis (rare but serious), vitamin B12 deficiency with long-term use.',
    'Used to treat type 2 diabetes. Helps control blood sugar levels. May be used alone or with other diabetes medications or insulin. Also used for polycystic ovary syndrome (PCOS).',
    'Category B - Not recommended during pregnancy. Insulin is preferred for blood sugar control during pregnancy. Inform doctor if planning pregnancy.',
    'Can be used in children 10 years and older for type 2 diabetes. Dose adjusted based on response and tolerance.',
    'Passes into breast milk in small amounts. Benefits and risks should be discussed with healthcare provider. Monitor infant blood sugar if used.'
  ),
  (
    'Omeprazole',
    'Take before meals, usually before breakfast. Swallow capsule whole, do not crush or chew. Can take up to 4 days to see full benefit.',
    'Common: Headache, stomach pain, nausea, diarrhea, vomiting, gas. Long-term: Increased risk of bone fractures, vitamin B12 deficiency, low magnesium levels.',
    'Treats gastroesophageal reflux disease (GERD), stomach ulcers, erosive esophagitis, Zollinger-Ellison syndrome. Reduces stomach acid production.',
    'Category C - Use only if clearly needed. Discuss risks and benefits with healthcare provider if pregnant.',
    'Approved for children 1 year and older for certain conditions. Dose based on weight. Short-term use preferred.',
    'May pass into breast milk. Consult healthcare provider. Consider alternative medications for breastfeeding mothers.'
  );

-- Verify the data was inserted
SELECT drug_name, LEFT(indications, 50) as indications_preview 
FROM drugs 
ORDER BY drug_name;
