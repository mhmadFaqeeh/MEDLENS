from flask import Flask, render_template, request, jsonify
import sqlite3
import base64
import cv2
import numpy as np
import easyocr
import os

app = Flask(__name__)

# تجهيز قارئ النصوص (OCR) - سيتم تحميل الموديل في أول مرة تشغيل فقط
# نستخدم 'en' لأن أسماء الأدوية غالباً بالإنجليزية
reader = easyocr.Reader(['en']) 

def get_db_connection():
    # تأكد أن قاعدة البيانات medlens.db موجودة في نفس مجلد app.py
    db_path = os.path.join(os.path.dirname(__file__), 'medlens.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        data = request.json
        image_data = data['image'].split(",")[1]
        
        # تحويل كود الصورة (Base64) إلى مصفوفة يفهمها OpenCV
        nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # قراءة النص من الصورة
        result = reader.readtext(img)
        detected_text = " ".join([res[1] for res in result]).lower()
        print(f"--- النص المكتشف من الكاميرا: {detected_text} ---")

        # البحث في قاعدة البيانات
        conn = get_db_connection()
        medicine = None
        all_meds = conn.execute('SELECT * FROM medicines').fetchall()
        
        # مطابقة النص المكتشف مع أسماء الأدوية في الداتا بيز
        for med in all_meds:
            if med['name'].lower() in detected_text:
                medicine = med
                break
        conn.close()

        if medicine:
            return jsonify({
                "success": True,
                "name": medicine['name'],
                "description": medicine['description'],
                "usage": medicine['usage_instructions'],
                "warnings": medicine['warnings']
            })
        else:
            return jsonify({"success": False, "message": "لم يتم التعرف على الدواء في قاعدة البيانات"})

    except Exception as e:
        print(f"خطأ أثناء المعالجة: {e}")
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    # التشغيل على 0.0.0.0 ليسمح للتلفون بالدخول عبر شبكة الواي فاي
    app.run(host='0.0.0.0', port=5000, debug=True)