"""
Vision Transformer AI Processor using timm library
Provides 768-dimensional semantic embeddings
"""

import sys
import json
import torch
import timm
from PIL import Image
from timm.data import resolve_data_config
from timm.data.transforms_factory import create_transform

class ViTProcessor:
    def __init__(self):
        print("[AI] Loading ViT model...", file=sys.stderr)
        self.model = timm.create_model("vit_base_patch16_224", pretrained=True, num_classes=0)
        self.model.eval()
        config = resolve_data_config({}, model=self.model)
        self.transform = create_transform(**config)
        print("[SUCCESS] ViT model loaded", file=sys.stderr)
    
    def extract_embedding(self, image_path):
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0)
        with torch.no_grad():
            embedding = self.model(input_tensor).squeeze().numpy()
        return embedding

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python ai_processor_enhanced.py <image_path>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        processor = ViTProcessor()
        print(f"[PROCESSING] Processing image: {image_path}", file=sys.stderr)
        embedding = processor.extract_embedding(image_path)
        
        print(f"[SUCCESS] Extracted {len(embedding)} features", file=sys.stderr)
        print(f"[STATS] Mean: {embedding.mean():.4f}, Std: {embedding.std():.4f}", file=sys.stderr)
        
        output = {
            "success": True,
            "embeddings": embedding.tolist(),
            "dimensions": len(embedding),
            "model": "ViT-Base-Patch16-224 (timm)",
            "feature_stats": {
                "mean": float(embedding.mean()),
                "std": float(embedding.std()),
                "min": float(embedding.min()),
                "max": float(embedding.max())
            }
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

