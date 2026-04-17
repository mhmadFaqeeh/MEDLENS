// =========================================
// MedLens JavaScript
// هذا الملف مسؤول عن:
// 1) تسجيل الدخول
// 2) إنشاء الحساب
// 3) دعم العربي والإنجليزي
// 4) تشغيل الكاميرا
// 5) التقاط صورة وعرض نتيجة
// 6) دعم الصوت
// 7) إدارة الأدوية في لوحة الأدمن
// 8) إظهار / إخفاء كلمة المرور
// =========================================

window.onload = function () {
    console.log("MedLens System Ready...");

    // =========================================
    // مفاتيح التخزين المحلي
    // نستخدم LocalStorage بدل Backend فعلي
    // =========================================
    const USERS_STORAGE_KEY = "medlens_users";
    const LANGUAGE_STORAGE_KEY = "medlens_language";

    // =========================================
    // ربط عناصر الصفحة
    // =========================================
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const authSection = document.getElementById("auth-section");
    const userDashboard = document.getElementById("user-dashboard");
    const adminDashboard = document.getElementById("admin-dashboard");

    const loginPanel = document.getElementById("login-panel");
    const registerPanel = document.getElementById("register-panel");
    const showRegisterLink = document.getElementById("show-register-link");
    const showLoginLink = document.getElementById("show-login-link");
    const authTabs = document.querySelectorAll(".auth-tab");
    const authMessage = document.getElementById("auth-message");

    const languageSelect = document.getElementById("language-select");
    const voiceToggle = document.getElementById("voice-toggle");

    const video = document.getElementById("video");
    const freezeImg = document.getElementById("freeze-img");
    const scanBtn = document.getElementById("scan-btn");
    const resultCard = document.getElementById("result-card");
    const medName = document.getElementById("med-name");
    const medDescription = document.getElementById("med-description");

    const addMedBtn = document.getElementById("add-med-btn");
    const medsTableBody = document.querySelector("#meds-table tbody");

    // أزرار إظهار/إخفاء الباسورد
    const togglePasswordButtons = document.querySelectorAll(".toggle-password-btn");

    // كانفاس مخفي لاستخراج صورة من الفيديو
    const canvas = document.createElement("canvas");

    // =========================================
    // قاموس الترجمة
    // كل النصوص الأساسية هنا
    // =========================================
    const translations = {
        ar: {
            heroEyebrow: "Smart Medicine Recognition",
            heroTitle: "واجهة ذكية لفحص الأدوية والتعرف عليها بصريًا",

            featureScanTitle: "فحص الدواء",
            featureScanText: "التقاط وتحليل سريع",
            featureResultTitle: "نتائج واضحة",
            featureResultText: "اسم ووصف مباشر",
            featureVoiceTitle: "دعم صوتي",
            featureVoiceText: "قراءة حسب اللغة",

            loginTab: "تسجيل الدخول",
            registerTab: "إنشاء حساب",
            loginWelcome: "مرحبًا بك في MedLens",
            loginSubtitle: "ادخل إلى النظام للبدء بفحص الأدوية وإدارة النتائج",
            usernameLabel: "اسم المستخدم",
            usernamePlaceholder: "أدخل اسم المستخدم",
            passwordLabel: "كلمة المرور",
            passwordPlaceholder: "أدخل كلمة المرور",
            loginBtn: "دخول",
            noAccountText: "ليس لديك حساب؟",
            createNewAccountLink: "إنشاء حساب جديد",

            registerTitle: "إنشاء حساب جديد",
            registerSubtitle: "أنشئ حسابًا جديدًا للوصول إلى لوحة المستخدم",
            newUsernameLabel: "اسم المستخدم الجديد",
            newUsernamePlaceholder: "اسم المستخدم الجديد",
            newPasswordLabel: "كلمة المرور",
            newPasswordPlaceholder: "كلمة المرور",
            confirmPasswordLabel: "تأكيد كلمة المرور",
            confirmPasswordPlaceholder: "تأكيد كلمة المرور",
            registerBtn: "إنشاء الحساب",
            haveAccountText: "لديك حساب بالفعل؟",
            backToLoginLink: "العودة لتسجيل الدخول",

            userPanelEyebrow: "MedLens User Panel",
            userDashboardTitle: "لوحة المستخدم",
            readyToScan: "جاهز لفحص الدواء",
            smartScanTitle: "فحص ذكي للدواء",
            smartScanText: "وجّه الكاميرا نحو العبوة أو القرص ليتم عرض البيانات بشكل سريع وواضح.",
            languageLabel: "اللغة",
            voiceResultsLabel: "صوت النتائج",
            cameraStatusText: "فحص الدواء فعّال",
            scanBtn: "فحص",
            retryBtn: "إعادة",
            resultBadge: "نتيجة الدواء",
            defaultMedName: "اسم الدواء",
            defaultMedDescription: "وصف الدواء سيظهر هنا بعد الفحص...",

            adminPanelEyebrow: "Admin Dashboard",
            adminDashboardTitle: "إدارة الأدوية",
            medicineDatabase: "قاعدة بيانات الأدوية",
            adminBannerTitle: "إدارة بيانات النظام",
            adminBannerText: "أضف الأدوية، عدّل بياناتها، واحتفظ بواجهة منظمة تناسب مشروع MedLens.",
            tableName: "الاسم",
            tableDescription: "الوصف",
            tableActions: "خيارات",
            addMedicineTitle: "إضافة دواء جديد",
            addNameArPlaceholder: "الاسم (Ar)",
            addNameEnPlaceholder: "الاسم (En)",
            addDescArPlaceholder: "الوصف (Ar)",
            addDescEnPlaceholder: "الوصف (En)",
            addMedicineBtn: "إضافة إلى النظام",
            deleteBtn: "حذف",

            showPassword: "إظهار",
            hidePassword: "إخفاء",

            msgFillAllFields: "يرجى تعبئة جميع حقول إنشاء الحساب.",
            msgPasswordShort: "كلمة المرور يجب أن تكون 4 أحرف أو أكثر.",
            msgPasswordsNotMatch: "كلمتا المرور غير متطابقتين.",
            msgUserExists: "اسم المستخدم موجود بالفعل. اختر اسمًا آخر.",
            msgRegisterSuccess: "تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.",
            msgLoginError: "اسم المستخدم أو كلمة المرور غير صحيحين.",
            msgCameraDenied: "يرجى السماح بالوصول للكاميرا.",
            msgMedicineAdded: "تمت إضافة الدواء بنجاح!",
            msgFillMedicineFields: "يرجى تعبئة الحقول الأساسية."
        },

        en: {
            heroEyebrow: "Smart Medicine Recognition",
            heroTitle: "Smart Interface for Scanning and Recognizing Medicines",

            featureScanTitle: "Medicine Scan",
            featureScanText: "Fast capture and analysis",
            featureResultTitle: "Clear Results",
            featureResultText: "Direct name and description",
            featureVoiceTitle: "Voice Support",
            featureVoiceText: "Reading results by language",

            loginTab: "Login",
            registerTab: "Create Account",
            loginWelcome: "Welcome to MedLens",
            loginSubtitle: "Sign in to start scanning medicines and managing results",
            usernameLabel: "Username",
            usernamePlaceholder: "Enter username",
            passwordLabel: "Password",
            passwordPlaceholder: "Enter password",
            loginBtn: "Login",
            noAccountText: "Don't have an account?",
            createNewAccountLink: "Create a new account",

            registerTitle: "Create New Account",
            registerSubtitle: "Create a new account to access the user dashboard",
            newUsernameLabel: "New Username",
            newUsernamePlaceholder: "New username",
            newPasswordLabel: "Password",
            newPasswordPlaceholder: "Password",
            confirmPasswordLabel: "Confirm Password",
            confirmPasswordPlaceholder: "Confirm password",
            registerBtn: "Create Account",
            haveAccountText: "Already have an account?",
            backToLoginLink: "Back to login",

            userPanelEyebrow: "MedLens User Panel",
            userDashboardTitle: "User Dashboard",
            readyToScan: "Ready to scan medicine",
            smartScanTitle: "Smart Medicine Scan",
            smartScanText: "Point the camera at the medicine box or pill to display data quickly and clearly.",
            languageLabel: "Language",
            voiceResultsLabel: "Voice Results",
            cameraStatusText: "Medicine Scan Active",
            scanBtn: "Scan",
            retryBtn: "Retry",
            resultBadge: "Medicine Result",
            defaultMedName: "Medicine Name",
            defaultMedDescription: "Medicine description will appear here after scanning...",

            adminPanelEyebrow: "Admin Dashboard",
            adminDashboardTitle: "Medicine Management",
            medicineDatabase: "Medicine Database",
            adminBannerTitle: "Manage System Data",
            adminBannerText: "Add medicines, edit their data, and maintain an organized interface for the MedLens project.",
            tableName: "Name",
            tableDescription: "Description",
            tableActions: "Actions",
            addMedicineTitle: "Add New Medicine",
            addNameArPlaceholder: "Name (Ar)",
            addNameEnPlaceholder: "Name (En)",
            addDescArPlaceholder: "Description (Ar)",
            addDescEnPlaceholder: "Description (En)",
            addMedicineBtn: "Add to System",
            deleteBtn: "Delete",

            showPassword: "Show",
            hidePassword: "Hide",

            msgFillAllFields: "Please fill in all registration fields.",
            msgPasswordShort: "Password must be at least 4 characters long.",
            msgPasswordsNotMatch: "Passwords do not match.",
            msgUserExists: "Username already exists. Please choose another one.",
            msgRegisterSuccess: "Account created successfully. You can now log in.",
            msgLoginError: "Incorrect username or password.",
            msgCameraDenied: "Please allow camera access.",
            msgMedicineAdded: "Medicine added successfully!",
            msgFillMedicineFields: "Please fill in the required fields."
        }
    };

    // =========================================
    // تخزين آخر نتيجة مع اللغتين
    // حتى تتغير حسب اللغة المختارة
    // =========================================
    let currentMedicine = {
        arName: "بانادول",
        enName: "Panadol",
        arDesc: "مسكن آلام فعال وخافض للحرارة.",
        enDesc: "An effective pain reliever and fever reducer."
    };

    // =========================================
    // دوال اللغة
    // =========================================
    function getCurrentLanguage() {
        return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "ar";
    }

    function setCurrentLanguage(lang) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }

    function t(key) {
        const lang = getCurrentLanguage();
        return translations[lang][key] || key;
    }

    // تحديث نص زر إظهار/إخفاء الباسورد حسب الحالة
    function updatePasswordToggleLabels() {
        togglePasswordButtons.forEach((button) => {
            const inputId = button.getAttribute("data-target-input");
            const targetInput = document.getElementById(inputId);

            if (!targetInput) return;

            button.textContent = targetInput.type === "password" ? t("showPassword") : t("hidePassword");
        });
    }

    // تطبيق اللغة على الصفحة
    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            const key = element.getAttribute("data-i18n-placeholder");
            if (translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });

        if (scanBtn) {
            scanBtn.textContent = scanBtn.dataset.mode === "retry" ? t("retryBtn") : t("scanBtn");
        }

        if (resultCard && !resultCard.classList.contains("hidden")) {
            updateDisplayedResult();
        }

        updatePasswordToggleLabels();
    }

    // =========================================
    // رسائل النجاح والخطأ
    // =========================================
    function showMessage(message, type = "success") {
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
        authMessage.classList.remove("hidden");
    }

    function clearMessage() {
        authMessage.textContent = "";
        authMessage.className = "auth-message hidden";
    }

    // =========================================
    // التنقل بين الدخول وإنشاء الحساب
    // =========================================
    function switchAuthPanel(targetId) {
        clearMessage();

        loginPanel.classList.add("hidden");
        registerPanel.classList.add("hidden");

        authTabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.target === targetId);
        });

        document.getElementById(targetId).classList.remove("hidden");
    }

    // =========================================
    // إدارة المستخدمين باستخدام LocalStorage
    // =========================================
    function getUsers() {
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

        if (savedUsers) {
            return JSON.parse(savedUsers);
        }

        // إنشاء أدمن افتراضي
        const defaultUsers = [
            { username: "admin", password: "admin123", role: "admin" }
        ];

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    // =========================================
    // تحديث نتيجة الفحص حسب اللغة
    // =========================================
    function updateDisplayedResult() {
        const lang = getCurrentLanguage();
        medName.textContent = lang === "ar" ? currentMedicine.arName : currentMedicine.enName;
        medDescription.textContent = lang === "ar" ? currentMedicine.arDesc : currentMedicine.enDesc;
    }

    // عرض النتيجة + النطق
    function showResult(medicineData) {
        currentMedicine = medicineData;
        updateDisplayedResult();
        resultCard.classList.remove("hidden");

        if (voiceToggle.checked) {
            window.speechSynthesis.cancel();

            const lang = getCurrentLanguage();
            const speechText = lang === "ar"
                ? `${medicineData.arName}. ${medicineData.arDesc}`
                : `${medicineData.enName}. ${medicineData.enDesc}`;

            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
            window.speechSynthesis.speak(utterance);
        }
    }

    // =========================================
    // تشغيل الكاميرا
    // =========================================
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });

            video.srcObject = stream;
            video.classList.remove("hidden");
            freezeImg.classList.add("hidden");

            scanBtn.dataset.mode = "scan";
            scanBtn.textContent = t("scanBtn");
        } catch (error) {
            alert(`${t("msgCameraDenied")} ${error.message}`);
        }
    }

    // =========================================
    // Events للتبويبات
    // =========================================
    authTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            switchAuthPanel(this.dataset.target);
        });
    });

    if (showRegisterLink) {
        showRegisterLink.addEventListener("click", function (e) {
            e.preventDefault();
            switchAuthPanel("register-panel");
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener("click", function (e) {
            e.preventDefault();
            switchAuthPanel("login-panel");
        });
    }

    // =========================================
    // تغيير اللغة
    // =========================================
    if (languageSelect) {
        languageSelect.addEventListener("change", function () {
            const selectedLanguage = this.value;
            setCurrentLanguage(selectedLanguage);
            applyLanguage(selectedLanguage);
        });
    }

    // =========================================
    // إظهار / إخفاء كلمة المرور
    // =========================================
    togglePasswordButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const inputId = this.getAttribute("data-target-input");
            const targetInput = document.getElementById(inputId);

            if (!targetInput) return;

            targetInput.type = targetInput.type === "password" ? "text" : "password";
            updatePasswordToggleLabels();
        });
    });

    // =========================================
    // إنشاء حساب جديد
    // =========================================
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("register-username").value.trim().toLowerCase();
            const password = document.getElementById("register-password").value.trim();
            const confirmPassword = document.getElementById("register-confirm-password").value.trim();

            if (!username || !password || !confirmPassword) {
                showMessage(t("msgFillAllFields"), "error");
                return;
            }

            if (password.length < 4) {
                showMessage(t("msgPasswordShort"), "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage(t("msgPasswordsNotMatch"), "error");
                return;
            }

            const users = getUsers();
            const userExists = users.some((user) => user.username === username);

            if (userExists) {
                showMessage(t("msgUserExists"), "error");
                return;
            }

            users.push({
                username,
                password,
                role: "user"
            });

            saveUsers(users);
            registerForm.reset();

            switchAuthPanel("login-panel");
            showMessage(t("msgRegisterSuccess"), "success");

            document.getElementById("username").value = username;
            document.getElementById("password").focus();

            updatePasswordToggleLabels();
        });
    }

    // =========================================
    // تسجيل الدخول
    // =========================================
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            clearMessage();

            const username = document.getElementById("username").value.trim().toLowerCase();
            const password = document.getElementById("password").value.trim();

            const users = getUsers();
            const foundUser = users.find(
                (user) => user.username === username && user.password === password
            );

            if (!foundUser) {
                showMessage(t("msgLoginError"), "error");
                return;
            }

            authSection.classList.add("hidden");

            if (foundUser.role === "admin") {
                adminDashboard.classList.remove("hidden");
            } else {
                userDashboard.classList.remove("hidden");
                startCamera();
            }
        });
    }

    // =========================================
    // زر الفحص
    // أول ضغطة: يلتقط الصورة
    // ثاني ضغطة: يعيد التشغيل
    // =========================================
    if (scanBtn) {
        scanBtn.dataset.mode = "scan";

        scanBtn.addEventListener("click", function () {
            if (scanBtn.dataset.mode === "retry") {
                startCamera();
                resultCard.classList.add("hidden");
                return;
            }

            if (!video.videoWidth || !video.videoHeight) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL("image/png");

            freezeImg.src = imageData;
            freezeImg.classList.remove("hidden");
            video.classList.add("hidden");

            scanBtn.dataset.mode = "retry";
            scanBtn.textContent = t("retryBtn");

            // نتيجة تجريبية
            showResult({
                arName: "بانادول",
                enName: "Panadol",
                arDesc: "مسكن آلام فعال وخافض للحرارة.",
                enDesc: "An effective pain reliever and fever reducer."
            });
        });
    }

    // =========================================
    // لوحة الأدمن - إضافة دواء
    // =========================================
    if (addMedBtn) {
        addMedBtn.addEventListener("click", function () {
            const nameAr = document.getElementById("add-name-ar").value.trim();
            const nameEn = document.getElementById("add-name-en").value.trim();
            const descAr = document.getElementById("add-desc-ar").value.trim();
            const descEn = document.getElementById("add-desc-en").value.trim();

            if (!nameAr || !nameEn) {
                alert(t("msgFillMedicineFields"));
                return;
            }

            const lang = getCurrentLanguage();
            const displayedName = lang === "ar" ? `${nameAr} / ${nameEn}` : `${nameEn} / ${nameAr}`;
            const displayedDescription = lang === "ar" ? (descAr || descEn) : (descEn || descAr);

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${displayedName}</td>
                <td>${displayedDescription}</td>
                <td><button class="delete-btn">${t("deleteBtn")}</button></td>
            `;

            row.querySelector(".delete-btn").addEventListener("click", () => row.remove());

            medsTableBody.appendChild(row);

            document.getElementById("add-name-ar").value = "";
            document.getElementById("add-name-en").value = "";
            document.getElementById("add-desc-ar").value = "";
            document.getElementById("add-desc-en").value = "";

            alert(t("msgMedicineAdded"));
        });
    }

    // =========================================
    // تشغيل أولي
    // =========================================
    getUsers();

    const savedLanguage = getCurrentLanguage();
    setCurrentLanguage(savedLanguage);

    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }

    applyLanguage(savedLanguage);
};