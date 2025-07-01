# SBC Paymaster Demo

A simple demo showcasing gasless transactions using **SBC's paymaster** with **Privy wallets** on Base Sepolia.

## What This Demo Shows

- **Privy Integration**: Connect wallets seamlessly through Privy's auth system
- **Smart Wallets**: Automatic smart wallet creation with gasless transaction capabilities  
- **SBC Paymaster**: Send SBC token transfers without paying gas fees
- **Real-time Updates**: Track transaction history and wallet balances

## Key Features

1. **Connect with Privy** - Authenticate and create embedded + smart wallets
2. **View Balances** - See SBC token balances for both embedded and smart wallets
3. **Gasless Transfers** - Send 0.01 SBC tokens without gas fees using SBC's paymaster
4. **Transaction History** - View completed gasless transactions on Base Sepolia

## Setup Instructions

1. **Clone and install dependencies:**

   ```bash
   git clone <repo-url>
   cd privy-demo
   pnpm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Add your Privy App ID to .env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) and:**
   - Connect your wallet through Privy
   - Smart wallet will be automatically created
   - Click "Send Gasless Transfer" to test paymaster functionality

## Technical Details

- **Network**: Base Sepolia testnet
- **Token**: SBC token (`0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16`)
- **Paymaster**: SBC's sponsored transaction paymaster
- **Wallet Provider**: Privy (embedded + smart wallets)

## Need SBC Tokens?

Contact the SBC team ([Telegram](https://t.me/stablecoin_xyz)) to receive testnet SBC tokens for testing gasless transactions.
