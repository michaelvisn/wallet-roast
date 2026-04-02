import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { stats, address } = await request.json();
    const short = address.slice(0, 4) + "..." + address.slice(-4);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `You're a savage, hilarious crypto roast comedian. Write 3-4 SHORT brutal roast paragraphs for this Solana wallet. Be specific to the numbers. Use degen/crypto slang naturally. Be merciless and genuinely funny. Each paragraph = different angle of attack. 2-3 sentences max each. No intro, no disclaimer, no markdown — just pure roast text.

Wallet: ${short}
- ${stats.tokensTraded} tokens traded, ${stats.rugsHit} rugs hit, ${stats.winRate}% win rate
- Avg hold: ${stats.avgHold}, bought tops ${stats.boughtTopCount}x, sold bottoms ${stats.soldBottomCount}x
- Paper hands: ${stats.paperHandScore}/100, FOMO: ${stats.fomo}/100, Diamond hands: ${stats.diamondHands}/100
- PnL: ${stats.totalPnl}, Best: ${stats.biggestWin}, Worst: ${stats.biggestLoss}
- Badges: ${stats.badges.join(", ")}`
        }]
      })
    });

    if (!res.ok) {
      console.error('Claude API error:', res.status);
      return NextResponse.json({ roast: getFallbackRoast(stats, short) });
    }

    const json = await res.json();
    const text = json.content?.map(c => c.text || "").join("") || "";

    if (text.length > 50) {
      return NextResponse.json({ roast: text });
    }

    return NextResponse.json({ roast: getFallbackRoast(stats, short) });
  } catch (err) {
    console.error('Roast API error:', err);
    const short = (request.body?.address || "????...????").slice(0, 4) + "...";
    return NextResponse.json({ roast: "This wallet is so bad even our AI refused to roast it. That's the roast." });
  }
}

function getFallbackRoast(stats, short) {
  return [
    `${short} bought the top on ${stats.boughtTopCount} consecutive tokens. At this point whales should pay you a salary for providing exit liquidity.`,
    `${stats.winRate}% win rate with ${stats.avgHold} average hold time. ${short} isn't trading — they're speedrunning poverty with conviction.`,
    `Rugged ${stats.rugsHit} times across ${stats.tokensTraded} tokens. That's not bad luck. Most people couldn't find that many rugs if they actively tried.`,
    `Net PnL: ${stats.totalPnl}. Would've been more profitable lighting SOL on fire for warmth. At least there'd be something to show for it.`
  ].join("\n\n");
}
