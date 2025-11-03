import sys
try:
    from transformers import CLIPProcessor, CLIPModel
    print("SUCCESS: CLIP is available!")
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
