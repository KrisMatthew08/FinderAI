const fs = require('fs');
require('dotenv').config();

async function processImageWithHF(imagePath) {
  try {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    console.log('🔑 API Key present:', API_KEY ? 'YES' : 'NO');
    console.log('🔑 API Key length:', API_KEY ? API_KEY.length : 0);
    console.log('🔑 API Key (trimmed):', API_KEY ? API_KEY.trim().substring(0, 10) + '...' : 'N/A');

    if (!API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not found in .env file. Please add it to your .env file.');
    }

    // Read image file as buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    console.log('📤 Sending image to Hugging Face API (direct fetch)...');
    console.log('📦 Image size:', imageBuffer.length, 'bytes');

    // Use direct fetch API call to Hugging Face
    // This bypasses the SDK's provider selection issues
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY.trim()}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBuffer
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Response Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📥 Received result type:', typeof result);
    console.log('📥 Result structure:', Array.isArray(result) ? 'array' : 'object');

    console.log('📥 Received result type:', typeof result);
    console.log('📥 Result is array:', Array.isArray(result));

    // Convert result to array if needed
    let embeddings;
    if (Array.isArray(result)) {
      // ViT returns [batch, sequence_length, hidden_size]
      // We want the [CLS] token (first token) which represents the whole image
      if (Array.isArray(result[0]) && Array.isArray(result[0][0])) {
        // Take first token of first batch: result[0][0]
        embeddings = result[0][0];
        console.log('📊 Using nested array (first token), length:', embeddings.length);
      } else if (Array.isArray(result[0])) {
        // If already flattened, take first element
        embeddings = result[0];
        console.log('📊 Using first array, length:', embeddings.length);
      } else {
        // If flat array, use as is
        embeddings = result;
        console.log('📊 Using flat array, length:', embeddings.length);
      }
    } else {
      embeddings = result;
      console.log('📊 Using raw result');
    }

    // Ensure embeddings is a flat array of numbers
    if (!Array.isArray(embeddings)) {
      throw new Error('Embeddings is not an array');
    }

    // Flatten if needed
    embeddings = embeddings.flat ? embeddings.flat(Infinity) : embeddings;

    console.log(`✅ Received ViT embeddings: ${embeddings.length} dimensions`);

    return {
      embeddings: embeddings,
      dimensions: embeddings.length,
      model: 'OpenAI CLIP-ViT-Base-Patch32 (Hugging Face)',
      source: 'huggingface',
      success: true
    };

  } catch (error) {
    console.error('❌ Hugging Face API error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('401') || error.message.includes('Invalid token')) {
      throw new Error('Invalid Hugging Face API key. Please check HUGGINGFACE_API_KEY in .env');
    } else if (error.message.includes('503') || error.message.includes('loading')) {
      throw new Error('Model is loading on Hugging Face servers, please wait 20-30 seconds and try again');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
    } else if (error.message.includes('not found')) {
      throw new Error('HUGGINGFACE_API_KEY not found in .env file');
    }
    
    throw error;
  }
}

module.exports = { processImageWithHF };
