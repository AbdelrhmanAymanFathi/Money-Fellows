const API_URL = "http://localhost:5500/associations"; // تأكد من ضبط مسار السيرفر
const token = localStorage.getItem("token");

// التحقق من التوكن
if (!token) {
    alert("❌ يجب تسجيل الدخول أولًا!");
    window.location.href = "index.html";
}

// جلب جميع الجمعيات
async function fetchAssociations() {
    const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
        renderAssociations(data);
    } else {
        alert(`❌ خطأ: ${data.message}`);
    }
}

// عرض الجمعيات في الصفحة
function renderAssociations(associations) {
    const list = document.getElementById("associationsList");
    list.innerHTML = "";

    associations.forEach((assoc) => {
        list.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 class="text-xl font-semibold text-blue-600">${assoc.name}</h3>
                <p class="text-gray-600">${assoc.description}</p>
                <p class="text-gray-800 font-bold">💰 ${assoc.totalAmount} جنيه</p>
                <p class="text-gray-800">👥 الأعضاء: ${assoc.members.length} / ${assoc.membersLimit}</p>
                <button onclick="joinAssociation('${assoc._id}')" 
                    class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    🔹 الانضمام للجمعية
                </button>
            </div>
        `;
    });
}

// الانضمام إلى جمعية
async function joinAssociation(assocId) {
    const res = await fetch(`${API_URL}/${assocId}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ تم الانضمام بنجاح!");
        fetchAssociations(); // تحديث القائمة
    } else {
        alert(`❌ خطأ: ${data.message}`);
    }
}

// إظهار فورم إنشاء جمعية
function showCreateForm() {
    document.getElementById("createForm").classList.remove("hidden");
}

// إخفاء فورم إنشاء جمعية
function hideCreateForm() {
    document.getElementById("createForm").classList.add("hidden");
}

// إنشاء جمعية جديدة
async function createAssociation() {
    const name = document.getElementById("assocName").value;
    const description = document.getElementById("assocDesc").value;
    const totalAmount = document.getElementById("assocAmount").value;
    const membersLimit = document.getElementById("assocLimit").value;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, totalAmount, membersLimit }),
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ تم إنشاء الجمعية بنجاح!");
        hideCreateForm();
        fetchAssociations(); // تحديث القائمة
    } else {
        alert(`❌ خطأ: ${data.message}`);
    }
}

// تحميل الجمعيات عند فتح الصفحة
fetchAssociations();
