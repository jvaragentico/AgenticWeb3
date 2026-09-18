# ChainLens

ChainLens is a responsive EVM wallet dashboard. Visitors can connect an injected wallet, view the wallet's native-token balance, follow the current top-10 cryptocurrency market rates, and optionally trigger a Telegram notification when a wallet connects.

## Live demo

**[Open ChainLens →](https://chainlens-wallet.jvar-agentic.chatgpt.site/)**

## Features

- EVM wallet connection through `window.ethereum`
- Mobile handoff to MetaMask and Trust Wallet
- Native-token balance and detected network
- Top-10 USD cryptocurrency prices with 30-second refresh
- Telegram wallet-connect notifications
- Responsive desktop and mobile interface
- Dependency-free Node.js server

## Security model

- The app never requests a seed phrase or private key.
- Wallet access is read-only; it requests the public address and balance only.
- Telegram credentials remain on the server in environment variables.
- Real `.env` files are ignored by Git.
- The repository contains placeholders only—no bot token or chat ID.

> If a credential was ever pasted into a chat, screenshot, commit, or public page, revoke it and create a new one before deployment.

## Quick start

Requirements: Node.js 22 or newer.

```bash
git clone https://github.com/jvaragentico/agentic.git
cd agentic
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Open `.env` and enter your own Telegram values:

```env
TELEGRAM_BOT_TOKEN=your_new_bot_token
TELEGRAM_CHAT_ID=your_numeric_chat_id
PORT=3000
```

Start the site:

```bash
npm start
```

Open http://localhost:3000.

## Telegram setup

1. Open Telegram and message `@BotFather`.
2. Run `/newbot`, follow the prompts, and copy the new bot token.
3. Open your new bot and send it `/start`.
4. In a private browser window, visit the URL below after replacing `YOUR_TOKEN`:

   ```text
   https://api.telegram.org/botYOUR_TOKEN/getUpdates
   ```

5. Find `message.chat.id` in the response. Use that number as `TELEGRAM_CHAT_ID`.
6. Store both values in `.env` locally or in your hosting provider's secret/environment settings. Never commit them.

## Production deployment

Use any Node.js hosting provider that supports environment variables.

- Build command: none
- Start command: `npm start`
- Required variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Optional variable: `PORT` (many providers set this automatically)

Production must use HTTPS so mobile and extension wallets can connect safely. GitHub Pages can display a static copy, but it cannot run the Telegram endpoint or server-side market proxy. Use a Node.js host for the fully functional version.

See [SELF_HOSTING.md](SELF_HOSTING.md) for deployment checks and troubleshooting.

## Project structure

```text
.
├── dist/index.html      # Complete responsive frontend
├── server.mjs           # Node server and API endpoints
├── .env.example         # Safe configuration template
├── SELF_HOSTING.md      # Deployment tutorial
└── package.json         # Start command and Node version
```

## Notes

The on-page Log out action clears the site's local UI state. Wallet applications keep their own connected-site authorization until the user removes the site from the wallet's settings.
