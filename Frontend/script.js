const API_URL = "http://localhost:5500/auth"; // تأكد من ضبط مسار السيرفر

// تبديل بين فورم تسجيل الدخول والتسجيل
function toggleForms() {
    document.getElementById("loginForm").classList.toggle("hidden");
    document.getElementById("registerForm").classList.toggle("hidden");
}

// تسجيل الدخول
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ تسجيل الدخول ناجح!");
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html"; // توجيه للصفحة الرئيسية
    } else {
        alert(`❌ خطأ: ${data.message}`);
    }
}

// إنشاء حساب جديد
async function register() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const phone = document.getElementById("registerPhone").value;

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ تم إنشاء الحساب بنجاح!");
        toggleForms(); // تحويل المستخدم لفورم تسجيل الدخول
    } else {
        alert(`❌ خطأ: ${data.message}`);
    }
}
