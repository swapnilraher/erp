/**
 * Plan cards and comparison, rendered from the ERP's public plans (GET /api/public/plans).
 * The fallback below must stay equal to src/config/plans.ts in the ERP. Prices include GST.
 */
(function () {
  "use strict";

  const FALLBACK = [
    {
      id: "starter", name: "Starter Plan", monthlyPrice: 499, yearlyPrice: 4999, maxUsers: 2, maxBranches: 1,
      recommended: false, trialEligible: true, displayOrder: 1,
      description: "Ideal for single-location retail counters, individual traders, and early-stage small businesses.",
      features: ["Up to 2 Active Users", "1 Branch Location", "Fast Invoicing & Thermal POS Printing", "Invoices & payment reminders on WhatsApp",
        "Stock & Basic Inventory Tracking", "GST Invoices & GSTR-1 Ledger", "Direct e-Invoice (IRN) & e-Way Bill from the ERP", "Customer & Vendor Accounts",
        "Standard WhatsApp & Email Support"],
    },
    {
      id: "business", name: "Business Plan", monthlyPrice: 999, yearlyPrice: 9999, maxUsers: 5, maxBranches: 2,
      recommended: true, trialEligible: true, displayOrder: 2,
      description: "Comprehensive multi-user ERP for growing distributors, wholesalers, and multi-counter retail shops.",
      features: ["Up to 5 Active Users with RBAC", "2 Active Branches with Multi-Counter POS",
        "Double-Entry Accounting & Balance Sheets", "Invoices & payment reminders on WhatsApp", "Multi-Godown / Warehouse Inventory", "Reorder Report & Purchase Orders",
        "GSTR-1, GSTR-3B & Form 3CD Data", "Direct e-Invoice (IRN) & e-Way Bill from the ERP", "Custom Barcode & Label Designer",
        "Priority Desk Support & CA Assistance"],
    },
    {
      id: "enterprise", name: "Enterprise Plan", monthlyPrice: 2499, yearlyPrice: 24999, maxUsers: 15, maxBranches: 5,
      recommended: false, trialEligible: false, displayOrder: 3,
      description: "Scale operations seamlessly across multi-branch chains, regional warehouses, and expanding teams.",
      features: ["Up to 15 Active Users Across Departments", "Up to 5 Active Branches & Regional Hubs",
        "Inter-Branch Stock Transfers & Approvals", "Invoices & payment reminders on WhatsApp", "Advanced Role-Based Access & Audit Trails",
        "Direct e-Invoice (IRN) & e-Way Bill from the ERP", "Dedicated Account Manager (Head Office)",
        "Custom Thermal & Letterhead Printing", "Custom ERP Integrations & Priority Support"],
    },
  ];

  // The largest plan: quoted per customer, so no price and no sign-up link — contact buttons only.
  // Keep equal to src/config/contactPlan.ts in the ERP.
  const CONTACT_PLAN = {
    id: "dedicated", name: "Dedicated Cloud",
    description: "Your own server and domain, with no limit on users or branches, for large chains and groups.",
    features: ["Dedicated CPU & server for your company", "Custom domain (e.g. erp.yourcompany.com)", "Unlimited users",
      "Unlimited branches", "Dedicated relationship manager (RM)", "Everything in the Enterprise plan"],
  };
  const CONTACT = { phone: "+91 95790 05645", tel: "tel:+919579005645", whatsapp: "https://wa.me/919420405601", email: "official@swapnilaher.in" };

  let plans = FALLBACK.slice();
  let billing = "yearly";
  const mounts = [];

  const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  // Owner's decision (11-Oct-2026): Starter and Business can be tried free; every self-service plan can be bought directly.
  // Keep equal to TRIAL_PLAN_IDS in the ERP's src/config/trial.ts.
  const TRIAL_PLAN_IDS = ["starter", "business"];
  const canTry = (plan) => TRIAL_PLAN_IDS.includes(String(plan.id).toLowerCase());
  const registerUrl = (plan, intent) => {
    const path = intent === "trial"
      ? `/register?plan=${encodeURIComponent(plan.id)}&intent=trial`
      : `/register?plan=${encodeURIComponent(plan.id)}&billing=${billing}&intent=buy`;
    return window.TechstarERP ? window.TechstarERP.getErpUrl(path) : "https://erp.techstarsolution.in" + path;
  };
  const savingPct = (plan) => {
    const full = plan.monthlyPrice * 12;
    return full > plan.yearlyPrice ? Math.round(((full - plan.yearlyPrice) / full) * 100) : 0;
  };

  function card(plan, compact) {
    const c = el("div", "pricing-card plan-card" + (plan.recommended ? " featured" : ""));
    if (plan.recommended) c.append(el("div", "pricing-badge", "Recommended"));
    c.append(el("h3", "pricing-plan-title", plan.name.replace(/ Plan$/, "")));
    c.append(el("p", "pricing-plan-desc plan-desc", plan.description));

    const price = el("div", "plan-price");
    price.append(el("span", "plan-price-amount", inr(billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice)));
    price.append(el("span", "plan-price-cycle", billing === "yearly" ? " / year" : " / month"));
    c.append(price);
    const note = el("div", "plan-tax-note", "Price includes GST");
    if (billing === "yearly" && savingPct(plan)) note.textContent += ` · save ${savingPct(plan)}% vs monthly`;
    c.append(note);

    const limits = el("div", "plan-limits");
    limits.append(el("span", "", `${plan.maxUsers} users`), el("span", "", `${plan.maxBranches} ${plan.maxBranches === 1 ? "branch" : "branches"}`));
    c.append(limits);

    const ul = el("ul", "pricing-features");
    (compact ? plan.features.slice(2, 6) : plan.features).forEach((f) => {
      const li = el("li", "pricing-feature");
      li.append(el("div", "pricing-feature-icon", "✓"), document.createTextNode(" " + f));
      ul.append(li);
    });
    c.append(ul);

    // Starter / Business: try free or buy now; other plans: buy now
    const actions = el("div", "plan-contact-actions");
    if (canTry(plan)) {
      const trial = el("a", "btn " + (plan.recommended ? "btn-primary" : "btn-secondary") + " plan-cta", "Start 7-day free trial");
      trial.href = registerUrl(plan, "trial");
      trial.addEventListener("click", () => window.TechstarERP && window.TechstarERP.trackEvent("plan_click", { plan: plan.id, intent: "trial" }));
      actions.append(trial);
    }
    const buy = el("a", "btn " + (canTry(plan) ? "btn-secondary" : plan.recommended ? "btn-primary" : "btn-secondary") + " plan-cta",
      "Subscribe now · " + (billing === "yearly" ? "yearly" : "monthly"));
    buy.href = registerUrl(plan, "buy");
    buy.addEventListener("click", () => window.TechstarERP && window.TechstarERP.trackEvent("plan_click", { plan: plan.id, billing, intent: "buy" }));
    actions.append(buy);
    if (canTry(plan)) actions.append(el("div", "plan-tax-note", "Trial: no card needed"));
    c.append(actions);
    return c;
  }

  function contactCard(compact) {
    const message = "Hello, I would like a quote for the " + CONTACT_PLAN.name + " plan of Techstar ERP.";
    const c = el("div", "pricing-card plan-card plan-card-contact");
    c.append(el("h3", "pricing-plan-title", CONTACT_PLAN.name));
    c.append(el("p", "pricing-plan-desc plan-desc", CONTACT_PLAN.description));
    const price = el("div", "plan-price");
    price.append(el("span", "plan-price-amount", "Let's talk"));
    c.append(price);
    c.append(el("div", "plan-tax-note", "A plan set up for your business"));
    const limits = el("div", "plan-limits");
    limits.append(el("span", "", "Unlimited users"), el("span", "", "Unlimited branches"));
    c.append(limits);
    const ul = el("ul", "pricing-features");
    (compact ? CONTACT_PLAN.features.slice(0, 2).concat(CONTACT_PLAN.features.slice(4, 5)) : CONTACT_PLAN.features).forEach((f) => {
      const li = el("li", "pricing-feature");
      li.append(el("div", "pricing-feature-icon", "✓"), document.createTextNode(" " + f));
      ul.append(li);
    });
    c.append(ul);
    const actions = el("div", "plan-contact-actions");
    const call = el("a", "btn btn-primary plan-cta", "Call us: " + CONTACT.phone);
    call.href = CONTACT.tel;
    const wa = el("a", "btn btn-secondary", "WhatsApp");
    wa.href = CONTACT.whatsapp + "?text=" + encodeURIComponent(message);
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    const mail = el("a", "btn btn-secondary", "Email");
    mail.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(CONTACT_PLAN.name + " plan — quote") + "&body=" + encodeURIComponent(message);
    [call, wa, mail].forEach((a) => a.addEventListener("click", () => window.TechstarERP && window.TechstarERP.trackEvent("contact_plan_click", { plan: CONTACT_PLAN.id, via: a.textContent })));
    const row = el("div", "plan-contact-row");
    row.append(wa, mail);
    actions.append(call, row);
    c.append(actions);
    return c;
  }

  function compare() {
    const table = el("table", "plan-compare-table");
    const head = el("tr");
    head.append(el("th", "", ""));
    plans.forEach((p) => head.append(el("th", "", p.name.replace(/ Plan$/, ""))));
    head.append(el("th", "", CONTACT_PLAN.name));
    const thead = el("thead"); thead.append(head); table.append(thead);
    // [label, value per plan, value for Dedicated Cloud]
    const rows = [
      ["Price per year (incl. GST)", (p) => inr(p.yearlyPrice), "Contact us"],
      ["Price per month (incl. GST)", (p) => inr(p.monthlyPrice), "Contact us"],
      ["Users", (p) => String(p.maxUsers), "Unlimited"],
      ["Branches", (p) => String(p.maxBranches), "Unlimited"],
      // Owner's decision (12-Oct-2026): every plan, Starter included
      ["e-Invoice & e-Way Bill, generated from the ERP", () => "✓", "✓"],
      ["Invoices & reminders on WhatsApp", () => "✓", "✓"],
      ["Dedicated server & custom domain", () => "—", "✓"],
      ["Dedicated relationship manager", (p) => ((p.features || []).some((f) => /dedicated account manager/i.test(f)) ? "✓" : "—"), "✓"],
      ["7-day free trial", (p) => (canTry(p) ? "✓" : "—"), "—"],
      ["Subscribe without a trial", () => "✓", "Contact us"],
    ];
    const tbody = el("tbody");
    rows.forEach(([label, fn, contactValue]) => {
      const tr = el("tr");
      tr.append(el("td", "", label));
      plans.forEach((p) => tr.append(el("td", "", fn(p))));
      tr.append(el("td", "", contactValue));
      tbody.append(tr);
    });
    table.append(tbody);
    const wrap = el("div", "table-scroll");
    wrap.append(table);
    return wrap;
  }

  function paint() {
    mounts.forEach(({ node, mode }) => {
      node.replaceChildren();
      if (mode === "compare") node.append(compare());
      else {
        plans.forEach((p) => node.append(card(p, mode === "compact")));
        node.append(contactCard(mode === "compact"));
      }
    });
    // Home page hero: the cheapest current plan per month — yearly price ÷ 12 when paid annually, else the monthly price
    const cheapest = plans.reduce((low, p) => (!low || p.yearlyPrice < low.yearlyPrice ? p : low), null);
    if (cheapest) {
      const yearly = billing === "yearly";
      document.querySelectorAll("[data-hero-price]").forEach((n) => {
        n.textContent = inr(yearly ? Math.round(cheapest.yearlyPrice / 12) : cheapest.monthlyPrice);
      });
      document.querySelectorAll("[data-hero-price-note]").forEach((n) => {
        n.textContent = yearly ? `paid annually (${inr(cheapest.yearlyPrice)} a year)` : "paid monthly, cancel any time";
      });
    }
    // The "save" badge states the real saving of the current prices, not a fixed number
    const best = Math.max(0, ...plans.map(savingPct));
    document.querySelectorAll(".billing-save").forEach((badge) => {
      badge.textContent = best > 0 ? "Save up to " + best + "%" : "";
      badge.hidden = best === 0;
    });
    document.querySelectorAll("[data-billing]").forEach((b) => {
      const on = b.getAttribute("data-billing") === billing;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  async function refresh() {
    const remote = window.TechstarERP && (await window.TechstarERP.fetchPublicPlans());
    if (Array.isArray(remote) && remote.length) {
      plans = remote
        .filter((p) => p && p.id && typeof p.monthlyPrice === "number" && typeof p.yearlyPrice === "number")
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      paint();
    }
  }

  window.TechstarPlans = {
    mount(node, mode) { if (node) { mounts.push({ node, mode: mode || "full" }); paint(); } },
    setBilling(mode) { billing = mode === "monthly" ? "monthly" : "yearly"; paint(); },
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-plans]").forEach((n) => window.TechstarPlans.mount(n, n.getAttribute("data-plans")));
    document.querySelectorAll("[data-billing]").forEach((b) => b.addEventListener("click", () => window.TechstarPlans.setBilling(b.getAttribute("data-billing"))));
    refresh();
  });
})();
