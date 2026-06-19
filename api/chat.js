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
1) Hedgehog — Product Designer (2024–2026). Redesigned the participation model of a Web3 prediction market from order-matching/orderbooks to pooled UP/DOWN positions. Task completion went 40% -> 88% and time-to-first-action dropped from ~8s to under 2s.
2) Hedgehog — Landing & Growth (2024–2026). Conversion-first landing page for an unreleased Web3 prediction market. Turned 40K+ organic followers into 15,000+ qualified waitlist sign-ups (~37.5% conversion) with zero paid spend, by building institutional trust first.
3) Transparent.space — Founding Product Designer (2025–2026). Built a B2B dashboard from zero giving liquidity providers real visibility into market-maker (MM) performance; discovery to design system. Task completion climbed 61% -> 88%.
4) Petrobras Saúde — Product Designer (2022–2023). Redesigned a telemedicine/healthcare platform for 50,000+ employees across three beneficiary segments (active employees, retirees, dependents) under COVID-19 urgency.
5) Unimed Seguros — Product Designer (2021–2022). Redesigned an insurance/telemedicine app prioritizing transparency over feature complexity for users with varying digital literacy.
- Other work & side projects: Picnic (brand/visual identity), Agent Arena (v1 UX/UI), plus concept/side projects AURA, NORA, and Caramel.

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
    return `At Hedgehog I redesigned how people predict on-chain — moving from orderbooks to pooled UP/DOWN positions, which took task completion from 40% to 88% and time-to-first-action from ~8s to under 2s. I also designed the conversion-first landing page that turned 40K+ followers into 15,000+ waitlist sign-ups with zero paid spend.`;
  }
  if (has('transparent', 'market maker', 'liquidity', 'b2b', 'dashboard')) {
    return `Transparent.space is where I'm Founding Product Designer — I built a B2B dashboard from zero that makes market-maker performance impossible to hide for liquidity providers. Task completion climbed from 61% to 88%, from discovery through the design system.`;
  }
  if (has('petrobras', 'unimed', 'healthcare', 'health', 'insurance', 'telemedicine')) {
    return `In healthcare I redesigned Petrobras Saúde's telemedicine platform for 50,000+ employees across three beneficiary segments under COVID-19 urgency, and Unimed Seguros' insurance app with a focus on transparency for users with varying digital literacy.`;
  }
  if (has('web3', 'defi', 'crypto', 'blockchain', 'on-chain', 'onchain')) {
    return `Web3/DeFi is a big part of my work — Hedgehog and Transparent.space, plus hackathon wins at ETHSamba 2023, Blockchain Rio 2024 (Ripio) and 2025 (BASE). I'm good at translating dense, technical systems into something people can actually use.`;
  }
  if (has('approach', 'process', 'philosophy', 'unique', 'different', 'how do you', 'balance', 'strategy')) {
    return `I don't just design interfaces — I structure products. I start from the real problem and the system behind it, then turn complexity into something clear and usable, balancing strategy with craft from discovery to hand-off. My art-direction roots keep the work visually sharp.`;
  }
  if (has('project', 'work', 'portfolio', 'case', 'experience', 'done')) {
    return `Selected work: Hedgehog (Web3 prediction market — product + growth), Transparent.space (B2B market-maker dashboard), Petrobras Saúde and Unimed Seguros (healthcare), plus brand work like Picnic and Agent Arena. Want detail on any one of them?`;
  }
  if (has('skill', 'tool', 'figma', 'stack', 'design system')) {
    return `My toolkit: Figma, Photoshop, Illustrator, plus prototyping, user research, design systems, website and strategy design — with a strong Web3/DeFi specialization.`;
  }
  if (has('who are you', 'about you', 'yourself', 'bio', 'background')) {
    return `I'm Matheus Fonseca, a UX/UI & Product Designer in Rio de Janeiro with roots in art direction and 5+ years building digital products — mostly across Web3/DeFi, healthcare and enterprise.`;
  }
  return `I'm Matheus' assistant — I can talk about his projects (Hedgehog, Transparent.space, Petrobras Saúde, Unimed Seguros), his process, skills, or availability. What would you like to know? For anything specific, email fonsecaa.design@gmail.com.`;
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
