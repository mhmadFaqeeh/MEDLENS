import os
import cv2
import numpy as np
import base64
from flask import Flask, request, jsonify, render_template
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# دالة معالجة الصورة (لزيادة دقة الـ OCR)
def preprocess_image(image_data):
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # تباين ذكي لفصل النص عن لمعة العلبة
    _, processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return processed_img

def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.environ.get('MYSQLHOST'),
            user=os.environ.get('MYSQLUSER'),
            password=os.environ.get('MYSQLPASSWORD'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=os.environ.get('MYSQLPORT', 3306),
            charset='utf8mb4'
        )
    except Error: return None

@app.route('/scan', methods=['POST'])
def scan_drug():
    data = request.get_json()
    detected_text = data.get('text', '').strip().upper()

    if not detected_text:
        return jsonify({"success": False, "message": "لم يتم التقاط نص"}), 400

    conn = get_db_connection()
    if conn is None: return jsonify({"success": False, "message": "خطأ في الاتصال بالقاعدة"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        # البحث الذكي في جدول drugs الجديد
        query = """
            SELECT * FROM drugs 
            WHERE drug_name_en LIKE %s 
            OR drug_name_ar LIKE %s 
            LIMIT 1
        """
        search_like = f"%{detected_text}%"
        cursor.execute(query, (search_like, search_like))
        
        drug = cursor.fetchone()

        if drug:
            return jsonify({
                "success": True,
                "data": {
                    "اسم_الدواء": drug['drug_name_ar'],
                    "الاسم_العلمي": drug['active_ingredient'],
                    "الاستخدامات": drug['indications_ar'],
                    "الآثار_الجانبية": drug['side_effects_ar'],
                    "بدائل_متاحة": drug['alternatives']
                }
            })
        return jsonify({"success": False, "message": "الدواء غير مسجل في النظام"})
    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if conn.is_connected(): conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
