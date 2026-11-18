/**
 * ApexBank Application Controller & UI Logic
 */

(function (window) {
  'use strict';

  const store = window.bankStore;
  const charts = window.bankCharts;

  // DOM Elements Cache
  const elements = {};

  function initElements() {
    elements.body = document.body;
    elements.userAvatar = document.getElementById('user-avatar');
    elements.userName = document.getElementById('user-name');
    elements.activeAccountSelect = document.getElementById('active-account-select');
    elements.currencySelect = document.getElementById('currency-select');
    elements.themeToggleBtn = document.getElementById('theme-toggle-btn');
    elements.themeIcon = document.getElementById('theme-icon');

    // Balances & KPI
    elements.mainBalance = document.getElementById('main-balance');
    elements.balancePrivacyBtn = document.getElementById('balance-privacy-btn');
    elements.privacyIcon = document.getElementById('privacy-icon');
    elements.accountSubtitle = document.getElementById('account-subtitle');
    elements.monthlyInflow = document.getElementById('monthly-inflow');
    elements.monthlyOutflow = document.getElementById('monthly-outflow');
    elements.netSavings = document.getElementById('net-savings');

    // Virtual Card
    elements.virtualCard = document.getElementById('virtual-card');
    elements.cardHolder = document.getElementById('card-holder');
    elements.cardNumber = document.getElementById('card-number');
    elements.cardExpiry = document.getElementById('card-expiry');
    elements.cardCvv = document.getElementById('card-cvv');
    elements.cardStatusBadge = document.getElementById('card-status-badge');
    elements.toggleCardLockBtn = document.getElementById('toggle-card-lock-btn');
    elements.cardRevealBtn = document.getElementById('card-reveal-btn');
    elements.cardLimitText = document.getElementById('card-limit-text');
    elements.cardSpentText = document.getElementById('card-spent-text');
    elements.cardLimitProgress = document.getElementById('card-limit-progress');
    elements.editCardLimitBtn = document.getElementById('edit-card-limit-btn');

    // Beneficiaries
    elements.beneficiariesList = document.getElementById('beneficiaries-list');

    // Bills & Goals
    elements.billsContainer = document.getElementById('bills-container');
    elements.goalsContainer = document.getElementById('goals-container');

    // Transactions
    elements.transactionsList = document.getElementById('transactions-list');
    elements.txSearchInput = document.getElementById('tx-search-input');
    elements.txCategoryFilter = document.getElementById('tx-category-filter');
    elements.txTypeFilter = document.getElementById('tx-type-filter');
    elements.exportCsvBtn = document.getElementById('export-csv-btn');

    // Modals
    elements.modals = document.querySelectorAll('.modal-overlay');
    elements.modalCloseBtns = document.querySelectorAll('[data-modal-close]');

    // Toasts
    elements.toastContainer = document.getElementById('toast-container');
  }

  let cardRevealed = false;

  /**
   * Toast notification system
   */
  function showToast(message, type = 'info', title = '') {
    if (!elements.toastContainer) return;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '•'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    elements.toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 3800);
  }

  /**
   * Update theme according to store settings
   */
  function renderTheme() {
    const isDark = store.settings.theme === 'dark';
    if (isDark) {
      elements.body.classList.add('dark-theme');
      elements.body.classList.remove('light-theme');
      if (elements.themeIcon) elements.themeIcon.textContent = '🌙';
    } else {
      elements.body.classList.add('light-theme');
      elements.body.classList.remove('dark-theme');
      if (elements.themeIcon) elements.themeIcon.textContent = '☀️';
    }
  }

  /**
   * Render Account selector dropdown
   */
  function renderAccountSelector() {
    const user = store.getCurrentUser();
    const activeAcc = store.getActiveAccount();
    if (!elements.activeAccountSelect) return;

    let options = '';
    user.accounts.forEach(acc => {
      const selected = acc.id === activeAcc.id ? 'selected' : '';
      const formatted = store.formatAmount(acc.balance);
      options += `<option value="${acc.id}" ${selected}>${acc.name} (${formatted})</option>`;
    });

    elements.activeAccountSelect.innerHTML = options;
  }

  /**
   * Render Header and User Information
   */
  function renderHeader() {
    const user = store.getCurrentUser();
    if (elements.userName) elements.userName.textContent = user.name;
    if (elements.userAvatar) elements.userAvatar.src = user.avatar;
    if (elements.currencySelect) elements.currencySelect.value = store.settings.currency;
  }

  /**
   * Render Primary Metrics and KPI Cards
   */
  function renderBalances() {
    const activeAcc = store.getActiveAccount();
    const hide = store.settings.hideBalance;
    const transactions = store.getTransactions(activeAcc.id);

    if (elements.mainBalance) {
      if (hide) {
        elements.mainBalance.textContent = '••••••••';
      } else {
        elements.mainBalance.textContent = store.formatAmount(activeAcc.balance);
      }
    }

    if (elements.privacyIcon) {
      elements.privacyIcon.textContent = hide ? '👁️‍🗨️' : '👁️';
    }

    if (elements.accountSubtitle) {
      elements.accountSubtitle.textContent = `${activeAcc.type} • Acct # ${activeAcc.accountNumber} • Routing # ${activeAcc.routingNumber}`;
    }

    // Calculate Inflow / Outflow for this account
    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach(tx => {
      if (tx.amount > 0) {
        totalInflow += tx.amount;
      } else {
        totalOutflow += Math.abs(tx.amount);
      }
    });

    if (elements.monthlyInflow) {
      elements.monthlyInflow.textContent = hide ? '••••' : store.formatAmount(totalInflow);
    }
    if (elements.monthlyOutflow) {
      elements.monthlyOutflow.textContent = hide ? '••••' : store.formatAmount(totalOutflow);
    }
    if (elements.netSavings) {
      const net = totalInflow - totalOutflow;
      elements.netSavings.textContent = hide ? '••••' : store.formatAmount(net, true);
      elements.netSavings.className = `metric-value ${net >= 0 ? 'text-positive' : 'text-negative'}`;
    }
  }

  /**
   * Render Virtual Debit Card
   */
  function renderVirtualCard() {
    const activeAcc = store.getActiveAccount();
    const card = activeAcc.card;

    if (!card) {
      // If savings or vault doesn't have an active physical card
      if (elements.virtualCard) {
        elements.virtualCard.classList.add('card-disabled-view');
        elements.cardNumber.textContent = 'No physical card linked';
        elements.cardExpiry.textContent = '--/--';
        elements.cardCvv.textContent = '---';
        elements.cardStatusBadge.textContent = 'Digital Account';
        elements.cardStatusBadge.className = 'card-badge badge-neutral';
        elements.toggleCardLockBtn.disabled = true;
        elements.cardRevealBtn.disabled = true;
        if (elements.editCardLimitBtn) elements.editCardLimitBtn.disabled = true;
        elements.cardLimitText.textContent = '--';
        elements.cardSpentText.textContent = '--';
        elements.cardLimitProgress.style.width = '0%';
      }
      return;
    }

    elements.virtualCard.classList.remove('card-disabled-view');
    elements.toggleCardLockBtn.disabled = false;
    elements.cardRevealBtn.disabled = false;
    if (elements.editCardLimitBtn) elements.editCardLimitBtn.disabled = false;

    elements.cardHolder.textContent = card.holder;

    if (cardRevealed) {
      elements.cardNumber.textContent = card.number;
      elements.cardCvv.textContent = card.cvv;
      elements.cardRevealBtn.textContent = 'Hide Details';
    } else {
      const lastFour = card.number.slice(-4);
      elements.cardNumber.textContent = `•••• •••• •••• ${lastFour}`;
      elements.cardCvv.textContent = '•••';
      elements.cardRevealBtn.textContent = 'Show Details';
    }

    elements.cardExpiry.textContent = card.expiry;

    if (card.isLocked) {
      elements.virtualCard.classList.add('card-locked');
      elements.cardStatusBadge.textContent = '🔒 Locked / Frozen';
      elements.cardStatusBadge.className = 'card-badge badge-locked';
      elements.toggleCardLockBtn.textContent = 'Unlock Card';
      elements.toggleCardLockBtn.classList.add('btn-unlock');
    } else {
      elements.virtualCard.classList.remove('card-locked');
      elements.cardStatusBadge.textContent = 'Active • Contactless';
      elements.cardStatusBadge.className = 'card-badge badge-active';
      elements.toggleCardLockBtn.textContent = 'Freeze Card';
      elements.toggleCardLockBtn.classList.remove('btn-unlock');
    }

    // Card limit progress
    const spent = card.spentToday || 0;
    const limit = card.dailyLimit || 2500;
    const pct = Math.min(100, Math.round((spent / limit) * 100));

    elements.cardSpentText.textContent = store.formatAmount(spent);
    elements.cardLimitText.textContent = store.formatAmount(limit);
    elements.cardLimitProgress.style.width = `${pct}%`;
    if (pct > 80) {
      elements.cardLimitProgress.style.backgroundColor = '#ef4444';
    } else {
      elements.cardLimitProgress.style.backgroundColor = '#6366f1';
    }
  }

  /**
   * Render Beneficiaries / Quick Transfer Avatars
   */
  function renderBeneficiaries() {
    if (!elements.beneficiariesList) return;
    const user = store.getCurrentUser();
    const beneficiaries = user.beneficiaries || [];

    let html = '';
    beneficiaries.forEach(b => {
      html += `
        <div class="beneficiary-chip" data-id="${b.id}" data-name="${b.name}" data-acc="${b.account}" title="Send money to ${b.name}">
          <div class="ben-avatar-wrap">
            <img src="${b.avatar}" alt="${b.name}" class="ben-avatar" />
            <span class="ben-plus">+</span>
          </div>
          <span class="ben-name">${b.name.split(' ')[0]}</span>
        </div>
      `;
    });

    // Add 'New Contact' placeholder
    html += `
      <div class="beneficiary-chip add-ben-chip" id="quick-add-ben-btn" title="Add New Beneficiary">
        <div class="ben-avatar-wrap ben-avatar-add">
          <span>＋</span>
        </div>
        <span class="ben-name">Add New</span>
      </div>
    `;

    elements.beneficiariesList.innerHTML = html;

    // Attach click handlers
    elements.beneficiariesList.querySelectorAll('.beneficiary-chip:not(.add-ben-chip)').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-name');
        const acc = chip.getAttribute('data-acc');
        openTransferModalWithTarget(name, acc);
      });
    });

    const addBtn = document.getElementById('quick-add-ben-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openModal('modal-transfer');
        document.getElementById('transfer-recipient-type').value = 'external';
        handleRecipientTypeChange();
      });
    }
  }

  /**
   * Render Bills & Upcoming Payments
   */
  function renderBills() {
    if (!elements.billsContainer) return;
    const user = store.getCurrentUser();
    const bills = user.bills || [];

    let html = '';
    bills.forEach(bill => {
      const isPaid = bill.status === 'Paid';
      const formatted = store.formatAmount(bill.amount);
      const iconMap = {
        wifi: '📶',
        zap: '⚡',
        cloud: '☁️',
        droplet: '💧'
      };
      const icon = iconMap[bill.icon] || '📄';

      html += `
        <div class="bill-card ${isPaid ? 'bill-paid' : ''}">
          <div class="bill-header">
            <span class="bill-icon">${icon}</span>
            <div class="bill-info">
              <h4 class="bill-title">${bill.title}</h4>
              <span class="bill-provider">${bill.provider} • <span class="bill-due">${isPaid ? 'Paid on ' + bill.paidDate : bill.dueDate}</span></span>
            </div>
          </div>
          <div class="bill-actions">
            <div class="bill-amount">${formatted}</div>
            ${isPaid
              ? `<span class="badge-status-paid">✓ Paid</span>`
              : `<button class="btn btn-sm btn-outline-primary pay-bill-btn" data-bill-id="${bill.id}" data-amount="${bill.amount}" data-title="${bill.title}">Pay Now</button>`
            }
          </div>
        </div>
      `;
    });

    elements.billsContainer.innerHTML = html;

    elements.billsContainer.querySelectorAll('.pay-bill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const billId = e.currentTarget.getAttribute('data-bill-id');
        openPayBillModal(billId);
      });
    });
  }

  /**
   * Render Savings Goals Tracker
   */
  function renderGoals() {
    if (!elements.goalsContainer) return;
    const user = store.getCurrentUser();
    const goals = user.savingsGoals || [];

    let html = '';
    goals.forEach(goal => {
      const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
      const formattedCurrent = store.formatAmount(goal.currentAmount);
      const formattedTarget = store.formatAmount(goal.targetAmount);

      html += `
        <div class="goal-card">
          <div class="goal-header">
            <div class="goal-title-wrap">
              <span class="goal-indicator" style="background: ${goal.color};"></span>
              <h4 class="goal-title">${goal.title}</h4>
            </div>
            <span class="goal-pct">${pct}%</span>
          </div>
          <div class="progress-track goal-progress-track">
            <div class="progress-bar" style="width: ${pct}%; background: ${goal.color};"></div>
          </div>
          <div class="goal-footer">
            <span class="goal-amounts">${formattedCurrent} of ${formattedTarget}</span>
            <button class="btn btn-xs btn-subtle add-to-goal-btn" data-goal-id="${goal.id}" data-title="${goal.title}">+ Add Funds</button>
          </div>
        </div>
      `;
    });

    elements.goalsContainer.innerHTML = html;

    elements.goalsContainer.querySelectorAll('.add-to-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const goalId = e.currentTarget.getAttribute('data-goal-id');
        const title = e.currentTarget.getAttribute('data-title');
        openGoalDepositModal(goalId, title);
      });
    });
  }

  /**
   * Render Transactions Ledger with live search & filters
   */
  function renderTransactions() {
    if (!elements.transactionsList) return;
    const activeAcc = store.getActiveAccount();
    let txs = store.getTransactions(activeAcc.id);

    const query = (elements.txSearchInput?.value || '').toLowerCase().trim();
    const category = elements.txCategoryFilter?.value || 'ALL';
    const type = elements.txTypeFilter?.value || 'ALL';

    if (query) {
      txs = txs.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.counterparty.toLowerCase().includes(query) ||
        t.reference.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query))
      );
    }

    if (category !== 'ALL') {
      txs = txs.filter(t => t.category === category);
    }

    if (type === 'INFLOW') {
      txs = txs.filter(t => t.amount > 0);
    } else if (type === 'OUTFLOW') {
      txs = txs.filter(t => t.amount < 0);
    }

    if (txs.length === 0) {
      elements.transactionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h4>No transactions found</h4>
          <p>Try clearing your search query or changing active filters.</p>
        </div>
      `;
      return;
    }

    let html = '';
    txs.forEach(tx => {
      const isPositive = tx.amount > 0;
      const formattedAmount = store.formatAmount(tx.amount, true);
      const dateObj = new Date(tx.date);
      const dateFormatted = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const iconMap = {
        'Salary': '💰',
        'Deposit': '📥',
        'Cash Withdrawal': '🏧',
        'Transfer': '💸',
        'Internal Transfer': '🔄',
        'Utilities': '💡',
        'Shopping': '🛍️',
        'Food & Dining': '🍔',
        'Entertainment': '🍿',
        'Transport': '🚕',
        'Interest': '📈',
        'Account Opening': '🎉',
        'Savings Goal': '🎯'
      };

      const icon = iconMap[tx.category] || (isPositive ? '📥' : '📤');

      html += `
        <tr class="tx-row" data-id="${tx.id}">
          <td class="tx-cell-desc">
            <div class="tx-icon-desc-wrap">
              <span class="tx-type-icon ${isPositive ? 'tx-icon-in' : 'tx-icon-out'}">${icon}</span>
              <div class="tx-title-group">
                <span class="tx-title">${tx.title}</span>
                <span class="tx-subtext">${tx.counterparty} • Ref: ${tx.reference}</span>
              </div>
            </div>
          </td>
          <td class="tx-cell-category">
            <span class="badge-category">${tx.category}</span>
          </td>
          <td class="tx-cell-date">${dateFormatted}</td>
          <td class="tx-cell-status">
            <span class="badge-status-completed">✓ ${tx.status}</span>
          </td>
          <td class="tx-cell-amount ${isPositive ? 'amount-positive' : 'amount-negative'}">
            ${formattedAmount}
          </td>
          <td class="tx-cell-action">
            <button class="btn-receipt-view" title="View & Print Receipt">🧾</button>
          </td>
        </tr>
      `;
    });

    elements.transactionsList.innerHTML = html;

    // Attach click listeners to transaction rows
    elements.transactionsList.querySelectorAll('.tx-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.getAttribute('data-id');
        openReceiptModal(id);
      });
    });
  }

  /**
   * Export transactions to CSV
   */
  function exportTransactionsToCSV() {
    const activeAcc = store.getActiveAccount();
    const txs = store.getTransactions(activeAcc.id);

    if (txs.length === 0) {
      showToast('No transactions to export.', 'warning');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Description', 'Counterparty', 'Amount', 'Currency', 'Status', 'Reference'];
    const rows = txs.map(t => [
      `"${t.id}"`,
      `"${new Date(t.date).toISOString()}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.counterparty.replace(/"/g, '""')}"`,
      t.amount,
      `"${store.settings.currency}"`,
      `"${t.status}"`,
      `"${t.reference}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaBank_Statement_${activeAcc.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Transaction statement exported successfully!', 'success', 'Export CSV');
  }

  /**
   * Modal Management
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal-active');
      document.body.style.overflow = 'hidden';
      // Auto-focus first input
      const firstInput = modal.querySelector('input:not([type=hidden]), select');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    if (modal) {
      modal.classList.remove('modal-active');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    elements.modals.forEach(m => closeModal(m));
  }

  /**
   * Open Deposit Modal with preset target account
   */
  function openDepositModal() {
    const accSelect = document.getElementById('deposit-target-account');
    if (accSelect) {
      const active = store.getActiveAccount();
      accSelect.innerHTML = store.getAccounts().map(a => 
        `<option value="${a.id}" ${a.id === active.id ? 'selected' : ''}>${a.name} (${store.formatAmount(a.balance)})</option>`
      ).join('');
    }
    document.getElementById('deposit-amount').value = '';
    document.getElementById('deposit-note').value = '';
    openModal('modal-deposit');
  }

  /**
   * Open Withdraw Modal
   */
  function openWithdrawModal() {
    const accSelect = document.getElementById('withdraw-source-account');
    if (accSelect) {
      const active = store.getActiveAccount();
      accSelect.innerHTML = store.getAccounts().map(a => 
        `<option value="${a.id}" ${a.id === active.id ? 'selected' : ''}>${a.name} (Available: ${store.formatAmount(a.balance)})</option>`
      ).join('');
    }
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-pin').value = '';
    openModal('modal-withdraw');
  }

  /**
   * Open Transfer Modal
   */
  function openTransferModalWithTarget(targetName = '', targetAcc = '') {
    const fromSelect = document.getElementById('transfer-from-account');
    const toSelect = document.getElementById('transfer-to-account');
    const active = store.getActiveAccount();
    const accounts = store.getAccounts();

    if (fromSelect) {
      fromSelect.innerHTML = accounts.map(a => 
        `<option value="${a.id}" ${a.id === active.id ? 'selected' : ''}>${a.name} (${store.formatAmount(a.balance)})</option>`
      ).join('');
    }

    if (toSelect) {
      toSelect.innerHTML = accounts.filter(a => a.id !== active.id).map(a => 
        `<option value="${a.id}">${a.name} (${store.formatAmount(a.balance)})</option>`
      ).join('');
    }

    const typeSelect = document.getElementById('transfer-recipient-type');
    const extTargetInput = document.getElementById('transfer-external-target');

    if (targetName) {
      if (typeSelect) typeSelect.value = 'external';
      if (extTargetInput) extTargetInput.value = `${targetName} (${targetAcc})`;
    } else {
      if (typeSelect) typeSelect.value = 'internal';
      if (extTargetInput) extTargetInput.value = '';
    }

    handleRecipientTypeChange();
    document.getElementById('transfer-amount').value = '';
    document.getElementById('transfer-note').value = '';

    openModal('modal-transfer');
  }

  function handleRecipientTypeChange() {
    const type = document.getElementById('transfer-recipient-type').value;
    const internalGroup = document.getElementById('transfer-internal-group');
    const externalGroup = document.getElementById('transfer-external-group');

    if (type === 'internal') {
      internalGroup.style.display = 'block';
      externalGroup.style.display = 'none';
    } else {
      internalGroup.style.display = 'none';
      externalGroup.style.display = 'block';
    }
  }

  /**
   * Open Pay Bill Modal
   */
  function openPayBillModal(billId) {
    const user = store.getCurrentUser();
    const bill = user.bills.find(b => b.id === billId);
    if (!bill) return;

    document.getElementById('pay-bill-id').value = bill.id;
    document.getElementById('pay-bill-title-display').textContent = bill.title;
    document.getElementById('pay-bill-provider-display').textContent = bill.provider;
    document.getElementById('pay-bill-amount-display').textContent = store.formatAmount(bill.amount);
    document.getElementById('pay-bill-due-display').textContent = bill.dueDate;

    const accSelect = document.getElementById('pay-bill-source-account');
    if (accSelect) {
      const active = store.getActiveAccount();
      accSelect.innerHTML = store.getAccounts().map(a => 
        `<option value="${a.id}" ${a.id === active.id ? 'selected' : ''}>${a.name} (Balance: ${store.formatAmount(a.balance)})</option>`
      ).join('');
    }

    openModal('modal-pay-bill');
  }

  /**
   * Open Savings Goal Deposit Modal
   */
  function openGoalDepositModal(goalId, title) {
    document.getElementById('goal-deposit-id').value = goalId;
    document.getElementById('goal-deposit-title-display').textContent = title;

    const accSelect = document.getElementById('goal-source-account');
    if (accSelect) {
      const active = store.getActiveAccount();
      accSelect.innerHTML = store.getAccounts().map(a => 
        `<option value="${a.id}" ${a.id === active.id ? 'selected' : ''}>${a.name} (${store.formatAmount(a.balance)})</option>`
      ).join('');
    }

    document.getElementById('goal-deposit-amount').value = '';
    openModal('modal-goal-deposit');
  }

  /**
   * Open Receipt Modal
   */
  function openReceiptModal(txId) {
    const user = store.getCurrentUser();
    const tx = user.transactions.find(t => t.id === txId);
    if (!tx) return;

    const isPositive = tx.amount > 0;
    const formattedAmount = store.formatAmount(tx.amount, true);
    const account = user.accounts.find(a => a.id === tx.accountId) || { name: 'Main Account' };

    document.getElementById('receipt-amount').textContent = formattedAmount;
    document.getElementById('receipt-amount').className = `receipt-big-amount ${isPositive ? 'amount-positive' : 'amount-negative'}`;
    document.getElementById('receipt-title').textContent = tx.title;
    document.getElementById('receipt-status').textContent = `✓ ${tx.status}`;
    document.getElementById('receipt-ref').textContent = tx.reference;
    document.getElementById('receipt-date').textContent = new Date(tx.date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    document.getElementById('receipt-account').textContent = account.name;
    document.getElementById('receipt-counterparty').textContent = tx.counterparty;
    document.getElementById('receipt-category').textContent = tx.category;
    document.getElementById('receipt-notes').textContent = tx.notes || 'None';
    document.getElementById('receipt-fee').textContent = store.formatAmount(tx.fee || 0);

    openModal('modal-receipt');
  }

  /**
   * Form Submission Handlers
   */
  function bindFormHandlers() {
    // Deposit Form
    const depositForm = document.getElementById('form-deposit');
    if (depositForm) {
      depositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const accountId = document.getElementById('deposit-target-account').value;
          const amount = document.getElementById('deposit-amount').value;
          const method = document.getElementById('deposit-method').value;
          const note = document.getElementById('deposit-note').value;

          const res = store.deposit({ accountId, amount, method, note });
          closeModal('modal-deposit');
          showToast(`Successfully deposited ${store.formatAmount(parseFloat(amount))} into ${res.account.name}!`, 'success', 'Deposit Confirmed');
        } catch (err) {
          showToast(err.message, 'error', 'Deposit Failed');
        }
      });
    }

    // Withdraw Form
    const withdrawForm = document.getElementById('form-withdraw');
    if (withdrawForm) {
      withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const accountId = document.getElementById('withdraw-source-account').value;
          const amount = document.getElementById('withdraw-amount').value;
          const pin = document.getElementById('withdraw-pin').value;
          const note = document.getElementById('withdraw-note').value;

          if (pin && pin.length < 4) {
            throw new Error('Please enter a valid 4-digit security PIN.');
          }

          const res = store.withdraw({ accountId, amount, note });
          closeModal('modal-withdraw');
          showToast(`Dispensed ${store.formatAmount(parseFloat(amount))}. Take your cash & receipt.`, 'success', 'Withdrawal Complete');
        } catch (err) {
          showToast(err.message, 'error', 'Withdrawal Error');
        }
      });
    }

    // Transfer Form
    const transferForm = document.getElementById('form-transfer');
    if (transferForm) {
      transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const fromAccountId = document.getElementById('transfer-from-account').value;
          const recipientType = document.getElementById('transfer-recipient-type').value;
          const amount = document.getElementById('transfer-amount').value;
          const note = document.getElementById('transfer-note').value;

          let recipientTarget = '';
          if (recipientType === 'internal') {
            recipientTarget = document.getElementById('transfer-to-account').value;
          } else {
            recipientTarget = document.getElementById('transfer-external-target').value;
            if (!recipientTarget.trim()) {
              throw new Error('Please enter a recipient name, account number, or email.');
            }
          }

          store.transfer({ fromAccountId, recipientType, recipientTarget, amount, note });
          closeModal('modal-transfer');
          showToast(`Transferred ${store.formatAmount(parseFloat(amount))} successfully!`, 'success', 'Transfer Sent');
        } catch (err) {
          showToast(err.message, 'error', 'Transfer Failed');
        }
      });
    }

    // Pay Bill Form
    const payBillForm = document.getElementById('form-pay-bill');
    if (payBillForm) {
      payBillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const billId = document.getElementById('pay-bill-id').value;
          const accountId = document.getElementById('pay-bill-source-account').value;

          const res = store.payBill({ billId, accountId });
          closeModal('modal-pay-bill');
          showToast(`Paid ${store.formatAmount(res.bill.amount)} for ${res.bill.title}. Confirmation # ${res.transaction.reference}`, 'success', 'Bill Paid');
        } catch (err) {
          showToast(err.message, 'error', 'Payment Error');
        }
      });
    }

    // Goal Deposit Form
    const goalDepositForm = document.getElementById('form-goal-deposit');
    if (goalDepositForm) {
      goalDepositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const goalId = document.getElementById('goal-deposit-id').value;
          const accountId = document.getElementById('goal-source-account').value;
          const amount = document.getElementById('goal-deposit-amount').value;

          const res = store.contributeToGoal(goalId, accountId, amount);
          closeModal('modal-goal-deposit');
          showToast(`Contributed ${store.formatAmount(parseFloat(amount))} to ${res.goal.title}!`, 'success', 'Goal Updated');
        } catch (err) {
          showToast(err.message, 'error', 'Contribution Error');
        }
      });
    }

    // Create New Account Form
    const createAccountForm = document.getElementById('form-create-account');
    if (createAccountForm) {
      createAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const type = document.getElementById('new-account-type').value;
          const name = document.getElementById('new-account-name').value;
          const initialDeposit = document.getElementById('new-account-deposit').value;

          const newAcc = store.createNewAccount({ type, name, initialDeposit });
          closeModal('modal-create-account');
          showToast(`Created new ${newAcc.type} account "${newAcc.name}"!`, 'success', 'Account Activated');
        } catch (err) {
          showToast(err.message, 'error', 'Creation Error');
        }
      });
    }

    // Create New Goal Form
    const createGoalForm = document.getElementById('form-create-goal');
    if (createGoalForm) {
      createGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const title = document.getElementById('new-goal-title').value;
          const targetAmount = document.getElementById('new-goal-target').value;
          const currentAmount = document.getElementById('new-goal-current').value;
          const deadline = document.getElementById('new-goal-deadline').value;
          const category = document.getElementById('new-goal-category').value;

          const newGoal = store.createSavingsGoal({ title, targetAmount, currentAmount, deadline, category });
          closeModal('modal-create-goal');
          showToast(`Created new savings goal "${newGoal.title}"!`, 'success', 'Goal Created');
        } catch (err) {
          showToast(err.message, 'error', 'Goal Creation Error');
        }
      });
    }

    // Edit Card Limit Form
    const editLimitForm = document.getElementById('form-edit-limit');
    if (editLimitForm) {
      editLimitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const activeAcc = store.getActiveAccount();
          const newLimit = document.getElementById('new-card-limit-input').value;
          store.updateCardLimit(activeAcc.id, newLimit);
          closeModal('modal-edit-limit');
          showToast(`Daily spending limit updated to ${store.formatAmount(parseFloat(newLimit))}!`, 'success', 'Limit Updated');
        } catch (err) {
          showToast(err.message, 'error', 'Update Error');
        }
      });
    }

    // Reset Demo Data Form / Button
    const confirmResetBtn = document.getElementById('confirm-reset-btn');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        store.resetAllData();
        closeModal('modal-reset-confirm');
        showToast('All accounts and transactions have been reset to factory demo state.', 'info', 'System Reset');
      });
    }
  }

  /**
   * Set up preset buttons ($50, $100, $500, etc.)
   */
  function setupPresetAmountButtons() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetInputId = btn.getAttribute('data-target-input');
        const amount = btn.getAttribute('data-amount');
        const input = document.getElementById(targetInputId);
        if (input) {
          input.value = amount;
          input.focus();
        }
      });
    });
  }

  /**
   * Bind UI Click Listeners & Navigation
   */
  function bindUIEvents() {
    // Active Account Change
    if (elements.activeAccountSelect) {
      elements.activeAccountSelect.addEventListener('change', (e) => {
        store.setActiveAccount(e.target.value);
      });
    }

    // Currency Switcher
    if (elements.currencySelect) {
      elements.currencySelect.addEventListener('change', (e) => {
        store.setCurrency(e.target.value);
        showToast(`Currency changed to ${e.target.value}`, 'info');
      });
    }

    // Dark/Light Theme Toggle
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    // Privacy / Balance Reveal Toggle
    if (elements.balancePrivacyBtn) {
      elements.balancePrivacyBtn.addEventListener('click', () => {
        store.toggleBalancePrivacy();
      });
    }

    // Card Freeze / Unlock Toggle
    if (elements.toggleCardLockBtn) {
      elements.toggleCardLockBtn.addEventListener('click', () => {
        const active = store.getActiveAccount();
        if (active.card) {
          const isLocked = store.toggleCardLock(active.id);
          showToast(
            isLocked ? 'Your card has been locked. All new transactions will be declined.' : 'Your card is now unlocked and active.',
            isLocked ? 'warning' : 'success',
            isLocked ? 'Card Locked' : 'Card Active'
          );
        }
      });
    }

    // Card Details Reveal (CVV & full number)
    if (elements.cardRevealBtn) {
      elements.cardRevealBtn.addEventListener('click', () => {
        cardRevealed = !cardRevealed;
        renderVirtualCard();
      });
    }

    // Card Limit Edit Button
    if (elements.editCardLimitBtn) {
      elements.editCardLimitBtn.addEventListener('click', () => {
        const active = store.getActiveAccount();
        if (active.card) {
          document.getElementById('new-card-limit-input').value = active.card.dailyLimit;
          openModal('modal-edit-limit');
        }
      });
    }

    // Quick Action Buttons
    document.getElementById('btn-action-deposit')?.addEventListener('click', openDepositModal);
    document.getElementById('btn-action-withdraw')?.addEventListener('click', openWithdrawModal);
    document.getElementById('btn-action-transfer')?.addEventListener('click', () => openTransferModalWithTarget());
    document.getElementById('btn-action-new-account')?.addEventListener('click', () => openModal('modal-create-account'));
    document.getElementById('btn-action-new-goal')?.addEventListener('click', () => openModal('modal-create-goal'));
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => openModal('modal-reset-confirm'));

    // Transaction search & filters
    elements.txSearchInput?.addEventListener('input', () => renderTransactions());
    elements.txCategoryFilter?.addEventListener('change', () => renderTransactions());
    elements.txTypeFilter?.addEventListener('change', () => renderTransactions());

    // Export CSV
    elements.exportCsvBtn?.addEventListener('click', exportTransactionsToCSV);

    // Transfer Recipient Type Switch
    document.getElementById('transfer-recipient-type')?.addEventListener('change', handleRecipientTypeChange);

    // Modal Close Buttons
    elements.modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal-overlay');
        closeModal(modal);
      });
    });

    // Close on click outside modal content
    elements.modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    // Print Receipt Button
    document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
      window.print();
    });

    // Responsive window resize for canvas charts
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        charts.renderCashflowChart('cashflow-canvas');
        charts.renderCategoryBreakdown('category-breakdown-container');
      }, 150);
    });
  }

  /**
   * Main Render Pipeline
   */
  function renderAll() {
    renderTheme();
    renderHeader();
    renderAccountSelector();
    renderBalances();
    renderVirtualCard();
    renderBeneficiaries();
    renderBills();
    renderGoals();
    renderTransactions();

    // Render Canvas & SVG Visualizations
    setTimeout(() => {
      charts.renderCashflowChart('cashflow-canvas');
      charts.renderCategoryBreakdown('category-breakdown-container');
    }, 50);
  }

  /**
   * Initialize App
   */
  function init() {
    initElements();
    setupPresetAmountButtons();
    bindFormHandlers();
    bindUIEvents();

    // Subscribe to store updates
    store.subscribe(() => {
      renderAll();
    });

    // Initial render
    renderAll();

    // Welcome toast
    setTimeout(() => {
      showToast('Welcome to ApexBank Online Banking. All systems operational.', 'info', 'Secure Session Started');
    }, 600);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
