document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const userDashboard = document.getElementById('user-dashboard');
    const loginForm = document.getElementById('login-form');
    const video = document.getElementById('video');
    const scanBtn = document.getElementById('scan-btn');

    // 1. التبديل بين الشاشات (تسجيل الدخول)
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            authSection.classList.add('hidden');
            userDashboard.classList.remove('hidden');
            startCamera();
        };
    }

    // 2. تشغيل الكاميرا
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            video.srcObject = stream;
        } catch (err) {
            alert("يرجى السماح بالوصول للكاميرا للفحص الذكي");
        }
    }

    // 3. التحكم في لغة الواجهة
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.onchange = () => {
            document.body.dir = langSelect.value === 'ar' ? 'rtl' : 'ltr';
        };
    }

    // 4. معالجة زر الفحص
    if (scanBtn) {
        scanBtn.onclick = () => {
            scanBtn.innerText = "جاري التحليل...";
            setTimeout(() => {
                scanBtn.innerText = "فحص";
                document.getElementById('result-card').classList.remove('hidden');
            }, 1200);
        };
    }
});
