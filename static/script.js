// دالة التقاط الصورة وإرسالها للسيرفر
async function scanMedicine() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');

    try {
        const response = await fetch('/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });

        const result = await response.json();

        if (result.success) {
            // عرض النتيجة في الـ UI
            document.getElementById('med-name').innerText = result.data.drug_name_ar;
            document.getElementById('med-description').innerText = result.data.description_ar;
            document.getElementById('result-card').classList.remove('hidden');
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error scanning:", error);
    }
}

document.getElementById('scan-btn').addEventListener('click', scanMedicine);
