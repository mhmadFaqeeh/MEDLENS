# ... (الأكواد السابقة لـ EasyOCR والـ Database تبقى كما هي)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/test')
def test():
    return "السيرفر شغال تمام يا محمد!"

@app.route('/scan', methods=['POST'])
def scan_drug():
    try:
        data = request.json
        image_b64 = data.get('image')
        if not image_b64:
            return jsonify({"error": "No image data"}), 400
        
        # معالجة الصورة... (تأكد أن كل سطر هنا يبدأ بـ 8 مسافات لأنه داخل try)
        encoded_data = image_b64.split(',')[1] if ',' in image_b64 else image_b64
        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = reader.readtext(img)
        if not results:
            return jsonify({"error": "No text detected"}), 404
            
        detected_name = results[0][1].strip()
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM drugs WHERE drug_name_en LIKE %s"
        cursor.execute(query, ('%' + detected_name + '%',))
        drug_info = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": drug_info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# تأكد أن هذا الجزء في نهاية الملف تماماً وبدون أي مسافات قبله
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
