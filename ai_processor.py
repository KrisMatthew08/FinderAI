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

# Set to use CPU only and limit threads to avoid memory issues
torch.set_num_threads(1)
os.environ['OMP_NUM_THREADS'] = '1'

def get_embeddings(image_path):
    """
    Generate embeddings for an image using Vision Transformer (ViT)
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with embeddings or error message
    """
    if not os.path.exists(image_path):
        return {"error": "Image file not found", "success": False}
    
    try:
        # Load pre-trained ViT model and feature extractor
        print(f"Loading ViT model...", file=sys.stderr)
        extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
        model = ViTModel.from_pretrained('google/vit-base-patch16-224')
        model.eval()  # Set to evaluation mode
        
        # Load and preprocess image
        print(f"Processing image: {image_path}", file=sys.stderr)
        image = Image.open(image_path).convert('RGB')
        
        # Resize to save memory
        image = image.resize((224, 224))
        
        # Extract features
        inputs = extractor(images=image, return_tensors="pt")
        
        # Generate embeddings (no gradient needed for inference)
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Use mean pooling on the last hidden state to get a single vector
        # Shape: [batch_size, sequence_length, hidden_size] -> [hidden_size]
        embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
        
        print(f"✅ Generated {len(embeddings)} dimensional embeddings", file=sys.stderr)
        
        # Clear memory
        del model
        del extractor
        del outputs
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
        return {"embeddings": embeddings, "success": True}
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error generating embeddings: {error_msg}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {"error": error_msg, "success": False}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        result = {"error": "Usage: python ai_processor.py <image_path>", "success": False}
        try:
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": "JSON dump failed: " + str(e), "success": False}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Generate embeddings (handles file existence check internally)
    result = get_embeddings(image_path)
    
    # Output JSON to stdout (Node.js will read this)
    try:
        print(json.dumps(result))
        sys.stdout.flush()  # Ensure output is sent immediately
    except Exception as e:
        try:
            print(json.dumps({"error": "JSON dump failed: " + str(e), "success": False}))
            sys.stdout.flush()
        except:
            # Last resort - print simple error
            print('{"error": "Critical JSON error", "success": false}')
            sys.stdout.flush()
