import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { address } = await request.json();
    if (!address || address.length < 30) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const res = await fetch(`https://data.solanatracker.io/pnl/${address}?showHistoricPnL=false&holdingCheck=true&hideDetails=false`, {
      headers: {
        'x-api-key': process.env.SOLANATRACKER_API_KEY,
      },
    });

    if (!res.ok) {
      console.error('SolanaTracker error:', res.status);
      return NextResponse.json({ error: 'SolanaTracker API error', fallback: true }, { status: 200 });
    }

    const data = await res.json();
    const tokens = data.tokens || {};
    const summary = data.summary || null;

    if (Object.keys(tokens).length === 0) {
      return NextResponse.json({ error: 'No trading data found', fallback: true }, { status: 200 });
    }

    const stats = buildStats(tokens, summary);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error('Wallet API error:', err);
    return NextResponse.json({ error: err.message, fallback: true }, { status: 200 });
  }
}

function buildStats(tokens, summary) {
  const entries = Object.entries(tokens);
  const tokensTraded = entries.length;

  let wins = 0;
  let losses = 0;
  let rugsHit = 0;
  let totalInvested = 0;
  let totalRealized = 0;
  let totalUnrealized = 0;
  let totalBuys = 0;
  let totalSells = 0;
  let totalTxns = 0;
  let holdTimes = [];
  let biggestWinAmt = -Infinity;
  let biggestWinDesc = 'None';
  let biggestLossAmt = Infinity;
  let biggestLossDesc = 'None';

  for (const [mint, t] of entries) {
    const realized = t.realized || 0;
    const unrealized = t.unrealized || 0;
    const pnl = t.total || (realized + unrealized);
    const invested = t.total_invested || 0;
    const sold = t.total_sold || t.sold_usd || 0;
    const buys = t.buy_transactions || 0;
    const sells = t.sell_transactions || 0;
    const shortMint = mint.slice(0, 4) + '...' + mint.slice(-4);

    totalInvested += invested;
    totalRealized += realized;
    totalUnrealized += unrealized;
    totalBuys += buys;
    totalSells += sells;
    totalTxns += t.total_transactions || (buys + sells);

    // Win/loss per token
    if (pnl > 0.01) {
      wins++;
      if (pnl > biggestWinAmt) {
        biggestWinAmt = pnl;
        const mult = invested > 0 ? ((invested + pnl) / invested).toFixed(1) : '?';
        biggestWinDesc = `${mult}x on ${shortMint} (+${pnl.toFixed(2)} SOL)`;
      }
    } else if (pnl < -0.01) {
      losses++;
      if (pnl < biggestLossAmt) {
        biggestLossAmt = pnl;
        const pct = invested > 0 ? Math.round((pnl / invested) * 100) : -100;
        biggestLossDesc = `${pct}% on ${shortMint} (${pnl.toFixed(2)} SOL)`;
      }
      // Rug = lost 90%+ of investment
      if (sold < invested * 0.1) {
        rugsHit++;
      }
    }

    // Hold time
    const firstBuy = t.first_buy_time || 0;
    const lastTrade = t.last_trade_time || t.last_sell_time || 0;
    if (firstBuy && lastTrade && lastTrade > firstBuy) {
      holdTimes.push((lastTrade - firstBuy) / 1000); // ms to seconds
    }
  }

  const totalPnl = totalRealized + totalUnrealized;
  const winRate = tokensTraded > 0 ? Math.round((wins / tokensTraded) * 100) : 0;
  const avgHoldSec = holdTimes.length > 0 ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0;

  const formatHold = (sec) => {
    if (sec <= 0) return 'unknown';
    if (sec < 60) return `${Math.round(sec)} seconds`;
    if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
    if (sec < 86400) return `${(sec / 3600).toFixed(1)} hours`;
    return `${(sec / 86400).toFixed(1)} days`;
  };

  const soldBottomCount = entries.filter(([, t]) => {
    const sells = t.sell_transactions || 0;
    const invested = t.total_invested || 0;
    const sold = t.total_sold || t.sold_usd || 0;
    return sells > 0 && sold < invested * 0.5;
  }).length;

  // Scores
  const paperHandScore = avgHoldSec > 0
    ? Math.min(99, Math.max(10, Math.round(100 - Math.min(avgHoldSec / 36, 90))))
    : 50;
  const fomoScore = Math.min(99, Math.max(10, Math.round(30 + (losses / Math.max(1, tokensTraded)) * 80)));
  const degenScore = Math.min(99, Math.max(10, Math.round(20 + totalTxns * 0.08 + tokensTraded * 1.2)));
  const diamondScore = avgHoldSec > 0 ? Math.min(99, Math.max(1, Math.round(avgHoldSec / 360))) : 5;

  // Badges
  const badges = [];
  if (rugsHit >= 3 || (tokensTraded > 0 && rugsHit >= tokensTraded * 0.25)) badges.push("🧲 Rug Magnet");
  if (winRate <= 25 && tokensTraded > 3) badges.push("🗑️ Exit Liquidity");
  if (paperHandScore > 80) badges.push("🧻 Paper Hands Pro");
  if (avgHoldSec > 0 && avgHoldSec < 300) badges.push("⚡ Speed Loser");
  if (losses >= 5) badges.push("📈 Top Buyer");
  if (fomoScore > 75) badges.push("🐑 FOMO Lord");
  if (degenScore > 80) badges.push("💀 Terminal Degen");
  if (totalPnl > 1 && winRate > 50) badges.push("🏆 Actually Profitable");
  if (badges.length === 0) badges.push("🤡 Certified Clown");

  return {
    totalTxns,
    tokensTraded,
    rugsHit,
    winRate,
    biggestWin: biggestWinAmt > -Infinity ? biggestWinDesc : 'None',
    biggestLoss: biggestLossAmt < Infinity ? biggestLossDesc : 'None',
    avgHold: formatHold(avgHoldSec),
    paperHandScore: Math.min(99, Math.max(1, paperHandScore)),
    totalPnl: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} SOL`,
    boughtTopCount: losses,
    soldBottomCount,
    fomo: Math.min(99, Math.max(1, fomoScore)),
    diamondHands: Math.min(99, Math.max(1, diamondScore)),
    degen: Math.min(99, Math.max(1, degenScore)),
    badges,
    _debug: {
      source: 'solanatracker',
      tokensTraded,
      totalInvested: totalInvested.toFixed(4),
      totalRealized: totalRealized.toFixed(4),
      totalUnrealized: totalUnrealized.toFixed(4),
      totalPnl: totalPnl.toFixed(4),
      wins,
      losses,
      rugsHit,
      totalBuys,
      totalSells,
      totalTxns,
      avgHoldSeconds: Math.round(avgHoldSec),
    }
  };
}
