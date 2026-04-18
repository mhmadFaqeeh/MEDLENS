import os
import cv2
import numpy as np
import mysql.connector
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from fuzzywuzzy import process # للمطابقة التقريبية للاسماء

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- 1. معالجة الصورة ذكياً (Pre-processing) ---
def process_image_for_ocr(image_path):
    # قراءة الصورة
    img = cv2.imread(image_path)
    
    # 1. تحويل لرمادي (Grayscale)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. زيادة التباين (Contrast) وتحويل لأسود وأبيض (Thresholding)
    # استخدام Adaptive Thresholding للتعامل مع الإضاءة المختلفة
    processed_img = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    # حفظ الصورة المعالجة (اختياري للتأكد)
    processed_path = image_path.replace('.', '_proc.')
    cv2.imwrite(processed_path, processed_img)
    return processed_path

# --- 2. البحث الذكي (Fuzzy Matching) ---
def find_best_match(detected_text, db_results):
    # db_results هي قائمة بأسماء الأدوية من قاعدة البيانات
    # هاد الفنكشن بيعرف إن "Panadol" هي نفسها "Panadoll" أو "Panado"
    highest_match = process.extractOne(detected_text, db_results)
    if highest_match and highest_match[1] > 70: # نسبة دقة أعلى من 70%
        return highest_match[0]
    return None

# --- 3. المسارات الرئيسية ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_medicine():
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400
    
    file = request.files['image']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # تنفيذ المعالجة (تحويل لأسود وأبيض وتباين)
    processed_file = process_image_for_ocr(filepath)

    # --- (هنا يتم استدعاء مكتبة الـ OCR مثل Tesseract) ---
    # نستخدم نص تجريبي كمثال:
    detected_from_ocr = "Panadoll" # نفرض الـ OCR قرأها غلط بزيادة حرف L

    # جلب الأسماء من قاعدة البيانات للمطابقة
    conn = mysql.connector.connect(
        host=os.environ.get('MYSQLHOST'),
        user=os.environ.get('MYSQLUSER'),
        password=os.environ.get('MYSQLPASSWORD'),
        database=os.environ.get('MYSQLDATABASE')
    )
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM medicines")
    db_medicines = [row[0] for row in cursor.fetchall()]
    
    # المطابقة الذكية
    best_name = find_best_match(detected_from_ocr, db_medicines)
    
    if best_name:
        cursor.execute("SELECT * FROM medicines WHERE name = %s", (best_name,))
        result = cursor.fetchone()
        conn.close()
        return jsonify({
            "status": "success",
            "detected": detected_from_ocr,
            "matched_as": best_name,
            "data": result
        })

    conn.close()
    return jsonify({"status": "error", "message": "الدواء غير معروف"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
