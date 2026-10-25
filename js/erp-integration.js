/**
 * ERP integration for the Techstar ERP marketing website.
 * - Links to the ERP app (login / register) with UTM attribution.
 * - Sends demo / contact requests to the ERP (`POST /api/leads`), where they appear under Admin → Demo leads.
 * - Reads public plan prices (`GET /api/public/plans`).
 * - Loads the Meta Pixel (PageView everywhere; Lead / Contact on the actions below). Form contents are never sent to it;
 *   the ERP sends its own copy of Lead / Contact with the hashed mobile / e-mail (same event id, counted once by Meta).
 * - Loads Google Analytics 4 (page views and the funnel events sent through trackEvent). No form contents either.
 */

const IS_LOCAL_HOST = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const ERP_APP_URL = IS_LOCAL_HOST ? "http://localhost:3000" : "https://erp.techstarsolution.in";

const META_PIXEL_ID = "2403234756807616";

const GA_MEASUREMENT_ID = "G-8LP0LEY9R0";

/** How long a campaign (UTM / Meta click id) stays attached to a visitor who comes back later: like Meta's _fbc cookie. */
const UTM_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Google Analytics 4. Skipped on localhost, like the Pixel. */
function initGoogleAnalytics() {
  if (IS_LOCAL_HOST || typeof window.gtag === "function") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const loader = document.createElement("script");
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(loader);
  window.gtag("js", new Date());
  // Visit statistics only: no Google signals or ad personalisation (as privacy.html section 5 says)
  window.gtag("config", GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
}

initGoogleAnalytics();

/** Standard Meta Pixel loader. Skipped on localhost so development never pollutes the live event data. */
function initMetaPixel() {
  if (IS_LOCAL_HOST || window.fbq) return;
  const fbq = (window.fbq = function () {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
    else fbq.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  const loader = document.createElement("script");
  loader.async = true;
  loader.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(loader);

  // autoConfig off: Meta must not auto-detect buttons or hash form fields; we send only the explicit events below.
  fbq("set", "autoConfig", false, META_PIXEL_ID);
  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

/** Fires a standard Meta event. `eventId` lets a matching server-side (Conversions API) event be de-duplicated later. */
function metaTrack(name, params = {}, eventId) {
  if (typeof window.fbq !== "function") return;
  if (eventId) window.fbq("track", name, params, { eventID: eventId });
  else window.fbq("track", name, params);
}

initMetaPixel();

/**
 * The visitor's campaign: the last ad / campaign link they arrived from, kept for 90 days in localStorage, so a lead
 * who comes back a few days later (typed address, bookmark) is still credited to that campaign, not "organic".
 */
function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const isCampaign = Boolean(params.get("utm_source") || params.get("fbclid"));
  // A plain visit or page change keeps what is stored; only a new campaign link replaces it.
  const stored = getStoredUtm();
  if (!isCampaign && stored.landingPage) return stored;
  const utm = {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmContent: params.get("utm_content") || "",
    fbclid: params.get("fbclid") || "",
    landingPage: window.location.pathname,
    referrer: document.referrer || "",
    savedAt: Date.now(),
  };
  try {
    // A campaign is kept for 90 days; a visit without one (its landing page and referrer) only for this tab.
    if (isCampaign) localStorage.setItem("techstar_utm", JSON.stringify(utm));
    sessionStorage.setItem("techstar_visit", JSON.stringify(utm));
  } catch { /* private mode / storage blocked */ }
  return utm;
}

/** The stored campaign (if still within 90 days), else this tab's visit, else nothing. */
function getStoredUtm() {
  try {
    const campaign = JSON.parse(localStorage.getItem("techstar_utm") || "{}");
    if (campaign.savedAt && Date.now() - campaign.savedAt <= UTM_TTL_MS) return campaign;
  } catch { /* storage blocked */ }
  try { return JSON.parse(sessionStorage.getItem("techstar_visit") || "{}"); }
  catch { return {}; }
}

/** Meta's browser id (_fbp) and click id (_fbc) cookies, for the ERP's sign-up and purchase events (Conversions API). */
function metaCookieParams(params) {
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  if (fbp) params.set("fbp", fbp);
  if (fbc) params.set("fbc", fbc);
  return params;
}

function utmParams() {
  const utm = getStoredUtm();
  const params = new URLSearchParams();
  if (utm.utmSource) params.set("utm_source", utm.utmSource);
  if (utm.utmMedium) params.set("utm_medium", utm.utmMedium);
  if (utm.utmCampaign) params.set("utm_campaign", utm.utmCampaign);
  // Which ad / video brought the visitor (Meta fills {{ad.name}})
  if (utm.utmContent) params.set("utm_content", utm.utmContent);
  // Meta ad-click id: lets the ERP attribute a later sign-up to the ad (the ERP is a different domain).
  if (utm.fbclid) params.set("fbclid", utm.fbclid);
  return params;
}

function getErpUrl(path = "") {
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  const [base, query] = cleanPath.split("?");
  const params = new URLSearchParams(query || "");
  utmParams().forEach((v, k) => { if (!params.has(k)) params.set(k, v); });
  // Sign-up links carry the Meta cookies, so the ERP's StartTrial / Purchase events match this visitor
  if (base === "/register") metaCookieParams(params);
  const qs = params.toString();
  return `${ERP_APP_URL}${base}${qs ? "?" + qs : ""}`;
}

/**
 * Sends a lead to the ERP. `payload` needs name, mobile and businessName.
 * `pixelEvent` is the Meta event to fire on success: "Lead" for a demo booking, "Contact" for the contact form.
 * Resolves to { ok: true, leadId, sessionCode } or { ok: false, error }.
 */
async function submitLead(payload, { pixelEvent = "Lead" } = {}) {
  const utm = getStoredUtm();
  const body = {
    ...payload,
    utm_source: utm.utmSource || "website",
    utm_medium: utm.utmMedium || "organic",
    utm_campaign: utm.utmCampaign || "",
    utm_content: utm.utmContent || "",
    referrer: [window.location.pathname, utm.referrer].filter(Boolean).join(" ← "),
    // For the ERP's server copy of the Meta event (same event id as the Pixel's, so Meta counts it once).
    meta_event: pixelEvent,
    page_url: window.location.origin + window.location.pathname,
    fbclid: utm.fbclid || "",
    fbc: readCookie("_fbc"),
    fbp: readCookie("_fbp"),
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
    // GA4's recommended lead event (mark it as a key event in GA4 → Admin → Events)
    trackEvent("generate_lead", { lead_type: pixelEvent === "Lead" ? "demo_booking" : "contact_form", business_type: payload.businessType || "" });
    metaTrack(pixelEvent, { content_name: pixelEvent === "Lead" ? "demo_booking" : "contact_form" }, `${pixelEvent.toLowerCase()}_${data.leadId}`);
    return { ok: true, leadId: data.leadId, sessionCode: data.sessionCode };
  } catch {
    trackEvent("lead_failed", { status: 0 });
    return { ok: false, error: "Could not reach our server. Please check your internet connection." };
  }
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Indian mobile: 10 digits starting 6–9 (a leading +91 / 0 is dropped). */
function cleanIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function navigateToFreeTrial(sessionCode, leadId, plan) {
  const params = metaCookieParams(utmParams());
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

/** The yearly plan offer as the ERP applies it: free months on every yearly payment (0 when off) and the money-back days. */
async function fetchPublicOffers() {
  try {
    const res = await fetch(`${ERP_APP_URL}/api/public/offers`);
    if (!res.ok) return null;
    const data = await res.json();
    return { yearlyBonusMonths: Math.max(0, Number(data.yearlyBonusMonths) || 0), moneyBackDays: Number(data.moneyBackDays) || 15 };
  } catch {
    return null;
  }
}

function trackEvent(name, props = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, props);
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

  document.querySelectorAll("a[href^='https://wa.me/']").forEach((a) => a.addEventListener("click", () => {
    trackEvent("whatsapp_click", {});
    metaTrack("Contact", { content_name: "whatsapp" });
  }));
  document.querySelectorAll("a[href^='tel:']").forEach((a) => a.addEventListener("click", () => {
    trackEvent("call_click", {});
    metaTrack("Contact", { content_name: "call" });
  }));

  // Sign-up links drawn when the page loaded (free-trial page, plan cards) can predate the Pixel's _fbp / _fbc
  // cookies on a visitor's first page, so the cookies are added when the link is used (click, middle / right click).
  ["click", "auxclick", "contextmenu"].forEach((type) => document.addEventListener(type, (e) => {
    const link = e.target instanceof Element ? e.target.closest(`a[href^="${ERP_APP_URL}/register"]`) : null;
    if (!link) return;
    const url = new URL(link.href);
    metaCookieParams(url.searchParams);
    link.href = url.toString();
  }, true));
});

window.TechstarERP = {
  ERP_APP_URL,
  getErpUrl,
  getStoredUtm,
  submitLead,
  cleanIndianMobile,
  navigateToFreeTrial,
  fetchPublicPlans,
  fetchPublicOffers,
  trackEvent,
  metaTrack,
};
