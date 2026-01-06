// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAeqE7ED6tR1VbVKET7_UXpAifwTvI0byI",
  authDomain: "smart-civic-portal-6e6d9.firebaseapp.com",
  projectId: "smart-civic-portal-6e6d9",
};

// ================= INIT FIREBASE =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= DOM =================
const list = document.getElementById("reportsList");

// ================= LOAD REPORTS =================
async function loadReports() {
  try {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = `<p class="empty">No reports submitted yet.</p>`;
      return;
    }

    list.innerHTML = ""; // clear old data

    snapshot.forEach(doc => {
      const data = doc.data();

      // STATUS COLOR + ICON
      const statusClass =
        data.status === "Resolved"
          ? "status-resolved"
          : data.status === "In Progress"
          ? "status-progress"
          : "status-submitted";

      const statusIcon =
        data.status === "Resolved"
          ? "🟢"
          : data.status === "In Progress"
          ? "🔵"
          : "🟡";

      // DATE FORMAT
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : "N/A";

      // RENDER CARD
      list.innerHTML += `
        <div class="report-card">
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Problem:</strong> ${data.subIssue || "-"}</p>
          <p><strong>Reported On:</strong> ${createdAt}</p>

          <p class="status ${statusClass}">
            ${statusIcon} ${data.status}
          </p>

          ${
            data.imageURL
              ? `<img src="${data.imageURL}" alt="Issue Image" />`
              : ""
          }
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading reports:", error);
    list.innerHTML =
      "<p class='empty'>Failed to load reports. Please try again.</p>";
  }
}

// ================= INIT =================
loadReports();
