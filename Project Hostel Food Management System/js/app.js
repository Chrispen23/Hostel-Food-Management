// =================== HOME ===================
function goHome() {
  window.location.href = "index.html";
}

// =================== MEALS ===================
function addMeal() {
  if (!mealName.value || !mealImage.files[0]) {
    alert("Please enter meal name and image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const meal = {
      id: Date.now(),
      name: mealName.value,
      image: reader.result, // ✅ BASE64 IMAGE
      date: new Date().toDateString()
    };

    let meals = JSON.parse(localStorage.getItem("meals")) || [];
    meals.push(meal);
    localStorage.setItem("meals", JSON.stringify(meals));

    mealPreview.innerHTML = `
      <h4>${meal.name}</h4>
      <img src="${meal.image}" width="220">
    `;

    alert("Meal uploaded successfully");
  };

  reader.readAsDataURL(mealImage.files[0]);
}



// =================== DISPLAY MEAL (STUDENT) ===================


function loadMeal() {
  if (!window.mealDisplay) return;

  const meals = JSON.parse(localStorage.getItem("meals")) || [];

  if (meals.length === 0) {
    mealDisplay.innerText = "No meal uploaded yet.";
    return;
  }

  const meal = meals[meals.length - 1];

  mealDisplay.innerHTML = `
    <h4>${meal.name}</h4>
    <img src="${meal.image}" style="max-width:250px;">
  `;
}

// =================== FEEDBACK ===================
function submitFeedback() {
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  if (meals.length === 0) {
    alert("No meal available to give feedback");
    return;
  }

  const currentMeal = meals[meals.length - 1];

  const feedback = {
    mealId: currentMeal.id,
    mealName: currentMeal.name,
    mealImage: currentMeal.image,
    name: studentName.value,
    hostel: hostel.value,
    rating: rating.value,
    comment: comment.value,
    date: new Date().toDateString()
  };

  let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
  feedbacks.push(feedback);
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

  // 🔒 LOCK FEEDBACK FOR THIS MEAL ONLY
  localStorage.setItem("feedbackSubmitted_" + currentMeal.id, "yes");

  alert("Feedback submitted successfully");
  goHome();
}


// =================== PREVENT DOUBLE FEEDBACK ===================
function checkFeedbackStatus() {
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  if (meals.length === 0) return;

  const currentMeal = meals[meals.length - 1];
  const submitted = localStorage.getItem("feedbackSubmitted_" + currentMeal.id);

  if (submitted === "yes") {
    if (window.feedbackSection) feedbackSection.style.display = "none";
    if (window.feedbackStatus)
      feedbackStatus.innerHTML = "✅ Feedback already submitted for this meal";
  } else {
    if (window.feedbackSection) feedbackSection.style.display = "block";
    if (window.feedbackStatus) feedbackStatus.innerHTML = "";
  }
}


// =================== SICK REQUEST ===================
function sendSickRequest() {
  const request = {
    id: Date.now(),
    name: sickStudentName.value,
    hostel: sickHostel.value,
    room: sickRoom.value,
    symptoms: symptoms.value,
    note: doctorNote.value,
    food: foodType.value,
    status: "Pending"
  };

  let requests = JSON.parse(localStorage.getItem("sickRequests")) || [];
  requests.push(request);
  localStorage.setItem("sickRequests", JSON.stringify(requests));

  alert("Sick food request submitted successfully");
  goHome();
}

// =================== ADMIN VIEW ===================
function loadAdmin() {
  // ---- Sick Requests ----
  const requests = JSON.parse(localStorage.getItem("sickRequests")) || [];

  if (window.adminRequests) {
    if (requests.length === 0) {
      adminRequests.innerText = "No sick requests yet.";
    } else {
      adminRequests.innerHTML = requests.map((r, i) => `
        <div class="card">
          <p><b>${r.name}</b> (${r.hostel}, Room ${r.room})</p>
          <p>Food: ${r.food}</p>
          <p>Status: ${r.status}</p>
          ${r.status === "Pending" ? `
            <button onclick="approveRequest(${r.id})">Approve</button>
          ` : ""}
        </div>
      `).join("");
    }
  }

  // ---- Feedback ----
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

  if (window.feedbackList) {
    if (feedbacks.length === 0) {
      feedbackList.innerText = "No feedback submitted yet.";
    } else {
      feedbackList.innerHTML = feedbacks.map(f => `
        <div class="card">
          <h4>${f.mealName}</h4>
          <img src="${f.mealImage}" width="150">
          <p><b>${f.name}</b> (${f.hostel})</p>
          <p>⭐ ${f.rating}</p>
          <p>${f.comment}</p>
        </div>
      `).join("");
    }
  }
}

// =================== APPROVE REQUEST ===================
function approveRequest(requestId) {
  let requests = JSON.parse(localStorage.getItem("sickRequests")) || [];

  requests = requests.map(r =>
    r.id === requestId ? { ...r, status: "Approved" } : r
  );

  localStorage.setItem("sickRequests", JSON.stringify(requests));

  alert("Request approved successfully");

  loadAdmin();
  loadStaff();
}




// =================== STUDENT STATUS ===================
function loadStudentStatus() {
  const requests = JSON.parse(localStorage.getItem("sickRequests")) || [];
  if (requests.length && window.studentRequestStatus) {
    const latest = requests[requests.length - 1];
    studentRequestStatus.innerText = "Status: " + latest.status;
  }
}

// =================== STAFF ===================
function loadStaff() {
  if (!window.staffOrders) return;

  const requests = JSON.parse(localStorage.getItem("sickRequests")) || [];
  const approved = requests.filter(r => r.status === "Approved");

  if (approved.length === 0) {
    staffOrders.innerHTML = "No approved deliveries yet.";
    return;
  }

  staffOrders.innerHTML = approved.map(r => `
    <div class="card">
      <p><b>Food:</b> ${r.food}</p>
      <p><b>Student:</b> ${r.name}</p>
      <p><b>Hostel:</b> ${r.hostel}</p>
      <p><b>Room:</b> ${r.room}</p>
    </div>
  `).join("");
}



// =================== AUTO LOAD ===================
window.onload = () => {
  loadMeal();
  loadAdmin();
  loadStudentStatus();
  loadStaff();
  checkFeedbackStatus();
  populateMealDropdown(); // ✅ NEW
};


function populateMealDropdown() {
  if (!window.mealFilter) return;

  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  mealFilter.innerHTML = `<option value="">-- Select Meal --</option>`;

  meals.forEach(m => {
    const option = document.createElement("option");
    option.value = m.id;
    option.textContent = m.name;
    mealFilter.appendChild(option);
  });
}

function loadFeedbackByMeal() {
  if (!mealFilter.value) {
    filteredFeedback.innerHTML = "";
    return;
  }

  const mealId = Number(mealFilter.value);
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

  const meal = meals.find(m => m.id === mealId);
  const related = feedbacks.filter(f => f.mealId === mealId);

  filteredFeedback.innerHTML = `
    <h4>${meal.name}</h4>
    <img src="${meal.image}" width="200">
  `;

  if (related.length === 0) {
    filteredFeedback.innerHTML += `<p>No feedback yet.</p>`;
    return;
  }

  related.forEach(f => {
    filteredFeedback.innerHTML += `
      <div class="card">
        <p><b>${f.name}</b> (${f.hostel})</p>
        <p>⭐ ${f.rating}</p>
        <p>${f.comment}</p>
      </div>
    `;
  });
}

// ================= PAGE TRANSITION =================

// Fade in when page loads
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Fade out when navigating
function navigatePage(url) {
  document.body.classList.remove("loaded");
  document.body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = url;
  }, 400);
}
