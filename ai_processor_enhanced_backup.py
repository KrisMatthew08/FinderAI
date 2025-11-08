"""
Enhanced AI Processor for FinderAI - Advanced Feature Extraction
Uses sophisticated computer vision techniques to generate 768-dimensional embeddings
Similar to ViT but without requiring heavy ML libraries
"""

from PIL import Image
import sys
import json
import os
import numpy as np
from scipy import ndimage
import cv2

def extract_advanced_features(image_path):
    """
    Extract advanced visual features similar to ViT's approach
    
    Features extracted (768 dimensions total):
    - Color features (256 dims)
    - Texture features (256 dims)
    - Shape features (256 dims)
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with 768-dimensional embeddings or error message
    """
    if not os.path.exists(image_path):
        return {"error": "Image file not found", "success": False}
    
    try:
        print(f"📸 Processing image: {image_path}", file=sys.stderr)
        
        # Load image
        image = Image.open(image_path).convert('RGB')
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32)
        
        # OpenCV format (for advanced processing)
        img_cv = cv2.cvtColor(img_array.astype(np.uint8), cv2.COLOR_RGB2BGR)
        
        features = []
        
        # ========== COLOR FEATURES (256 dimensions) ==========
        print("🎨 Extracting color features...", file=sys.stderr)
        
        # 1. RGB Histograms (48 dims: 16 bins × 3 channels)
        for channel in range(3):
            hist, _ = np.histogram(img_array[:,:,channel], bins=16, range=(0, 256))
            features.extend((hist / hist.sum()).tolist())
        
        # 2. HSV Histograms (48 dims: 16 bins × 3 channels)
        img_hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        for channel in range(3):
            hist, _ = np.histogram(img_hsv[:,:,channel], bins=16, range=(0, 256))
            features.extend((hist / hist.sum()).tolist())
        
        # 3. LAB Color Space (48 dims: 16 bins × 3 channels)
        img_lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        for channel in range(3):
            hist, _ = np.histogram(img_lab[:,:,channel], bins=16, range=(0, 256))
            features.extend((hist / hist.sum()).tolist())
        
        # 4. Spatial Color Grid (64 dims: 8×8 grid, average RGB)
        grid_size = 8
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = img_array[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step, :]
                avg_color = region.mean(axis=(0, 1)) / 255.0
                # Only take the mean across channels for spatial compactness
                features.append(float(avg_color.mean()))
        
        # 5. Color Moments (48 dims: mean, std, skew for RGB in 4×4 grid)
        grid_size = 4
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = img_array[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step, :]
                # Mean, std, skewness for each RGB channel (flatten to get more info)
                features.append(float(region.mean() / 255.0))
                features.append(float(region.std() / 255.0))
                # Skewness approximation
                centered = (region - region.mean()) / (region.std() + 1e-5)
                skew = float((centered ** 3).mean())
                features.append(skew)
        
        print(f"   ✅ Color features: {len(features)} dims", file=sys.stderr)
        
        # ========== TEXTURE FEATURES (256 dimensions) ==========
        print("🧩 Extracting texture features...", file=sys.stderr)
        texture_start = len(features)
        
        # Convert to grayscale for texture analysis
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY).astype(np.float32)
        
        # 1. Local Binary Pattern (LBP) inspired features (64 dims)
        # Compute differences with neighbors in 8×8 grid
        grid_size = 8
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = gray[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                # Local variance as texture measure
                features.append(float(region.std() / 255.0))
        
        # 2. Gabor Filter-like responses (64 dims: 8 orientations × 8 regions)
        for angle in range(0, 180, 22):  # 8 orientations
            # Sobel at different angles (approximation of Gabor)
            theta = np.radians(angle)
            kx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
            ky = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
            
            # Directional gradient
            oriented_grad = kx * np.cos(theta) + ky * np.sin(theta)
            
            # Average response in each quadrant
            h, w = oriented_grad.shape
            regions = [
                oriented_grad[:h//2, :w//2],
                oriented_grad[:h//2, w//2:],
                oriented_grad[h//2:, :w//2],
                oriented_grad[h//2:, w//2:],
                oriented_grad[:h//4, :],
                oriented_grad[h//4:h//2, :],
                oriented_grad[h//2:3*h//4, :],
                oriented_grad[3*h//4:, :]
            ]
            for region in regions:
                features.append(float(np.abs(region).mean() / 100.0))
        
        # 3. Multi-scale Gradient Magnitudes (64 dims: 4 scales × 16 regions)
        for scale in [1, 2, 3, 4]:
            # Gaussian blur at different scales
            blurred = cv2.GaussianBlur(gray, (2*scale+1, 2*scale+1), scale)
            gx = cv2.Sobel(blurred, cv2.CV_32F, 1, 0, ksize=3)
            gy = cv2.Sobel(blurred, cv2.CV_32F, 0, 1, ksize=3)
            magnitude = np.sqrt(gx**2 + gy**2)
            
            # Divide into 4×4 grid
            grid_size = 4
            h_step = 224 // grid_size
            w_step = 224 // grid_size
            for i in range(grid_size):
                for j in range(grid_size):
                    region = magnitude[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                    features.append(float(region.mean() / 100.0))
        
        # 4. Edge Orientation Histogram (64 dims: 16 orientations × 4 quadrants)
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        orientation = np.arctan2(gy, gx) * 180 / np.pi  # -180 to 180
        orientation = (orientation + 180) % 360  # 0 to 360
        
        h, w = orientation.shape
        quadrants = [
            orientation[:h//2, :w//2],
            orientation[:h//2, w//2:],
            orientation[h//2:, :w//2],
            orientation[h//2:, w//2:]
        ]
        
        for quad in quadrants:
            hist, _ = np.histogram(quad.flatten(), bins=16, range=(0, 360))
            features.extend((hist / (hist.sum() + 1e-5)).tolist())
        
        print(f"   ✅ Texture features: {len(features) - texture_start} dims", file=sys.stderr)
        
        # ========== SHAPE FEATURES (256 dimensions) ==========
        print("📐 Extracting shape features...", file=sys.stderr)
        shape_start = len(features)
        
        # 1. Canny Edge Maps at multiple thresholds (64 dims)
        for thresh_low in [30, 50, 70, 100]:
            edges = cv2.Canny(img_cv, thresh_low, thresh_low * 2)
            
            # Divide into 4×4 grid
            grid_size = 4
            h_step = 224 // grid_size
            w_step = 224 // grid_size
            for i in range(grid_size):
                for j in range(grid_size):
                    region = edges[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                    # Percentage of edge pixels in region
                    features.append(float(region.mean() / 255.0))
        
        # 2. Corner Detection (Harris corners) (64 dims: 8×8 grid)
        gray_uint8 = gray.astype(np.uint8)
        corners = cv2.cornerHarris(gray_uint8, blockSize=2, ksize=3, k=0.04)
        corners = cv2.dilate(corners, None)
        
        grid_size = 8
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = corners[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                features.append(float(region.max() / (corners.max() + 1e-5)))
        
        # 3. Hough Lines (approximate - 64 dims)
        edges_canny = cv2.Canny(img_cv, 50, 150)
        
        # Line detection in different orientations
        for angle_bin in range(8):
            # Detect lines around specific angles
            lines = cv2.HoughLines(edges_canny, 1, np.pi / 180, threshold=50)
            
            # Count lines in 8 angular bins
            if lines is not None:
                angles = lines[:, 0, 1] * 180 / np.pi  # Convert to degrees
                hist, _ = np.histogram(angles, bins=8, range=(0, 180))
                features.extend((hist / (hist.sum() + 1e-5)).tolist())
            else:
                features.extend([0.0] * 8)
        
        # 4. Contour Features (64 dims)
        # Find contours
        _, binary = cv2.threshold(gray_uint8, 127, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        # Create contour density map in 8×8 grid
        contour_map = np.zeros((224, 224), dtype=np.uint8)
        cv2.drawContours(contour_map, contours, -1, (255), thickness=1)
        
        grid_size = 8
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region = contour_map[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                features.append(float(region.mean() / 255.0))
        
        # 5. HOG-inspired features (64 dims)
        # Histogram of Oriented Gradients in 4×4 grid
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        magnitude = np.sqrt(gx**2 + gy**2)
        orientation = np.arctan2(gy, gx) * 180 / np.pi
        orientation = (orientation + 180) % 360
        
        grid_size = 4
        h_step = 224 // grid_size
        w_step = 224 // grid_size
        for i in range(grid_size):
            for j in range(grid_size):
                region_orient = orientation[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                region_mag = magnitude[i*h_step:(i+1)*h_step, j*w_step:(j+1)*w_step]
                
                # Weighted histogram
                hist, _ = np.histogram(region_orient.flatten(), bins=4, range=(0, 360),
                                      weights=region_mag.flatten())
                features.extend((hist / (hist.sum() + 1e-5)).tolist())
        
        print(f"   ✅ Shape features: {len(features) - shape_start} dims", file=sys.stderr)
        
        # ========== FINAL PROCESSING ==========
        # Ensure exactly 768 dimensions
        current_dims = len(features)
        if current_dims < 768:
            # Pad with zeros if needed
            features.extend([0.0] * (768 - current_dims))
        elif current_dims > 768:
            # Truncate if somehow we have more
            features = features[:768]
        
        # Normalize the entire feature vector
        features = np.array(features, dtype=np.float32)
        norm = np.linalg.norm(features)
        if norm > 0:
            features = features / norm
        
        features = features.tolist()
        
        print(f"✅ Generated {len(features)} dimensional feature vector (ViT-like)", file=sys.stderr)
        
        return {
            "embeddings": features,
            "success": True,
            "dimensions": len(features),
            "model": "Enhanced Computer Vision (768D)"
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error generating features: {error_msg}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {"error": error_msg, "success": False}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        result = {"error": "Usage: python ai_processor_enhanced.py <image_path>", "success": False}
        print(json.dumps(result))
        sys.stdout.flush()
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Generate features
    result = extract_advanced_features(image_path)
    
    # Output JSON to stdout
    try:
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": "JSON dump failed: " + str(e), "success": False}))
        sys.stdout.flush()
