// =========================================
// MedLens — script.js
// =========================================

window.onload = function () {

    // =========================================
    // Constants & State
    // =========================================
    const USERS_KEY = 'medlens_users';
    const LANG_KEY  = 'medlens_language';

    let currentLang     = localStorage.getItem(LANG_KEY) || 'ar';
    let currentMedicine = null;
    let cameraStream    = null;

    // =========================================
    // Translations
    // =========================================
    const T = {
        ar: {
            heroEyebrow: 'Perceptive Medicine Recognition',
            heroTitle: 'واجهة ذكية لفحص الأدوية',
            loginTab: 'تسجيل الدخول',
            registerTab: 'إنشاء حساب',
            loginWelcome: 'مرحباً بك',
            loginSubtitle: 'ادخل للبدء بفحص الأدوية',
            usernameLabel: 'اسم المستخدم',
            usernamePlaceholder: 'أدخل اسم المستخدم',
            passwordLabel: 'كلمة المرور',
            passwordPlaceholder: 'أدخل كلمة المرور',
            loginBtn: 'دخول',
            noAccountText: 'ليس لديك حساب؟',
            createNewAccountLink: 'إنشاء حساب',
            registerTitle: 'إنشاء حساب',
            registerSubtitle: 'أنشئ حسابك للوصول للنظام',
            newUsernameLabel: 'اسم المستخدم',
            newPasswordLabel: 'كلمة المرور',
            confirmPasswordLabel: 'تأكيد كلمة المرور',
            registerBtn: 'إنشاء الحساب',
            haveAccountText: 'لديك حساب؟',
            backToLoginLink: 'تسجيل الدخول',
            featureScanTitle: 'فحص الدواء',
            featureScanText: 'التقاط وتحليل سريع',
            featureResultTitle: 'نتائج واضحة',
            featureResultText: 'اسم ووصف مباشر',
            featureVoiceTitle: 'دعم صوتي',
            featureVoiceText: 'قراءة حسب اللغة',
            cameraStatusText: 'فحص الدواء فعّال',
            scanBtn: 'فحص',
            retryBtn: 'إعادة',
            resultBadge: 'نتيجة الفحص',
            categoryLabel: 'الفئة',
            formLabel: 'الشكل',
            ingredientLabel: 'المادة الفعالة',
            indicationsLabel: 'الاستخدامات',
            sideEffectsLabel: 'الأعراض الجانبية',
            contraLabel: 'موانع الاستخدام',
            alternativesLabel: 'البدائل',
            storageLabel: 'التخزين',
            readAloudBtn: 'قراءة النتيجة',
            userDashboardTitle: 'لوحة المستخدم',
            readyToScan: 'جاهز لفحص الدواء',
            smartScanTitle: 'فحص ذكي للدواء',
            smartScanText: 'وجّه الكاميرا نحو العبوة',
            voiceResultsLabel: 'صوت النتائج',
            languageLabel: 'اللغة',
            adminDashboardTitle: 'إدارة الأدوية',
            adminBannerText: 'أضف وعدّل بيانات الأدوية',
            medicineDatabase: 'قاعدة البيانات',
            tableName: 'الاسم',
            tableDescription: 'الوصف',
            tableActions: 'خيارات',
            addMedicineTitle: 'إضافة دواء جديد',
            addMedicineBtn: 'إضافة إلى النظام',
            deleteBtn: 'حذف',
            errFillFields: 'يرجى تعبئة جميع الحقول.',
            errPasswordShort: 'كلمة المرور يجب أن تكون 4 أحرف أو أكثر.',
            errPasswordMatch: 'كلمتا المرور غير متطابقتين.',
            errUserExists: 'اسم المستخدم موجود بالفعل.',
            successRegister: 'تم إنشاء الحساب بنجاح.',
            errLogin: 'اسم المستخدم أو كلمة المرور غير صحيحين.',
            errCamera: 'يرجى السماح بالوصول للكاميرا.',
            scanning: 'جاري الفحص...',
            notFound: 'لم يتم التعرف على الدواء.',
            errServer: 'خطأ في الاتصال بالسيرفر.',
            successAdded: 'تمت إضافة الدواء بنجاح!',
            errFillMed: 'يرجى تعبئة الحقول الأساسية.',
        },
        en: {
            heroEyebrow: 'Perceptive Medicine Recognition',
            heroTitle: 'Smart Medicine Scanning Interface',
            loginTab: 'Login',
            registerTab: 'Register',
            loginWelcome: 'Welcome Back',
            loginSubtitle: 'Sign in to start scanning medicines',
            usernameLabel: 'Username',
            usernamePlaceholder: 'Enter username',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter password',
            loginBtn: 'Login',
            noAccountText: "Don't have an account?",
            createNewAccountLink: 'Create Account',
            registerTitle: 'Create Account',
            registerSubtitle: 'Register to access the system',
            newUsernameLabel: 'Username',
            newPasswordLabel: 'Password',
            confirmPasswordLabel: 'Confirm Password',
            registerBtn: 'Create Account',
            haveAccountText: 'Already have an account?',
            backToLoginLink: 'Login',
            featureScanTitle: 'Medicine Scan',
            featureScanText: 'Fast capture and analysis',
            featureResultTitle: 'Clear Results',
            featureResultText: 'Name and description',
            featureVoiceTitle: 'Voice Support',
            featureVoiceText: 'Read results aloud',
            cameraStatusText: 'Medicine Scan Active',
            scanBtn: 'Scan',
            retryBtn: 'Retry',
            resultBadge: 'Scan Result',
            categoryLabel: 'Category',
            formLabel: 'Form',
            ingredientLabel: 'Active Ingredient',
            indicationsLabel: 'Uses',
            sideEffectsLabel: 'Side Effects',
            contraLabel: 'Contraindications',
            alternativesLabel: 'Alternatives',
            storageLabel: 'Storage',
            readAloudBtn: 'Read Result',
            userDashboardTitle: 'User Dashboard',
            readyToScan: 'Ready to scan',
            smartScanTitle: 'Smart Medicine Scan',
            smartScanText: 'Point camera at the medicine box',
            voiceResultsLabel: 'Voice Results',
            languageLabel: 'Language',
            adminDashboardTitle: 'Medicine Management',
            adminBannerText: 'Add and edit medicine data',
            medicineDatabase: 'Database',
            tableName: 'Name',
            tableDescription: 'Description',
            tableActions: 'Actions',
            addMedicineTitle: 'Add New Medicine',
            addMedicineBtn: 'Add to System',
            deleteBtn: 'Delete',
            errFillFields: 'Please fill in all fields.',
            errPasswordShort: 'Password must be at least 4 characters.',
            errPasswordMatch: 'Passwords do not match.',
            errUserExists: 'Username already exists.',
            successRegister: 'Account created successfully.',
            errLogin: 'Incorrect username or password.',
            errCamera: 'Please allow camera access.',
            scanning: 'Scanning...',
            notFound: 'Medicine not recognized.',
            errServer: 'Server connection error.',
            successAdded: 'Medicine added successfully!',
            errFillMed: 'Please fill in the required fields.',
        }
    };

    function t(key) { return T[currentLang][key] || key; }

    // =========================================
    // Elements
    // =========================================
    const authSection    = document.getElementById('auth-section');
    const userDash       = document.getElementById('user-dashboard');
    const adminDash      = document.getElementById('admin-dashboard');
    const loginForm      = document.getElementById('login-form');
    const registerForm   = document.getElementById('register-form');
    const loginPanel     = document.getElementById('login-panel');
    const registerPanel  = document.getElementById('register-panel');
    const authMsg        = document.getElementById('auth-message');
    const langSelect     = document.getElementById('language-select');
    const adminLangSel   = document.getElementById('admin-language-select');
    const voiceToggle    = document.getElementById('voice-toggle');
    const video          = document.getElementById('video');
    const freezeImg      = document.getElementById('freeze-img');
    const scanBtn        = document.getElementById('scan-btn');
    const resultCard     = document.getElementById('result-card');
    const medName        = document.getElementById('med-name');
    const closeResultBtn = document.getElementById('close-result-btn');
    const voiceReadBtn   = document.getElementById('voice-read-btn');
    const addMedBtn      = document.getElementById('add-med-btn');
    const medsTableBody  = document.querySelector('#meds-table tbody');
    const logoutBtn      = document.getElementById('logout-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const canvas         = document.createElement('canvas');

    // Result value elements
    const rv = {
        category:    document.getElementById('val-category'),
        form:        document.getElementById('val-form'),
        ingredient:  document.getElementById('val-ingredient'),
        indications: document.getElementById('val-indications'),
        sideeffects: document.getElementById('val-sideeffects'),
        contra:      document.getElementById('val-contra'),
        alternatives:document.getElementById('val-alternatives'),
        storage:     document.getElementById('val-storage'),
    };

    // =========================================
    // Language
    // =========================================
    function applyLang(lang) {
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);

        const isAr = lang === 'ar';
        document.documentElement.lang = lang;
        document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            if (T[lang][k]) el.textContent = T[lang][k];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const k = el.getAttribute('data-i18n-placeholder');
            if (T[lang][k]) el.placeholder = T[lang][k];
        });

        // Update scan button text
        if (scanBtn) {
            const mode = scanBtn.dataset.mode || 'scan';
            scanBtn.querySelector('span').textContent = mode === 'retry' ? t('retryBtn') : t('scanBtn');
        }

        // If result visible, re-render with new lang
        if (currentMedicine && resultCard && !resultCard.classList.contains('hidden')) {
            renderResult(currentMedicine);
        }

        if (langSelect) langSelect.value = lang;
        if (adminLangSel) adminLangSel.value = lang;
    }

    if (langSelect) langSelect.addEventListener('change', e => applyLang(e.target.value));
    if (adminLangSel) adminLangSel.addEventListener('change', e => applyLang(e.target.value));

    // =========================================
    // Auth Tabs
    // =========================================
    function switchPanel(targetId) {
        clearMsg();
        loginPanel.classList.remove('active-panel');
        registerPanel.classList.remove('active-panel');
        document.getElementById(targetId).classList.add('active-panel');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === targetId);
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchPanel(btn.dataset.target));
    });

    document.getElementById('show-register-link')?.addEventListener('click', e => {
        e.preventDefault(); switchPanel('register-panel');
    });
    document.getElementById('show-login-link')?.addEventListener('click', e => {
        e.preventDefault(); switchPanel('login-panel');
    });

    // =========================================
    // Auth Messages
    // =========================================
    function showMsg(msg, type = 'success') {
        authMsg.textContent = msg;
        authMsg.className   = `auth-message ${type}`;
        authMsg.classList.remove('hidden');
    }

    function clearMsg() {
        authMsg.textContent = '';
        authMsg.className   = 'auth-message hidden';
    }

    // =========================================
    // Users (LocalStorage)
    // =========================================
    function getUsers() {
        const saved = localStorage.getItem(USERS_KEY);
        if (saved) return JSON.parse(saved);
        const defaults = [{ username: 'admin', password: 'admin123', role: 'admin' }];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
        return defaults;
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // =========================================
    // Password Toggle (Eye Button)
    // =========================================
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.targetInput);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.querySelector('.eye-show').classList.toggle('hidden', isHidden);
            btn.querySelector('.eye-hide').classList.toggle('hidden', !isHidden);
        });
    });

    // =========================================
    // Register
    // =========================================
    registerForm?.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value.trim();
        const confirm  = document.getElementById('register-confirm-password').value.trim();

        if (!username || !password || !confirm) { showMsg(t('errFillFields'), 'error'); return; }
        if (password.length < 4) { showMsg(t('errPasswordShort'), 'error'); return; }
        if (password !== confirm) { showMsg(t('errPasswordMatch'), 'error'); return; }

        const users = getUsers();
        if (users.some(u => u.username === username)) { showMsg(t('errUserExists'), 'error'); return; }

        users.push({ username, password, role: 'user' });
        saveUsers(users);
        registerForm.reset();
        switchPanel('login-panel');
        showMsg(t('successRegister'), 'success');
        document.getElementById('username').value = username;
    });

    // =========================================
    // Login
    // =========================================
    loginForm?.addEventListener('submit', e => {
        e.preventDefault();
        clearMsg();
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();
        const user = getUsers().find(u => u.username === username && u.password === password);

        if (!user) { showMsg(t('errLogin'), 'error'); return; }

        authSection.classList.add('hidden');
        if (user.role === 'admin') {
            adminDash.classList.remove('hidden');
        } else {
            userDash.classList.remove('hidden');
            startCamera();
        }
    });

    // =========================================
    // Logout
    // =========================================
    function logout() {
        stopCamera();
        userDash.classList.add('hidden');
        adminDash.classList.add('hidden');
        authSection.classList.remove('hidden');
        loginForm?.reset();
        clearMsg();
        resultCard?.classList.add('hidden');
        if (scanBtn) { scanBtn.dataset.mode = 'scan'; scanBtn.querySelector('span').textContent = t('scanBtn'); }
    }

    logoutBtn?.addEventListener('click', logout);
    adminLogoutBtn?.addEventListener('click', logout);

    // =========================================
    // Camera
    // =========================================
    async function startCamera() {
        try {
            const constraints = { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } };
            cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = cameraStream;
            video.classList.remove('hidden');
            freezeImg.classList.add('hidden');
            scanBtn.dataset.mode = 'scan';
            scanBtn.querySelector('span').textContent = t('scanBtn');
        } catch (err) {
            alert(t('errCamera') + ' ' + err.message);
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    // =========================================
    // Scan Button
    // =========================================
    scanBtn?.addEventListener('click', async () => {
        if (scanBtn.dataset.mode === 'retry') {
            resultCard.classList.add('hidden');
            startCamera();
            return;
        }

        if (!video.videoWidth || !video.videoHeight) return;

        // Capture frame
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        // Freeze display
        freezeImg.src = imageData;
        freezeImg.classList.remove('hidden');
        video.classList.add('hidden');

        scanBtn.dataset.mode = 'retry';
        scanBtn.querySelector('span').textContent = t('scanning');
        scanBtn.disabled = true;

        try {
            const res = await fetch('/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData, lang: currentLang })
            });

            const data = await res.json();

            if (data.success && data.data) {
                currentMedicine = data.data;
                renderResult(data.data);
                resultCard.classList.remove('hidden');
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

                if (voiceToggle?.checked) speakResult(data.data);
            } else {
                alert(data.error || t('notFound'));
                startCamera();
            }
        } catch (err) {
            alert(t('errServer'));
            startCamera();
        } finally {
            scanBtn.querySelector('span').textContent = t('retryBtn');
            scanBtn.disabled = false;
        }
    });

    // =========================================
    // Render Result
    // =========================================
    function renderResult(drug) {
        if (!drug) return;
        medName.textContent = drug.name || '—';
        rv.category.textContent    = drug.category    || '—';
        rv.form.textContent        = drug.form        || '—';
        rv.ingredient.textContent  = drug.active_ingredient || '—';
        rv.indications.textContent = drug.indications || '—';
        rv.sideeffects.textContent = drug.side_effects || '—';
        rv.contra.textContent      = drug.contraindications || '—';
        rv.alternatives.textContent= drug.alternatives || '—';
        rv.storage.textContent     = drug.storage     || '—';
    }

    // =========================================
    // Voice Read
    // =========================================
    function speakResult(drug) {
        if (!drug) return;
        window.speechSynthesis.cancel();
        const text = currentLang === 'ar'
            ? `${drug.name}. ${drug.indications}. ${drug.side_effects}`
            : `${drug.name}. ${drug.indications}. ${drug.side_effects}`;
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
    }

    voiceReadBtn?.addEventListener('click', () => {
        if (currentMedicine) speakResult(currentMedicine);
    });

    closeResultBtn?.addEventListener('click', () => {
        resultCard.classList.add('hidden');
        startCamera();
    });

    // =========================================
    // Admin — Add Medicine
    // =========================================
    addMedBtn?.addEventListener('click', () => {
        const nameAr = document.getElementById('add-name-ar').value.trim();
        const nameEn = document.getElementById('add-name-en').value.trim();
        const descAr = document.getElementById('add-desc-ar').value.trim();
        const descEn = document.getElementById('add-desc-en').value.trim();

        if (!nameAr || !nameEn) { alert(t('errFillMed')); return; }

        const displayName = currentLang === 'ar' ? `${nameAr} / ${nameEn}` : `${nameEn} / ${nameAr}`;
        const displayDesc = currentLang === 'ar' ? (descAr || descEn) : (descEn || descAr);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${displayName}</td>
            <td>${displayDesc}</td>
            <td><button class="delete-btn">${t('deleteBtn')}</button></td>
        `;
        tr.querySelector('.delete-btn').addEventListener('click', () => tr.remove());
        medsTableBody.appendChild(tr);

        ['add-name-ar','add-name-en','add-desc-ar','add-desc-en'].forEach(id => {
            document.getElementById(id).value = '';
        });
        alert(t('successAdded'));
    });

    // =========================================
    // Init
    // =========================================
    getUsers();
    applyLang(currentLang);
};
