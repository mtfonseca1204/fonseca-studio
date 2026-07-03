// =====================================================
//  FonsecaLLM — serverless chat endpoint (Vercel)
//  - Uses OpenAI when OPENAI_API_KEY is set
//  - Falls back to a curated keyword responder otherwise
//  Zero npm deps: calls the OpenAI REST API with global fetch.
// =====================================================

const KNOWLEDGE = `
IDENTITY
- Name: Matheus Fonseca. Brand: Fonseca Studio (fonseca.studio).
- Role: Senior UX/UI & Product Designer with roots in Art Direction. 5+ years.
- Based in Rio de Janeiro, Brazil. Available for remote work worldwide; open to select projects.
- One-liner: A product designer who turns complex systems into clear, intuitive experiences that drive real outcomes.

FOCUS / EXPERTISE
- Web3 / DeFi, healthcare, and enterprise / B2B products.
- Zero-to-one product design, design systems, and translating technical concepts into usable, scalable experiences.
- Strategy, systems, and experience from discovery to hand-off.

RECOGNITION
- Hackathon wins: ETHSamba 2023 (Ethereum), Blockchain Rio 2024 (Ripio), Blockchain Rio 2025 (BASE).

SELECTED WORK
1) Hedgehog — Prediction Market, Product Designer (2024–2026). Turning prediction curiosity into participation: replaced order-matching/orderbooks with pooled UP/DOWN rounds and five-minute cycles. Closed beta with 100 waitlist users; 100% understood mechanics by round two. Time to first action dropped from ~10s to under 2–4s. 120+ components; ~35% faster handoff.
2) Hedgehog — Waitlist & Landing, Product Designer (2024–2026). Credibility before the product existed: institutional waitlist with a three-layer funnel (understand → trust → act) and live community on X, Telegram, and Discord. 15,000+ sign-ups at 37.5% conversion with zero paid traffic; 40K+ organic community.
3) Transparent.space — Founding Product Designer (2025–2026). From twenty minutes of cross-checking to thirty seconds of certainty: unified B2B dashboard with binary SLA, liquidity over time, and neutral Market Maker comparison. Task completion 61% → 88%; ~20 min → under 30s to check a data point. Validated with Worldchain and Kraken.
4) Unimed Seguros — Product Designer (2021–2022). In healthcare, the barrier is trust, not usability: trust-first telemedicine for 40K+ beneficiaries with four pillars, dedicated onboarding for 60+ users, and 24/7 in-app support during COVID. ~50K consultations/month; <30% no-show; 80%+ in-app chat retention.
- Creative Side & other work: Picnic (brand/visual identity), AURA, NØRA, Caramel, Agent Arena, and more.

SERVICES
- Brand Strategy: research, competitive mapping, audience insights, naming, messaging, architecture.
- Visual Identity: type, color, imagery, motion, iconography systems.
- UX/UI Design: research, wireframes, polished interfaces across devices.
- Systems & Guidelines: components, templates, usage rules that scale.

SKILLS / TOOLS
- Figma, Photoshop, Illustrator, Prototyping, User Research, Design Systems, Website Design, Strategy Design, Web3/DeFi.

CONTACT
- Email: fonsecaa.design@gmail.com
- LinkedIn: https://www.linkedin.com/in/maths-fonseca/
- Behance: https://www.behance.net/maths-fonseca
- X / Twitter: https://x.com/0xFonseca
- Resume: MatheusFonsecaCV.pdf
`;

const SYSTEM_PROMPT = `You are FonsecaLLM, the AI assistant on Matheus Fonseca's design portfolio (fonseca.studio).
Speak in the FIRST PERSON as Matheus ("I", "my work"), like a warm, sharp, confident designer talking to a recruiter, founder, or potential client.

RULES:
- Only use the facts in the KNOWLEDGE block below. Never invent companies, metrics, dates, or claims.
- If something isn't covered, say you're not sure and point them to email fonsecaa.design@gmail.com.
- Keep answers concise: usually 2-4 sentences. Use a short list only when it genuinely helps.
- Be specific — cite real projects and numbers when relevant.
- When someone shows hiring/collaboration intent, warmly invite them to reach out by email.
- No markdown headers; plain text with the occasional dash list is fine. Don't use emojis unless the user does.
- If asked something off-topic (not about Matheus, his work, design, or availability), gently steer back.

KNOWLEDGE:
${KNOWLEDGE}`;

// --- curated fallback (used when no API key, or the API errors) ---
function fallbackReply(userText = '', quote = '') {
  const t = (userText || '').toLowerCase();
  const has = (...words) => words.some((w) => t.includes(w));

  if (quote && !userText.trim()) {
    return `That line is about my work. Happy to go deeper — what would you like to know about it? You can also reach me at fonsecaa.design@gmail.com.`;
  }
  if (has('hello', 'hi ', 'hey', 'oi', 'olá', 'ola')) {
    return `Hey! I'm Matheus — a product designer working across Web3/DeFi, healthcare and enterprise. Ask me about my projects, process, or availability.`;
  }
  if (has('available', 'hire', 'hiring', 'freelance', 'work with', 'contact', 'reach', 'email', 'rate', 'budget', 'project in mind')) {
    return `Yes — I'm open to select projects and available for remote work worldwide. The best way to start is an email to fonsecaa.design@gmail.com, or connect on LinkedIn (/in/maths-fonseca).`;
  }
  if (has('hedgehog', 'prediction', 'orderbook', 'waitlist')) {
    return `At Hedgehog I redesigned how people predict on-chain, moving from orderbooks to pooled UP/DOWN rounds with five-minute cycles. In a closed beta with 100 waitlist users, 100% understood the mechanics by round two and time to first action dropped from ~10s to under 2–4s. I also designed the institutional waitlist landing that turned 40K+ organic followers into 15,000+ sign-ups at 37.5% conversion with zero paid spend.`;
  }
  if (has('transparent', 'market maker', 'liquidity', 'b2b', 'dashboard')) {
    return `At Transparent.space I'm Founding Product Designer. I built a B2B dashboard from zero that cuts cross-checking from ~20 minutes to under 30 seconds per data point, with binary SLA, liquidity over time, and neutral Market Maker comparison. Task completion climbed from 61% to 88%, validated with Worldchain and Kraken.`;
  }
  if (has('unimed', 'healthcare', 'health', 'insurance', 'telemedicine')) {
    return `At Unimed Seguros I led a trust-first telemedicine app for 40K+ beneficiaries during COVID: four pillars, dedicated onboarding for 60+ users, and 24/7 in-app support. The result was ~50K consultations per month with under 30% no-show and 80%+ in-app chat retention.`;
  }
  if (has('petrobras')) {
    return `Petrobras Saúde isn't in my current featured portfolio, but I'm happy to discuss healthcare work in detail. My featured case is Unimed Seguros: trust-first telemedicine for 40K+ beneficiaries with strong retention and no-show metrics during COVID.`;
  }
  if (has('web3', 'defi', 'crypto', 'blockchain', 'on-chain', 'onchain')) {
    return `Web3/DeFi is a big part of my work — Hedgehog and Transparent.space, plus hackathon wins at ETHSamba 2023, Blockchain Rio 2024 (Ripio) and 2025 (BASE). I'm good at translating dense, technical systems into something people can actually use.`;
  }
  if (has('approach', 'process', 'philosophy', 'unique', 'different', 'how do you', 'balance', 'strategy')) {
    return `I don't just design interfaces — I structure products. I start from the real problem and the system behind it, then turn complexity into something clear and usable, balancing strategy with craft from discovery to hand-off. My art-direction roots keep the work visually sharp.`;
  }
  if (has('project', 'work', 'portfolio', 'case', 'experience', 'done')) {
    return `Featured work: Hedgehog prediction market (product + waitlist), Transparent.space (B2B market-maker dashboard), and Unimed Seguros (trust-first telemedicine). Creative Side includes Picnic, AURA, NØRA, and Caramel. Want detail on any one of them?`;
  }
  if (has('skill', 'tool', 'figma', 'stack', 'design system')) {
    return `My toolkit: Figma, Photoshop, Illustrator, plus prototyping, user research, design systems, website and strategy design — with a strong Web3/DeFi specialization.`;
  }
  if (has('who are you', 'about you', 'yourself', 'bio', 'background')) {
    return `I'm Matheus Fonseca, a UX/UI & Product Designer in Rio de Janeiro with roots in art direction and 5+ years building digital products — mostly across Web3/DeFi, healthcare and enterprise.`;
  }
  return `I'm Matheus' assistant. I can talk about his featured projects (Hedgehog, Transparent.space, Unimed Seguros), his process, skills, or availability. What would you like to know? For anything specific, email fonsecaa.design@gmail.com.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const history = Array.isArray(body.messages) ? body.messages : [];
  const quote = typeof body.quote === 'string' ? body.quote.slice(0, 1200) : '';
  const lastUser = [...history].reverse().find((m) => m && m.role === 'user');
  const lastUserText = lastUser ? String(lastUser.content || '') : '';

  const apiKey = process.env.OPENAI_API_KEY;

  // No key configured → curated fallback so the feature still works.
  if (!apiKey) {
    return res.status(200).json({ reply: fallbackReply(lastUserText, quote), source: 'fallback' });
  }

  try {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    if (quote) {
      messages.push({
        role: 'system',
        content: `The user is asking about this highlighted quote from the site: "${quote}"`,
      });
    }
    for (const m of history.slice(-10)) {
      if (!m || !m.role || !m.content) continue;
      if (m.role !== 'user' && m.role !== 'assistant') continue;
      messages.push({ role: m.role, content: String(m.content).slice(0, 4000) });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 320,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!apiRes.ok) {
      return res.status(200).json({ reply: fallbackReply(lastUserText, quote), source: 'fallback' });
    }

    const data = await apiRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(200).json({ reply: fallbackReply(lastUserText, quote), source: 'fallback' });
    }
    return res.status(200).json({ reply, source: 'openai' });
  } catch (err) {
    return res.status(200).json({ reply: fallbackReply(lastUserText, quote), source: 'fallback' });
  }
}
