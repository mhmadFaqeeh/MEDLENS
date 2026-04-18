import os
import base64
import cv2
import numpy as np
import easyocr
import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

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
        print(f"Error: {err}")
        return None

def search_drug(cursor, text):
    # بحث مباشر
    cursor.execute("SELECT * FROM drugs WHERE UPPER(drug_name_en) LIKE %s", ('%' + text.upper() + '%',))
    result = cursor.fetchone()
    if result:
        return result

    # بحث بكل كلمة منفردة
    words = text.split()
    for word in words:
        if len(word) < 3:
            continue
        cursor.execute("SELECT * FROM drugs WHERE UPPER(drug_name_en) LIKE %s", ('%' + word.upper() + '%',))
        result = cursor.fetchone()
        if result:
            return result

    # بحث بالمادة الفعالة
    cursor.execute("SELECT * FROM drugs WHERE UPPER(active_ingredient) LIKE %s", ('%' + text.upper() + '%',))
    result = cursor.fetchone()
    if result:
        return result

    # بحث بالـ model_class
    clean = text.lower().replace(' ', '_')
    cursor.execute("SELECT * FROM drugs WHERE model_class LIKE %s", ('%' + clean + '%',))
    return cursor.fetchone()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        data = request.json
        image_b64 = data.get('image')
        lang = data.get('lang', 'ar')  # اللغة من الفرونت إند

        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        if ',' in image_b64:
            encoded_data = image_b64.split(',')[1]
        else:
            encoded_data = image_b64

        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # معالجة الصورة
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        enhanced = cv2.convertScaleAbs(gray, alpha=1.5, beta=20)

        results = reader.readtext(enhanced)

        if not results:
            msg = "لم يتم التعرف على نص في الصورة" if lang == 'ar' else "No text detected in image"
            return jsonify({"error": msg}), 404

        # جمع كل النصوص المقروءة
        all_text = ' '.join([r[1] for r in results])
        print(f"OCR detected: {all_text}")

        conn = get_db_connection()
        if conn is None:
            msg = "فشل الاتصال بقاعدة البيانات" if lang == 'ar' else "Database connection failed"
            return jsonify({"error": msg}), 500

        cursor = conn.cursor(dictionary=True)
        drug = search_drug(cursor, all_text)
        cursor.close()
        conn.close()

        if drug:
            # إرجاع البيانات حسب اللغة
            if lang == 'ar':
                return jsonify({
                    "success": True,
                    "detected_name": all_text,
                    "data": {
                        "name": drug['drug_name_ar'],
                        "category": drug['category_ar'],
                        "active_ingredient": drug['active_ingredient'],
                        "indications": drug['indications_ar'],
                        "side_effects": drug['side_effects_ar'],
                        "contraindications": drug['contraindications_ar'],
                        "storage": drug['storage_ar'],
                        "alternatives": drug['alternatives'],
                        "form": drug['form'],
                    }
                })
            else:
                return jsonify({
                    "success": True,
                    "detected_name": all_text,
                    "data": {
                        "name": drug['drug_name_en'],
                        "category": drug['category_en'],
                        "active_ingredient": drug['active_ingredient'],
                        "indications": drug['indications_en'],
                        "side_effects": drug['side_effects_en'],
                        "contraindications": drug['contraindications_en'],
                        "storage": drug['storage_en'],
                        "alternatives": drug['alternatives'],
                        "form": drug['form'],
                    }
                })
        else:
            msg = f"لم يتم العثور على '{all_text}' في قاعدة البيانات" if lang == 'ar' else f"'{all_text}' not found in database"
            return jsonify({"success": False, "error": msg}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
