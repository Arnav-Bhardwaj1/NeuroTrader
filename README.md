# NeuroTrader

An AI-powered, immersive market analysis and paper trading platform built for the modern traders.

## Features

- **Rich Dashboard**: Enjoy a real-time feel with animated counters, sparklines, and market indices tracking. Get a bird’s eye view with an active AI signal feed.
- **AI Insights**: Communicate with a mock AI analyst to generate market summaries, view sentiment heatmaps across sectors, and assess risk with confidence gauges.
- **Detailed Stock Analysis**: Dive deep into individual equities with interactive Candlestick Charts powered by `lightweight-charts` and a dedicated AI breakdown (Sentiment, Risk, Predictions).
- **Paper Trading**: Simulate buying and selling directly from the stock view to test strategies without real capital. Track estimated costs and current available cash.
- **Custom Watchlists**: Create, edit, and manage personalized lists to track your favorite tickers in grid or list views.
- **Global Market News**: Stay informed with categorized, real-time mock news featuring AI-powered Bullish/Bearish impact scoring.
- **Premium UI**: Experience a sleek, modern, glassmorphism-inspired dark mode interface built with React, Framer Motion, and fine-tuned custom CSS.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with predefined CSS variables, `framer-motion` for micro-animations and page transitions
- **Routing**: `react-router-dom`
- **Charting**: `recharts` for generic data visualizations, `lightweight-charts` for high-performance financial candlestick charts
- **Icons**: `lucide-react`

## Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in Browser**
   Navigate to `http://localhost:5173` to explore NeuroTrader.

## Project Structure

- `src/pages/`: Contains all main application views (`DashboardPage`, `PortfolioPage`, `AIInsightsPage`, `StocksPage`, `StockDetailPage`, `WatchlistPage`, `NewsPage`, `SettingsPage`, etc.)
- `src/components/layout/`: Includes `Sidebar` and `DashboardLayout` for the main structural scaffolding.
- `src/lib/`: Contains mocked data (`mockData.ts`), AI simulants (`mockAI.ts`), utility functions, and mock authentication structures.
- `src/index.css`: The central nervous system of styling and design tokens.

## License

MIT License. Feel free to fork, build upon, or use this as inspiration for your own fintech applications.
