import os
import base64
import cv2
import numpy as np
import easyocr
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS # مهم جداً للربط مع الفرونت إيند

app = Flask(__name__)
CORS(app) # لتجنب مشاكل الـ Cross-Origin

# 1. تهيئة الـ OCR مرة واحدة فقط (خارج الدوال) وبدون GPU لتوفير الذاكرة
reader = easyocr.Reader(['en'], gpu=False)

# 2. دالة الاتصال بقاعدة البيانات (اللي إنت جهزتها)
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("MYSQLHOST"),
        user=os.environ.get("MYSQLUSER"),
        password=os.environ.get("MYSQLPASSWORD"),
        database=os.environ.get("MYSQLDATABASE"),
        port=int(os.environ.get("MYSQLPORT", 3306))
    )

# 3. المسار الأساسي لفحص الدواء
@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        data = request.json
        image_b64 = data.get('image') # استلام الصورة بصيغة Base64
        
        # تحويل الـ Base64 إلى صورة يفهمها OpenCV
        encoded_data = image_b64.split(',')[1] if ',' in image_b64 else image_b64
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # تنفيذ الـ OCR لاستخراج النص
        results = reader.readtext(img)
        if not results:
            return jsonify({"error": "لم يتم العثور على نص واضح"}), 404
        
        # نأخذ النص الأول المكتوب (عادة يكون اسم الدواء)
        detected_name = results[0][1].strip()

        # البحث في قاعدة البيانات عن الاسم المكتشف
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM drugs WHERE drug_name_en LIKE %s"
        cursor.execute(query, ('%' + detected_name + '%',))
        drug_info = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if drug_info:
            return jsonify(drug_info)
        else:
            return jsonify({"error": f"الدواء {detected_name} غير موجود في القاعدة"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# تشغيل السيرفر
if __name__ == '__main__':
    # ملاحظة: Port و Host مهمين جداً للمنصات السحابية
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
