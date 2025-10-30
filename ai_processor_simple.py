"""
Simple AI Processor for FinderAI - Fallback Version
Uses image hashing for similarity detection (faster, no heavy ML libraries)
This is a fallback if transformers/torch causes crashes
"""

from PIL import Image
import sys
import json
import os
import hashlib
import numpy as np

def get_image_features(image_path):
    """
    Generate simple feature vector from image using perceptual hash
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with features or error message
    """
    if not os.path.exists(image_path):
        return {"error": "Image file not found", "success": False}
    
    try:
        # Load image
        print(f"Processing image: {image_path}", file=sys.stderr)
        image = Image.open(image_path).convert('RGB')
        
        # Resize to standard size
        image = image.resize((224, 224))
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Generate multiple feature types
        features = []
        
        # 1. Color histogram (simplified - 16 bins per channel)
        for channel in range(3):
            hist, _ = np.histogram(img_array[:,:,channel], bins=16, range=(0, 256))
            features.extend(hist / hist.sum())  # Normalize
        
        # 2. Average color per region (4x4 grid = 16 regions, 3 channels = 48 values)
        grid_size = 4
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = img_array[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step, :]
                avg_color = region.mean(axis=(0, 1)) / 255.0  # Normalize to 0-1
                features.extend(avg_color)
        
        # 3. Edge detection (simple gradient-based)
        gray = img_array.mean(axis=2)  # Convert to grayscale
        gx = np.gradient(gray, axis=0)
        gy = np.gradient(gray, axis=1)
        edge_strength = np.sqrt(gx**2 + gy**2)
        
        # Edge histogram (16 bins)
        edge_hist, _ = np.histogram(edge_strength.flatten(), bins=16, range=(0, 100))
        features.extend(edge_hist / edge_hist.sum())  # Normalize
        
        # Convert to list of floats
        features = [float(f) for f in features]
        
        print(f"✅ Generated {len(features)} dimensional feature vector", file=sys.stderr)
        
        return {"embeddings": features, "success": True}
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error generating features: {error_msg}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {"error": error_msg, "success": False}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        result = {"error": "Usage: python ai_processor_simple.py <image_path>", "success": False}
        try:
            print(json.dumps(result))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"error": "JSON dump failed: " + str(e), "success": False}))
            sys.stdout.flush()
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Generate features
    result = get_image_features(image_path)
    
    # Output JSON to stdout (Node.js will read this)
    try:
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        try:
            print(json.dumps({"error": "JSON dump failed: " + str(e), "success": False}))
            sys.stdout.flush()
        except:
            print('{"error": "Critical JSON error", "success": false}')
            sys.stdout.flush()
