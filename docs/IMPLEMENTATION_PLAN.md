# Techstar ERP marketing website: implementation plan

Version 3, 4-Oct-2026. Sources:
- the full website audit of 4-Oct-2026;
- a full re-scan of the ERP code in `E:\cc\ERP_System-master`: all 101 screens, about 330 API routes, `docs/HANDOFF.md`, and the progress log in `docs/accounting-gap-report-and-plan.md`;
- the owner's decisions of 4-Oct-2026.

This file is internal. `firebase.json` ignores `docs/**`, so it is never deployed.

### Progress (4-Oct-2026)

**Deployed 4-Oct-2026:**
- ERP commit `a52b578f` (only this work's 17 files) was pushed → Vercel. It was live after about 4 minutes: CORS for the marketing origin and the new plan texts confirmed.
- Website commit `ec58d51` → `firebase deploy` to `erp-by-swapnilaher.web.app`. Live checks: pages 200, `docs/` 404, `/login` → app, plan cards from the live API, 0 JS errors.
- The website commit is not pushed to GitHub yet.
- No real lead was submitted as a test. Submit one demo request and check Admin → Demo leads.

| Task | State |
|---|---|
| W0 brand kit | ✅ done |
| W1.0 dead app URL | ✅ done: all links go to `https://erp.techstarsolution.in` (16 places + `firebase.json`) |
| W1.1 lead capture | ✅ done in the website: home / demo / contact forms post to `/api/leads`, with errors shown and source `website`. **Needs the ERP deploy of E1**; until then the browser blocks the call (CORS) |
| W1.2 / W1.3 header, mobile menu, footer, visible pages | ✅ done: 17 pages, hamburger below 1200px, `.js`-gated animations; `js/firebase-integration.js` renamed `js/erp-integration.js` |
| W1.4 truth pass | ✅ done: section-4 corrections on the home, feature, features, solutions, industries, docs and FAQ pages; `app/` removed. The forbidden-claims grep is clean (only "Kotak" in the BRS bank list) |
| W1.5 pricing | ✅ done: `js/plans.js` renders the cards + comparison from `/api/public/plans` (static fallback = `plans.ts`); "incl. GST"; trial only on Business |
| W1.6 legal | ✅ done: app URL, 2 branches, prices incl. GST, true hosting (Supabase Mumbai), sub-processors, a no-lending-use promise, DPDP rights |
| W1.7 testimonials | ✅ done: the fabricated testimonials are removed (D4: not real), replaced by an honest "Built in Pune — talk to us" block |
| Round-2 decisions | ✅ 3-day trial on the site + in the ERP (`src/config/trial.ts`, used by registration and the app's texts); About / Contact now about the ERP only (D8); privacy policy explains the optional, consent-based loan referral (see E13) |
| E1 CORS origins | ✅ code done (`allowedOrigins.ts`); **deploy needed** |
| E4 plan feature texts | ✅ code done (`plans.ts`: e-Invoice / EWB JSON on Business + Enterprise, 3CD data, reorder report); **deploy needed** |
| Checks | 108 / 108 layout checks (18 pages × 6 widths), 0 JS errors on 22 pages, form flows tested with a mocked API, 0 broken links |

### What changed in version 3
- **Owner's decisions recorded:**
  - D1: prices **include GST**.
  - D2: the Business plan has **2 branches**.
  - D3: e-Invoice / e-Way Bill are in **Business and Enterprise**, not Starter.
  - D13: **no A3 print** (removed).
  - D7: company backups will **connect to Google Drive** (new ERP task E11).
- **New P0 bug (W1.0):** every Login / Start Free Trial / pricing link points to `erp-system-psi-one.vercel.app`. That host returns **404 DEPLOYMENT_NOT_FOUND**, so no visitor can sign up or log in. The live app is `https://erp.techstarsolution.in`.
- **Domain fact:** `www.techstarsolution.in` is the company's **loan DSA website** ("Instant Loans… DSA Partner"). The ERP marketing site needs its own product domain (D6 revised), and the privacy policy must state that ERP data is never used for lending or loan marketing.
- **Hosting fact:** the database is **Supabase PostgreSQL in Mumbai (ap-south-1)**, so "your data is stored in India" is a true claim.

### What changed in version 2
- **Invoice print formats re-checked.** The ERP prints invoices in **A4 (tax invoice), A5 (half page) and 80 mm thermal**, with Original / Duplicate / Triplicate copies. The source is `src/services/invoicePrint.ts`: `InvoiceFormat = "A4" | "A5" | "thermal"`.
- **Backup corrected.** Security console → owner / admin can **download a full backup of the company's data (JSON)** (`company/backup/[collection]`, `backupService`). Version 1 said there was no backup feature; that was wrong. "Azure / OneDrive" is still wrong.
- **Feature inventory (section 3) rebuilt** from every screen and route.
  - Added: Tally-style shortcuts (the real key list), barcode label presets, the report catalogue, POS F-keys, touch mode, split payment, the Z-report denominations, PDF and bulk print, interest on overdue bills, PDC bounce, balance-confirmation letters, the inventory analytics (ageing / slow / ABC / reorder / expiry), the GST return checks, and more.
  - The ERP's own "not built yet" list is now section 3.10, so the site never claims those.
- **e-Invoice / e-Way Bill wording refined.** The GSP integration code exists (generate / cancel IRN and e-Way Bill, GSTIN details), but it is **switched off until GSP credentials are set** (ERP Phase 7 is deferred). Until then the ERP exports the official JSON.

---

## 0. How to use this plan

- Every task has an ID: W = website repo, E = ERP repo. Ask for a task by its ID, for example "do W1.1".
- Do the phases in order. Phase W1 removes legal and revenue risk, so it ships first.
- Each task lists **Files**, **Steps** and **Done when**. A task is done only when its acceptance checks pass.
- Website files are plain HTML/CSS/JS with CRLF line endings. Keep CRLF.
- ERP rules apply to ERP tasks:
  - Next.js 16: read `node_modules/next/dist/docs/` first.
  - Follow the GSTN rules in `AGENTS.md`.
  - Nothing is committed until the owner asks.

---

## 1. Done: brand kit (W0)

A single logo is now used everywhere.

| Asset | Path (website) | Use |
|---|---|---|
| Horizontal logo, light background | `assets/logo.svg` (296×64 viewBox) | Header and standalone pages |
| Horizontal logo, dark background | `assets/logo-white.svg` | Footer |
| Mark only | `assets/logo-mark.svg`, `assets/favicon.svg` | Icons, avatars |
| Favicon (16/32/48) | `favicon.ico` (site root) | Browsers, Google results |
| Touch / PWA icons | `assets/apple-touch-icon.png` (180), `assets/icon-192.png`, `assets/icon-512.png` | Home screen |
| Social preview | `assets/og-image.png` (1200×630) | WhatsApp, LinkedIn, X |

The design:
- **Mark:** a blue rounded square (gradient `#1E40AF` to `#2563EB`), a white "T", and an orange 4-point star (`#F97316`) at the top right.
- **Wordmark:** "Techstar" in `#0F172A` and "ERP" in `#2563EB`, set in Inter ExtraBold. The letters are **converted to vector paths**, so the logo never depends on a font.
- **Dark variant:** white "Techstar" and `#93C5FD` "ERP".

Where the logo was applied:
- **Website:**
  - All 25 HTML pages now have the favicon set and `theme-color` in `<head>`, plus the new header logo (34px in the header, 40px on standalone pages).
  - The 17 footers now use the white logo. It replaces the old "A" triangle.
  - The 22 public pages now have `og:image` and `twitter:card` tags.
- **ERP:**
  - `src/app/icon.svg`, `src/app/apple-icon.tsx`, a new `src/app/favicon.ico`
  - `src/components/ui/BrandMark.tsx` (the sidebar; fixed brand colours)
  - `src/app/login/page.tsx` and `src/app/register/page.tsx`

Logo usage rules:
- Keep clear space of at least half the mark's height around the logo.
- Minimum sizes: 24px tall for the horizontal logo, 16px for the mark.
- Do not recolour, stretch or add effects. On dark backgrounds use `logo-white.svg`.
- Write the name as "Techstar ERP" (two words).

Open brand work:
- `og:image` URLs point to `https://erp-by-swapnilaher.web.app`. Update them at the domain switch (W2.1).
- The ERP payment-failure page uses `support@techstar-erp.com` (E5).

---

## 2. Truth rules (non-negotiable)

1. Every claim must map to a feature that ships in the ERP **today** (section 3). Items in 3.10 are never claimed. Items "in progress" are claimed only after they are committed and released.
2. **e-Invoice / e-Way Bill / GSTIN.**
   - Today the site says "official e-Invoice / e-Way Bill JSON for the IRP / EWB portal".
   - The site may add "direct generation through a GSP — coming soon" because the code exists. Never write "IRN generated" or "e-Way Bill generated" until the GSP account is live (decision D3).
   - GSTIN: "format and state-code check" today.
3. **GST returns** are prepared from the books. The user files them on the GST portal and records the ARN. Never write "file returns from Techstar", "GSTN connected", "real-time GSTR-2B" or "filing status" (`AGENTS.md`). GSTR-2B is imported from the portal file.
4. **No fabrication:** no testimonials, ratings, customer counts, "Most popular" badges or logos without proof and written consent.
5. **No third-party trademarks** in claims or mock data (banks as "integrations", Marg, Reliance, Tata, Mahindra). Competitors appear only on an honest, dated comparison page.
6. **Prices** exactly as `src/config/plans.ts` / `GET /api/public/plans`, with "+ 18% GST" (or "incl. GST", D1). The same numbers on the homepage, the pricing page, the terms and the refund policy.
7. **Mock data** uses a fictional company with a checksum-valid fictional GSTIN. Tax maths must be correct, and rates follow GST 2.0 (5% / 18% / 40%).

---

## 3. ERP feature inventory vs the website

Legend:
- ✅ on the site and correct
- ⚠️ on the site but wrong or overstated
- ➕ in the ERP, missing on the site
- ⛔ on the site, not in the ERP

The evidence column is the ERP screen, route or file.

### 3.1 Sales and billing
| ERP feature (live) | Evidence | Site |
|---|---|---|
| B2B tax invoice: rates exclusive (or inclusive) of GST, line discount %, bill discount, freight / packing / insurance charge lines with their own GST and SAC, round-off, back-dating within period rules, bill-to / ship-to, buyer's PO, transporter, salesperson, due date from credit days | `/dashboard/sales/invoice` | ⚠️ generic |
| Credit-limit check with confirmation and supervisor bypass | SalesInvoiceForm | ➕ |
| Quotation → sales order → delivery note → invoice, part deliveries, close / reopen orders | `/dashboard/sales/orders` | ➕ |
| Price lists (per customer), discount schemes by product / category / date / min qty, minimum selling price (owner override) | `/dashboard/sales/pricing` | ➕ |
| Credit notes: value-only multi-rate or commercial; adjust / cash / bank; s.34(2) time limit. Sales returns with refund mode | Sales → Credit Notes / Recent Bills | ✅ partly |
| Delivery challans | Sales → Delivery Challans | ➕ |
| Customer address book: billing / shipping, **GSTIN per place of business** | `customers/[id]/addresses` | ➕ |
| Services on the invoice (SAC items, no stock) | sale core | ➕ |
| **Invoice print: A4 tax invoice, A5 half page, 80 mm thermal.** Original / Duplicate / Triplicate (Rule 48). Rule 46 contents, HSN summary, amount in words, bank details, terms, declaration, signatory label, footer, company logo, UTGST, "CANCELLED" stamp | `invoicePrint.ts`, InvoicePrintDialog | ⚠️ the site claims 58 mm, dot-matrix "driverless" and a signature image |
| **Bulk print** of up to 100 invoices; **PDF download** (A4 / A5); **e-mail** with PDF (up to 3 addresses); **WhatsApp share link** (`wa.me`) from the print dialog | `/api/sales/print`, `/api/sales/[id]/email` | ⚠️ the site implies automatic WhatsApp notifications |
| e-Invoice QR and IRN / Ack printed when the sale has an IRN | `qrMatrix.ts` | ✅ (needs IRN, see 3.7) |
| Salesperson commission (API only, no screen yet) | `GET /api/sales/commission` | ➕ (claim after the screen exists) |

### 3.2 Retail POS
| ERP feature | Evidence | Site |
|---|---|---|
| Fast POS billing with barcode scan, product search, held bills on the server (any cashier of the branch recalls them) | `/dashboard/sales`, `pos/held` | ✅ |
| **Keyboard billing:** F3 hold · F4 catalogue · F7 discount · F8 cash · F9 UPI · F10 credit | KeyboardShortcuts.tsx | ➕ |
| **Touch mode** (item tiles by category) | POS | ➕ |
| Payment modes: cash, UPI, card, credit, **split cash / bank** | POS, Z report | ➕ |
| Counters and shifts, opening float, pay-in / pay-out, **X / Z reports**, cash count by **denomination**, cash short / excess journal | `/dashboard/sales/pos-control` | ➕ |
| Exchange (return + new bill in one step) | `pos/exchange` | ➕ |
| Coupons (%, flat, min bill, caps, limits) and loyalty points (earn / redeem) | POS Control | ✅ "loyalty", detail it |
| Card / UPI settlement clearing with MDR and GST on MDR | `pos/settlements` | ➕ |
| Credit-member (customer card) scan with limit / outstanding on the receipt | `/dashboard/credit` | ➕ |
| Batch FEFO, expired batches blocked, serial numbers asked at sale | stock rules | ✅ (pharma) |
| Counter discount limit (10%); minimum-price guard | sale core | ➕ |
| **No offline billing:** every bill posts to the server instantly | PosControlPanel | ⛔ the site claims "Queue Buster / local cache" |

### 3.3 Purchases and expenses
| ERP feature | Evidence | Site |
|---|---|---|
| Purchase request → PO (amendments with revision history) → GRN → bill, with a **GRN 3-way match** on the server | `/dashboard/purchases` | ➕ |
| Purchase bill: charges with GST, round-off, paid-from ledger, reverse charge with self-invoice series, s.17(5) blocked lines, capital goods (→ fixed assets), import bill of entry (customs duty and IGST), alternate billed unit, serials | purchase form | ➕ |
| Opt-in TDS on bills / expenses (194C/H/I/J/Q/A/M/O), 194Q suggestion | `purchases/tds-194q` | ➕ |
| Purchase returns and debit notes (value / commercial, multi-rate) | Purchases → Debit Notes | ✅ partly |
| Supplier payments: bill-wise, advances, TDS, cheques / PDC; approval above a limit | Purchases → Payments | ✅ partly |
| **Purchase checks:** MSME 43B(h) (45-day rule, disallowance, missing Udyam), GRN not invoiced, rate comparison | `tab=checks` | ➕ strong for CAs |
| Vendor statements and ledger | `tab=ledger_reports` | ➕ |
| Expenses: part payment, optional TDS, reverse charge, up to 5 attachment **links** (no file upload yet) | Accounting → Expenses | ✅ partly |

### 3.4 Inventory and products
| ERP feature | Evidence | Site |
|---|---|---|
| Real-time stock; append-only stock ledger; stock movement ledger | `/dashboard/stock/*` | ✅ |
| Valuation **FIFO or weighted average** (company setting, as at any date, per branch / godown) | Inventory Control | ⚠️ the site says FIFO only |
| Batch and expiry, **FEFO**, expired batches never sold, no negative batch | migration 0041 | ✅ |
| Godowns → racks → bins; godown transfers; stock by godown | Inventory Control | ✅ partly |
| Branch transfers (goods in transit counted), department issues, stock issue / receive | `/stock/transfer`, `/stock/issue` | ✅ partly |
| Opening stock (line / CSV import, adopt from the master) | Inventory Control | ➕ |
| Physical verification (count sheets, gains / losses, **write-off with s.17(5)(h) ITC reversal**) | Inventory Control | ➕ |
| Stock adjustments with approval (delta-based) | `/stock/adjustment` | ➕ |
| Units with GST UQC and **alternate units** (e.g. 1 Case = 24 Nos) on purchases; not yet at the POS | Units & Groups | ⚠️ the site says "unit conversions" generically |
| Product groups (hierarchy), serial numbers, **landed cost after purchase** | Inventory Control | ✅ partly |
| **Inventory analytics:** summary, ageing (FIFO layers), slow / dead stock, ABC, reorder (suggested qty), expiry | `inventory/reports/*` | ➕ |
| Product master: HSN / SAC, GST, cess, MRP, wholesale price, minimum price, reorder level, brand, group, unit, barcode, serial tracking, expiry | `/dashboard/products` | ✅ partly |
| **Barcode label printer:** CODE128; presets 38×25, 50×25, 50×25 2-up, 50×38 mm, 104 mm rolls (TVS / Zebra) and A4 sheets; name / price / company / barcode text | `/dashboard/barcodes` | ✅ ("label designer") |

### 3.5 Manufacturing and services
| ERP feature | Evidence | Site |
|---|---|---|
| BOM with versions, wastage, by-products / scrap at NRV, multi-level explosion, standard cost | `/dashboard/manufacturing` | ⚠️ a "BOM" tag only |
| Production orders: issue / return / partial receipt, WIP at actual cost, cost sheet, yield | same | ➕ |
| Job work with challans and **ITC-04 data**, the one-year return list | same | ➕ |
| Service contracts: milestones, time and material (timesheets), retainers, **AMC and recurring invoices**, billing run | `/dashboard/services` | ⚠️ "recurring bills" only |
| Deferred revenue (released monthly) and unbilled revenue (accrual) | Services → Revenue | ➕ |
| Place-of-supply rules for services (IGST Act s.12) | `services/place-of-supply` | ➕ |

### 3.6 Accounting and finance
| ERP feature | Evidence | Site |
|---|---|---|
| Ledger master with Tally-style groups, COA, journals (reversals), receipt / payment / contra vouchers, multiple cash / bank ledgers, voucher series | Accounting | ✅ |
| Day book, cash book, bank book | Accounting → Daily Books | ✅ partly |
| **Bill-wise outstanding:** New Ref / Agst Ref / Advance / On Account, ageing, party statement, **balance-confirmation letters**, **interest on overdue bills** | `/accounting/receivables` | ⚠️ generic "outstanding" |
| PDC / cheque register (deposit, clear, **bounce**) | `accounting/pdc` | ➕ |
| **BRS** from the bank statement file (XLSX / CSV of SBI, HDFC, ICICI, Axis, Kotak and the app template), auto-match, clearing dates, BRS certificate | `/dashboard/brs`, `brsService.ts` | ⛔ the site claims direct ICICI / Axis / RBL APIs and "94%" |
| TDS: payment-type master with dated rates, register from the books, ITNS-281 challans, 201(1A) interest / 234E fee, **26Q / 24Q / 27Q data (CSV for the RPU)**, **Form 16A**, **26AS / AIS import and reconciliation**, no-PAN flag | `/accounting/tds` | ➕ |
| Fixed assets: capitalise from bills, **Companies Act Schedule II SLM / WDV**, one run per FY, disposal with profit / loss, FA schedule, **Income-tax block report** | `/accounting/fixed-assets` | ➕ |
| Cost centres (master and journal tagging) | Books & Controls | ➕ |
| Recurring / accrual / prepaid journals | `year-end?tab=recurring` | ➕ |
| Opening balances: books-beginning date, ledger openings, **bill-wise party openings**, Excel / CSV import | `/accounting/imports` | ➕ |
| Month-end checklist and lock; year-end: appropriation JV, closing-stock freeze, FY lock, **auditor-adjustment window**; back-dating control | `/accounting/periods`, `/year-end` | ➕ |
| Trial balance (group view), P&L, balance sheet | statements | ✅ |
| **Schedule III statements with the previous year and notes** (receivables / payables ageing incl. MSME, PPE), cash flow (AS-3, indirect), funds flow, **ratios** (current, quick, D/E, GP%, NP%, inventory turnover, debtor / creditor days, ROE, ROCE), comparative statements, stock valuation (AS-2) | `/accounting/statements`, `/comparative` | ➕ strong for CAs |
| Multi-branch ledger and analysis | `/accounting/branchwise` | ✅ |
| Credit members ledger (limits, repayments, statements) | `/dashboard/credit` | ➕ |
| Approval of payments above a set limit | Approvals desk | ➕ |

### 3.7 GST compliance (offline workbench)
| ERP feature | Evidence | Site |
|---|---|---|
| **GSTR-1** from the books: all tables, table 13 series by series (gaps flagged), **offline-tool JSON with checks** (GSTIN check digit, rates, arithmetic, UQC), download | `/dashboard/gst/returns`, `/gst/gstr1` | ⚠️ partly; the site shows a wrong "GSTR-2" |
| **GSTR-1A** amendments with JSON | `/gst/gstr1a` | ➕ |
| **GSTR-3B**: 3.1, 3.2, 4 (with reversals), 5, 5.1 interest and late fee, **6.1 set-off**, set-off journal | `/gst/gstr3b` | ➕ |
| ITC register: eligible / blocked / reversed / re-claimed; **Rule 37 (180-day)**, Rules 42 / 43, reversal / re-claim vouchers, ECRS statement | `/gst/itc-compliance` | ➕ |
| PMT-06 challans, GST electronic cash ledger | Payments & Cash Ledger | ➕ |
| **Filed with ARN** → snapshot → month lock (changes only via credit note / GSTR-1A) | Filed Returns | ➕ |
| **Return checks:** GSTR-1 filed vs books, 1 vs 3B, 3B filed vs books, **GSTR-2B vs purchase register with IMS actions** | Return Checks & IMS | ➕ |
| **GSTR-2B import** (xlsx / xls / json / csv) and reconciliation (evidence only; never changes the books) | `/gst/gstr2b` | ⚠️ the site says "2B export" and "real-time ITC alerts" |
| Composition: bill of supply, **CMP-08**, **GSTR-4** data | Composition | ➕ |
| **GSTR-9** and **9C working**, ISD distribution (GSTR-6 data) | Annual & ISD | ➕ |
| Inter-GSTIN stock transfer as a taxable supply | transfers | ➕ |
| GST sales / purchase registers, statutory registers (.XLSM), HSN summary with UQC | `/gst/registers`, `/gst/statutory_xlsm` | ✅ partly |
| **e-Invoice:** official JSON for the IRP portal. The GSP integration (generate / cancel IRN) is built but off until GSP credentials are set | `/gst/einvoice`, `api/gst/compliance` | ⛔ the site claims live "IRN generated" |
| **e-Way Bill:** official JSON for the EWB portal. GSP generate / cancel is built but off | `/gst/eway` | ⛔ the site claims live generation |
| **GSTIN:** format and state-code check. Name / status lookup only with a GSP. No filing status (not allowed) | `api/gst/compliance` | ⛔ the site claims name, status and filing status |

### 3.8 Reports, audit and MIS
| ERP feature | Evidence | Site |
|---|---|---|
| **Sales reports:** date-, branch-, GST-, product-, customer-, staff- and payment-mode-wise; sales returns; delivery challans; credit notes | `/reports/sales` | ✅ partly |
| **Purchase reports:** supplier-, item- and GST-wise; purchase register; debit notes | `/reports/purchases` | ➕ |
| **Stock reports:** current, branch stock, valuation, low stock, dead stock, movement | `/reports/stock` | ✅ partly |
| Day book, expense register, customer credit reports, financial statements, multi-branch analysis, GST and statutory registers | Reports | ✅ partly |
| **MIS:** dashboard, item gross profit, **customer profitability**, monthly P&L, **budget vs actual**, tax summary, **MIS e-mail reports** (sent on demand or by an outside scheduler) | `/reports/mis` | ➕ |
| **Audit:** master changes (database trigger, before / after), cancelled, modified and back-dated registers; **cash rules 269ST / 40A(3) / 269SS-T**; **Form 3CD data** (clauses 18, 21, 22, 26, 31, 34, 35, 40, 44) | `/reports/audit` | ⚠️ "Tax audit export" |
| Accountant dashboard: cash / bank, overdue receivables / payables, sales / purchases, stock at cost, approvals waiting, TDS not deposited, statutory due dates; date filters | `/dashboard`, `mis/dashboard` | ✅ partly |
| Excel / PDF / CSV export and print on reports | universal export | ✅ |

### 3.9 Platform and administration
| ERP feature | Evidence | Site |
|---|---|---|
| Company setup: logo, **state-wise GST registrations**, financial year | `/dashboard/company` | ➕ |
| Branch master: GSTIN / state, **invoice prefix per branch**, manager | `/dashboard/branches` | ✅ partly |
| **9 roles:** owner, admin, accountant, branch manager, billing operator, cashier, purchase manager, store keeper, auditor (read-only); branch-scoped users | `/dashboard/users` | ⚠️ the site shows 4 made-up role sets |
| Approvals desk (payments above a limit, stock adjustments) | `/dashboard/approvals` | ➕ (no multi-level chains) |
| **Security console:** audit logs, login history, role permissions, **full company data backup download (JSON)** | `/dashboard/security` | ⚠️ the site claims Azure / OneDrive, IP allowlist |
| Sign-in: e-mail + password, e-mail OTP, Google | `api/auth/*` | ➕ |
| Tenant isolation by PostgreSQL row-level security | migration 0002 | ➕ (security page) |
| **Tally-style keyboard:** Alt+G / Ctrl+K go to, Enter to next field, Ctrl+A / Ctrl+S save, Alt+C create a product from the purchase invoice, Ctrl+B menu, F1 help | KeyboardShortcuts.tsx | ➕ strong for Tally users |
| Appearance: light / dark / system theme, compact / comfortable density | `appearance.ts` | ➕ |
| Multi-company switcher; **working-FY picker** | header | ➕ |
| Installable app on phone and desktop (PWA) | `manifest.ts` | ➕ |
| **Legacy data migration** from Tally / an old ERP via Excel (xlsx / xls / csv templates, Marathi guidance) + the import framework (customers, suppliers, products, opening stock, ledger and bill-wise openings; all-or-nothing commit) | `/dashboard/migration`, `/accounting/imports` | ➕ key USP |
| Subscription self-service: Cashfree AutoPay, upgrade / downgrade with proration, GST invoices for the subscription | `/dashboard/subscription` | ✅ (legal pages) |

### 3.10 Not in the ERP: never claim (until built)
- **Printing:**
  - A3 invoice (owner: not offered);
  - 58 mm thermal;
  - dot-matrix "draft / driverless" printing (browser printing to an installed printer only);
  - signature image on the invoice (signatory label only);
  - quotation / order print.
- **POS:**
  - offline billing;
  - KOT / table maps;
  - weighing-scale integration;
  - customer display;
  - selling in an alternate unit;
  - free-quantity schemes;
  - loyalty-points expiry.
- **Products:** size / colour matrix (variants).
- **Payments and banking:**
  - UPI QR on the invoice (E9 adds it; today the UPI ID prints);
  - direct bank APIs / connected banking;
  - automatic payment reminders.
- **Platform and security:**
  - Azure / OneDrive backups;
  - IP allowlist;
  - two-factor authentication;
  - automatic session expiry (not verified);
  - in-app or push notifications (low-stock "alerts" are a report);
  - multi-level approval chains;
  - updating masters by import.
- **Other:**
  - multi-currency, export / SEZ invoices (excluded);
  - payroll;
  - consignment;
  - MRP / capacity planning;
  - statement of changes in equity;
  - purchase-bill amendment;
  - project profitability;
  - timesheet approval;
  - live GSTN filing or a GSTR-2B API (never, by `AGENTS.md`).
- **In progress in the ERP (uncommitted, do not claim yet):**
  - GST on advances (GSTR-1 Table 11 AT / ATADJ);
  - cost-centre P&L report;
  - provision for doubtful debts and bad-debt write-off.

---

## 4. Claim corrections: old copy → new copy

Find each item with the quoted text and replace it on every page where it appears.

| # | Find (old) | Replace with (new) |
|---|---|---|
| 1 | "Generate e-Invoice", "IRN Generated", "e-Invoice generation" | "e-Invoice JSON for the IRP portal — direct GSP generation coming soon" |
| 2 | "Generate e-Way Bill", "e-Way Bill generation" | "e-Way Bill JSON for the EWB portal — direct generation coming soon" |
| 3 | "GSTIN Verification" (name, status, filing status) | "GSTIN format & state check" (in the hero tags: "GSTIN check") |
| 4 | "Connected Banking … ICICI, Axis, RBL … 94%" | "Bank reconciliation from your bank statement (SBI, HDFC, ICICI, Axis, Kotak formats) with auto-matching" |
| 5 | "Automatic cloud backups … Azure & OneDrive slots" | "Your data is stored in India (Mumbai). Download a full backup of your company data any time. Automatic backup to your Google Drive — coming soon." (drop "coming soon" when E11 ships) |
| 6 | "IP Allowlist protection …" | remove |
| 7 | "Dot Matrix … Direct Driverless", "Instant Printing — no preview", "Zero Delay Billing" | "Print A4, A5 or 80 mm thermal from your browser; bulk-print up to 100 invoices" |
| 8 | "thermal receipts (80mm/58mm)" | "80 mm thermal receipts" |
| 9 | "Queue Buster — local cache …", FAQ "local draft caches" | remove; FAQ: "Techstar needs internet. Every bill is saved to the server instantly, so nothing is lost." |
| 10 | "UPI QR code display" | "UPI ID and bank details on every invoice" (until E9) |
| 11 | Restaurants "Table maps, KOT"; Garments "Sizing matrix, color codes" | remove; use real industries: Services / AMC, Manufacturing / job work, Pharma / FMCG distribution |
| 12 | "Centralize … 25+ outlets" | "Up to 5 branches on Enterprise (more on request)" |
| 13 | Comparison table "Traditional Software ✗ …" | the honest comparison (W4.3) |
| 14 | "GSTR-1 & GSTR-2 registers" | "GSTR-1, GSTR-3B, GSTR-2B reconciliation and GSTR-9" |
| 15 | "GSTR-2B summaries export", "Real-time ITC mismatch alerts" | "Import GSTR-2B from the portal and see ITC mismatches (with IMS status)" |
| 16 | "WhatsApp delivery / notifications", "link invoices to WhatsApp notifications" | "Share invoices on WhatsApp in one click; e-mail them with PDF" |
| 17 | "Unlimited Branch Outlets / Unlimited Users" | real plan limits (from the API) |
| 18 | "Tax Audit Export" | "Form 3CD data for your tax auditor" |
| 19 | "Indian Accounting Standards" | "Schedule III statements, AS-2 stock valuation, AS-3 cash flow" |
| 20 | "Learn Multi-Branch USP", "core Techstar USP" | "Multi-branch control" |
| 21 | Every "… by Swapnil Aher & TechStar …" / "by TECHSTAR MONEY SOLUTION …" suffix (25×) | cut it |
| 22 | "Honest Pricing" (with no prices) | show the three plans with prices |
| 23 | Testimonials (Patel Trading, Elite Garments, TechHardware) | remove until real (W1.7) |
| 24 | "You'll receive alert notifications when items drop below threshold" | "The reorder report lists items at or below their reorder level, with a suggested quantity" |
| 25 | "Auto Remind" (Trading & Service card) | remove (or E10) |
| 26 | "authorized signature" (invoice customisation) | "logo, bank details, terms, declaration, signatory and footer" |
| 27 | "Encrypted user logins & automatic session expires" | "Sign in with e-mail + password, e-mail OTP or Google; every action in the audit log" |
| 28 | Role names (Super Admin / Viewer / Chief Accountant / Branch Manager mixes) | the real 9 roles (3.9) |
| 29 | "value stock with FIFO metrics", "Inventory & FIFO Stock" | "FIFO or weighted-average stock valuation" |
| 30 | "Dedicated Account Manager (Pune HQ)" | per D12 |
| 31 | "Approval builder / multi-tier approvals" (`app/` demo) | "Approvals desk: payments above your limit, stock adjustments" |

---

## 5. Owner decisions needed (blockers marked ⛔)

| ID | Decision | Default if no answer |
|---|---|---|
| D1 ✅ | Prices **include GST** (owner, 4-Oct-2026) | Show "incl. GST" |
| D2 ✅ | Business plan = **2 branches** (owner, 4-Oct-2026; matches `plans.ts`) | Update the site, terms and refund policy |
| D3 ✅ | e-Invoice / e-Way Bill: **Business and Enterprise only, not Starter** (owner, 4-Oct-2026). Today they are JSON export; "direct GSP — coming soon" | Gate it in the ERP (E12) |
| D4 ✅ | Testimonials are not real → removed (owner, 4-Oct-2026) | — |
| D5 ✅ | **3-day free trial** (owner, 4-Oct-2026); no free plan. The app gives the trial on the Business plan | Site + ERP updated |
| D6 ⏳ | No product domain yet (owner, 4-Oct-2026): stay on `erp-by-swapnilaher.web.app` until one is bought; W2.1 waits. Below, the original question: product domain for the marketing site. `www.techstarsolution.in` is the loan DSA site, so not that. Options: a new domain (e.g. `techstarerp.in`), or keep `erp-by-swapnilaher.web.app` for now. The app stays at `erp.techstarsolution.in` | Buy a product domain |
| D7 ✅ | Backups: owner will connect company backups to **Google Drive** (E11). Facts: Supabase PostgreSQL, Mumbai (ap-south-1); full JSON backup download exists today | Claim "download any time"; "Google Drive backup — coming soon" until E11 ships |
| D8 ✅ | No consultancy services on this site (owner, 4-Oct-2026) — About / Contact rewritten for the ERP | — |
| D9 | Support hours and demo slots | Mon–Sat 10–6 |
| D10 | Founder photo, full registered address, support e-mail | Needed for W2.3 |
| D11 | Marathi version of the key pages? | Yes, phase W4 |
| D12 ✅ | "Dedicated Account Manager (Pune HQ)" in Enterprise is real — keep. "SLA Guarantee" dropped for "Priority Support" (owner chose option A, 4-Oct-2026): `plans.ts`, `js/plans.js`, the subscription page's comparison. The terms keep the 99.5% "commercially reasonable efforts" wording | — |
| D15 ✅ | ERP data may be used for loans (owner, 4-Oct-2026). Done consent-based: only the subscriber's own business data, only after a separate opt-in, revocable, never a condition of the service; no personal data of the subscriber's customers / suppliers / staff | E13 + legal review |
| D13 ✅ | No A3 print (owner, 4-Oct-2026). Invoices: A4 / A5 / 80 mm thermal | — |
| D14 | Add a UPI QR on invoices (E9)? It is a cheap, strong feature for Indian SMBs | Yes |

---

## 6. Phases and tasks

### Phase W1: critical fixes (about 3 days; ship first)

**W1.0 Dead app URL (P0, do first)**
- Files:
  - `js/firebase-integration.js` (`resolveErpAppUrl`)
  - `pricing.html` (fallback `getUrl` + three plan links)
  - `login.html` (two scripts + fallback links)
  - `free-trial.html` (fallback)
  - `firebase.json` (`/login`, `/register`, `/dashboard`, `/app` redirects)
- Steps: replace `https://erp-system-psi-one.vercel.app` with `https://erp.techstarsolution.in` everywhere.
- Done when:
  - `grep -r "psi-one" .` returns nothing.
  - Login / Start Free Trial / pricing buttons open the live app.

**W1.1 Lead capture into the ERP (all forms)**
- Files:
  - `index.html` (`#demoForm`)
  - `demo.html` (`handleDemoSubmit`)
  - `contact.html` (`#contactForm`)
  - `js/main.js`
  - `js/firebase-integration.js`
- Steps:
  1. Add `submitLead(payload)`:
     - It sends `POST ${ERP_APP_URL}/api/leads`. The ERP requires `name`, `mobile` and `businessName`.
     - Always send `utm_source` (default `"website"`), `utm_medium` (default `"organic"`), `utm_campaign`, `referrer` and the page path.
  2. Delete the Firestore code (`getDb`, `saveDemoLead`, the Firebase config). The ERP no longer reads Firestore.
  3. Homepage form:
     - Replace the `setTimeout` with `submitLead`.
     - Show success **only** on HTTP 201.
     - On error, show an inline message with WhatsApp / phone fallback, and re-enable the button.
  4. `demo.html`:
     - Business Name required.
     - Use the returned `sessionCode` for "Start Free Trial" (drop the extra `/api/auth/exchange` call).
     - Build the summary with `textContent`.
  5. `contact.html`:
     - Give every field a `name`.
     - Send through `submitLead` (`businessType: "Support"`).
     - Show inline success / error, no `alert()`.
  6. Consent line under each submit button (link to the Privacy Policy).
- Depends on: E1, E2.
- Done when:
  - Each form creates a lead in the ERP admin → Demo leads, with source `website`.
  - With the network off, the forms show an error, never success.

**W1.2 One shared header and footer on every page, with a mobile menu**
- Files: all 25 HTML pages, `css/components.css`, `js/main.js`.
- Steps:
  1. Nav: at most 5 items (Product ▾, GST, Pricing, Switch from Tally, Resources ▾) + Login, Book demo, Start free trial. No emoji in buttons.
  2. Header, hamburger and `.mobile-menu` on every page; fix the relative paths in `features/`.
  3. Every page loads `js/main.js`, then `js/firebase-integration.js`.
  4. "Book Demo" goes to `demo.html` everywhere. The 8 feature pages link to `pricing.html` today.
  5. One footer everywhere (refund and security links, correct labels; social links only if real).
  6. Dropdown and hamburger work by keyboard and carry `aria-expanded`.
- Done when:
  - At 390px, every page shows a working hamburger.
  - At 1280 / 1366px there is no horizontal scroll.
  - The link check passes.

**W1.3 Make the feature pages visible**
- Steps:
  1. Load `main.js` on them.
  2. `.js`-gated animations: `main.js` adds `document.documentElement.classList.add('js')`, and CSS hides `.animate-*` only under `.js`.
  3. Fade only (no `translateX`) on screens ≤ 768px.
- Done when: every feature page shows its content with JS on and with JS off (headless render).

**W1.4 Truth pass**
- Steps:
  1. Apply section 4.
  2. Remove `app/` (the fake demo app) and every "Launch ERP App" / "View Banking App" button.
  3. The industries grid keeps only what section 3 supports.
- Done when:
  - `grep -riE "IRN Generated|Direct API|Azure|OneDrive|IP Allowlist|Driverless|58 ?mm|Queue Buster|KOT|Size Matrix|25\+ outlets|GSTR-2 |real-time ITC|filing status|USP|Auto Remind|alert notifications|by Swapnil Aher" *.html features/*.html` returns nothing.
  - `app/` is gone.

**W1.5 Pricing from one source**
- Files: `pricing.html`, `index.html` (`#pricing`), `js/firebase-integration.js`.
- Steps:
  1. Render the plan cards from `GET /api/public/plans` (name, prices, `maxUsers`, `maxBranches`, `features`, `recommended`, `trialEligible`). Keep a static fallback equal to `plans.ts`.
  2. "incl. GST" under each price (D1). Keep the monthly / yearly toggle. e-Invoice / e-Way Bill JSON appears on Business and Enterprise only (D3). Business shows 2 branches (D2).
  3. Homepage: the same three cards (or a compact strip); remove "Growth / Contact for pricing / Unlimited".
  4. Trial button only where `trialEligible`; the others say "Choose plan". No "Most Popular" without data.
  5. Plan comparison table: users, branches, POS counters, GST workbench, e-Invoice / EWB JSON (D3), support.
- Done when: the homepage, the pricing page, the terms (§5) and the refund table show identical numbers.

**W1.6 Legal pages**
- Steps:
  1. Replace `https://erp.<MY_DOMAIN>/…` with the app URL (D6). Update the plan table (D2) and the GST note (D1).
  2. Privacy policy:
     - True sub-processors: Vercel (app), Supabase PostgreSQL (Mumbai, India), Firebase Authentication (Google), Cashfree, the e-mail provider, and later the GSP and Google Drive (only when the customer connects it, E11).
     - A clear statement that ERP business data is never used for lending, credit decisions or marketing of financial products (the company also runs a loan DSA business at `www.techstarsolution.in`).
     - Website lead data, its purpose and consent withdrawal.
     - The Data Protection Board complaint route.
     - "Data Fiduciary" wording.
  3. Make `about.html` agree with the terms on "no tax consulting" (D8).
- Done when: no `<MY_DOMAIN>` remains, and the plan data matches `plans.ts`.

**W1.7 Social proof without fabrication**
- Steps:
  1. Remove the testimonials and star rows (D4).
  2. Add a founder note (photo, 3 lines, phone / WhatsApp) and an early-access onboarding offer.
- Done when: no unverified testimonial remains.

### Phase W2: trust and brand (about 1 week)

**W2.1 Domain switch**
- Note: `www.techstarsolution.in` is the loan DSA website, so the ERP marketing site cannot live there. The app already runs at `erp.techstarsolution.in`.
- Steps:
  1. Put the product domain chosen in D6 on Firebase Hosting (+ `www` 301 to the apex). The app stays at `erp.techstarsolution.in`.
  2. Update `ERP_APP_URL`, the `firebase.json` redirects, the hard-coded URLs in `login.html`, `free-trial.html` and `pricing.html`, and the canonical / `og:url` / `og:image`, sitemap and robots URLs.
  3. 301 from `erp-by-swapnilaher.web.app`.
  4. `support@techstarsolution.in` replaces `official@swapnilaher.in`.
- Depends on: E1, E3.

**W2.2 One brand system**
- Product name: "Techstar ERP".
- Legal name (footer, legal pages, invoices): "TECHSTAR MONEY SOLUTION PRIVATE LIMITED".
- Remove "TechStar Business Solution" and "Techstar Web ERP", or define the trade name once.
- Use "Techstar", not "TechStar".

**W2.3 About page rewrite**
- Content:
  - the founder story;
  - what was built in 2026 (P0–P12);
  - the support model;
  - the full address and founder photo;
  - company details.
- Consultancy services go elsewhere (D8). Check with your CA that the MOA covers SaaS (the CIN NIC code is 66190).

**W2.4 Real screenshots and video**
- Steps:
  1. In the ERP, create a fictional demo company (e.g. "Shree Ganesh Traders, Pune", checksum-valid fictional GSTIN) with a month of data.
  2. Capture screenshots:
     - POS (touch mode and keyboard)
     - B2B invoice + A4 / A5 / 80 mm prints
     - GST workbench
     - GSTR-2B recon
     - bill-wise outstanding
     - inventory analytics
     - MIS
     - the barcode label printer
  3. Use WebP with dimensions. Record a 2-minute video.

**W2.5 Identity leaks**
- Remove the real GSTIN and legal name from the mocks (`features/billing-sales.html`, `features/reports.html`) and the bank names from the mocks.

### Phase W3: UX and content quality (about 1 week)

**W3.1 Homepage order.**
1. hero
2. real screenshots
3. "Who it's for"
4. core modules
5. GST workbench (truthful)
6. Switch from Tally
7. For accountants / CAs
8. pricing strip
9. founder note
10. FAQ (8 questions)
11. final CTA

Remove the duplicate bullets and the third repetition of the feature list. About 11 sections instead of 17.

**W3.2 Hero copy.** Headline: "GST billing, stock and accounts — in one cloud ERP". Sub-line: "POS, inventory, accounting and GST returns for Indian businesses. Bring your data from Tally with Excel templates." Trust line: "No credit card · Pune-based support · Download your data any time".

**W3.3 Mockup corrections** (for mocks kept until W2.4):
- Invoice: CGST / SGST ₹1,800 each on a taxable value of ₹24,000, with a taxable value line and HSN.
- GST 2.0 rates (the mouse is 18%).
- GSTIN mocks pass the checksum (`27AABCT3456Q1ZX` fails; it needs the check character `R`).
- e-Way Bill mock: "Vehicle No." and a future validity date.
- "Net Profit" (not PAT); the reports P&L shows expenses.
- One consistent data set (branches, the real 9 roles, margins).

**W3.4 Layout**
- `.table-scroll` wrapper for the RBAC and comparison tables (the 602px table forces a 658px layout on phones).
- `min-width: 0` on grid children.
- The hamburger below 1200px.
- Done when: `scrollWidth == clientWidth` at 390 / 768 / 1100 / 1280 / 1366 on every page.

**W3.5 Forms UX**
- Neutral placeholders.
- Branch ranges 1 / 2–5 / 6–20 / 21+.
- A "Select…" first option.
- The sector list equals the industries list.
- Demo slots inside support hours (D9).
- `label for` on every field.
- The success text "We'll WhatsApp you within one working day".

**W3.6 Accessibility**
- FAQ questions as `<button aria-expanded>`.
- ARIA tabs with arrow keys.
- One SVG icon set (Lucide, like the ERP) instead of emoji.
- Mockup text ≥ 11px.
- Lighthouse Accessibility ≥ 95.

**W3.7 Thin pages**
- Merge Solutions and Industries into one page.
- A full FAQ page (about 20 questions).
- `docs.html` gets real guides (W4.6) or leaves the nav.

### Phase W4: show the real strengths (about 2 weeks)

**W4.1 Module pages built from section 3.** Each page has: a problem statement, 4–8 capabilities, 2–3 screenshots, "Who uses it", 3 FAQs and a CTA.

| Page | Highlights |
|---|---|
| Sales and billing | B2B invoice, order flow, price lists / schemes / min price, credit notes, address book, A4 / A5 / 80 mm, bulk print, PDF / e-mail / WhatsApp |
| Retail POS | F-key billing, touch mode, split payment, shifts with X / Z and denominations, exchange, coupons / loyalty, card / UPI settlement with MDR, credit-member cards, FEFO |
| Purchases | PR → PO → GRN → bill with 3-way match, RCM / self-invoice, bill of entry, MSME 43B(h), rate comparison, opt-in TDS |
| Inventory | FIFO / weighted average, batch / expiry FEFO, godowns / racks / bins, landed cost, physical verification with ITC reversal, alternate units, analytics (ageing, slow, ABC, reorder, expiry), barcode labels |
| Accounting | bill-wise with interest and confirmations, PDC, BRS import, TDS 26Q / 16A / 26AS, fixed assets (Companies Act + IT block), Schedule III, cash flow, ratios, year-end close |
| GST workbench | GSTR-1 / 1A / 3B with JSON checks, 2B recon with IMS, ITC Rule 37 / 42 / 43, PMT-06, CMP-08 / GSTR-4, GSTR-9 / 9C, ISD, e-Invoice / EWB JSON |
| Manufacturing | BOM, production, WIP, job work ITC-04 |
| Services / AMC | contracts, milestones, timesheets, recurring billing, deferred / unbilled revenue |
| Reports, audit and MIS | the report catalogue, 3CD data, cash rules, audit registers, budget vs actual, MIS e-mails |
| Security and administration | 9 roles, auditor read-only, approvals, audit trail, login history, data backup download, row-level isolation, sign-in options |

**W4.2 "Switch from Tally" page**
- The migration steps (Tally → Excel → Techstar templates).
- **Tally-style keys** (Alt+G, Enter-to-next, Ctrl+A, Alt+C, F1).
- Tally-style groups and voucher types.
- Learning-curve FAQs.
- A dated price comparison.
- A "we migrate it for you" offer.

**W4.3 Honest comparison page.** Techstar vs Tally Prime vs Marg vs Vyapar, with the source and "as of" date in every competitor cell, and no unverified ✗ marks.

**W4.4 Security and data page.** Cover:
- hosting / backups (D7) and the data-backup download;
- encryption in transit;
- sign-in methods;
- the 9 roles;
- the audit trail;
- period locks;
- the 90-day read-only export after cancellation;
- the grievance officer.

**W4.5 "For accountants / CAs" page.** Schedule III + ratios, AS-2 / AS-3, 3CD data, 43B(h), 269ST / 40A(3), the auditor role and adjustment window, GSTR-9 / 9C, TDS 26Q / 26AS. Option: a partner / referral programme.

**W4.6 Help centre v1.** 10 how-to articles with screenshots:
1. first invoice
2. POS setup and F-keys
3. import from Tally
4. GSTR-1 JSON
5. 2B import
6. BRS import
7. users and roles
8. printing A4 / A5 / 80 mm and barcode labels
9. year-end close
10. subscription

**W4.7 Marathi pages (D11):** home, pricing, Switch from Tally, demo form.

**W4.8 Lead magnets:**
- an e-Invoice applicability checker (AATO > ₹5 Cr);
- an e-Way Bill limit checker (₹50,000);
- a GST 2.0 rate article.

### Phase W5: SEO, analytics and engineering (about 3 days)

**W5.1 Analytics**
- GA4 events: `start_trial_click`, `book_demo_click`, `lead_submitted`, `lead_failed`, `whatsapp_click`, `call_click`, `pricing_toggle`, `plan_click`.
- Search Console.
- Analytics cookies in the privacy policy.

**W5.2 Per-page SEO**
- On every page: a unique title / description, a canonical, `og:title` / `og:description` / `og:url`.
- JSON-LD: `Organization`, `SoftwareApplication` with `offers`, `FAQPage`, `BreadcrumbList`.
- Remove `meta keywords`.

**W5.3 Sitemap and robots** cover every public page, including the module pages and `/mr/`.

**W5.4 Build step**
- `src/pages` + `src/partials` → `dist/` via `scripts/build.mjs`. It also runs the link check and the forbidden-claims grep.
- Set `firebase.json` `"public": "dist"`.

**W5.5 Performance**
- Inline styles → CSS classes.
- Font weights in use only.
- WebP images.
- Lighthouse mobile: Performance ≥ 90, SEO 100.

### Phase W6: launch and measure
- QA checklist (section 9).
- Deploy to the brand domain and submit the sitemap. Test the WhatsApp preview.
- Weekly KPIs:
  - visits
  - trial clicks
  - leads in the ERP
  - trials started
  - paid conversions
  - the lead source split

---

## 7. ERP-side tasks (`E:\cc\ERP_System-master`)

| ID | Task | Files | Notes |
|---|---|---|---|
| E1 | Add the marketing origin(s) to the CORS allow-list (web.app now, the brand domain later) | `src/lib/allowedOrigins.ts` | Required by W1.1; exact origins only |
| E2 | `POST /api/leads`: default `source` = `"website"`, accept `pagePath`, rate-limit; optional owner alert | `src/app/api/leads/route.ts` | Honest lead sources |
| E3 | Canonical app / site URLs match the chosen domains | `allowedOrigins.ts`, env | With W2.1 |
| E4 | Plans: reconcile with D1–D3; expose `priceIncludesGst` / `taxNote` in `/api/public/plans` | `src/config/plans.ts`, `api/public/plans` | Single source for W1.5 |
| E5 | Brand strings: `support@techstar-erp.com`, "Techstar Enterprise Security Portal", the "TECHSTAR ENTERPRISE" fallbacks → "Techstar ERP" / the support e-mail | payment failure page, `sales/page.tsx`, export fallbacks | One brand |
| E6 | PWA: add the 192 / 512 PNG icons from the brand kit to the manifest | `src/app/manifest.ts` | Install prompts |
| E7 | Product gaps that would unlock site claims: P7 GSP activation, POS alternate unit, an in-app scheduler for the MIS e-mails, a file-upload store, quotation / order print | per HANDOFF | Claim only after they ship |
| E8 | (Dropped: no A3 print, owner 4-Oct-2026.) | — | Invoices stay A4 / A5 / 80 mm |
| E9 | (If D14 = yes) **UPI QR on invoices**: `upi://pay?pa=<UPI ID>&pn=<name>&am=<balance>&tn=<invoice>` drawn with the existing `qrMatrix.ts` on A4 / A5 / thermal | `invoicePrint.ts`, `invoicePdf.ts` | Small, high-value |
| E10 | (Optional) Payment reminders: a WhatsApp / e-mail link per overdue bill from bill-wise outstanding | `BillwiseOutstandingPanel.tsx` | Would allow an "easy reminders" claim |
| E11 | **Google Drive backup** (D7): owner / admin connects Google Drive (OAuth, `drive.file` scope only); a scheduled job uploads the company JSON backup (the `backupService` collections) to a "Techstar ERP Backups" folder; keep the last N copies; show the last backup time and status in the Security console; disconnect at any time | new route + settings; the existing `company/backup` export | Then the site may say "Automatic backup to your own Google Drive" |
| E13 | **Loan-referral consent (D15)** — required before any ERP data is used for loans: an opt-in screen for owner / admin (what data, which lender, for what purpose), off by default, revocable in one click, every grant / withdrawal in the audit log, and an export limited to the company's own summaries (sales, purchases, receivables, GST return totals). Get a lawyer / CA to check it against the DPDP Act 2023 / Rules 2025 and the RBI Digital Lending Directions for loan service providers. Note: the personal data of the subscriber's customers is held by Techstar only as a processor and must never be used for this | new ERP screen + route; privacy policy already describes it | Until E13 ships, no ERP data may be used for loans |
| E12 | **Plan gating for e-Invoice / e-Way Bill** (D3): Starter does not get e-Invoice / EWB JSON (and later the GSP actions). Business / Enterprise do. Show an upgrade prompt on Starter | `api/gst/compliance`, the e-Invoice / EWB panels, the plan features in `plans.ts` | The site's plan table then matches the app |

---

## 8. Information architecture

**Header:** Product ▾ (overview + 10 module pages) · GST · Pricing · Switch from Tally · Resources ▾ (Help, FAQ, Security, About, Contact) · Login · Book demo · **Start free trial**.

**Footer:**
- Product
- Industries
- Resources
- Company
- Legal
- Contact: support e-mail, phone, WhatsApp, address, legal name / CIN / GSTIN

**Sitemap:**
```
/                    home
/features/           overview + 10 module pages
/gst/                GST workbench (truthful)
/pricing/
/switch-from-tally/
/compare/
/industries/         (merged solutions + industries)
/security/
/for-accountants/
/about/  /contact/  /demo/  /free-trial/
/help/   /faq/
/mr/                 Marathi set
/privacy/ /terms/ /refund-policy/
```

---

## 9. QA and launch checklist

- [ ] Every page at 390 / 768 / 1100 / 1280 / 1366 / 1920: no horizontal scroll, the hamburger below 1200px, the bottom CTA bar fully visible.
- [ ] Every page renders its content with JS disabled.
- [ ] All three forms create leads in the ERP admin. Error states tested.
- [ ] Prices identical across the home page, the pricing page, the terms, the refund policy and the API. The GST label is shown.
- [ ] The forbidden-claims grep (W1.4) is clean. A manual read of every page against section 3 (especially 3.10).
- [ ] Mocks: no real GSTIN or legal name; checksums valid; tax maths correct.
- [ ] Favicon, the Apple touch icon and the WhatsApp `og:image` preview checked on real devices.
- [ ] Link checker: 0 broken, 0 dead `href="#"`.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best practices ≥ 95, SEO 100.
- [ ] GA4 events firing. Search Console verified. Sitemap submitted.
- [ ] Legal pages: no placeholders; the sub-processors are true; the DPDP items are present.

---

## 10. Timeline (one developer, part-time agent help)

| Week | Work |
|---|---|
| 1 | **W1.0 first**, then W1.1 – W1.7 + E1, E2, E4 (D1–D3 decided; D4, D5 open) |
| 2 | W2.1 – W2.5 + E3, E5, E12 (+ E9 if approved) |
| 3–4 | E11 Google Drive backup (ERP), alongside the website phases |
| 3 | W3.1 – W3.7 + W5.1 – W5.3 |
| 4 | W5.4 – W5.5, W4.2, W4.4 |
| 5–6 | W4.1 module pages, W4.3, W4.5 – W4.8, W6 launch |
