import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🔍 Checking Vite environment configuration...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('💡 Copy .env.example to .env and fill in your values');
    console.log('   cp .env.example .env\n');
  }
  
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const requiredVars = [
  'VITE_GOOGLE_MAPS_API_KEY'
];

const missingVars = [];
const configuredVars = [];

requiredVars.forEach(varName => {
  const found = envLines.find(line => line.startsWith(`${varName}=`));
  
  if (!found || found.split('=')[1].trim() === '' || found.includes('your_')) {
    missingVars.push(varName);
  } else {
    configuredVars.push(varName);
  }
});

// Report results
console.log('✅ Configured variables:');
configuredVars.forEach(varName => {
  console.log(`   ${varName}`);
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing or incomplete variables:');
  missingVars.forEach(varName => {
    console.log(`   ${varName}`);
  });
  console.log('\n💡 Please configure these variables in your .env file\n');
  process.exit(1);
}

console.log('\n🎉 Vite environment configuration looks good!\n');