### MoonCreditFi
MoonCreditFi is a Creditcoin-inspired DeFi + DePIN platform that enables on-chain credit profiles, reputation-based lending, and decentralized funding of real-world infrastructure.
The platform combines transparent credit history, ethical lending pools, and DePIN funding mechanisms to promote financial inclusion and verifiable real-world impact.

### 🔗 Creditcoin Alignment
MoonCreditFi is designed to strengthen the Creditcoin ecosystem by:
Tracking on-chain credit history at the wallet level
Enabling reputation-based borrowing instead of pure collateral
Supporting real economic activity through DePIN funding
Providing transparent, auditable lending logic.

![Screenshot_27-1-2026_133848_localhost](https://github.com/user-attachments/assets/b815044d-fbb5-4b61-b665-12762895e807)

<img width="1351" height="712" alt="screenshot-1769068815454" src="https://github.com/user-attachments/assets/f997e0a2-a61f-4cc2-ad43-6f207f1c530c" />
<img width="1350" height="711" alt="screenshot-1769068941232" src="https://github.com/user-attachments/assets/a7caea81-2ee0-40a0-955f-331b441316a9" />

### Features

🔹 Smart Contracts

CreditProfile.sol

Tracks wallet-based credit scores.

Stores loan history (amount, repayment status).

Updates reputation after successful repayment or funding.


LendingPool.sol

Deposit tokens into the lending pool.

Borrow from the pool based on credit profile.

Repay loans to grow reputation.

Withdraw deposits anytime.


DePINFunding.sol

Allow users to fund real-world infrastructure (solar, compute, etc).

Record funders’ contributions and ownership shares.

Distribute real yield (profit-sharing, not interest).

Mint proof-of-impact NFTs for contributors.


🔹 Backend (Node.js + Supabase)

Fetch live crypto market data from CoinGecko API.

Provide  Creditcoin DeFi data (price, users, lending rates).

Auth system (signup/signin) via Supabase.

Clean JSON responses: { success, data }.

Integrated with blockchain events for transparency.



---

🔹 Frontend (Next.js + Tailwind)

Engaging Landing Page with:

Testimonials (auto-scroll)

Trusted Companies section (auto-scroll)

Wallet connection CTA


Auth (Sign in / Sign up) before dashboard access.

Dashboard with:

Real crypto market insights

DeFi + DePIN project funding stats

Graphs and trends


Wallet integration for blockchain interactions.



---

### 📂 Project Structure

mooncreditfi/
│── contracts/               # Solidity smart contracts
│   ├── CreditProfile.sol
│   ├── LendingPool.sol
│   └── DePINFunding.sol
│── backend/                 # Node.js + Express API
│   ├── routes/
│   ├── services/
│   └── server.js
│── frontend/                # Next.js frontend
│   ├── pages/
│   ├── components/
│   └── styles/
│── scripts/
│   └── deploy.js            # Hardhat deployment script
│── hardhat.config.js        # Hardhat config


---

### 🚀 Quick Start

1️⃣ Clone Repo

git clone https://github.com/<your-username>/mooncreditfi.git
cd mooncreditfi

2️⃣ Install Dependencies

npm install

3️⃣ Compile Smart Contracts

npx hardhat compile

4️⃣ Deploy Contracts

npx hardhat run scripts/deploy.js --network localhost

5️⃣ Start Backend Server

cd backend
npm start

6️⃣ Run Frontend

cd frontend
npm run dev


---

### 🛠️ Tech Stack

Frontend: Next.js, TailwindCSS, Ethers.js
Backend: Node.js, Express, Supabase, CoinGecko API
Blockchain: Solidity, Hardhat
Database: Supabase (Postgres)


---

### 📌 Roadmap

✅ Phase 1: Smart Contracts (CreditProfile + LendingPool)
✅ Phase 2: Backend API ( Creditcoin + market data)
✅ Phase 3: Frontend dashboard + landing page
✅ Phase 4: DePIN Funding smart contract + module
🔜 Phase 5: Smart contract + frontend integration
🔜 Phase 6: Deploy to Creditcoin & Polygon testnets


---

### 🤝 Contribution

We welcome all contributions!

1. Fork the repo


2. Create a feature branch


3. Commit your changes


4. Submit a Pull Request 🚀




---

### 📄 License

MIT License © 2025 MoonCreditFi
