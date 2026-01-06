import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAeqE7ED6tR1VbVKET7_UXpAifwTvI0byI",
    authDomain: "smart-civic-portal-6e6d9.firebaseapp.com",
    projectId: "smart-civic-portal-6e6d9"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 UI elements
const totalEl = document.getElementById("totalCount");
const resolvedEl = document.getElementById("resolvedCount");
const pendingEl = document.getElementById("pendingCount");
const highEl = document.getElementById("highCount");

// 🔹 Load dashboard data
async function loadDashboard() {
    const snapshot = await getDocs(collection(db, "reports"));

    let total = 0;
    let resolved = 0;
    let pending = 0;
    let high = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        total++;

        if (data.status === "Resolved") resolved++;
        else pending++;

        if (data.priority === "High") high++;
    });

    totalEl.innerText = total;
    resolvedEl.innerText = resolved;
    pendingEl.innerText = pending;
    highEl.innerText = high;
}

loadDashboard();
