document.addEventListener('DOMContentLoaded', () => {
    // 1. التبديل بين لوحة تسجيل الدخول وإنشاء الحساب
    const authTabs = document.querySelectorAll('.auth-tab');
    const authPanels = document.querySelectorAll('.auth-panel');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    function switchTab(targetId) {
        authPanels.forEach(panel => panel.classList.add('hidden'));
        authTabs.forEach(tab => tab.classList.remove('active'));
        
        document.getElementById(targetId).classList.remove('hidden');
        document.querySelector(`[data-target="${targetId}"]`).classList.add('active');
    }

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.target));
    });

    if(showRegisterLink) showRegisterLink.onclick = () => switchTab('register-panel');
    if(showLoginLink) showLoginLink.onclick = () => switchTab('login-panel');

    // 2. إظهار/إخفاء كلمة المرور
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.targetInput);
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = 'إخفاء';
            } else {
                input.type = 'password';
                btn.textContent = 'إظهار';
            }
        });
    });

    // 3. التعامل مع الكاميرا (في لوحة المستخدم)
    const video = document.getElementById('video');
    const scanBtn = document.getElementById('scan-btn');

    async function setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
        } catch (err) {
            console.error("خطأ في فتح الكاميرا: ", err);
        }
    }

    // تشغيل الكاميرا فقط إذا كان قسم المستخدم ظاهراً (أو عند الضغط على دخول تجريبياً)
    // لتجربة الواجهة الآن، سنقوم بإخفاء قسم التسجيل وإظهار الكاميرا عند الضغط على "دخول"
    const loginForm = document.getElementById('login-form');
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('user-dashboard').classList.remove('hidden');
        setupCamera();
    };

    // 4. إرسال الصورة للسيرفر للفحص
    if (scanBtn) {
        scanBtn.onclick = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');

            scanBtn.innerText = "جاري الفحص...";
            scanBtn.disabled = true;

            try {
                const response = await fetch('/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageData })
                });
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('med-name').innerText = result.data.drug_name_ar;
                    document.getElementById('med-description').innerText = result.data.description_ar;
                    document.getElementById('result-card').classList.remove('hidden');
                } else {
                    alert(result.error || "لم يتم العثور على الدواء");
                }
            } catch (error) {
                alert("حدث خطأ في الاتصال بالسيرفر");
            } finally {
                scanBtn.innerText = "فحص";
                scanBtn.disabled = false;
            }
        };
    }
});
