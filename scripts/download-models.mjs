#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@xenova/transformers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.resolve(__dirname, '../public/models');

// Configure transformers.js to download and store models directly in public/models/
env.cacheDir = MODELS_DIR;
env.localModelPath = MODELS_DIR;
env.allowLocalModels = true;
env.allowRemoteModels = true;

async function main() {
  console.log(`\nDownloading local AI models to: ${MODELS_DIR}\n`);

  console.log('1/2 Downloading embedding model: Xenova/all-MiniLM-L6-v2 (quantized)...');
  await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });
  console.log('✓ Embedding model downloaded successfully.\n');

  console.log('2/3 Downloading QA model: Xenova/distilbert-base-uncased-distilled-squad (quantized)...');
  await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
    quantized: true,
  });
  console.log('✓ QA model downloaded successfully.\n');

  console.log('3/3 Downloading GenAI LLM: Xenova/LaMini-Flan-T5-77M (quantized)...');
  await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
    quantized: true,
  });
  console.log('✓ GenAI Seq2Seq LLM downloaded successfully.\n');

  console.log('All local models are now downloaded and ready for 100% offline execution.');
}

main().catch((err) => {
  console.error('Failed to download local models:', err);
  process.exit(1);
});

