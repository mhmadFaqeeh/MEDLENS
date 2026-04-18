let currentLang = 'ar';

function toggleLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.getElementById('main-html').dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    // تغيير النصوص برمجياً هنا
}

document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    startCamera();
};

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    document.getElementById('video').srcObject = stream;
}

document.getElementById('capture').onclick = async () => {
    // منطق إرسال الصورة للسيرفر (Blob)
    // بعد استلام النتيجة:
    document.getElementById('result-box').classList.remove('hidden');
    document.getElementById('res-name').innerText = "جاري التحليل...";
};

function speakText() {
    let msg = document.getElementById('res-name').innerText;
    let speech = new SpeechSynthesisUtterance(msg);
    speech.lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    window.speechSynthesis.speak(speech);
}
