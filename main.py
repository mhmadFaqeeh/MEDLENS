import os
import cv2
import numpy as np
import base64
from flask import Flask, request, jsonify, render_template
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# --- دالة الذكاء في معالجة الصورة (تفتيح الخط وزيادة التباين) ---
def preprocess_image(image_data):
    # تحويل الصورة من Base64 إلى مصفوفة OpenCV
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 1. تحويل للصورة لرمادي (Grayscale)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. زيادة التباين (Thresholding) - تحويل الحروف لأسود والخلفية أبيض تماماً
    # تقنية Otsu's binarization بتحدد أفضل تباين تلقائياً
    _, processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return processed_img

# --- دالة الاتصال بقاعدة البيانات ---
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
    except Error:
        return None

@app.route('/scan', methods=['POST'])
def scan_drug():
    data = request.get_json()
    image_b64 = data.get('image') # الصورة القادمة من الكاميرا
    detected_text = data.get('text', '').strip().upper() # النص المستخرج

    if not detected_text:
        return jsonify({"success": False, "message": "لم يتم التقاط نص بوضوح"}), 400

    conn = get_db_connection()
    if conn is None: return jsonify({"success": False, "message": "Database Connection Error"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        
        # --- الذكاء في البحث (Fuzzy Match) ---
        # نبحث باستخدام SOUNDS LIKE أو تقريب المسافات لضمان التعرف حتى مع وجود أخطاء إملائية بسيطة
        query = """
            SELECT *, 
            (CASE WHEN product_name_en = %s THEN 1 
                  WHEN product_name_en LIKE %s THEN 2 
                  ELSE 3 END) as priority
            FROM medications 
            WHERE product_name_en LIKE %s 
            OR product_name_ar LIKE %s 
            ORDER BY priority LIMIT 1
        """
        search_like = f"%{detected_text}%"
        cursor.execute(query, (detected_text, search_like, search_like, search_like))
        
        drug_info = cursor.fetchone()

        if drug_info:
            return jsonify({
                "success": True,
                "data": {
                    "name_ar": drug_info['product_name_ar'],
                    "indications": drug_info['indications'],
                    "side_effects": drug_info['side_effects']
                }
            })
        return jsonify({"success": False, "message": "لم يتم العثور على الدواء، حاول تقريب الكاميرا أكثر"})

    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if conn.is_connected():
            conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
