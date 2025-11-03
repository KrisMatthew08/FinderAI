"""
CLIP AI Processor for FinderAI
Uses OpenAI's CLIP model for superior image similarity matching
CLIP is specifically designed for comparing images and works great for lost & found matching
"""

from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import sys
import json
import os

# Set to use CPU only and limit threads to avoid memory issues
torch.set_num_threads(2)
os.environ['OMP_NUM_THREADS'] = '2'

def get_embeddings(image_path):
    """
    Generate embeddings for an image using CLIP
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with embeddings or error message
    """
    if not os.path.exists(image_path):
        return {"error": "Image file not found", "success": False}
    
    try:
        # Load CLIP model and processor
        print(f"Loading CLIP model...", file=sys.stderr)
        model_name = "openai/clip-vit-base-patch32"
        processor = CLIPProcessor.from_pretrained(model_name)
        model = CLIPModel.from_pretrained(model_name)
        model.eval()  # Set to evaluation mode
        
        # Load and preprocess image
        print(f"Processing image: {image_path}", file=sys.stderr)
        image = Image.open(image_path).convert('RGB')
        
        # Resize to save memory
        image = image.resize((224, 224))
        
        # Process image
        inputs = processor(images=image, return_tensors="pt")
        
        # Generate embeddings (no gradient needed for inference)
        with torch.no_grad():
            # Get image features from CLIP
            image_features = model.get_image_features(**inputs)
            
            # Normalize embeddings (CLIP works best with normalized vectors)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert to list
            embeddings = image_features.squeeze().tolist()
        
        print(f"✅ Generated {len(embeddings)} dimensional embeddings", file=sys.stderr)
        
        # Clear memory
        del model
        del processor
        del image_features
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
        result = {"error": "Usage: python ai_processor_clip.py <image_path>", "success": False}
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
