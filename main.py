import os
import base64
import cv2
import numpy as np
import easyocr
import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# إعداد التطبيق
app = Flask(__name__)
CORS(app)

# تهيئة محرك الـ OCR (تعطيل GPU ليتناسب مع سيرفرات Railway)
try:
    reader = easyocr.Reader(['en'], gpu=False)
    print("OCR Reader initialized successfully.")
except Exception as e:
    print(f"Error initializing OCR: {e}")

# وظيفة الاتصال بقاعدة البيانات
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.environ.get("MYSQLHOST"),
            user=os.environ.get("MYSQLUSER"),
            password=os.environ.get("MYSQLPASSWORD"),
            database=os.environ.get("MYSQLDATABASE"),
            port=int(os.environ.get("MYSQLPORT", 3306)),
            connect_timeout=10
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database Connection Error: {err}")
        return None

# المسار الرئيسي لعرض الواجهة
@app.route('/')
def home():
    return render_template('index.html')

# مسار فحص السيرفر
@app.route('/test')
def test():
    return "MedLens Server is Running!"

# المسار الرئيسي لمعالجة صورة الدواء
@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        data = request.json
        image_b64 = data.get('image')
        
        if not image_b64:
            return jsonify({"success": False, "error": "لم يتم استلام صورة"}), 400

        # معالجة الـ Base64 وتحويله لصورة
        if ',' in image_b64:
            encoded_data = image_b64.split(',')[1]
        else:
            encoded_data = image_b64
            
        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"success": False, "error": "فشل في معالجة الصورة"}), 400

        # قراءة النص باستخدام OCR
        results = reader.readtext(img)
        
        if not results:
            return jsonify({"success": False, "error": "لم يتم اكتشاف نص، حاول بوضوح"}), 404
        
        # استخراج أول نص مكتشف
        detected_name = results[0][1].strip()

        # البحث في MySQL
        conn = get_db_connection()
        if conn is None:
            return jsonify({"success": False, "error": "مشكلة في الاتصال بقاعدة البيانات"}), 500
            
        cursor = conn.cursor(dictionary=True)
        # البحث عن اسم الدواء (En) بطريقة مرنة
        query = "SELECT * FROM drugs WHERE drug_name_en LIKE %s"
        cursor.execute(query, ('%' + detected_name + '%',))
        drug_info = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if drug_info:
            return jsonify({
                "success": True, 
                "detected_name": detected_name, 
                "data": drug_info
            })
        else:
            return jsonify({
                "success": False, 
                "error": f"تمت قراءة '{detected_name}' ولكن لم يتم العثور عليه في السجلات"
            }), 404

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"success": False, "error": f"حدث خطأ: {str(e)}"}), 500

# تشغيل السيرفر
if __name__ == '__main__':
    # قراءة المنفذ من Railway أو استخدام 5000 محلياً
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
