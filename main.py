import os
import cv2
import numpy as np
import easyocr
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder='static')

# تهيئة القارئ مرة واحدة لتوفير الوقت
reader = easyocr.Reader(['ar', 'en'], gpu=False)

def enhance_for_ocr(img_path):
    # قراءة الصورة
    img = cv2.imread(img_path)
    # 1. تحويل لرمادي
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # 2. زيادة التباين والحدة (Adaptive Thresholding)
    enhanced = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    path = "processed.png"
    cv2.imwrite(path, enhanced)
    return path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400
    
    file = request.files['image']
    file.save("temp.png")
    
    # المعالجة
    processed_path = enhance_for_ocr("temp.png")
    
    # القراءة (سرعة عالية وماتشينج)
    results = reader.readtext(processed_path, detail=0)
    full_text = " ".join(results)
    
    return jsonify({
        "name": full_text if full_text else "تعذر القراءة",
        "status": "success"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
