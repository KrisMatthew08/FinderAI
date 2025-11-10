code = """
Enhanced AI Processor using ResNet-50
"""
import sys, json, torch
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
from PIL import Image

class ResNetProcessor:
    def __init__(self):
        print("[AI] Loading ResNet-50...")
        self.model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        self.model = torch.nn.Sequential(*list(self.model.children())[:-1])
        self.model.eval()
        self.transform = transforms.Compose([
            transforms.Resize(256), transforms.CenterCrop(224), transforms.ToTensor(),
            transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])])
        print("[OK] Model loaded")
    def extract_embedding(self, img_path):
        img = Image.open(img_path).convert("RGB")
        t = self.transform(img).unsqueeze(0)
        with torch.no_grad():
            return self.model(t).squeeze().numpy()

if len(sys.argv) < 2:
    print(json.dumps({"success":False,"error":"Need image path"}))
    sys.exit(1)
try:
    p = ResNetProcessor()
    print(f"[Processing] {sys.argv[1]}")
    emb = p.extract_embedding(sys.argv[1])
    print(f"[OK] {len(emb)} features")
    print(json.dumps({"success":True,"embeddings":emb.tolist(),"dimensions":len(emb),"model":"ResNet-50"}))
except Exception as e:
    print(json.dumps({"success":False,"error":str(e)}))
    sys.exit(1)
