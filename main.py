import os
from flask import Flask, request, jsonify, render_template
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# دالة الاتصال بقاعدة البيانات باستخدام المتغيرات من Railway
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.environ.get('MYSQLHOST'),
            user=os.environ.get('MYSQLUSER'),
            password=os.environ.get('MYSQLPASSWORD'),
            database=os.environ.get('MYSQLDATABASE', 'railway'),
            port=os.environ.get('MYSQLPORT', 3306),
            charset='utf8mb4',
            collation='utf8mb4_general_ci'
        )
        return connection
    except Error as e:
        print(f"Error: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_drug():
    data = request.get_json()
    # الاسم الذي تم التعرف عليه بواسطة الكاميرا (OCR)
    detected_text = data.get('text', '').strip()

    if not detected_text:
        return jsonify({"success": False, "message": "لم يتم اكتشاف نص"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"success": False, "message": "خطأ في الاتصال بقاعدة البيانات"}), 500

    try:
        # استخدام Dictionary Cursor لتسهيل قراءة الأعمدة بأسمائها
        cursor = conn.cursor(dictionary=True)
        
        # الاستعلام باستخدام الأسماء التي ظهرت في صورتك (product_name_en)
        # نستخدم LIKE للبحث عن جزء من الاسم لضمان نتائج أفضل
        query = "SELECT * FROM medications WHERE product_name_en LIKE %s OR product_name_ar LIKE %s LIMIT 1"
        search_term = f"%{detected_text}%"
        cursor.execute(query, (search_term, search_term))
        
        drug_info = cursor.fetchone()

        if drug_info:
            return jsonify({
                "success": True,
                "data": {
                    "name_en": drug_info['product_name_en'],
                    "name_ar": drug_info['product_name_ar'],
                    "active_ingredient": drug_info['active_ingredient'],
                    "indications": drug_info['indications'], # دواعي الاستعمال
                    "side_effects": drug_info['side_effects'], # الآثار الجانبية
                    "contraindications": drug_info['contraindications'] # موانع الاستعمال
                }
            })
        else:
            return jsonify({"success": False, "message": "الدواء غير موجود في قاعدة البيانات"})

    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    # تشغيل السيرفر على البورت الذي يحدده Railway
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
