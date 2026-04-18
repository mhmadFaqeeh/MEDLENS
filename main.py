import os
import cv2
import numpy as np
import pytesseract
from flask import Flask, render_template, request, jsonify
from gtts import gTTS

app = Flask(__name__, static_folder='static')

# إعداد OCR (إذا كنت تستخدم Windows محلياً حدد مسار tesseract)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def process_image(img_path):
    # 1. قراءة الصورة وتحويلها لرمادي (Grayscale)
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. زيادة التباين والحدة (Thresholding)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    # 3. قراءة النص
    text = pytesseract.image_to_string(gray, lang='eng+ara')
    return text.strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    path = "temp_img.png"
    file.save(path)
    
    # معالجة وقراءة
    extracted_text = process_image(path)
    
    # هنا منطق الـ Matching (مثال بسيط)
    # يمكنك ربطها بقاعدة البيانات اللي عملناها سابقاً
    result = {
        "name": extracted_text if extracted_text else "غير معروف",
        "description": "تم تحليل النص بنجاح" if extracted_text else "لم يتم التعرف على النص"
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
