/**
 * ApexBank Store - LocalStorage State Management & Mock Banking Engine
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'apex_bank_data_v1';
  const SETTINGS_KEY = 'apex_bank_settings_v1';

  // Supported Currencies with conversion rates relative to USD (1.0)
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, name: 'US Dollar', format: 'en-US' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro', format: 'de-DE' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound', format: 'en-GB' },
    INR: { symbol: '₹', rate: 84.5, name: 'Indian Rupee', format: 'en-IN' },
    CAD: { symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar', format: 'en-CA' },
    JPY: { symbol: '¥', rate: 154.2, name: 'Japanese Yen', format: 'ja-JP' }
  };

  function getDaysAgo(days, hours = 0, minutes = 0) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours, d.getMinutes() - minutes);
    return d.toISOString();
  }

  function getInitialData() {
    return {
      users: [
        {
          id: 'usr_alex',
          name: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          activeAccountId: 'acc_chk_101',
          accounts: [
            {
              id: 'acc_chk_101',
              type: 'Checking',
              name: 'Premier Checking Account',
              accountNumber: '4092 8821 7349',
              routingNumber: '021000021',
              balance: 14850.75,
              currency: 'USD',
              card: {
                number: '4532 8899 4321 9081',
                holder: 'ALEX MORGAN',
                expiry: '09/29',
                cvv: '842',
                isLocked: false,
                dailyLimit: 3000,
                spentToday: 184.50,
                type: 'Visa Platinum'
              }
            },
            {
              id: 'acc_sav_202',
              type: 'Savings',
              name: 'High-Yield Growth Savings',
              accountNumber: '4092 5519 2201',
              routingNumber: '021000021',
              balance: 42120.00,
              apy: '4.85%',
              currency: 'USD',
              card: null
            },
            {
              id: 'acc_vlt_303',
              type: 'Vault',
              name: 'Emergency Rainy Day Vault',
              accountNumber: '4092 1190 7654',
              routingNumber: '021000021',
              balance: 10000.00,
              apy: '5.10%',
              currency: 'USD',
              card: null
            }
          ],
          beneficiaries: [
            { id: 'ben_1', name: 'Sophia Chen', email: 'sophia.c@gmail.com', account: '4092 7712 9901', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', bank: 'NovaBank' },
            { id: 'ben_2', name: 'Marcus Sterling', email: 'marcus@sterling.io', account: '4092 3341 6612', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', bank: 'Chase Direct' },
            { id: 'ben_3', name: 'Elena Rostova', email: 'elena.rostova@art.com', account: '4092 9980 1452', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80', bank: 'Barclays' },
            { id: 'ben_4', name: 'David Kim', email: 'david.kim@techlab.net', account: '4092 1109 4432', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', bank: 'ApexBank' }
          ],
          bills: [
            { id: 'bill_1', title: 'Fiber Gigabit Internet', provider: 'Verizon Fios', category: 'Utilities', amount: 89.99, dueDate: 'In 3 days', status: 'Due', icon: 'wifi' },
            { id: 'bill_2', title: 'City Electric & Power', provider: 'NextEra Energy', category: 'Utilities', amount: 142.30, dueDate: 'In 5 days', status: 'Due', icon: 'zap' },
            { id: 'bill_3', title: 'Cloud Storage & Workspace', provider: 'Google One', category: 'Subscriptions', amount: 19.99, dueDate: 'In 12 days', status: 'Auto-Pay', icon: 'cloud' },
            { id: 'bill_4', title: 'Metropolitan Water District', provider: 'Metro Water', category: 'Utilities', amount: 48.50, dueDate: 'In 18 days', status: 'Upcoming', icon: 'droplet' }
          ],
          savingsGoals: [
            { id: 'goal_1', title: 'New Electric Vehicle (Tesla Model 3)', targetAmount: 38000, currentAmount: 24500, category: 'Transport', color: '#6366f1', deadline: 'Dec 2026' },
            { id: 'goal_2', title: 'Kyoto Autumn Vacation', targetAmount: 7500, currentAmount: 5600, category: 'Travel', color: '#ec4899', deadline: 'Oct 2026' },
            { id: 'goal_3', title: 'Emergency Fund (6 Months)', targetAmount: 25000, currentAmount: 21500, category: 'Security', color: '#10b981', deadline: 'Ongoing' }
          ],
          transactions: [
            {
              id: 'tx_1001',
              accountId: 'acc_chk_101',
              type: 'deposit',
              category: 'Salary',
              title: 'Bi-Weekly Payroll Direct Deposit',
              counterparty: 'Acme Technologies Inc.',
              amount: 4850.00,
              date: getDaysAgo(1, 2, 15),
              status: 'Completed',
              fee: 0.00,
              reference: 'DIR-DEP-99482',
              notes: 'Regular salary disbursement'
            },
            {
              id: 'tx_1002',
              accountId: 'acc_chk_101',
              type: 'transfer_out',
              category: 'Transfer',
              title: 'Transfer to Sophia Chen',
              counterparty: 'Sophia Chen',
              amount: -320.00,
              date: getDaysAgo(1, 5, 40),
              status: 'Completed',
              fee: 0.00,
              reference: 'TX-TRF-40192',
              notes: 'Dinner & concert ticket split'
            },
            {
              id: 'tx_1003',
              accountId: 'acc_chk_101',
              type: 'withdrawal',
              category: 'Shopping',
              title: 'Apple Store NYC 5th Ave',
              counterparty: 'Apple Retail',
              amount: -184.50,
              date: getDaysAgo(2, 4, 10),
              status: 'Completed',
              fee: 0.00,
              reference: 'POS-APL-88219',
              notes: 'Magic Keyboard and USB-C adapter'
            },
            {
              id: 'tx_1004',
              accountId: 'acc_chk_101',
              type: 'bill_pay',
              category: 'Utilities',
              title: 'Bill Payment - ConEdison Power',
              counterparty: 'ConEdison Electric',
              amount: -135.20,
              date: getDaysAgo(3, 8, 30),
              status: 'Completed',
              fee: 0.00,
              reference: 'BIL-CON-77218',
              notes: 'Monthly residential power'
            },
            {
              id: 'tx_1005',
              accountId: 'acc_chk_101',
              type: 'deposit',
              category: 'Freelance',
              title: 'UI/UX Design Consultation Fee',
              counterparty: 'Starlight Studios Ltd.',
              amount: 1400.00,
              date: getDaysAgo(4, 11, 20),
              status: 'Completed',
              fee: 0.00,
              reference: 'INV-STL-2026-03',
              notes: 'Phase 1 mobile prototype delivery'
            },
            {
              id: 'tx_1006',
              accountId: 'acc_chk_101',
              type: 'withdrawal',
              category: 'Food & Dining',
              title: 'Whole Foods Market',
              counterparty: 'Whole Foods 365',
              amount: -92.40,
              date: getDaysAgo(5, 3, 45),
              status: 'Completed',
              fee: 0.00,
              reference: 'POS-WFM-33120',
              notes: 'Weekly organic grocery replenishment'
            },
            {
              id: 'tx_1007',
              accountId: 'acc_chk_101',
              type: 'withdrawal',
              category: 'Entertainment',
              title: 'Netflix Premium 4K Family',
              counterparty: 'Netflix.com',
              amount: -22.99,
              date: getDaysAgo(7, 14, 0),
              status: 'Completed',
              fee: 0.00,
              reference: 'SUB-NFLX-1011',
              notes: 'Monthly subscription'
            },
            {
              id: 'tx_1008',
              accountId: 'acc_sav_202',
              type: 'deposit',
              category: 'Interest',
              title: 'Monthly High-Yield APY Interest',
              counterparty: 'Apex Treasury Division',
              amount: 168.40,
              date: getDaysAgo(10, 0, 1),
              status: 'Completed',
              fee: 0.00,
              reference: 'INT-SAV-202-09',
              notes: 'Compounded monthly dividend'
            },
            {
              id: 'tx_1009',
              accountId: 'acc_chk_101',
              type: 'transfer_in',
              category: 'Transfer',
              title: 'Payment from Marcus Sterling',
              counterparty: 'Marcus Sterling',
              amount: 450.00,
              date: getDaysAgo(12, 6, 15),
              status: 'Completed',
              fee: 0.00,
              reference: 'TX-TRF-88123',
              notes: 'Weekend cabin rental share'
            },
            {
              id: 'tx_1010',
              accountId: 'acc_chk_101',
              type: 'withdrawal',
              category: 'Transport',
              title: 'Uber Black Ride',
              counterparty: 'Uber Technologies',
              amount: -44.80,
              date: getDaysAgo(14, 9, 20),
              status: 'Completed',
              fee: 0.00,
              reference: 'UBR-TRIP-9901',
              notes: 'JFK Airport transfer'
            }
          ]
        }
      ]
    };
  }

  function getInitialSettings() {
    return {
      currency: 'USD',
      theme: 'dark',
      hideBalance: false
    };
  }

  class BankStore {
    constructor() {
      this.data = this.loadData();
      this.settings = this.loadSettings();
      this.listeners = [];
    }

    loadData() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse storage, using initial mock data:', e);
      }
      const initial = getInitialData();
      this.saveData(initial);
      return initial;
    }

    saveData(data) {
      this.data = data || this.data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Failed to save data:', e);
      }
      this.notifyListeners();
    }

    loadSettings() {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Settings parse error:', e);
      }
      const initial = getInitialSettings();
      this.saveSettings(initial);
      return initial;
    }

    saveSettings(settings) {
      this.settings = { ...this.settings, ...settings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.error('Save settings error:', e);
      }
      this.notifyListeners();
    }

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notifyListeners() {
      this.listeners.forEach(cb => {
        try {
          cb(this.data, this.settings);
        } catch (err) {
          console.error('Error in store subscriber:', err);
        }
      });
    }

    getCurrentUser() {
      return this.data.users[0];
    }

    getActiveAccount() {
      const user = this.getCurrentUser();
      return user.accounts.find(acc => acc.id === user.activeAccountId) || user.accounts[0];
    }

    setActiveAccount(accountId) {
      const user = this.getCurrentUser();
      const exists = user.accounts.some(acc => acc.id === accountId);
      if (exists) {
        user.activeAccountId = accountId;
        this.saveData();
      }
    }

    getAccounts() {
      return this.getCurrentUser().accounts;
    }

    getCurrencies() {
      return CURRENCIES;
    }

    getCurrentCurrency() {
      return CURRENCIES[this.settings.currency] || CURRENCIES.USD;
    }

    setCurrency(code) {
      if (CURRENCIES[code]) {
        this.saveSettings({ currency: code });
      }
    }

    toggleTheme() {
      const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
      this.saveSettings({ theme: newTheme });
      return newTheme;
    }

    toggleBalancePrivacy() {
      const newState = !this.settings.hideBalance;
      this.saveSettings({ hideBalance: newState });
      return newState;
    }

    formatAmount(amountInUSD, showSign = false) {
      const curr = this.getCurrentCurrency();
      const converted = amountInUSD * curr.rate;
      const isNegative = converted < 0;
      const absVal = Math.abs(converted);
      
      const formattedNumber = absVal.toLocaleString(curr.format, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      let prefix = '';
      if (showSign) {
        prefix = isNegative ? '- ' : '+ ';
      } else if (isNegative) {
        prefix = '- ';
      }

      return `${prefix}${curr.symbol}${formattedNumber}`;
    }

    getTransactions(accountId = null) {
      const user = this.getCurrentUser();
      let txs = user.transactions || [];
      if (accountId) {
        txs = txs.filter(t => t.accountId === accountId);
      }
      return [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    deposit({ accountId, amount, method, note, category = 'Deposit' }) {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid positive deposit amount.');
      }

      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account) throw new Error('Selected account not found.');

      // Update balance
      account.balance += amount;

      // Create transaction
      const newTx = {
        id: 'tx_' + Date.now(),
        accountId: account.id,
        type: 'deposit',
        category: category || 'Deposit',
        title: `Deposit via ${method || 'Direct Wire'}`,
        counterparty: method || 'Instant Electronic Deposit',
        amount: amount,
        date: new Date().toISOString(),
        status: 'Completed',
        fee: 0.00,
        reference: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
        notes: note || 'Self initiated funds deposit'
      };

      user.transactions.unshift(newTx);
      this.saveData();
      return { account, transaction: newTx };
    }

    withdraw({ accountId, amount, note, category = 'Cash Withdrawal' }) {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid withdrawal amount.');
      }

      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account) throw new Error('Selected account not found.');

      if (account.balance < amount) {
        throw new Error(`Insufficient funds. Your current available balance is ${this.formatAmount(account.balance)}.`);
      }

      account.balance -= amount;

      const newTx = {
        id: 'tx_' + Date.now(),
        accountId: account.id,
        type: 'withdrawal',
        category: category,
        title: 'ATM / Cash Withdrawal',
        counterparty: 'Apex Global ATM Network',
        amount: -amount,
        date: new Date().toISOString(),
        status: 'Completed',
        fee: 0.00,
        reference: 'WTH-' + Math.floor(100000 + Math.random() * 900000),
        notes: note || 'Standard cash withdrawal'
      };

      user.transactions.unshift(newTx);
      this.saveData();
      return { account, transaction: newTx };
    }

    transfer({ fromAccountId, recipientType, recipientTarget, amount, note, category = 'Transfer' }) {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid transfer amount.');
      }

      const user = this.getCurrentUser();
      const sourceAccount = user.accounts.find(a => a.id === fromAccountId);
      if (!sourceAccount) throw new Error('Source account not found.');

      if (sourceAccount.balance < amount) {
        throw new Error(`Insufficient funds. Available: ${this.formatAmount(sourceAccount.balance)}.`);
      }

      // Check if transferring to another personal account
      if (recipientType === 'internal') {
        const destAccount = user.accounts.find(a => a.id === recipientTarget);
        if (!destAccount) throw new Error('Destination account not found.');
        if (destAccount.id === sourceAccount.id) {
          throw new Error('Source and destination accounts must be different.');
        }

        sourceAccount.balance -= amount;
        destAccount.balance += amount;

        const ref = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
        const timestamp = new Date().toISOString();

        const debitTx = {
          id: 'tx_' + Date.now() + '_out',
          accountId: sourceAccount.id,
          type: 'transfer_out',
          category: 'Internal Transfer',
          title: `Transfer to ${destAccount.name}`,
          counterparty: destAccount.name,
          amount: -amount,
          date: timestamp,
          status: 'Completed',
          fee: 0.00,
          reference: ref,
          notes: note || 'Internal balance adjustment'
        };

        const creditTx = {
          id: 'tx_' + (Date.now() + 1) + '_in',
          accountId: destAccount.id,
          type: 'transfer_in',
          category: 'Internal Transfer',
          title: `Transfer from ${sourceAccount.name}`,
          counterparty: sourceAccount.name,
          amount: amount,
          date: timestamp,
          status: 'Completed',
          fee: 0.00,
          reference: ref,
          notes: note || 'Internal balance adjustment'
        };

        user.transactions.unshift(debitTx, creditTx);
        this.saveData();
        return { sourceAccount, destAccount, transaction: debitTx };
      } else {
        // External transfer
        sourceAccount.balance -= amount;
        const ref = 'EXT-' + Math.floor(100000 + Math.random() * 900000);
        const timestamp = new Date().toISOString();

        const debitTx = {
          id: 'tx_' + Date.now(),
          accountId: sourceAccount.id,
          type: 'transfer_out',
          category: category,
          title: `Transfer to ${recipientTarget}`,
          counterparty: recipientTarget,
          amount: -amount,
          date: timestamp,
          status: 'Completed',
          fee: 0.00,
          reference: ref,
          notes: note || 'External wire transfer'
        };

        user.transactions.unshift(debitTx);
        this.saveData();
        return { sourceAccount, transaction: debitTx };
      }
    }

    payBill({ billId, accountId, customAmount = null }) {
      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account) throw new Error('Account not found.');

      const bill = user.bills.find(b => b.id === billId);
      if (!bill) throw new Error('Bill not found.');

      const amountToPay = customAmount ? parseFloat(customAmount) : bill.amount;
      if (isNaN(amountToPay) || amountToPay <= 0) {
        throw new Error('Invalid payment amount.');
      }

      if (account.balance < amountToPay) {
        throw new Error(`Insufficient balance to pay this bill (${this.formatAmount(amountToPay)}).`);
      }

      account.balance -= amountToPay;
      bill.status = 'Paid';
      bill.paidDate = new Date().toLocaleDateString();

      const newTx = {
        id: 'tx_' + Date.now(),
        accountId: account.id,
        type: 'bill_pay',
        category: 'Utilities',
        title: `Bill Paid: ${bill.title}`,
        counterparty: bill.provider,
        amount: -amountToPay,
        date: new Date().toISOString(),
        status: 'Completed',
        fee: 0.00,
        reference: 'BIL-' + Math.floor(100000 + Math.random() * 900000),
        notes: `Account statement payment for ${bill.provider}`
      };

      user.transactions.unshift(newTx);
      this.saveData();
      return { account, bill, transaction: newTx };
    }

    toggleCardLock(accountId) {
      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account || !account.card) throw new Error('Card not found for this account.');

      account.card.isLocked = !account.card.isLocked;
      this.saveData();
      return account.card.isLocked;
    }

    updateCardLimit(accountId, newLimit) {
      const limit = parseFloat(newLimit);
      if (isNaN(limit) || limit < 100) {
        throw new Error('Daily card limit must be at least $100.');
      }
      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account || !account.card) throw new Error('Card not found for this account.');

      account.card.dailyLimit = limit;
      this.saveData();
      return account.card.dailyLimit;
    }

    createNewAccount({ type, name, initialDeposit = 0 }) {
      const initial = parseFloat(initialDeposit) || 0;
      if (initial < 0) throw new Error('Initial deposit cannot be negative.');

      const user = this.getCurrentUser();
      const accId = 'acc_' + Date.now().toString().slice(-6);
      
      const numPart1 = Math.floor(1000 + Math.random() * 9000);
      const numPart2 = Math.floor(1000 + Math.random() * 9000);
      const numPart3 = Math.floor(1000 + Math.random() * 9000);
      const accNum = `${numPart1} ${numPart2} ${numPart3}`;

      const newAcc = {
        id: accId,
        type: type || 'Checking',
        name: name || `${type} Account`,
        accountNumber: accNum,
        routingNumber: '021000021',
        balance: initial,
        currency: 'USD',
        card: type === 'Checking' ? {
          number: `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          holder: user.name.toUpperCase(),
          expiry: '12/30',
          cvv: Math.floor(100 + Math.random() * 900).toString(),
          isLocked: false,
          dailyLimit: 2500,
          spentToday: 0,
          type: 'Visa Platinum'
        } : null
      };

      user.accounts.push(newAcc);
      user.activeAccountId = newAcc.id;

      if (initial > 0) {
        user.transactions.unshift({
          id: 'tx_' + Date.now(),
          accountId: newAcc.id,
          type: 'deposit',
          category: 'Account Opening',
          title: 'Opening Balance Deposit',
          counterparty: 'Apex Global Welcome Bonus / Transfer',
          amount: initial,
          date: new Date().toISOString(),
          status: 'Completed',
          fee: 0.00,
          reference: 'OPN-' + Math.floor(100000 + Math.random() * 900000),
          notes: 'Initial account funding'
        });
      }

      this.saveData();
      return newAcc;
    }

    contributeToGoal(goalId, accountId, amount) {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid contribution amount.');

      const user = this.getCurrentUser();
      const account = user.accounts.find(a => a.id === accountId);
      if (!account) throw new Error('Account not found.');
      if (account.balance < amount) throw new Error('Insufficient account balance.');

      const goal = user.savingsGoals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found.');

      account.balance -= amount;
      goal.currentAmount += amount;

      user.transactions.unshift({
        id: 'tx_' + Date.now(),
        accountId: account.id,
        type: 'transfer_out',
        category: 'Savings Goal',
        title: `Goal Allocation: ${goal.title}`,
        counterparty: `Goal: ${goal.title}`,
        amount: -amount,
        date: new Date().toISOString(),
        status: 'Completed',
        fee: 0.00,
        reference: 'GOL-' + Math.floor(100000 + Math.random() * 900000),
        notes: `Automated contribution towards ${goal.title}`
      });

      this.saveData();
      return { goal, account };
    }

    createSavingsGoal({ title, targetAmount, currentAmount = 0, deadline, category = 'General' }) {
      const target = parseFloat(targetAmount);
      const initial = parseFloat(currentAmount) || 0;
      if (!title || !title.trim()) throw new Error('Please provide a goal title.');
      if (isNaN(target) || target <= 0) throw new Error('Target amount must be greater than zero.');

      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const user = this.getCurrentUser();
      const newGoal = {
        id: 'goal_' + Date.now(),
        title: title.trim(),
        targetAmount: target,
        currentAmount: initial,
        category: category,
        color: randomColor,
        deadline: deadline || 'Ongoing'
      };

      user.savingsGoals.push(newGoal);
      this.saveData();
      return newGoal;
    }

    resetAllData() {
      const initial = getInitialData();
      const initialSettings = getInitialSettings();
      this.data = initial;
      this.settings = initialSettings;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
      this.notifyListeners();
      return true;
    }
  }

  // Attach singleton to window
  window.bankStore = new BankStore();

})(window);
