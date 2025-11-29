/**
 * Test script to list available Gemini models
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

const envPath = join(process.cwd(), envFile);

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listAvailableModels() {
  console.log('📋 Attempting to list available models via API...\n');
  
  // Try both v1 and v1beta
  const apiVersions = ['v1', 'v1beta'];
  let availableModels: string[] = [];

  for (const version of apiVersions) {
    try {
      console.log(`Trying ${version} API...`);
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.models) {
        console.log(`✅ Found ${response.data.models.length} models in ${version}:\n`);
        response.data.models.forEach((model: any) => {
          const modelName = model.name.replace('models/', '');
          console.log(`   - ${modelName}`);
          if (model.supportedGenerationMethods) {
            console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
          }
          availableModels.push(modelName);
        });
        console.log('');
        break; // Found models, no need to try other version
      }
    } catch (error: any) {
      if (error.response) {
        console.log(`❌ ${version} failed: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.data?.error?.message) {
          console.log(`   ${error.response.data.error.message.substring(0, 150)}\n`);
        }
      } else {
        console.log(`❌ ${version} error: ${error.message}\n`);
      }
    }
  }

  return availableModels;
}

async function testModels() {
  console.log('🧪 Testing Gemini models...\n');
  
  // First, try to list available models
  const availableModels = await listAvailableModels();
  
  // Remove duplicates and add common model names
  const modelsToTest = [
    ...new Set([
      ...availableModels,
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-1.0-pro',
      'gemini-1.0-pro-latest',
    ])
  ];

  console.log('\n🧪 Testing individual models...\n');

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "test" if you can read this.' }] }],
      });
      const text = result.response.text();
      console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...\n`);
      console.log(`\n🎉 Use this model name in your code: "${modelName}"\n`);
      break; // Found a working model
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      console.log(`❌ ${modelName} failed: ${errorMsg.substring(0, 150)}\n`);
    }
  }
}

testModels().catch(console.error);

