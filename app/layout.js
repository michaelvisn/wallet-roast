import './globals.css';

export const metadata = {
  title: 'Wallet Roast — AI Roasts Your Solana Wallet',
  description: 'Paste any Solana wallet address. AI analyzes your on-chain history and generates a brutal, personalized roast.',
  openGraph: {
    title: 'Wallet Roast 🔥',
    description: 'AI roasts your Solana trading performance. No mercy.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
