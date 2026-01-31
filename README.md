# Arkanoid

Classic brick breaker game for Solana Mobile. Built with React, Vite, Capacitor, and Solana Wallet Adapter.

## Features

- **10 levels** with unique brick layouts
- **8 power-ups**: Enlarge, Laser, Slow, Catch, Disruption, Break, Extra Life, Mega
- **Swipe & touch controls** — mobile-first
- **Solana wallet integration** — Phantom, Solflare
- **Capacitor** — package as Android APK for Solana dApp Store

Live: [solana-arkanoid.vercel.app](https://solana-arkanoid.vercel.app)

## Setup

```bash
npm install
npm run dev
```

Set `VITE_APP_URL` to your production URL (default: https://solana-arkanoid.vercel.app) before deploying.

## Build for Android

```bash
npm run build
npx cap add android
npm run android
```

Then build APK in Android Studio.

## Solana dApp Store

1. Register at [publish.solanamobile.com](https://publish.solanamobile.com)
2. Mint Publisher Handle (one-time)
3. Create App Entry → upload APK
4. Add MWA (Mobile Wallet Adapter) for full compliance — see [Solana Mobile docs](https://docs.solanamobile.com)

## Tech

- React 18, Vite, TypeScript
- Tailwind CSS, Framer Motion
- Zustand (state)
- @solana/wallet-adapter (wallet connect)
- Capacitor (Android wrapper)
