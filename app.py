import cv2
import numpy as np
from flask import Flask, request, jsonify, render_template
import base64
import mysql.connector
import easyocr

app = Flask(__name__)

# تشغيل محرك القراءة (بياخذ وقت أول مرة بس)
reader = easyocr.Reader(['en'])

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="medlens"
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.get_json()
        image_data = data['image'].split(",")[1]
        image_bytes = base64.b64decode(image_data)

        # تحويل الصورة لـ OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # --- المعالجة اللي طلبتها (أبيض وأسود وتغميق) ---
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        processed = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        # القراءة باستخدام EasyOCR
        results = reader.readtext(processed)
        detected_text = " ".join([res[1] for res in results]).upper()
        print(f"Detected: {detected_text}") # بطلعلك في الـ Terminal شو قرأ

        # البحث في القاعدة
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM drugs")
        all_drugs = cursor.fetchall()
        
        found_drug = None
        for drug in all_drugs:
            if drug['name'].upper() in detected_text:
                found_drug = drug
                break
        conn.close()

        if found_drug:
            return jsonify({"success": True, "name": found_drug['name'], "usage": found_drug['usage_info']})
        return jsonify({"success": False, "message": "لم يتم التعرف على الدواء"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
