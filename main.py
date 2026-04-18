import os
from flask import Flask, request, jsonify, render_template
import mysql.connector

app = Flask(__name__)

# إعدادات الاتصال بقاعدة البيانات (لرفعها على Railway لاحقاً)
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('MYSQLHOST'),
        user=os.environ.get('MYSQLUSER'),
        password=os.environ.get('MYSQLPASSWORD'),
        database=os.environ.get('MYSQLDATABASE'),
        port=os.environ.get('MYSQLPORT', 3306)
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_drug():
    # هذا المسار مخصص لاستقبال الصور ومعالجتها لاحقاً
    return jsonify({"success": True, "message": "جاري تحليل الدواء..."})

if __name__ == '__main__':
    # تشغيل السيرفر على البورت المطلوب من Railway
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
