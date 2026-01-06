// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAeqE7ED6tR1VbVKET7_UXpAifwTvI0byI",
  authDomain: "smart-civic-portal-6e6d9.firebaseapp.com",
  projectId: "smart-civic-portal-6e6d9",
  storageBucket: "smart-civic-portal-6e6d9.appspot.com",
  messagingSenderId: "689342834550",
  appId: "1:689342834550:web:22780895516a80af9bc57"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ================= GLOBAL STATE =================
let map, marker;
let selectedLat = null;
let selectedLng = null;
let currentLanguage = "en";
let selectedCategory = null;
let successAudio = null;

// ================= GOOGLE MAP =================
window.initMap = function () {
  const center = { lat: 17.385044, lng: 78.486671 };

  map = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: 12
  });

  marker = new google.maps.Marker({ map });

  map.addListener("click", e => {
    selectedLat = e.latLng.lat();
    selectedLng = e.latLng.lng();
    marker.setPosition(e.latLng);
  });
};

// ================= TRANSLATIONS =================
const translations = {
  en: {
    title: "Report Civic Issue",
    selectIssue: "Select Issue Type",
    subIssue: "Select Related Problem",
    describe: "Describe Issue (Voice / Text)",
    describePlaceholder: "You can type or use voice",
    upload: "Upload Image (optional)",
    map: "Click on Map to Select Location",
    submit: "Submit Report",
    selected: "Selected Issue",
    listening: "Listening...",
    voiceCaptured: "Voice captured",
    success: "Your complaint has been registered successfully",
    error: "Please complete all steps",

    categories: {
      "Road & Transport": "Road & Transport",
      "Water Supply": "Water Supply",
      "Electricity": "Electricity",
      "Garbage & Sanitation": "Garbage & Sanitation",
      "Drainage & Sewage": "Drainage & Sewage",
      "Street Safety": "Street Safety",
      "Public Facilities": "Public Facilities",
      "Pollution & Noise": "Pollution & Noise",
      "Animal Issues": "Animal Issues",
      "Emergency / Disaster": "Emergency / Disaster"
    },

    issues: {
      "Road & Transport": ["Potholes","Broken Speed Breakers","Traffic Signal Not Working","Road Flooding","No Zebra Crossing"],
      "Water Supply": ["No Water Supply","Pipeline Leakage","Contaminated Water","Low Water Pressure"],
      "Electricity": ["Power Outage","Streetlight Not Working","Exposed Wires","Transformer Issue"],
      "Garbage & Sanitation": ["Garbage Overflow","No Garbage Pickup","Open Dumping","Bad Odour"],
      "Drainage & Sewage": ["Open Drain","Sewage Overflow","Mosquito Breeding"],
      "Street Safety": ["Broken Streetlight","Unsafe Crossing","Dark Area at Night"],
      "Public Facilities": ["Public Toilet Not Usable","Damaged Bus Stop","Park Not Maintained"],
      "Pollution & Noise": ["Noise Pollution","Air Pollution","Construction Disturbance"],
      "Animal Issues": ["Stray Animals","Injured Animals","Cattle on Roads"],
      "Emergency / Disaster": ["Fallen Tree","Flooded Road","Storm Damage"]
    }
  },

  te: {
    title: "పౌర సమస్య నివేదిక",
    selectIssue: "సమస్య రకాన్ని ఎంచుకోండి",
    subIssue: "సంబంధిత సమస్యను ఎంచుకోండి",
    describe: "సమస్య వివరణ (వాయిస్ / టైప్)",
    describePlaceholder: "మీరు టైప్ చేయవచ్చు లేదా మాట్లాడవచ్చు",
    upload: "చిత్రాన్ని అప్లోడ్ చేయండి",
    map: "స్థానాన్ని ఎంచుకోవడానికి మ్యాప్‌పై క్లిక్ చేయండి",
    submit: "నివేదిక పంపండి",
    selected: "ఎంచుకున్న సమస్య",
    listening: "వింటోంది...",
    voiceCaptured: "వాయిస్ నమోదు అయింది",
    success: "మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది",
    error: "దయచేసి అన్ని దశలను పూర్తి చేయండి",

    categories: {
      "Road & Transport": "రోడ్లు & రవాణా",
      "Water Supply": "నీటి సరఫరా",
      "Electricity": "విద్యుత్",
      "Garbage & Sanitation": "చెత్త & పారిశుధ్యం",
      "Drainage & Sewage": "డ్రెయినేజ్ & మురుగు",
      "Street Safety": "వీధి భద్రత",
      "Public Facilities": "ప్రజా సౌకర్యాలు",
      "Pollution & Noise": "కాలుష్యం & శబ్దం",
      "Animal Issues": "జంతు సమస్యలు",
      "Emergency / Disaster": "అత్యవసరం / విపత్తు"
    },

    issues: {
      "Road & Transport": ["గుంతలు","పాడైన స్పీడ్ బ్రేకర్లు","సిగ్నల్ పనిచేయడం లేదు","రోడ్డు ముంపు","జీబ్రా క్రాసింగ్ లేదు"],
      "Water Supply": ["నీటి సరఫరా లేదు","పైప్ లీకేజ్","కలుషిత నీరు","తక్కువ నీటి ఒత్తిడి"],
      "Electricity": ["కరెంట్ లేదు","వీధి లైట్ పనిచేయడం లేదు","బహిర్గత వైర్లు","ట్రాన్స్‌ఫార్మర్ సమస్య"],
      "Garbage & Sanitation": ["చెత్త పొంగిపొర్లడం","చెత్త సేకరణ లేదు","బహిరంగ చెత్త","దుర్వాసన"],
      "Drainage & Sewage": ["బహిరంగ డ్రెయిన్","మురుగు పొంగడం","దోమల పెరుగుదల"],
      "Street Safety": ["వీధి లైట్ పాడైంది","అసురక్షిత దాటవేత","చీకటి ప్రాంతం"],
      "Public Facilities": ["పబ్లిక్ టాయిలెట్ పనికిరాదు","బస్ స్టాప్ పాడైంది","పార్క్ నిర్వహణ లేదు"],
      "Pollution & Noise": ["శబ్ద కాలుష్యం","వాయు కాలుష్యం","నిర్మాణ అంతరాయం"],
      "Animal Issues": ["తిరుగుతున్న జంతువులు","గాయపడిన జంతువులు","రోడ్లపై పశువులు"],
      "Emergency / Disaster": ["పడిపోయిన చెట్టు","ముంపు రోడ్డు","తుఫాన్ నష్టం"]
    }
  },

  hi: {
    title: "नागरिक समस्या रिपोर्ट",
    selectIssue: "समस्या का प्रकार चुनें",
    subIssue: "संबंधित समस्या चुनें",
    describe: "समस्या का विवरण",
    describePlaceholder: "आप बोल सकते हैं या लिख सकते हैं",
    upload: "छवि अपलोड करें",
    map: "मानचित्र पर स्थान चुनें",
    submit: "रिपोर्ट जमा करें",
    selected: "चयनित समस्या",
    listening: "सुन रहा है...",
    voiceCaptured: "आवाज़ दर्ज की गई",
    success: "आपकी शिकायत सफलतापूर्वक दर्ज की गई",
    error: "कृपया सभी चरण पूरे करें",

    categories: {
      "Road & Transport": "सड़क और परिवहन",
      "Water Supply": "जल आपूर्ति",
      "Electricity": "बिजली",
      "Garbage & Sanitation": "कचरा और स्वच्छता",
      "Drainage & Sewage": "जल निकासी",
      "Street Safety": "सड़क सुरक्षा",
      "Public Facilities": "सार्वजनिक सुविधाएँ",
      "Pollution & Noise": "प्रदूषण और शोर",
      "Animal Issues": "पशु समस्याएँ",
      "Emergency / Disaster": "आपातकाल / आपदा"
    },

    issues: {
      "Road & Transport": ["गड्ढे","टूटे स्पीड ब्रेकर","सिग्नल खराब","सड़क पर पानी","ज़ेब्रा क्रॉसिंग नहीं"],
      "Water Supply": ["पानी नहीं","पाइप लीक","दूषित पानी","कम दबाव"],
      "Electricity": ["बिजली नहीं","स्ट्रीट लाइट खराब","खुले तार","ट्रांसफार्मर समस्या"],
      "Garbage & Sanitation": ["कचरा भरा","कचरा नहीं उठा","खुला डंप","बदबू"],
      "Drainage & Sewage": ["खुली नाली","सीवेज ओवरफ्लो","मच्छर"],
      "Street Safety": ["स्ट्रीट लाइट खराब","असुरक्षित क्रॉसिंग","अंधेरा क्षेत्र"],
      "Public Facilities": ["शौचालय खराब","बस स्टॉप टूटा","पार्क रखरखाव नहीं"],
      "Pollution & Noise": ["शोर प्रदूषण","वायु प्रदूषण","निर्माण बाधा"],
      "Animal Issues": ["आवारा पशु","घायल पशु","सड़क पर पशु"],
      "Emergency / Disaster": ["गिरा पेड़","बाढ़ वाली सड़क","तूफान क्षति"]
    }
  }
};

// ================= AUDIO INIT =================
function initSuccessAudio() {
  if (!successAudio) {
    successAudio = new Audio(`../assets/audio/success-${currentLanguage}.mp3`);
    successAudio.play().then(() => {
      successAudio.pause();
      successAudio.currentTime = 0;
    }).catch(() => {});
  }
}

// ================= RENDER CATEGORIES =================
function renderCategories() {
  const container = document.getElementById("categoryContainer");
  container.innerHTML = "";

  Object.keys(translations.en.categories).forEach(category => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = translations[currentLanguage].categories[category];
    btn.onclick = () => selectCategory(category);
    container.appendChild(btn);
  });
}

// ================= LANGUAGE SWITCH =================
window.setLanguage = function (lang) {
  currentLanguage = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.innerText = translations[lang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) el.placeholder = translations[lang][key];
  });

  renderCategories();
  if (selectedCategory) renderSubIssues(selectedCategory);
};

// ================= CATEGORY =================
window.selectCategory = function (category) {
  selectedCategory = category;
  document.getElementById("category").value = category;

  document.getElementById("selectedCategory").innerText =
    translations[currentLanguage].selected + ": " +
    translations[currentLanguage].categories[category];

  renderSubIssues(category);
};

function renderSubIssues(category) {
  const sub = document.getElementById("subIssue");
  const label = document.getElementById("subIssueLabel");

  sub.innerHTML = "";
  translations[currentLanguage].issues[category].forEach(issue => {
    const opt = document.createElement("option");
    opt.value = issue;
    opt.textContent = issue;
    sub.appendChild(opt);
  });

  label.style.display = "block";
  sub.style.display = "block";
}

// ================= VOICE =================
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const descBox = document.getElementById("description");

if ("webkitSpeechRecognition" in window) {
  const rec = new webkitSpeechRecognition();
  rec.lang = "en-IN";

  voiceBtn.onclick = () => {
    rec.start();
    voiceStatus.innerText = translations[currentLanguage].listening;
  };

  rec.onresult = e => {
    descBox.value = e.results[0][0].transcript;
    voiceStatus.innerText = translations[currentLanguage].voiceCaptured;
  };
}

// ================= SUBMIT =================
document.getElementById("reportForm").addEventListener("submit", async e => {
  e.preventDefault();
  initSuccessAudio();

  if (!selectedCategory || selectedLat === null) {
    alert(translations[currentLanguage].error);
    return;
  }

  const subIssue = document.getElementById("subIssue").value;
  const description = descBox.value || "";
  const imageInput = document.getElementById("image");

  let imageURL = "";
  if (imageInput.files.length) {
    const imgRef = ref(storage, `reports/${Date.now()}_${imageInput.files[0].name}`);
    await uploadBytes(imgRef, imageInput.files[0]);
    imageURL = await getDownloadURL(imgRef);
  }

  await addDoc(collection(db, "reports"), {
    category: selectedCategory,
    subIssue,
    description,
    imageURL,
    location: { lat: selectedLat, lng: selectedLng },
    status: "Submitted",
    createdAt: serverTimestamp()
  });

  successAudio.src = `../assets/audio/success-${currentLanguage}.mp3`;
  successAudio.play();
  alert(translations[currentLanguage].success);

  e.target.reset();
  selectedCategory = null;
  selectedLat = selectedLng = null;
  marker.setPosition(null);
});

// ================= INIT =================
renderCategories();
