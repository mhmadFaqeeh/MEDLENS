import os
import base64
import cv2
import numpy as np
import easyocr
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # ضروري جداً لربط الفرونت إيند مع الباك إيند

# 1. تهيئة محرك الـ OCR (مرة واحدة فقط خارج الـ Routes)
# قمنا بتعطيل الـ GPU لتجنب الـ Crash في السيرفرات السحابية
reader = easyocr.Reader(['en'], gpu=False)

# 2. وظيفة الاتصال بقاعدة البيانات باستخدام متغيرات البيئة
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.environ.get("MYSQLHOST"),
            user=os.environ.get("MYSQLUSER"),
            password=os.environ.get("MYSQLPASSWORD"),
            database=os.environ.get("MYSQLDATABASE"),
            port=int(os.environ.get("MYSQLPORT", 3306))
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# 3. المسار الرئيسي لفحص صورة الدواء (OCR + Database)
@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        # استلام البيانات من الطلب
        data = request.json
        image_b64 = data.get('image')
        
        if not image_b64:
            return jsonify({"error": "No image data provided"}), 400

        # معالجة صورة الـ Base64 وتحويلها لصيغة OpenCV
        # نتأكد من إزالة الجزء التعريفي للـ Base64 إذا وجد
        if ',' in image_b64:
            encoded_data = image_b64.split(',')[1]
        else:
            encoded_data = image_b64
            
        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # تنفيذ الـ OCR لاستخراج اسم الدواء
        results = reader.readtext(img)
        
        if not results:
            return jsonify({"error": "لم يتم التعرف على اسم الدواء، حاول التصوير بوضوح"}), 404
        
        # نأخذ النص المكتشف (الأكثر دقة عادةً يكون الأول)
        detected_name = results[0][1].strip()

        # البحث في قاعدة البيانات عن تفاصيل الدواء
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "فشل الاتصال بقاعدة البيانات"}), 500
            
        cursor = conn.cursor(dictionary=True)
        # بحث مرن (LIKE) للتعامل مع أي نص إضافي قد يقرأه الـ OCR
        query = "SELECT * FROM drugs WHERE drug_name_en LIKE %s"
        cursor.execute(query, ('%' + detected_name + '%',))
        drug_info = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if drug_info:
            # إرجاع كل التفاصيل (الاستخدام، الموانع، البدائل، إلخ)
            return jsonify({
                "success": True,
                "detected_name": detected_name,
                "data": drug_info
            })
        else:
            return jsonify({
                "success": False, 
                "error": f"تم قراءة '{detected_name}' ولكن لم يتم العثور عليه في قاعدة البيانات"
            }), 404

    except Exception as e:
        return jsonify({"error": f"حدث خطأ في السيرفر: {str(e)}"}), 500

# 4. تشغيل السيرفر بالمنفذ الصحيح لـ Railway
if __name__ == '__main__':
    # Railway بيعطيك Port ديناميكي لازم تقرأه من الـ Environment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
