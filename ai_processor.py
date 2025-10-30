"""
AI Processor for FinderAI
Uses Hugging Face Transformers to generate image embeddings locally
This avoids API limitations and provides more reliable processing
"""

from transformers import ViTFeatureExtractor, ViTModel
from PIL import Image
import torch
import sys
import json
import os

def get_embeddings(image_path):
    """
    Generate embeddings for an image using Vision Transformer (ViT)
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of floats representing the image embeddings
    """
    try:
        # Load pre-trained ViT model and feature extractor
        print(f"Loading ViT model...", file=sys.stderr)
        extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
        model = ViTModel.from_pretrained('google/vit-base-patch16-224')
        
        # Load and preprocess image
        print(f"Processing image: {image_path}", file=sys.stderr)
        image = Image.open(image_path).convert('RGB')
        
        # Extract features
        inputs = extractor(images=image, return_tensors="pt")
        
        # Generate embeddings (no gradient needed for inference)
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Use mean pooling on the last hidden state to get a single vector
        # Shape: [batch_size, sequence_length, hidden_size] -> [hidden_size]
        embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
        
        print(f"✅ Generated {len(embeddings)} dimensional embeddings", file=sys.stderr)
        
        return embeddings
        
    except Exception as e:
        print(f"❌ Error generating embeddings: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ai_processor.py <image_path>", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}", file=sys.stderr)
        sys.exit(1)
    
    # Generate embeddings
    embeddings = get_embeddings(image_path)
    
    # Output JSON to stdout (Node.js will read this)
    print(json.dumps(embeddings))
