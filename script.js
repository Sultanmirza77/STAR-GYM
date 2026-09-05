/* =========================================================
   STAR GYM — PREMIUM V4.2
   Complete Gym Management System
   + Student Profile Photo
========================================================= */

const STORAGE_KEY = "starGymStudents";

let students = [];
let currentScreen = "home";
let screenHistory = [];
let currentStudentId = null;
let currentRenewalStudentId = null;
let currentFilter = "all";
let toastTimer = null;

/* =========================================================
   STUDENT PROFILE PHOTO
========================================================= */

let selectedStudentPhoto = "";

/* =========================================================
   PWA INSTALL
========================================================= */

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", event => {

  event.preventDefault();

  deferredInstallPrompt = event;

  const installBtn =
    document.getElementById("installAppBtn");

  if (installBtn) {
    installBtn.style.display = "flex";
  }

});

async function installApp() {

  if (!deferredInstallPrompt) {

    showToast(
      "Install option browser menu me available hai",
      "ℹ"
    );

    return;
  }

  try {

    deferredInstallPrompt.prompt();

    const result =
      await deferredInstallPrompt.userChoice;

    if (result.outcome === "accepted") {

      showToast(
        "STAR GYM install ho raha hai 🔥",
        "✓"
      );

    } else {

      showToast(
        "Installation cancelled",
        "!"
      );

    }

    deferredInstallPrompt = null;

    const installBtn =
      document.getElementById("installAppBtn");

    if (installBtn) {
      installBtn.style.display = "none";
    }

  } catch (error) {

    console.error(
      "Install error:",
      error
    );

    showToast(
      "Installation start nahi ho saki",
      "!"
    );

  }

}

window.addEventListener("appinstalled", () => {

  deferredInstallPrompt = null;

  const installBtn =
    document.getElementById("installAppBtn");

  if (installBtn) {
    installBtn.style.display = "none";
  }

  showToast(
    "STAR GYM successfully installed 🎉",
    "✓"
  );

});

/* =========================================================
   START APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  setDefaultDates();

  setupStudentPhotoInputs();

  renderAll();

  setupAndroidBack();

});

/* =========================================================
   DATA
========================================================= */

function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    students =
      saved
        ? JSON.parse(saved)
        : [];

    if (!Array.isArray(students)) {
      students = [];
    }

    students.forEach(student => {

      if (!Array.isArray(student.payments)) {
        student.payments = [];
      }

      if (!Array.isArray(student.renewals)) {
        student.renewals = [];
      }

      if (typeof student.photo !== "string") {
        student.photo = "";
      }

    });

  } catch (error) {

    console.error(
      "Data loading error:",
      error
    );

    students = [];

  }

}

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(students)
    );

  } catch (error) {

    console.error(
      "Data save error:",
      error
    );

    showToast(
      "Data save nahi ho saka. Storage full ho sakta hai.",
      "!"
    );

  }

}

/* =========================================================
   STUDENT PHOTO SYSTEM
========================================================= */

function openStudentCamera() {

  const input =
    document.getElementById(
      "studentCameraInput"
    );

  if (input) {
    input.click();
  }

}

function openStudentGallery() {

  const input =
    document.getElementById(
      "studentGalleryInput"
    );

  if (input) {
    input.click();
  }

}

function setupStudentPhotoInputs() {

  const cameraInput =
    document.getElementById(
      "studentCameraInput"
    );

  const galleryInput =
    document.getElementById(
      "studentGalleryInput"
    );

  if (cameraInput) {

    cameraInput.addEventListener(
      "change",
      event => {

        handleStudentPhotoFile(
          event.target.files[0]
        );

      }
    );

  }

  if (galleryInput) {

    galleryInput.addEventListener(
      "change",
      event => {

        handleStudentPhotoFile(
          event.target.files[0]
        );

      }
    );

  }

}

function handleStudentPhotoFile(file) {

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image file",
      "!"
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload = event => {

    const img =
      new Image();

    img.onload = () => {

      const maxSize = 600;

      let width = img.width;
      let height = img.height;

      if (
        width > height &&
        width > maxSize
      ) {

        height =
          Math.round(
            height * maxSize / width
          );

        width = maxSize;

      } else if (
        height > maxSize
      ) {

        width =
          Math.round(
            width * maxSize / height
          );

        height = maxSize;

      }

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {

        showToast(
          "Photo process nahi ho saki",
          "!"
        );

        return;
      }

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      selectedStudentPhoto =
        canvas.toDataURL(
          "image/jpeg",
          0.78
        );

      updateStudentPhotoPreview();

      showToast(
        "Profile photo added 📸",
        "✓"
      );

    };

    img.onerror = () => {

      showToast(
        "Photo process nahi ho saki",
        "!"
      );

    };

    img.src = event.target.result;

  };

  reader.onerror = () => {

    showToast(
      "Photo read nahi ho saki",
      "!"
    );

  };

  reader.readAsDataURL(file);

  setTimeout(() => {

    const camera =
      document.getElementById(
        "studentCameraInput"
      );

    const gallery =
      document.getElementById(
        "studentGalleryInput"
      );

    if (camera) {
      camera.value = "";
    }

    if (gallery) {
      gallery.value = "";
    }

  }, 100);

}

function updateStudentPhotoPreview() {

  const preview =
    document.getElementById(
      "studentPhotoPreview"
    );

  const placeholder =
    document.getElementById(
      "studentPhotoPlaceholder"
    );

  const removeBtn =
    document.getElementById(
      "removeStudentPhotoBtn"
    );

  if (!preview) {
    return;
  }

  if (selectedStudentPhoto) {

    preview.src =
      selectedStudentPhoto;

    preview.hidden = false;

    if (placeholder) {
      placeholder.hidden = true;
    }

    if (removeBtn) {
      removeBtn.hidden = false;
    }

  } else {

    preview.removeAttribute("src");

    preview.hidden = true;

    if (placeholder) {
      placeholder.hidden = false;
    }

    if (removeBtn) {
      removeBtn.hidden = true;
    }

  }

}

function removeStudentPhoto() {

  selectedStudentPhoto = "";

  updateStudentPhotoPreview();

  showToast(
    "Profile photo removed",
    "✓"
  );

}

/* =========================================================
   PHOTO VALIDATION
========================================================= */

function isValidStudentPhoto(photo) {

  return (
    typeof photo === "string" &&
    /^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(photo)
  );

}

/* =========================================================
   AVATAR CONTENT
========================================================= */

function getStudentAvatarContent(student) {

  if (
    student &&
    isValidStudentPhoto(student.photo)
  ) {

    return `
      <img
        src="${student.photo}"
        alt="${escapeHTML(student.name)}"
        loading="lazy"
      >
    `;

  }

  return escapeHTML(
    String(
      student?.name || "?"
    )
      .charAt(0)
      .toUpperCase()
  );

}

/* =========================================================
   DATE FUNCTIONS
========================================================= */

function todayString() {

  const d =
    new Date();

  const year =
    d.getFullYear();

  const month =
    String(
      d.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      d.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}

function formatDate(dateString) {

  if (!dateString) {
    return "-";
  }

  const date =
    new Date(
      dateString +
      "T00:00:00"
    );

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}

function calculateExpiry(
  startDate,
  duration
) {

  const date =
    new Date(
      startDate +
      "T00:00:00"
    );

  date.setMonth(
    date.getMonth() +
    Number(duration)
  );

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}

function daysRemaining(expiryDate) {

  if (!expiryDate) {
    return 0;
  }

  const today =
    new Date(
      todayString() +
      "T00:00:00"
    );

  const expiry =
    new Date(
      expiryDate +
      "T00:00:00"
    );

  return Math.ceil(
    (
      expiry - today
    ) /
    (
      1000 *
      60 *
      60 *
      24
    )
  );

}

/* =========================================================
   MEMBERSHIP STATUS
========================================================= */

function getStatus(student) {

  const days =
    daysRemaining(
      student.expiryDate
    );

  if (days < 0) {
    return "expired";
  }

  if (days <= 3) {
    return "due";
  }

  return "active";

}

function getStatusText(student) {

  const status =
    getStatus(student);

  const days =
    daysRemaining(
      student.expiryDate
    );

  if (status === "expired") {

    const count =
      Math.abs(days);

    return `Expired ${count} day${count === 1 ? "" : "s"} ago`;

  }

  if (status === "due") {

    if (days === 0) {
      return "Expires today";
    }

    return `Expires in ${days} day${days === 1 ? "" : "s"}`;

  }

  return `Active • ${days} days left`;

}

/* =========================================================
   PAYMENT CALCULATIONS
========================================================= */

function totalPaid(student) {

  if (
    !student ||
    !Array.isArray(
      student.payments
    )
  ) {

    return 0;

  }

  return student.payments.reduce(
    (
      sum,
      payment
    ) =>
      sum +
      Number(
        payment.amount || 0
      ),
    0
  );

}

function totalCollection() {

  return students.reduce(
    (
      total,
      student
    ) =>
      total +
      totalPaid(student),
    0
  );

}

function todayCollection() {

  const today =
    todayString();

  let total = 0;

  students.forEach(student => {

    if (
      !Array.isArray(
        student.payments
      )
    ) {

      return;

    }

    student.payments.forEach(
      payment => {

        if (
          payment.date ===
          today
        ) {

          total +=
            Number(
              payment.amount || 0
            );

        }

      }
    );

  });

  return total;

}

/* =========================================================
   NAVIGATION
========================================================= */

function getScreenElement(name) {

  return document.getElementById(
    name + "Screen"
  );

}

function navigateTo(
  screenName,
  addHistory = true
) {

  if (
    screenName ===
    currentScreen
  ) {

    return;

  }

  const current =
    getScreenElement(
      currentScreen
    );

  const next =
    getScreenElement(
      screenName
    );

  if (!next) {

    console.warn(
      "Screen not found:",
      screenName
    );

    return;

  }

  if (addHistory) {

    if (
      currentScreen !==
      screenName
    ) {

      screenHistory.push(
        currentScreen
      );

    }

  }

  if (current) {
    current.classList.remove(
      "active"
    );
  }

  next.classList.add(
    "active"
  );

  currentScreen =
    screenName;

  updateBottomNavigation();

  handleScreenOpen(
    screenName
  );

  window.scrollTo(
    0,
    0
  );

}

function goBack() {

  if (
    screenHistory.length ===
    0
  ) {

    if (
      currentScreen !==
      "home"
    ) {

      navigateTo(
        "home",
        false
      );

    }

    return;

  }

  const previous =
    screenHistory.pop();

  const current =
    getScreenElement(
      currentScreen
    );

  const previousScreen =
    getScreenElement(
      previous
    );

  if (current) {

    current.classList.remove(
      "active"
    );

  }

  if (previousScreen) {

    previousScreen.classList.add(
      "active"
    );

  }

  currentScreen =
    previous;

  updateBottomNavigation();

  handleScreenOpen(
    previous
  );

  window.scrollTo(
    0,
    0
  );

}

function updateBottomNavigation() {

  const bottomNav =
    document.getElementById(
      "bottomNav"
    );

  if (!bottomNav) {
    return;
  }

  const mainScreens = [
    "home",
    "students",
    "fees",
    "settings",
    "reminders"
  ];

  if (
    mainScreens.includes(
      currentScreen
    )
  ) {

    bottomNav.style.display =
      "grid";

  } else {

    bottomNav.style.display =
      "none";

  }

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

      if (
        button.dataset.nav ===
        currentScreen
      ) {

        button.classList.add(
          "active"
        );

      }

    });

  if (
    currentScreen ===
    "reminders"
  ) {

    document
      .querySelectorAll(
        ".nav-item"
      )
      .forEach(
        button =>
          button.classList.remove(
            "active"
          )
      );

  }

}

function handleScreenOpen(
  screenName
) {

  if (
    screenName ===
    "home"
  ) {

    updateDashboard();
    renderHomeAlerts();

  }

  if (
    screenName ===
    "students"
  ) {

    renderStudents();

  }

  if (
    screenName ===
    "fees"
  ) {

    renderPayments();

  }

  if (
    screenName ===
    "reminders"
  ) {

    renderReminders();

  }

  if (
    screenName ===
    "payment"
  ) {

    populatePaymentStudents();

  }

  if (
    screenName ===
    "renewal"
  ) {

    prepareRenewalScreen();

  }

}

/* =========================================================
   ANDROID BACK
========================================================= */

function setupAndroidBack() {

  window.addEventListener(
    "popstate",
    () => {

      goBack();

    }
  );

}

window.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      currentScreen !== "home"
    ) {

      goBack();

    }

  }
);

/* =========================================================
   ADD MEMBER
========================================================= */

function openAddStudent() {

  navigateTo(
    "addStudent"
  );

}

function setDefaultDates() {

  const joiningDate =
    document.getElementById(
      "joiningDate"
    );

  const paymentDate =
    document.getElementById(
      "paymentDate"
    );

  if (joiningDate) {
    joiningDate.value =
      todayString();
  }

  if (paymentDate) {
    paymentDate.value =
      todayString();
  }

}

function saveStudent() {

  const name =
    document
      .getElementById(
        "studentName"
      )
      ?.value
      .trim();

  const mobile =
    document
      .getElementById(
        "studentMobile"
      )
      ?.value
      .trim();

  const fee =
    Number(
      document
        .getElementById(
          "studentFee"
        )
        ?.value
    );

  const duration =
    Number(
      document
        .getElementById(
          "studentDuration"
        )
        ?.value
    );

  const joiningDate =
    document
      .getElementById(
        "joiningDate"
      )
      ?.value;

  if (!name) {

    showToast(
      "Member name required",
      "!"
    );

    return;

  }

  if (
    !mobile ||
    !/^\d{10}$/.test(mobile)
  ) {

    showToast(
      "Enter valid 10 digit mobile number",
      "!"
    );

    return;

  }

  if (
    isNaN(fee) ||
    fee < 0
  ) {

    showToast(
      "Enter valid membership fee",
      "!"
    );

    return;

  }

  if (
    !duration ||
    duration <= 0
  ) {

    showToast(
      "Select membership duration",
      "!"
    );

    return;

  }

  if (!joiningDate) {

    showToast(
      "Select joining date",
      "!"
    );

    return;

  }

  const expiryDate =
    calculateExpiry(
      joiningDate,
      duration
    );

  const timestamp =
    Date.now().toString();

  const student = {

    id: timestamp,

    name,

    mobile,

    fee,

    duration,

    joiningDate,

    expiryDate,

    photo:
      selectedStudentPhoto || "",

    payments: [

      {

        id:
          timestamp +
          "-payment",

        amount:
          fee,

        date:
          joiningDate,

        note:
          "Initial membership payment"

      }

    ],

    renewals: []

  };

  students.push(
    student
  );

  saveData();

  renderAll();

  resetAddStudentForm();

  showToast(
    "Membership created successfully",
    "✓"
  );

  screenHistory = [];

  navigateTo(
    "students",
    false
  );

}

function resetAddStudentForm() {

  const form =
    document.getElementById(
      "addStudentForm"
    );

  if (form) {
    form.reset();
  }

  const joiningDate =
    document.getElementById(
      "joiningDate"
    );

  if (joiningDate) {

    joiningDate.value =
      todayString();

  }

  selectedStudentPhoto = "";

  updateStudentPhotoPreview();

}

/* =========================================================
   MEMBERS LIST
========================================================= */

function renderStudents() {

  const container =
    document.getElementById(
      "studentList"
    );

  if (!container) {
    return;
  }

  const searchInput =
    document.getElementById(
      "studentSearch"
    );

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";

  let filtered =
    students.filter(
      student => {

        const matchesSearch =
          !search ||
          String(
            student.name
          )
            .toLowerCase()
            .includes(search) ||
          String(
            student.mobile
          ).includes(search);

        if (!matchesSearch) {
          return false;
        }

        if (
          currentFilter ===
          "all"
        ) {

          return true;

        }

        if (
          currentFilter ===
          "active"
        ) {

          return (
            getStatus(student) ===
            "active"
          );

        }

        if (
          currentFilter ===
          "expiring"
        ) {

          return (
            getStatus(student) ===
            "due"
          );

        }

        if (
          currentFilter ===
          "expired"
        ) {

          return (
            getStatus(student) ===
            "expired"
          );

        }

        return true;

      }
    );

  const count =
    document.getElementById(
      "memberCount"
    );

  if (count) {
    count.textContent =
      filtered.length;
  }

  const countText =
    document.getElementById(
      "memberCountText"
    );

  if (countText) {

    const labels = {

      all:
        "All Members",

      active:
        "Active Members",

      expiring:
        "Expiring Soon",

      expired:
        "Expired Members"

    };

    countText.textContent =
      labels[
        currentFilter
      ] ||
      "Members";

  }

  if (
    filtered.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          👥
        </div>

        <strong>
          No members found
        </strong>

        <span>
          Try another search or add a new member.
        </span>

        <button
          class="empty-action"
          onclick="navigateTo('addStudent')"
        >
          ＋ Add Member
        </button>

      </div>

    `;

    return;

  }

  filtered.sort(
    (a, b) =>
      String(a.name || "")
        .localeCompare(
          String(b.name || "")
        )
  );

  container.innerHTML =
    filtered
      .map(
        student =>
          createStudentCard(
            student
          )
      )
      .join("");

}

function createStudentCard(
  student
) {

  const status =
    getStatus(student);

  const statusClass =
    status === "active"
      ? "active"
      : status === "due"
        ? "due"
        : "expired";

  return `

    <button
      class="student-card"
      onclick="viewStudent('${student.id}')"
    >

      <div
        class="student-avatar ${statusClass}"
      >

        ${getStudentAvatarContent(
          student
        )}

      </div>

      <div class="student-info">

        <strong>
          ${escapeHTML(
            student.name
          )}
        </strong>

        <span>
          ${escapeHTML(
            student.mobile
          )}
        </span>

        <small>
          Expiry:
          ${formatDate(
            student.expiryDate
          )}
        </small>

      </div>

      <div class="student-right">

        <span
          class="status-pill ${statusClass}"
        >

          ${
            status === "active"
              ? "ACTIVE"
              : status === "due"
                ? "EXPIRING"
                : "EXPIRED"
          }

        </span>

        <span class="student-arrow">
          ›
        </span>

      </div>

    </button>

  `;

}

function filterStudents(
  filter,
  button
) {

  currentFilter =
    filter;

  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach(
      btn =>
        btn.classList.remove(
          "active"
        )
    );

  if (button) {

    button.classList.add(
      "active"
    );

  }

  renderStudents();

}

function searchStudents() {

  renderStudents();

}

/* =========================================================
   MEMBER PROFILE
========================================================= */

function viewStudent(id) {

  const student =
    students.find(
      item =>
        String(
          item.id
        ) ===
        String(id)
    );

  if (!student) {
    return;
  }

  currentStudentId =
    student.id;

  const title =
    document.getElementById(
      "profileTitle"
    );

  if (title) {
    title.textContent =
      student.name;
  }

  const container =
    document.getElementById(
      "studentProfileContent"
    );

  if (!container) {
    return;
  }

  const status =
    getStatus(student);

  const statusClass =
    status === "active"
      ? "active"
      : status === "due"
        ? "due"
        : "expired";

  const paid =
    totalPaid(student);

  const payments =
    Array.isArray(
      student.payments
    )
      ? [
          ...student.payments
        ].sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
      : [];

  const renewals =
    Array.isArray(
      student.renewals
    )
      ? student.renewals
      : [];

  container.innerHTML = `

    <div class="profile-hero">

      <div class="profile-top">

        <div
          class="profile-avatar ${statusClass}"
        >

          ${getStudentAvatarContent(
            student
          )}

        </div>

        <div class="profile-name">

          <h3>
            ${escapeHTML(
              student.name
            )}
          </h3>

          <span>
            ${escapeHTML(
              student.mobile
            )}
          </span>

        </div>

      </div>

      <div class="profile-status">

        <span
          class="status-pill ${statusClass}"
        >

          ${
            status === "active"
              ? "ACTIVE"
              : status === "due"
                ? "EXPIRING"
                : "EXPIRED"
          }

        </span>

      </div>

    </div>

    <div class="profile-stats">

      <div class="profile-stat">

        <span>
          Membership Status
        </span>

        <strong>
          ${getStatusText(
            student
          )}
        </strong>

      </div>

      <div class="profile-stat">

        <span>
          Expiry Date
        </span>

        <strong>
          ${formatDate(
            student.expiryDate
          )}
        </strong>

      </div>

    </div>

    <div class="info-card">

      <div class="info-card-title">
        MEMBERSHIP DETAILS
      </div>

      <div class="info-row">

        <span>
          Joining Date
        </span>

        <strong>
          ${formatDate(
            student.joiningDate
          )}
        </strong>

      </div>

      <div class="info-row">

        <span>
          Membership Fee
        </span>

        <strong>
          ₹${Number(
            student.fee || 0
          ).toLocaleString(
            "en-IN"
          )}
        </strong>

      </div>

      <div class="info-row">

        <span>
          Duration
        </span>

        <strong>

          ${student.duration}

          Month${
            Number(
              student.duration
            ) === 1
              ? ""
              : "s"
          }

        </strong>

      </div>

    </div>

    <div class="money-summary">

      <div>

        <span>
          Total Paid
        </span>

        <strong class="green-text">

          ₹${paid.toLocaleString(
            "en-IN"
          )}

        </strong>

      </div>

      <div>

        <span>
          Membership Renewals
        </span>

        <strong>
          ${renewals.length}
        </strong>

      </div>

    </div>

    <div class="profile-actions">

      <button
        class="profile-action primary"
        onclick="openRenewal('${student.id}')"
      >
        🔄 Renew
      </button>

      <button
        class="profile-action payment"
        onclick="openPaymentForStudent('${student.id}')"
      >
        ₹ Add Payment
      </button>

      <button
        class="profile-action whatsapp"
        onclick="sendWhatsAppReminder('${student.id}')"
      >
        ◉ WhatsApp
      </button>

      <button
        class="profile-action"
        onclick="callStudent('${student.mobile}')"
      >
        ☎ Call
      </button>

    </div>

    <div class="section-heading">

      <div>

        <span class="eyebrow">
          HISTORY
        </span>

        <h3>
          Payments
        </h3>

      </div>

      <span class="history-count">
        ${payments.length}
      </span>

    </div>

    <div class="profile-payment-history">

      ${
        payments.length
          ? payments
              .map(
                payment => `

                  <div class="history-row">

                    <div class="history-icon">
                      ₹
                    </div>

                    <div class="history-info">

                      <strong>

                        ₹${Number(
                          payment.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </strong>

                      <span>

                        ${formatDate(
                          payment.date
                        )}

                      </span>

                    </div>

                    <div class="history-note">

                      ${escapeHTML(
                        payment.note ||
                        "Payment"
                      )}

                    </div>

                  </div>

                `
              )
              .join("")
          : `

              <div class="empty-state">

                <div class="empty-icon">
                  ₹
                </div>

                <strong>
                  No payments
                </strong>

                <span>
                  No payment history available.
                </span>

              </div>

            `
      }

    </div>

    ${
      renewals.length
        ? `

          <div class="section-heading">

            <div>

              <span class="eyebrow">
                MEMBERSHIP
              </span>

              <h3>
                Renewal History
              </h3>

            </div>

          </div>

          <div class="profile-payment-history">

            ${renewals
              .slice()
              .reverse()
              .map(
                renewal => `

                  <div class="history-row">

                    <div class="history-icon">
                      🔄
                    </div>

                    <div class="history-info">

                      <strong>

                        ${renewal.duration}
                        Month Renewal

                      </strong>

                      <span>

                        ${formatDate(
                          renewal.date
                        )}

                      </span>

                    </div>

                    <div class="history-note">

                      New expiry:
                      ${formatDate(
                        renewal.newExpiry
                      )}

                    </div>

                  </div>

                `
              )
              .join("")}

          </div>

        `
        : ""
    }

    <button
      class="delete-member-btn"
      onclick="deleteStudent('${student.id}')"
    >

      🗑 Delete Member

    </button>

  `;

  screenHistory.push(
    currentScreen
  );

  currentScreen =
    "studentProfile";

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(
      screen =>
        screen.classList.remove(
          "active"
        )
    );

  const profileScreen =
    document.getElementById(
      "studentProfileScreen"
    );

  if (profileScreen) {

    profileScreen.classList.add(
      "active"
    );

  }

  updateBottomNavigation();

  window.scrollTo(
    0,
    0
  );

}

/* =========================================================
   RENEW MEMBERSHIP
========================================================= */

function openRenewal(id) {

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(id)
    );

  if (!student) {

    showToast(
      "Member not found",
      "!"
    );

    return;
  }

  currentRenewalStudentId =
    student.id;

  const renewalScreen =
    getScreenElement(
      "renewal"
    );

  if (!renewalScreen) {

    processRenewalFallback(
      student
    );

    return;
  }

  screenHistory.push(
    currentScreen
  );

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(
      screen =>
        screen.classList.remove(
          "active"
        )
    );

  renewalScreen.classList.add(
    "active"
  );

  currentScreen =
    "renewal";

  updateBottomNavigation();

  prepareRenewalScreen();

  window.scrollTo(
    0,
    0
  );

}

function prepareRenewalScreen() {

  if (!currentRenewalStudentId) {
    return;
  }

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(
          currentRenewalStudentId
        )
    );

  if (!student) {
    return;
  }

  const name =
    document.getElementById(
      "renewalMemberName"
    );

  if (name) {
    name.textContent =
      student.name;
  }

  const mobile =
    document.getElementById(
      "renewalMemberMobile"
    );

  if (mobile) {
    mobile.textContent =
      student.mobile;
  }

  const status =
    document.getElementById(
      "renewalMemberStatus"
    );

  if (status) {

    status.textContent =
      getStatusText(
        student
      );

  }

  const fee =
    document.getElementById(
      "renewalFee"
    );

  if (
    fee &&
    !fee.value
  ) {

    fee.value =
      Number(
        student.fee || 0
      );

  }

  const duration =
    document.getElementById(
      "renewalDuration"
    );

  if (
    duration &&
    !duration.value
  ) {

    duration.value =
      Number(
        student.duration || 1
      );

  }

  const startDate =
    document.getElementById(
      "renewalStartDate"
    );

  const start =
    getRenewalStartDate(
      student
    );

  if (startDate) {

    startDate.value =
      start;

  }

  const addPayment =
    document.getElementById(
      "renewalAddPayment"
    );

  if (addPayment) {

    addPayment.checked =
      true;

  }

  updateRenewalPreview();

}

function getRenewalStartDate(
  student
) {

  const status =
    getStatus(student);

  if (
    status ===
    "expired"
  ) {

    return todayString();

  }

  return (
    student.expiryDate ||
    todayString()
  );

}

function updateRenewalPreview() {

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(
          currentRenewalStudentId
        )
    );

  if (!student) {
    return;
  }

  const duration =
    Number(
      document
        .getElementById(
          "renewalDuration"
        )
        ?.value ||
      1
    );

  const start =
    getRenewalStartDate(
      student
    );

  const newExpiry =
    calculateExpiry(
      start,
      duration
    );

  const oldExpiry =
    document.getElementById(
      "renewalOldExpiry"
    );

  if (oldExpiry) {

    oldExpiry.textContent =
      formatDate(
        student.expiryDate
      );

  }

  const newExpiryElement =
    document.getElementById(
      "renewalNewExpiry"
    );

  if (newExpiryElement) {

    newExpiryElement.textContent =
      formatDate(
        newExpiry
      );

  }

  const preview =
    document.getElementById(
      "renewalPreview"
    );

  if (preview) {

    preview.innerHTML = `

      <div>

        <span>
          Current Expiry
        </span>

        <strong>
          ${formatDate(
            student.expiryDate
          )}
        </strong>

      </div>

      <div class="renewal-arrow">
        →
      </div>

      <div>

        <span>
          New Expiry
        </span>

        <strong>
          ${formatDate(
            newExpiry
          )}
        </strong>

      </div>

    `;

  }

}

function processRenewal() {

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(
          currentRenewalStudentId
        )
    );

  if (!student) {

    showToast(
      "Member not found",
      "!"
    );

    return;
  }

  const duration =
    Number(
      document
        .getElementById(
          "renewalDuration"
        )
        ?.value
    );

  const fee =
    Number(
      document
        .getElementById(
          "renewalFee"
        )
        ?.value
    );

  const addPayment =
    document
      .getElementById(
        "renewalAddPayment"
      )
      ?.checked;

  if (
    !duration ||
    duration <= 0
  ) {

    showToast(
      "Select renewal duration",
      "!"
    );

    return;

  }

  if (
    addPayment &&
    (
      !fee ||
      fee <= 0
    )
  ) {

    showToast(
      "Enter valid renewal fee",
      "!"
    );

    return;

  }

  const oldExpiry =
    student.expiryDate;

  const startDate =
    getRenewalStartDate(
      student
    );

  const newExpiry =
    calculateExpiry(
      startDate,
      duration
    );

  if (
    !Array.isArray(
      student.renewals
    )
  ) {

    student.renewals = [];

  }

  const renewalId =
    Date.now().toString();

  student.renewals.push({

    id:
      renewalId,

    date:
      todayString(),

    startDate,

    oldExpiry,

    newExpiry,

    duration,

    amount:
      addPayment
        ? fee
        : 0

  });

  student.expiryDate =
    newExpiry;

  student.duration =
    duration;

  if (fee > 0) {

    student.fee =
      fee;

  }

  if (addPayment) {

    if (
      !Array.isArray(
        student.payments
      )
    ) {

      student.payments = [];

    }

    student.payments.push({

      id:
        renewalId +
        "-payment",

      amount:
        fee,

      date:
        todayString(),

      note:
        "Membership Renewal"

    });

  }

  saveData();

  renderAll();

  showToast(
    "Membership renewed successfully 🔥",
    "✓"
  );

  currentStudentId =
    student.id;

  currentRenewalStudentId =
    null;

  screenHistory = [];

  viewStudent(
    student.id
  );

}

/* =========================================================
   FALLBACK RENEWAL
========================================================= */

function processRenewalFallback(
  student
) {

  const status =
    getStatus(student);

  const duration =
    Number(
      prompt(
        `Renew ${student.name}\n\nEnter duration in months:\n1, 2, 3, 6 or 12`
      )
    );

  if (
    !duration ||
    duration <= 0
  ) {

    return;

  }

  const feeInput =
    prompt(
      "Enter renewal fee:",
      student.fee || "1500"
    );

  if (
    feeInput ===
    null
  ) {

    return;

  }

  const fee =
    Number(
      feeInput
    );

  if (
    isNaN(fee) ||
    fee <= 0
  ) {

    showToast(
      "Invalid renewal fee",
      "!"
    );

    return;

  }

  const start =
    status === "expired"
      ? todayString()
      : student.expiryDate;

  const oldExpiry =
    student.expiryDate;

  const newExpiry =
    calculateExpiry(
      start,
      duration
    );

  student.expiryDate =
    newExpiry;

  student.duration =
    duration;

  student.fee =
    fee;

  if (
    !Array.isArray(
      student.renewals
    )
  ) {

    student.renewals = [];

  }

  const renewalId =
    Date.now().toString();

  student.renewals.push({

    id:
      renewalId,

    date:
      todayString(),

    startDate:
      start,

    oldExpiry,

    newExpiry,

    duration,

    amount:
      fee

  });

  if (
    !Array.isArray(
      student.payments
    )
  ) {

    student.payments = [];

  }

  student.payments.push({

    id:
      renewalId +
      "-payment",

    amount:
      fee,

    date:
      todayString(),

    note:
      "Membership Renewal"

  });

  saveData();

  renderAll();

  showToast(
    "Membership renewed successfully 🔥",
    "✓"
  );

  viewStudent(
    student.id
  );

}

/* =========================================================
   PAYMENT
========================================================= */

function openPaymentForStudent(id) {

  currentStudentId =
    id;

  populatePaymentStudents();

  const select =
    document.getElementById(
      "paymentStudent"
    );

  if (select) {

    select.value =
      id;

  }

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(id)
    );

  if (student) {

    const amount =
      document.getElementById(
        "paymentAmount"
      );

    if (amount) {

      amount.value =
        Number(
          student.fee || 0
        );

    }

  }

  navigateTo(
    "payment"
  );

}

function populatePaymentStudents() {

  const select =
    document.getElementById(
      "paymentStudent"
    );

  if (!select) {
    return;
  }

  const currentValue =
    currentStudentId ||
    select.value;

  select.innerHTML = `

    <option value="">
      Select member
    </option>

    ${
      students
        .slice()
        .sort(
          (a, b) =>
            String(a.name || "")
              .localeCompare(
                String(b.name || "")
              )
        )
        .map(
          student => `

            <option
              value="${student.id}"
            >

              ${escapeHTML(
                student.name
              )}

              —

              ${escapeHTML(
                student.mobile
              )}

            </option>

          `
        )
        .join("")
    }

  `;

  if (currentValue) {

    const exists =
      students.some(
        s =>
          String(s.id) ===
          String(currentValue)
      );

    if (exists) {

      select.value =
        currentValue;

    }

  }

  const paymentDate =
    document.getElementById(
      "paymentDate"
    );

  if (
    paymentDate &&
    !paymentDate.value
  ) {

    paymentDate.value =
      todayString();

  }

}

function savePayment() {

  const studentId =
    document
      .getElementById(
        "paymentStudent"
      )
      ?.value;

  const amount =
    Number(
      document
        .getElementById(
          "paymentAmount"
        )
        ?.value
    );

  const date =
    document
      .getElementById(
        "paymentDate"
      )
      ?.value;

  const note =
    document
      .getElementById(
        "paymentNote"
      )
      ?.value
      .trim();

  if (!studentId) {

    showToast(
      "Select a member",
      "!"
    );

    return;

  }

  if (
    !amount ||
    amount <= 0
  ) {

    showToast(
      "Enter valid payment amount",
      "!"
    );

    return;

  }

  if (!date) {

    showToast(
      "Select payment date",
      "!"
    );

    return;

  }

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(studentId)
    );

  if (!student) {

    showToast(
      "Member not found",
      "!"
    );

    return;

  }

  if (
    !Array.isArray(
      student.payments
    )
  ) {

    student.payments = [];

  }

  student.payments.push({

    id:
      Date.now().toString(),

    amount,

    date,

    note:
      note ||
      "Membership payment"

  });

  saveData();

  renderAll();

  const form =
    document.getElementById(
      "paymentForm"
    );

  if (form) {
    form.reset();
  }

  currentStudentId =
    null;

  showToast(
    "Payment saved successfully",
    "✓"
  );

  screenHistory = [];

  navigateTo(
    "fees",
    false
  );

}

/* =========================================================
   FEES
========================================================= */

function renderPayments() {

  const list =
    document.getElementById(
      "paymentList"
    );

  if (!list) {
    return;
  }

  const allPayments = [];

  students.forEach(student => {

    if (
      !Array.isArray(
        student.payments
      )
    ) {

      return;

    }

    student.payments.forEach(
      payment => {

        allPayments.push({

          ...payment,

          studentId:
            student.id,

          studentName:
            student.name,

          studentPhoto:
            student.photo || ""

        });

      }
    );

  });

  allPayments.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );

  const total =
    totalCollection();

  const today =
    todayCollection();

  setText(
    "feesTotalCollection",
    total.toLocaleString(
      "en-IN"
    )
  );

  setText(
    "feesTodayCollection",
    today.toLocaleString(
      "en-IN"
    )
  );

  setText(
    "feesPaymentCount",
    allPayments.length
  );

  if (
    allPayments.length ===
    0
  ) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ₹
        </div>

        <strong>
          No payments yet
        </strong>

        <span>
          Payments will appear here after recording a fee.
        </span>

        <button
          class="empty-action"
          onclick="navigateTo('payment')"
        >

          ＋ Add Payment

        </button>

      </div>

    `;

    return;

  }

  list.innerHTML =
    allPayments
      .slice(
        0,
        100
      )
      .map(
        payment => `

          <button
            class="payment-row"
            onclick="viewStudent('${payment.studentId}')"
          >

            <div class="payment-avatar">

              ${
                isValidStudentPhoto(
                  payment.studentPhoto
                )
                  ? `
                    <img
                      src="${payment.studentPhoto}"
                      alt="${escapeHTML(
                        payment.studentName
                      )}"
                      loading="lazy"
                    >
                  `
                  : "₹"
              }

            </div>

            <div class="payment-info">

              <strong>
                ${escapeHTML(
                  payment.studentName
                )}
              </strong>

              <span>

                ${formatDate(
                  payment.date
                )}

                ${
                  payment.note
                    ? " • " +
                      escapeHTML(
                        payment.note
                      )
                    : ""
                }

              </span>

            </div>

            <div class="payment-amount">

              +₹${Number(
                payment.amount || 0
              ).toLocaleString(
                "en-IN"
              )}

            </div>

          </button>

        `
      )
      .join("");

}

/* =========================================================
   REMINDERS
========================================================= */

function renderReminders() {

  const list =
    document.getElementById(
      "reminderList"
    );

  if (!list) {
    return;
  }

  const alerts =
    students.filter(
      student => {

        const status =
          getStatus(
            student
          );

        return (
          status === "due" ||
          status === "expired"
        );

      }
    );

  const counter =
    document.getElementById(
      "reminderCount"
    );

  if (counter) {

    counter.textContent =
      alerts.length;

  }

  if (
    alerts.length ===
    0
  ) {

    list.innerHTML = `

      <div class="empty-state large-empty">

        <div class="empty-icon">
          ✓
        </div>

        <strong>
          No reminders
        </strong>

        <span>
          Great! All memberships are currently on track.
        </span>

      </div>

    `;

    updateNotificationBadge();

    return;

  }

  alerts.sort(
    (a, b) =>
      daysRemaining(
        a.expiryDate
      ) -
      daysRemaining(
        b.expiryDate
      )
  );

  list.innerHTML =
    alerts
      .map(
        student =>
          createReminderCard(
            student
          )
      )
      .join("");

  updateNotificationBadge();

}

function createReminderCard(
  student
) {

  const status =
    getStatus(student);

  const days =
    daysRemaining(
      student.expiryDate
    );

  const statusClass =
    status === "expired"
      ? "expired"
      : "due";

  let message;

  if (
    status ===
    "expired"
  ) {

    message =
      `Membership expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;

  } else if (
    days === 0
  ) {

    message =
      "Membership expires today";

  } else {

    message =
      `Membership expires in ${days} day${days === 1 ? "" : "s"}`;

  }

  return `

    <div
      class="reminder-card ${statusClass}"
    >

      <div class="reminder-avatar">

        ${getStudentAvatarContent(
          student
        )}

      </div>

      <div class="reminder-info">

        <strong>
          ${escapeHTML(
            student.name
          )}
        </strong>

        <span>
          ${escapeHTML(
            student.mobile
          )}
        </span>

        <small>
          ${message}
        </small>

      </div>

      <button
        class="whatsapp-btn"
        onclick="event.stopPropagation(); sendWhatsAppReminder('${student.id}')"
      >

        WhatsApp

      </button>

    </div>

  `;

}

/* =========================================================
   WHATSAPP
========================================================= */

function sendWhatsAppReminder(id) {

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(id)
    );

  if (!student) {

    showToast(
      "Member not found",
      "!"
    );

    return;

  }

  const status =
    getStatus(student);

  const days =
    daysRemaining(
      student.expiryDate
    );

  let message;

  if (
    status ===
    "expired"
  ) {

    message =
      `Namaste ${student.name} ji 🙏\n\n` +
      `Aapki STAR GYM membership ${Math.abs(days)} din pehle expire ho gayi hai.\n\n` +
      `Kripya membership renew karwa lijiye. 💪🔥\n\n` +
      `STAR GYM`;

  } else {

    message =
      `Namaste ${student.name} ji 🙏\n\n` +
      `Aapki STAR GYM membership ${days === 0 ? "aaj" : days + " din mein"} expire ho rahi hai.\n\n` +
      `Kripya membership renew karwa lijiye. 💪🔥\n\n` +
      `STAR GYM`;

  }

  const mobile =
    String(
      student.mobile
    ).replace(
      /\D/g,
      ""
    );

  const url =
    `https://wa.me/91${mobile}?text=` +
    encodeURIComponent(
      message
    );

  window.open(
    url,
    "_blank"
  );

}

function callStudent(mobile) {

  if (!mobile) {
    return;
  }

  window.location.href =
    `tel:${mobile}`;

}

/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const total =
    students.length;

  const active =
    students.filter(
      s =>
        getStatus(s) ===
        "active"
    ).length;

  const expiring =
    students.filter(
      s =>
        getStatus(s) ===
        "due"
    ).length;

  const expired =
    students.filter(
      s =>
        getStatus(s) ===
        "expired"
    ).length;

  setText(
    "totalMembers",
    total
  );

  setText(
    "activeMembers",
    active
  );

  setText(
    "expiringMembers",
    expiring
  );

  setText(
    "expiredMembers",
    expired
  );

  setText(
    "homeTodayCollection",
    todayCollection()
      .toLocaleString(
        "en-IN"
      )
  );

  setText(
    "homeTotalCollection",
    totalCollection()
      .toLocaleString(
        "en-IN"
      )
  );

  updateNotificationBadge();

}

/* =========================================================
   NOTIFICATION BADGE
========================================================= */

function updateNotificationBadge() {

  const badge =
    document.getElementById(
      "notificationBadge"
    );

  if (!badge) {
    return;
  }

  const count =
    students.filter(
      student => {

        const status =
          getStatus(
            student
          );

        return (
          status === "due" ||
          status === "expired"
        );

      }
    ).length;

  badge.textContent =
    count > 99
      ? "99+"
      : count;

  badge.style.display =
    count > 0
      ? "grid"
      : "none";

}

/* =========================================================
   HOME ALERTS
========================================================= */

function renderHomeAlerts() {

  const container =
    document.getElementById(
      "homeAlerts"
    );

  if (!container) {
    return;
  }

  const alerts =
    students
      .filter(
        student => {

          const status =
            getStatus(
              student
            );

          return (
            status === "due" ||
            status === "expired"
          );

        }
      )
      .sort(
        (a, b) =>
          daysRemaining(
            a.expiryDate
          ) -
          daysRemaining(
            b.expiryDate
          )
      )
      .slice(
        0,
        5
      );

  if (
    alerts.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ✓
        </div>

        <strong>
          Everything looks good
        </strong>

        <span>
          No membership alerts right now.
        </span>

      </div>

    `;

    return;

  }

  container.innerHTML =
    alerts
      .map(
        student => {

          const status =
            getStatus(
              student
            );

          return `

            <div
              class="home-alert ${status}"
            >

              <div class="alert-avatar">

                ${getStudentAvatarContent(
                  student
                )}

              </div>

              <div class="alert-content">

                <strong>
                  ${escapeHTML(
                    student.name
                  )}
                </strong>

                <span>
                  ${getStatusText(
                    student
                  )}
                </span>

              </div>

              <button
                class="alert-whatsapp"
                onclick="event.stopPropagation(); sendWhatsAppReminder('${student.id}')"
              >

                WA

              </button>

            </div>

          `;

        }
      )
      .join("");

}

/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  updateDashboard();

  renderStudents();

  renderPayments();

  renderReminders();

  renderHomeAlerts();

}

/* =========================================================
   DELETE MEMBER
========================================================= */

function deleteStudent(id) {

  const student =
    students.find(
      s =>
        String(s.id) ===
        String(id)
    );

  if (!student) {
    return;
  }

  const confirmed =
    confirm(
      `Delete ${student.name}?\n\nThis will permanently delete the member and their payment history.`
    );

  if (!confirmed) {
    return;
  }

  students =
    students.filter(
      s =>
        String(s.id) !==
        String(id)
    );

  saveData();

  renderAll();

  currentStudentId =
    null;

  showToast(
    "Member deleted",
    "✓"
  );

  screenHistory = [];

  navigateTo(
    "students",
    false
  );

}

/* =========================================================
   CLEAR ALL DATA
========================================================= */

function clearAllData() {

  if (
    students.length ===
    0
  ) {

    showToast(
      "No data to delete",
      "!"
    );

    return;

  }

  const confirmed =
    confirm(
      "WARNING!\n\nDelete ALL members and payment data?\n\nThis action cannot be undone."
    );

  if (!confirmed) {
    return;
  }

  const doubleConfirm =
    confirm(
      "Are you absolutely sure?"
    );

  if (!doubleConfirm) {
    return;
  }

  students = [];

  saveData();

  renderAll();

  showToast(
    "All data deleted",
    "✓"
  );

}

/* =========================================================
   BACKUP / EXPORT
========================================================= */

function exportBackup() {

  const backup = {

    app:
      "STAR GYM",

    version:
      "4.2",

    exportedAt:
      new Date().toISOString(),

    students:
      students

  };

  const data =
    JSON.stringify(
      backup,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    `STAR-GYM-Backup-${todayString()}.json`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );

  showToast(
    "Backup exported successfully",
    "✓"
  );

}

/* =========================================================
   IMPORT BACKUP
========================================================= */

function importBackupFile(file) {

  if (!file) {
    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    event => {

      try {

        const backup =
          JSON.parse(
            event.target.result
          );

        if (
          !backup ||
          !Array.isArray(
            backup.students
          )
        ) {

          throw new Error(
            "Invalid backup"
          );

        }

        const confirmed =
          confirm(
            "Import this backup?\n\nCurrent data will be replaced."
          );

        if (!confirmed) {
          return;
        }

        students =
          backup.students;

        students.forEach(
          student => {

            if (
              !Array.isArray(
                student.payments
              )
            ) {

              student.payments = [];

            }

            if (
              !Array.isArray(
                student.renewals
              )
            ) {

              student.renewals = [];

            }

            if (
              typeof student.photo !==
              "string"
            ) {

              student.photo = "";

            }

          }
        );

        saveData();

        renderAll();

        showToast(
          "Backup restored successfully",
          "✓"
        );

      } catch (error) {

        console.error(
          error
        );

        showToast(
          "Invalid backup file",
          "!"
        );

      }

    };

  reader.readAsText(
    file
  );

}

/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  icon = "✓"
) {

  const toast =
    document.getElementById(
      "toast"
    );

  const toastMessage =
    document.getElementById(
      "toastMessage"
    );

  const toastIcon =
    document.getElementById(
      "toastIcon"
    );

  if (!toast) {
    return;
  }

  if (toastMessage) {

    toastMessage.textContent =
      message;

  }

  if (toastIcon) {

    toastIcon.textContent =
      icon;

  }

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}

/* =========================================================
   UTILITY
========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );

  if (element) {

    element.textContent =
      value;

  }

}

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}

/* =========================================================
   PAYMENT AUTO AMOUNT
========================================================= */

document.addEventListener(
  "change",
  event => {

    if (
      event.target.id ===
      "paymentStudent"
    ) {

      const student =
        students.find(
          s =>
            String(s.id) ===
            String(
              event.target.value
            )
        );

      if (student) {

        const amount =
          document.getElementById(
            "paymentAmount"
          );

        if (amount) {

          amount.value =
            Number(
              student.fee || 0
            );

        }

      }

    }

    if (
      event.target.id ===
      "renewalDuration"
    ) {

      updateRenewalPreview();

    }

  }
);

/* =========================================================
   RENEWAL LIVE PREVIEW
========================================================= */

document.addEventListener(
  "input",
  event => {

    if (
      event.target.id ===
      "renewalDuration"
    ) {

      updateRenewalPreview();

    }

  }
);

/* =========================================================
   PROFILE MENU
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (
      event.target.id ===
      "profileMenuBtn"
    ) {

      if (!currentStudentId) {
        return;
      }

      const student =
        students.find(
          s =>
            String(s.id) ===
            String(
              currentStudentId
            )
        );

      if (!student) {
        return;
      }

      const choice =
        prompt(
          "STAR GYM\n\n1 = Renew Membership\n2 = WhatsApp Reminder\n3 = Delete Member\n\nEnter option:"
        );

      if (
        choice ===
        "1"
      ) {

        openRenewal(
          student.id
        );

      }

      if (
        choice ===
        "2"
      ) {

        sendWhatsAppReminder(
          student.id
        );

      }

      if (
        choice ===
        "3"
      ) {

        deleteStudent(
          student.id
        );

      }

    }

  }
);

/* =========================================================
   PWA SERVICE WORKER
========================================================= */

if (
  "serviceWorker" in
  navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .then(
          registration => {

            console.log(
              "STAR GYM Service Worker registered:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.log(
              "Service Worker error:",
              error
            );

          }
        );

    }
  );

}