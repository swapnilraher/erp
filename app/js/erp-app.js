/**
 * TECHSTAR ERP — MASTER SAAS APPLICATION ENGINE
 * Controls views, interactive banking reconciliation, chart rendering,
 * search filters, offcanvas drawers, and Indian accounting calculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  ERP.init();
});

const ERP = {
  activeView: 'dashboard-view',

  init() {
    this.bindNavigation();
    this.bindSidebarToggle();
    this.bindGlobalSearch();
    this.bindReconciliationActions();
    this.initCharts();
    this.bindOnboardingWizard();
    this.bindReportFilters();
  },

  // Switch between views seamlessly
  bindNavigation() {
    const navLinks = document.querySelectorAll('[data-view-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetViewId = link.getAttribute('data-view-target');
        this.switchView(targetViewId, link);
      });
    });
  },

  switchView(viewId, activeLinkElement = null) {
    const views = document.querySelectorAll('.erp-view');
    views.forEach(v => {
      v.classList.add('d-none');
      v.classList.remove('animate-fade-in');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.remove('d-none');
      targetView.classList.add('animate-fade-in');
      this.activeView = viewId;

      // Update sidebar nav active state
      if (activeLinkElement) {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(nl => nl.classList.remove('active'));
        activeLinkElement.classList.add('active');
      }

      // Refresh charts if target view has dynamic charts
      if (viewId === 'dashboard-view') {
        this.renderDashboardCharts();
      } else if (viewId === 'customer-360-view') {
        this.renderCustomerCharts();
      }

      // Close mobile sidebar if open
      const sidebar = document.getElementById('erp-sidebar');
      sidebar.classList.remove('show-mobile');

      // Scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  // Toggle sidebar collapse
  bindSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
    const wrapper = document.getElementById('erp-wrapper');
    const sidebar = document.getElementById('erp-sidebar');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        wrapper.classList.toggle('sidebar-collapsed');
      });
    }

    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show-mobile');
      });
    }
  },

  // Global search (Ctrl + K)
  bindGlobalSearch() {
    const searchTrigger = document.getElementById('global-search-trigger');
    const searchModalElement = document.getElementById('globalSearchModal');
    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');

    if (!searchModalElement) return;

    const bsModal = new bootstrap.Modal(searchModalElement);

    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => bsModal.show());
    }

    // Keyboard shortcut Ctrl + K or Cmd + K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        bsModal.show();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          searchResults.innerHTML = '<div class="p-3 text-muted text-center">Type to search customers, invoices, ledgers, or transactions...</div>';
          return;
        }

        const mockData = [
          { type: 'Customer', name: 'ABC Traders', info: 'GSTIN: 27AABCA1234F1ZM | Outstanding: ₹1,84,500', view: 'customer-360-view' },
          { type: 'Invoice', name: 'INV-1042', info: 'ABC Traders | ₹25,000 | Paid via UPI', view: 'reconciliation-view' },
          { type: 'Bank TXN', name: 'UPI/ABC TRADERS/1042', info: 'ICICI Bank | ₹25,000 | 94% Matched', view: 'reconciliation-view' },
          { type: 'Ledger', name: 'Sales Account', info: 'Revenue | YTD ₹24,85,000', view: 'accounting-view' },
          { type: 'Vendor', name: 'Mahindra Logistics', info: 'Payable: ₹5,18,000', view: 'accounting-view' },
          { type: 'Report', name: 'Profit & Loss Statement', info: 'Financial Reports | FY 2026-27', view: 'reports-view' }
        ];

        const matches = mockData.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.type.toLowerCase().includes(query) || 
          item.info.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          searchResults.innerHTML = '<div class="p-3 text-muted text-center">No matching records found</div>';
        } else {
          searchResults.innerHTML = matches.map(m => `
            <div class="p-2 border-bottom hover-bg-light cursor-pointer search-item-row" data-target-view="${m.view}">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="badge bg-primary-subtle text-primary me-2">${m.type}</span>
                  <span class="fw-bold">${m.name}</span>
                </div>
                <small class="text-muted">Click to open</small>
              </div>
              <div class="text-muted small mt-1">${m.info}</div>
            </div>
          `).join('');

          document.querySelectorAll('.search-item-row').forEach(row => {
            row.addEventListener('click', () => {
              const target = row.getAttribute('data-target-view');
              bsModal.hide();
              this.switchView(target);
            });
          });
        }
      });
    }
  },

  // Auto Bank Reconciliation Workspace Interactions
  bindReconciliationActions() {
    // 1. Smart Match Accept Button
    const acceptSmartBtn = document.getElementById('accept-smart-match-btn');
    if (acceptSmartBtn) {
      acceptSmartBtn.addEventListener('click', () => {
        const smartCard = document.getElementById('smart-match-panel');
        if (smartCard) {
          smartCard.innerHTML = `
            <div class="d-flex align-items-center justify-content-between text-success">
              <div>
                <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                <span class="fw-bold">Transaction Successfully Matched & Ledger Entry Posted!</span>
                <div class="small text-white-50">INV-1042 (₹25,000.00) matched with UPI/ABC TRADERS</div>
              </div>
              <span class="badge bg-success">Auto-Reconciled</span>
            </div>
          `;
        }

        // Update reconciliation metrics
        this.updateReconciliationMetrics(1);
        this.showToast('Success', 'Bank transaction matched with Invoice INV-1042 successfully.', 'success');
      });
    }

    // 2. Row Match Action Buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-reconcile-match')) {
        const row = e.target.closest('tr');
        if (row) {
          const statusBadge = row.querySelector('.status-badge');
          if (statusBadge) {
            statusBadge.className = 'status-badge badge-matched';
            statusBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Matched';
          }
          e.target.outerHTML = '<span class="text-success small fw-semibold"><i class="bi bi-check-lg"></i> Reconciled</span>';
          this.updateReconciliationMetrics(1);
          this.showToast('Reconciled', 'Transaction manually matched to ledger.', 'success');
        }
      }
    });

    // 3. Open Offcanvas Transaction Drawer
    document.addEventListener('click', (e) => {
      const drawerTrigger = e.target.closest('[data-bs-target="#txnDetailDrawer"]');
      if (drawerTrigger) {
        const row = drawerTrigger.closest('tr');
        if (row) {
          const date = row.cells[0]?.innerText || '02 Sep 2026';
          const desc = row.cells[1]?.innerText || 'UPI/ABC TRADERS/INV-1042';
          const ref = row.cells[2]?.innerText || 'UPI/1042';
          const amt = row.cells[3]?.innerText || '₹25,000.00';

          document.getElementById('drawer-txn-date').innerText = date;
          document.getElementById('drawer-txn-desc').innerText = desc;
          document.getElementById('drawer-txn-ref').innerText = ref;
          document.getElementById('drawer-txn-amount').innerText = amt;
        }
      }
    });
  },

  updateReconciliationMetrics(incrementCount = 1) {
    const matchedCountEl = document.getElementById('recon-matched-count');
    const unmatchedCountEl = document.getElementById('recon-unmatched-count');
    const percentEl = document.getElementById('recon-percent');

    if (matchedCountEl && unmatchedCountEl) {
      let currentMatched = parseInt(matchedCountEl.innerText.replace(/,/g, '')) || 1248;
      let currentUnmatched = parseInt(unmatchedCountEl.innerText.replace(/,/g, '')) || 32;

      currentMatched += incrementCount;
      currentUnmatched = Math.max(0, currentUnmatched - incrementCount);

      matchedCountEl.innerText = currentMatched.toLocaleString('en-IN');
      unmatchedCountEl.innerText = currentUnmatched.toLocaleString('en-IN');

      const total = currentMatched + currentUnmatched;
      const rate = ((currentMatched / total) * 100).toFixed(1);
      if (percentEl) percentEl.innerText = rate + '%';
    }
  },

  // Toast Notification helper
  showToast(title, message, type = 'primary') {
    let toastContainer = document.getElementById('erp-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'erp-toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      toastContainer.style.zIndex = '1100';
      document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'text-bg-success' : type === 'danger' ? 'text-bg-danger' : 'text-bg-dark';

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <strong>${title}:</strong> ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
  },

  // Chart Rendering Engine
  initCharts() {
    this.renderDashboardCharts();
  },

  renderDashboardCharts() {
    const salesChartCanvas = document.getElementById('revenueTrendChart');
    if (salesChartCanvas && !salesChartCanvas.dataset.chartInitialized) {
      salesChartCanvas.dataset.chartInitialized = 'true';
      const ctx = salesChartCanvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep (MTD)'],
          datasets: [
            {
              label: 'Sales Revenue (₹ In Lakhs)',
              data: [14.2, 16.8, 18.5, 21.0, 22.4, 24.85],
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#2563EB'
            },
            {
              label: 'Purchases (₹ In Lakhs)',
              data: [8.1, 9.4, 11.2, 12.0, 13.5, 14.2],
              borderColor: '#64748B',
              borderDash: [5, 5],
              fill: false,
              tension: 0.35,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw}L`
              }
            }
          },
          scales: {
            y: { grid: { color: '#F1F5F9' }, ticks: { callback: (v) => '₹' + v + 'L' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const bankDistributionCanvas = document.getElementById('bankDistributionChart');
    if (bankDistributionCanvas && !bankDistributionCanvas.dataset.chartInitialized) {
      bankDistributionCanvas.dataset.chartInitialized = 'true';
      const ctx2 = bankDistributionCanvas.getContext('2d');
      new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['ICICI Bank', 'Axis Bank', 'RBL Bank', 'Petty Cash'],
          datasets: [{
            data: [12.64, 5.77, 0.0, 0.23],
            backgroundColor: ['#F37021', '#861F41', '#003B73', '#10B981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          },
          cutout: '72%'
        }
      });
    }
  },

  renderCustomerCharts() {
    const custChartCanvas = document.getElementById('customerSalesChart');
    if (custChartCanvas && !custChartCanvas.dataset.chartInitialized) {
      custChartCanvas.dataset.chartInitialized = 'true';
      const ctx = custChartCanvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [{
            label: 'Sales Volume (₹)',
            data: [45000, 68000, 52000, 89000, 112000, 184500],
            backgroundColor: '#2563EB',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
  },

  // Onboarding Wizard Stepper
  bindOnboardingWizard() {
    const nextBtns = document.querySelectorAll('.wizard-next-step');
    const prevBtns = document.querySelectorAll('.wizard-prev-step');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStep = btn.closest('.wizard-step');
        const nextStepId = btn.getAttribute('data-next-step');
        if (currentStep && nextStepId) {
          currentStep.classList.add('d-none');
          document.getElementById(nextStepId).classList.remove('d-none');
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStep = btn.closest('.wizard-step');
        const prevStepId = btn.getAttribute('data-prev-step');
        if (currentStep && prevStepId) {
          currentStep.classList.add('d-none');
          document.getElementById(prevStepId).classList.remove('d-none');
        }
      });
    });
  },

  // Report Export & Printing Handler
  bindReportFilters() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-export-excel')) {
        this.showToast('Export Started', 'Generating Excel report file (.xlsx)...', 'success');
      } else if (e.target.closest('#btn-export-pdf')) {
        this.showToast('Export Started', 'Generating PDF report print document...', 'primary');
      } else if (e.target.closest('#btn-print-report')) {
        window.print();
      }
    });
  }
};
