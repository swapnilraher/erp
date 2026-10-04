/**
 * ERP integration for the Techstar ERP marketing website.
 * - Links to the ERP app (login / register) with UTM attribution.
 * - Sends demo / contact requests to the ERP (`POST /api/leads`), where they appear under Admin → Demo leads.
 * - Reads public plan prices (`GET /api/public/plans`).
 */

const ERP_APP_URL = (() => {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "http://localhost:3000";
  return "https://erp.techstarsolution.in";
})();

function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const stored = getStoredUtm();
  // Keep the first campaign of the visit; a plain page change must not wipe it.
  if (!params.get("utm_source") && stored.utmSource) return stored;
  const utm = {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmContent: params.get("utm_content") || "",
    landingPage: window.location.pathname,
    referrer: document.referrer || "",
  };
  try { sessionStorage.setItem("techstar_utm", JSON.stringify(utm)); } catch { /* private mode */ }
  return utm;
}

function getStoredUtm() {
  try { return JSON.parse(sessionStorage.getItem("techstar_utm") || "{}"); }
  catch { return {}; }
}

function utmParams() {
  const utm = getStoredUtm();
  const params = new URLSearchParams();
  if (utm.utmSource) params.set("utm_source", utm.utmSource);
  if (utm.utmMedium) params.set("utm_medium", utm.utmMedium);
  if (utm.utmCampaign) params.set("utm_campaign", utm.utmCampaign);
  return params;
}

function getErpUrl(path = "") {
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  const [base, query] = cleanPath.split("?");
  const params = new URLSearchParams(query || "");
  utmParams().forEach((v, k) => { if (!params.has(k)) params.set(k, v); });
  const qs = params.toString();
  return `${ERP_APP_URL}${base}${qs ? "?" + qs : ""}`;
}

/**
 * Sends a lead to the ERP. `payload` needs name, mobile and businessName.
 * Resolves to { ok: true, leadId, sessionCode } or { ok: false, error }.
 */
async function submitLead(payload) {
  const utm = getStoredUtm();
  const body = {
    ...payload,
    utm_source: utm.utmSource || "website",
    utm_medium: utm.utmMedium || "organic",
    utm_campaign: utm.utmCampaign || "",
    utm_content: utm.utmContent || "",
    referrer: [window.location.pathname, utm.referrer].filter(Boolean).join(" ← "),
  };
  try {
    const res = await fetch(`${ERP_APP_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status !== 201) {
      trackEvent("lead_failed", { status: res.status });
      return { ok: false, error: data.error || "Could not send your request." };
    }
    trackEvent("lead_submitted", { type: payload.businessType || "" });
    return { ok: true, leadId: data.leadId, sessionCode: data.sessionCode };
  } catch {
    trackEvent("lead_failed", { status: 0 });
    return { ok: false, error: "Could not reach our server. Please check your internet connection." };
  }
}

/** Indian mobile: 10 digits starting 6–9 (a leading +91 / 0 is dropped). */
function cleanIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function navigateToFreeTrial(sessionCode, leadId, plan) {
  const params = utmParams();
  if (sessionCode) params.set("ref", sessionCode);
  if (leadId) params.set("lead", leadId);
  if (plan) params.set("plan", plan);
  const qs = params.toString();
  window.location.href = `${ERP_APP_URL}/register${qs ? "?" + qs : ""}`;
}

async function fetchPublicPlans() {
  try {
    const res = await fetch(`${ERP_APP_URL}/api/public/plans`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.plans || null;
  } catch {
    return null;
  }
}

function trackEvent(name, props = {}) {
  if (typeof gtag === "function") gtag("event", name, props);
}

document.addEventListener("DOMContentLoaded", () => {
  captureUtm();

  document.querySelectorAll("[data-action='start-trial']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const plan = btn.getAttribute("data-plan") || null;
      trackEvent("start_trial_click", { plan });
      navigateToFreeTrial(null, null, plan);
    });
  });

  document.querySelectorAll("[data-action='erp-login']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      trackEvent("login_click", {});
      window.location.href = getErpUrl("/login");
    });
  });

  document.querySelectorAll("a[href^='https://wa.me/']").forEach((a) => a.addEventListener("click", () => trackEvent("whatsapp_click", {})));
  document.querySelectorAll("a[href^='tel:']").forEach((a) => a.addEventListener("click", () => trackEvent("call_click", {})));
});

window.TechstarERP = {
  ERP_APP_URL,
  getErpUrl,
  getStoredUtm,
  submitLead,
  cleanIndianMobile,
  navigateToFreeTrial,
  fetchPublicPlans,
  trackEvent,
};
