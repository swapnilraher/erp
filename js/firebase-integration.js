/**
 * firebase-integration.js
 * Techstar ERP Marketing Website — Firebase & Analytics Integration
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-cvFNf0oelVh07mh8defFeonFetfJF88",
  authDomain: "erp-by-swapnilaher.firebaseapp.com",
  projectId: "erp-by-swapnilaher",
  storageBucket: "erp-by-swapnilaher.firebasestorage.app",
  messagingSenderId: "332157971292",
  appId: "1:332157971292:web:16af23c960e23864ffaf99",
};

const ERP_APP_URL = "https://erp-by-swapnilaher.web.app";

function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utmSource: params.get("utm_source") || "direct",
    utmMedium: params.get("utm_medium") || "none",
    utmCampaign: params.get("utm_campaign") || "none",
    utmContent: params.get("utm_content") || "",
    landingPage: window.location.pathname,
    referrer: document.referrer || "",
  };
  sessionStorage.setItem("techstar_utm", JSON.stringify(utm));
  return utm;
}

function getStoredUtm() {
  try { return JSON.parse(sessionStorage.getItem("techstar_utm") || "{}"); }
  catch { return {}; }
}

let _db = null;
async function getDb() {
  if (_db) return _db;
  const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
  _db = getFirestore(app);
  return _db;
}

async function saveDemoLead(formData) {
  try {
    const { getFirestore, collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const db = await getDb();
    const lead = { ...formData, ...getStoredUtm(), status: "pending", createdAt: Date.now() };
    const docRef = await addDoc(collection(db, "demo_leads"), lead);
    return docRef.id;
  } catch (err) {
    console.error("Failed to save lead:", err);
    return null;
  }
}

async function createOnboardingSession(leadId) {
  if (!leadId) return null;
  try {
    const res = await fetch(`${ERP_APP_URL}/api/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sessionCode || null;
  } catch { return null; }
}

function navigateToFreeTrial(sessionCode, leadId) {
  const utm = getStoredUtm();
  const params = new URLSearchParams();
  if (sessionCode) params.set("ref", sessionCode);
  if (leadId) params.set("lead", leadId);
  if (utm.utmSource && utm.utmSource !== "direct") params.set("utm_source", utm.utmSource);
  if (utm.utmMedium && utm.utmMedium !== "none") params.set("utm_medium", utm.utmMedium);
  if (utm.utmCampaign && utm.utmCampaign !== "none") params.set("utm_campaign", utm.utmCampaign);
  const qs = params.toString();
  window.location.href = `${ERP_APP_URL}/register${qs ? "?" + qs : ""}`;
}

function trackEvent(name, props = {}) {
  if (typeof gtag === "function") gtag("event", name, props);
}

document.addEventListener("DOMContentLoaded", () => {
  captureUtm();
  trackEvent("page_view", { page: window.location.pathname });

  document.querySelectorAll("[data-action='start-trial']").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      trackEvent("start_trial_click", {});
      navigateToFreeTrial(null, null);
    });
  });
});

window.TechstarERP = { saveDemoLead, createOnboardingSession, navigateToFreeTrial, trackEvent };
