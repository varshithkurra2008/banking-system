# 🏦 ApexBank - Modern Digital Banking Web Application

ApexBank is a modern, responsive, high-fidelity digital banking web application. It features a complete banking simulation engine, interactive financial dashboards, real-time transaction processing, multi-currency conversion, virtual card management, expense analytics, and client-side data persistence (`localStorage`).

Zero dependencies or complex build steps are required — simply open `index.html` in any modern web browser or serve it with any lightweight web server.

---

## 🌟 Key Features

### 1. 💼 Account Management & Multi-Account Architecture
- **Premier Checking Account**: Daily spending, linked virtual platinum debit card, instant transfers.
- **High-Yield Growth Savings**: 4.85% APY yield calculation with monthly compounding interest.
- **Emergency Rainy Day Vault**: 5.10% APY protected reserves.
- **Open New Accounts**: Create custom Checking, Savings, or Vault accounts with custom nicknames and initial funding in seconds.
- **Multi-Currency Converter**: Real-time balance conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, **INR (₹)**, **CAD ($)**, and **JPY (¥)**.

### 2. ⚡ Core Banking Operations
- **📥 Instant Deposit**: Deposit money into any account using ACH transfer, linked card, wire transfer, or mobile check capture with one-click quick amount presets (+$50, +$100, +$500, +$1,000, +$2,500).
- **📤 Cash Withdrawal**: Dispense funds with automated balance validation and optional 4-digit security PIN confirmation.
- **💸 Funds Transfer**:
  - **Internal Transfers**: Instant fee-free movement of funds between your own Checking, Savings, and Vault accounts.
  - **External Transfers**: Send money to beneficiaries or external bank accounts with instant ledger reflection.
- **👥 Quick Beneficiary Pay**: Frequent contacts carousel with 1-click auto-fill for friends & vendors (Sophia Chen, Marcus Sterling, Elena Rostova, David Kim).

### 3. 💳 Interactive Platinum Virtual Card
- **Realistic 3D Card Simulation**: Features chip, holographic branding, masked 16-digit card number, cardholder name, expiry date, and CVV.
- **Security Controls**:
  - **Freeze / Lock Card**: Immediately disables card payments and applies security styling.
  - **Reveal / Hide Details**: Toggle view of full card number and CVV on demand.
  - **Adjust Daily Spending Limit**: Set maximum daily allowable charges with a live utilization progress bar.

### 4. 📊 Cashflow Analytics & Categorization
- **Retina Canvas Cashflow Chart**: Crisp, zero-dependency dual-bar chart visualizing monthly **Inflow** (income) vs **Outflow** (expenses) with automatic DPI scaling.
- **Expense Category Breakdown**: Dynamic visual progress meters tracking spending across *Shopping, Food & Dining, Utilities, Entertainment, Transport, and Freelance*.

### 5. 🧾 Bills, Subscriptions & Savings Goals
- **Upcoming Bills**: View upcoming electricity, internet, water, and cloud subscription bills with 1-click **"Pay Now"** authorization and instant receipt generation.
- **Savings Goals Vaults**: Set and monitor financial goals (e.g., *Tesla Model 3, Kyoto Vacation, 6-Month Emergency Fund*) with dedicated progress bars and fund contribution triggers.

### 6. 📜 Real-Time Transaction Ledger & Receipts
- **Live Search & Filter**: Filter transactions by keywords, merchant names, references, flow type (Incoming vs Outgoing), or expense category.
- **Digital Transaction Receipts**: Click any transaction row to open a full itemized receipt modal with timestamp, reference number, counterparty, and **print/export** support.
- **Download Statement (CSV)**: Export the complete transaction history to a CSV spreadsheet with one click.

### 7. 🎨 UI / UX & Technical Polish
- **Dark & Light Mode**: Smooth theme transition with tailored dark fintech glassmorphic aesthetics.
- **Balance Privacy Mode**: Toggle eye icon to mask balances (`••••••••`) when in public environments.
- **Interactive Toast Notifications**: Contextual notifications for all successful deposits, transfers, warnings, and errors.
- **Full Offline Persistence**: Everything is preserved in the browser's `localStorage`. Includes a **"Reset Demo Database"** button to restore initial mock data at any time.

---

## 🚀 How to Run the Website

### Option 1: Direct File Launch (No server required)
Double-click `index.html` or drag and drop it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave).

### Option 2: Run via Any Local Web Server
If you prefer running through a local development server:

#### Using Python 3:
```bash
python -m http.server 8080
```
Then navigate to: `http://localhost:8080`

#### Using Node.js (npx):
```bash
npx serve .
```

#### Using VS Code:
Right-click `index.html` and select **"Open with Live Server"**.

---

## 📁 File Structure

```
anti gravity/
├── index.html          # Main HTML5 application structure & modal templates
├── css/
│   └── style.css       # Complete modern responsive styling & theme variables
├── js/
│   ├── store.js        # State engine, localStorage sync, accounts, calculations
│   ├── chart.js        # Retina Canvas & SVG cashflow & category chart engine
│   └── app.js          # UI controllers, modal managers, filters, toast notifications
└── README.md           # Documentation, guide, and feature specifications
```

---

## 🔒 Security & Demo Data Notice
All transactions, card numbers, and accounts generated by this application are simulated client-side mock records designed for demonstration and educational purposes.
