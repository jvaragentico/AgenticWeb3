# Security policy

Please do not report seed phrases, private keys, bot tokens, API keys, or other credentials in a public issue.

ChainLens only needs a public wallet address to show a balance. It must never request or store a seed phrase or private key.

If a Telegram token is exposed, revoke it through `@BotFather`, update the deployment secret, and restart the service. Treat any credential committed to Git as compromised even if the commit is later deleted.

