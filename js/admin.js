// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "smart-civic-portal-6e6d9.firebaseapp.com",
  projectId: "smart-civic-portal-6e6d9",
  storageBucket: "smart-civic-portal-6e6d9.appspot.com",
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ================= DOM =================
const adminList = document.getElementById("adminList");

// ================= ADMIN AUTH SECURITY =================
onAuthStateChanged(auth, (user) => {
  if (!user || !user.email.endsWith("@admin.com")) {
    alert("Unauthorized access");
    window.location.href = "admin-login.html";
  }
});

// ================= LOAD ISSUES (REALTIME) =================
function loadIssuesRealtime() {
  const q = query(
    collection(db, "complaints"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    adminList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      renderIssue(docSnap.id, docSnap.data());
    });
  });
}

// ================= RENDER ISSUE =================
function renderIssue(id, issue) {
  const div = document.createElement("div");
  div.className = "admin-card";

  div.innerHTML = `
    <h3>${issue.title || "No Title"}</h3>
    <p>${issue.description || ""}</p>

    <label>Status:</label>
    <select id="status-${id}" onchange="toggleResolved('${id}')">
      <option ${issue.status === "Submitted" ? "selected" : ""}>Submitted</option>
      <option ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
      <option ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
      <option ${issue.status === "Closed" ? "selected" : ""}>Closed</option>
    </select>

    <div id="resolved-${id}" style="display:${issue.status === "Resolved" ? "block" : "none"}; margin-top:10px;">
      <input id="by-${id}" placeholder="Resolved By" value="${issue.resolvedBy || ""}">
      <input id="date-${id}" type="date" value="${issue.resolvedDate || ""}">
      <input id="dept-${id}" placeholder="Department" value="${issue.resolvedDepartment || ""}">
      <input id="img-${id}" type="file">
    </div>

    <button onclick="updateIssue('${id}')">Update</button>
    <hr>
  `;

  adminList.appendChild(div);
}

// ================= TOGGLE RESOLVED FIELDS =================
window.toggleResolved = function (id) {
  const status = document.getElementById(`status-${id}`).value;
  document.getElementById(`resolved-${id}`).style.display =
    status === "Resolved" ? "block" : "none";
};

// ================= UPDATE ISSUE =================
window.updateIssue = async function (id) {
  const status = document.getElementById(`status-${id}`).value;

  let updateData = {
    status,
    updatedAt: new Date()
  };

  try {
    if (status === "Resolved") {
      const by = document.getElementById(`by-${id}`).value;
      const date = document.getElementById(`date-${id}`).value;
      const dept = document.getElementById(`dept-${id}`).value;
      const imgFile = document.getElementById(`img-${id}`).files[0];

      if (!by || !date || !dept || !imgFile) {
        alert("Please fill all resolution details");
        return;
      }

      const imgRef = ref(storage, `resolved_images/${id}`);
      await uploadBytes(imgRef, imgFile);
      const imgURL = await getDownloadURL(imgRef);

      updateData = {
        ...updateData,
        resolvedBy: by,
        resolvedDate: date,
        resolvedDepartment: dept,
        resolvedImageUrl: imgURL
      };
    }

    await updateDoc(doc(db, "complaints", id), updateData);
    alert("Complaint updated successfully ✅");

  } catch (error) {
    console.error("Update error:", error);
    alert("Failed to update complaint ❌");
  }
};

// ================= INIT =================
loadIssuesRealtime();