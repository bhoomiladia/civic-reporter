import os
import sys
import json
import urllib.request

# Ensure models directory exists
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODELS_DIR = os.path.join(ROOT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODELS_DIR, "pothole_yolov8.pt")
MODEL_URL = "https://huggingface.co/peterhdd/pothole-detection-yolov8/resolve/main/best.pt"

def download_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Downloading YOLOv8 weights from {MODEL_URL}...", file=sys.stderr)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Download complete.", file=sys.stderr)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"verified": False, "error": "No image path provided", "message": "No image path provided"}))
        return

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({"verified": False, "error": f"Image path not found: {image_path}", "message": "Image path not found"}))
        return

    try:
        download_model()
        from ultralytics import YOLO
        
        # Load model
        model = YOLO(MODEL_PATH)
        
        # Run inference
        results = model(image_path, verbose=False)
        
        # Parse results
        pothole_count = 0
        max_conf = 0.0
        
        if len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                conf = float(box.conf[0])
                if conf > max_conf:
                    max_conf = conf
                pothole_count += 1
        
        verified = pothole_count > 0 and max_conf >= 0.35
        
        output = {
            "verified": verified,
            "count": pothole_count,
            "confidence": max_conf,
            "message": f"Detected {pothole_count} potholes in the image (max confidence: {max_conf:.2f})." if verified else "No potholes detected with sufficient confidence in the image."
        }
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({
            "verified": False,
            "error": str(e),
            "message": f"AI Image Verification failed with error: {str(e)}"
        }))

if __name__ == "__main__":
    main()
