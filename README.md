# Funding Rate Calc

A sleek, client-side Svelte 5 application to calculate historical funding rate returns for Binance BTCUSDT.

## Features

- **Direct API Fetching**: Connects directly to Binance's `fapi` endpoints from your browser, eliminating the need for a backend server.
- **Accurate Historical Math**: Calculates potential returns or losses based on actual historical funding rates.
- **Position Selection**: Toggle between `LONG` and `SHORT` positions to see exactly how your direction affects funding payouts.
- **Contract Types**: Displays the impact on both Linear (USDT-margined) and Inverse (Coin-margined / fixed notional) contracts.
- **Premium UI**: Built with a glassmorphism design, sleek typography, and responsive layouts.

## Development

This project uses [Nix](https://nixos.org/) for development environment management.

### Setup

Make sure you have Nix and [direnv](https://direnv.net/) installed, then run:

```bash
direnv allow
```

Alternatively, you can manually drop into the shell:

```bash
nix develop
```

### Install Dependencies

```bash
pnpm install
```

### Run Local Server

```bash
pnpm run dev
```

### Build for Production

```bash
pnpm run build
```

## Technologies

- Node.js 26
- Svelte 5
- Vite
- pnpm
- Nix
