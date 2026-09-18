# Self-hosting ChainLens

## 1. Install the requirements

- Node.js 22 or newer
- Git
- A production host with HTTPS
- A Telegram bot token and numeric destination chat ID

No `npm install` step is required because the server uses only built-in Node.js modules.

## 2. Configure secrets

Copy `.env.example` to `.env`, then replace the placeholder values. Do not add quotes unless the value itself requires them.

```env
TELEGRAM_BOT_TOKEN=your_new_bot_token
TELEGRAM_CHAT_ID=your_numeric_chat_id
PORT=3000
```

The `.gitignore` blocks `.env` and common private-key files. Before every public push, run:

```bash
git status --short
git diff --cached
```

Confirm that `.env`, tokens, private keys, chat IDs, screenshots containing secrets, and exported wallet files are absent.

## 3. Run locally

```bash
npm start
```

Visit http://localhost:3000. Test the following:

1. The top-10 market list loads.
2. Connect Wallet opens your wallet or, on mobile, offers MetaMask and Trust Wallet.
3. The native balance appears after approval.
4. Your Telegram bot receives one connection notification.
5. Log out returns the page to its disconnected state.

Notifications are rate-limited per IP to reduce duplicates.

## 4. Deploy to a Node.js host

Create a web service from this repository and configure:

| Setting | Value |
| --- | --- |
| Runtime | Node.js 22+ |
| Build command | Leave empty |
| Start command | `npm start` |
| Health page | `/` |

Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as private environment variables in the host dashboard. Do not place them in GitHub repository variables that are visible to client-side code.

After deployment, open the HTTPS URL on desktop and mobile and repeat the five checks above.

## 5. Rotate a Telegram token

If a token is exposed:

1. Open `@BotFather` in Telegram.
2. Use `/revoke` for the affected bot, or generate a new token.
3. Replace `TELEGRAM_BOT_TOKEN` in the hosting dashboard and local `.env`.
4. Restart or redeploy the service.
5. Verify a connection notification arrives.

Removing a token from the latest commit is not sufficient if it appeared in Git history. Rotate the token first, then rewrite the history if necessary.

## Troubleshooting

### Wallet not detected on mobile

Normal mobile browsers usually do not expose `window.ethereum`. Tap Connect Wallet and choose MetaMask or Trust Wallet to open ChainLens inside the wallet's browser.

### Telegram notification does not arrive

- Send `/start` to the bot before testing.
- Verify the numeric chat ID.
- Confirm the host has both environment variables.
- Check the host logs for a `502` response from Telegram.

### Prices do not load

The server reads CoinPaprika's public market endpoint and caches the response briefly. Confirm the host permits outbound HTTPS requests.

### Wallet works locally but not in production

Use HTTPS. Wallet extensions and mobile wallet browsers may reject insecure production origins.

