import os
import base64
import cv2
import numpy as np
import easyocr
import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# تهيئة محرك الـ OCR للعمل على الـ CPU فقط لتوفير موارد السيرفر
reader = easyocr.Reader(['en'], gpu=False)

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
        print(f"Database Error: {err}")
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        data = request.json
        image_b64 = data.get('image')
        
        if not image_b64:
            return jsonify({"error": "No image data provided"}), 400

        # تحويل الصورة من Base64 إلى صيغة يفهمها OpenCV
        encoded_data = image_b64.split(',')[1] if ',' in image_b64 else image_b64
        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # قراءة النص من الصورة
        results = reader.readtext(img)
        
        if not results:
            return jsonify({"error": "لم يتم التعرف على نص، حاول بوضوح"}), 404
        
        detected_name = results[0][1].strip()

        # البحث في قاعدة البيانات
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "فشل الاتصال بقاعدة البيانات"}), 500
            
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM drugs WHERE drug_name_en LIKE %s"
        cursor.execute(query, ('%' + detected_name + '%',))
        drug_info = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if drug_info:
            return jsonify({"success": True, "detected_name": detected_name, "data": drug_info})
        else:
            return jsonify({"success": False, "error": f"تم قراءة '{detected_name}' ولكن غير موجود بالسجل"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
