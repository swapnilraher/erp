/**
 * Plan cards and comparison, rendered from the ERP's public plans (GET /api/public/plans).
 * The fallback below must stay equal to src/config/plans.ts in the ERP. Prices include GST.
 */
(function () {
  "use strict";

  const FALLBACK = [
    {
      id: "starter", name: "Starter Plan", monthlyPrice: 499, yearlyPrice: 4999, maxUsers: 2, maxBranches: 1,
      recommended: false, trialEligible: false, displayOrder: 1,
      description: "Ideal for single-location retail counters, individual traders, and early-stage small businesses.",
      features: ["Up to 2 Active Users", "1 Branch Location", "Fast Invoicing & Thermal POS Printing",
        "Stock & Basic Inventory Tracking", "GST Invoices & GSTR-1 Ledger", "Customer & Vendor Accounts",
        "Standard WhatsApp & Email Support"],
    },
    {
      id: "business", name: "Business Plan", monthlyPrice: 999, yearlyPrice: 9999, maxUsers: 5, maxBranches: 2,
      recommended: true, trialEligible: true, displayOrder: 2,
      description: "Comprehensive multi-user ERP for growing distributors, wholesalers, and multi-counter retail shops.",
      features: ["Up to 5 Active Users with RBAC", "2 Active Branches with Multi-Counter POS",
        "Double-Entry Accounting & Balance Sheets", "Multi-Godown / Warehouse Inventory", "Reorder Report & Purchase Orders",
        "GSTR-1, GSTR-3B & Form 3CD Data", "e-Invoice & e-Way Bill JSON (portal-ready)", "Custom Barcode & Label Designer",
        "Priority Desk Support & CA Assistance"],
    },
    {
      id: "enterprise", name: "Enterprise Plan", monthlyPrice: 2499, yearlyPrice: 24999, maxUsers: 15, maxBranches: 5,
      recommended: false, trialEligible: false, displayOrder: 3,
      description: "Scale operations seamlessly across multi-branch chains, regional warehouses, and expanding teams.",
      features: ["Up to 15 Active Users Across Departments", "Up to 5 Active Branches & Regional Hubs",
        "Inter-Branch Stock Transfers & Approvals", "Advanced Role-Based Access & Audit Trails",
        "e-Invoice & e-Way Bill JSON (portal-ready)", "Dedicated Account Manager (Pune HQ)",
        "Custom Thermal & Letterhead Printing", "Custom ERP Integrations & Priority Support"],
    },
  ];

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
  const registerUrl = (plan) => {
    const path = `/register?plan=${encodeURIComponent(plan.id)}&billing=${billing}`;
    return window.TechstarERP ? window.TechstarERP.getErpUrl(path) : "https://erp.techstarsolution.in" + path;
  };
  const hasEinvoice = (plan) => (plan.features || []).some((f) => /e-?invoice/i.test(f));
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

    const cta = el("a", "btn " + (plan.recommended ? "btn-primary" : "btn-secondary") + " plan-cta",
      plan.trialEligible ? "Start 3-day free trial" : `Choose ${plan.name.replace(/ Plan$/, "")}`);
    cta.href = registerUrl(plan);
    cta.addEventListener("click", () => window.TechstarERP && window.TechstarERP.trackEvent("plan_click", { plan: plan.id, billing }));
    c.append(cta);
    return c;
  }

  function compare() {
    const table = el("table", "plan-compare-table");
    const head = el("tr");
    head.append(el("th", "", ""));
    plans.forEach((p) => head.append(el("th", "", p.name.replace(/ Plan$/, ""))));
    const thead = el("thead"); thead.append(head); table.append(thead);
    const rows = [
      ["Price per year (incl. GST)", (p) => inr(p.yearlyPrice)],
      ["Price per month (incl. GST)", (p) => inr(p.monthlyPrice)],
      ["Users", (p) => String(p.maxUsers)],
      ["Branches", (p) => String(p.maxBranches)],
      // Owner's decision (4-Oct-2026): every plan except Starter
      ["e-Invoice & e-Way Bill JSON", (p) => (p.id !== "starter" || hasEinvoice(p) ? "✓" : "—")],
      ["3-day free trial", (p) => (p.trialEligible ? "✓" : "—")],
    ];
    const tbody = el("tbody");
    rows.forEach(([label, fn]) => {
      const tr = el("tr");
      tr.append(el("td", "", label));
      plans.forEach((p) => tr.append(el("td", "", fn(p))));
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
      else plans.forEach((p) => node.append(card(p, mode === "compact")));
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
