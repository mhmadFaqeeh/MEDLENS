import os
import cv2
import numpy as np
import pytesseract
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder='static')

# دالة معالجة الصورة الذكية
def get_text_from_image(img_path):
    # 1. قراءة الصورة
    img = cv2.imread(img_path)
    if img is None: return ""
    
    # 2. تحويل لرمادي (Grayscale) لزيادة سرعة القراءة
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. زيادة التباين والحدة (Adaptive Thresholding) لتمزيق التشويش
    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    # حفظ النسخة المعالجة (للفحص)
    cv2.imwrite("static/processed_debug.png", processed_img)
    
    # 4. قراءة النص (عربي + إنجليزي)
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(processed_img, lang='eng+ara', config=custom_config)
    return text.strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    img_path = "temp_capture.png"
    file.save(img_path)
    
    # معالجة وقراءة
    extracted_text = get_text_from_image(img_path)
    
    return jsonify({
        "name": extracted_text if extracted_text else "تعذر قراءة الاسم",
        "status": "success"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
