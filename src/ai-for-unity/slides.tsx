/**
 * AI for Unity Development — deck content.
 * This file is CONTENT ONLY: edit text, media and slide order here.
 * Layout and behavior come from src/deck and src/components.
 * (Generated from the legacy page markup; refactor slides into
 * src/components primitives incrementally as they get edited.)
 */
import { CSSProperties } from 'react';
import { DeckConfig } from '../deck/Deck';
import { Slide } from '../deck/Slide';
import { CoverArt3D, CoverSlide, DeckItemHeading } from '../components';
import { initHeroCanvas } from './hero.js';
import { initCover3d } from './cover3d.js';

export const deckConfig: DeckConfig = {
  storageKey: 'ai-unity-deck-position',
  darkSlides: [0, 18],
  tag: 'Trend',
  deckTitle: 'AI for Unity Development',
  fx: [initHeroCanvas, initCover3d],
};

export const slides = [
  <CoverSlide
    key="cover"
    label="01 Cover"
    notes="Welcome. This talk is about how AI is reshaping Unity development — from autocomplete to agentic engineering. We'll cover what changed, what tools matter, and what skills you need now."
    kicker="From hype to production"
    title={<>AI for Unity<br />development</>}
    description="Engineering · Tooling · Workflows"
    art={<CoverArt3D />}
  />,

  <Slide
    key="02-trend"
    label="02 Trend"
    notes="The industry is moving from traditional engineering to vibe coding to agentic engineering. AI is no longer just a tool you call — it's a collaborator inside your loop. Development is shifting from manual control to guided automation."
    className="slide-trend"
    tag="Trend"
    headline="The shift to agents"
  >
    <div className="trend-stack">
        <div className="trend-columns" role="img" aria-label="Evolution from traditional engineering to agentic engineering">
          <DeckItemHeading className="trend-col-label" style={{ gridColumn: '1' }}>Traditional engineering</DeckItemHeading>
          <DeckItemHeading className="trend-col-label" style={{ gridColumn: '3' }}>Auto-complete</DeckItemHeading>
          <DeckItemHeading className="trend-col-label" style={{ gridColumn: '5' }}>Vibe coding</DeckItemHeading>
          <DeckItemHeading className="trend-col-label" style={{ gridColumn: '7' }}>Agentic engineering</DeckItemHeading>
          <svg className="trend-panel" style={{ gridColumn: '1', gridRow: '2' }} viewBox="0 0 195 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs><clipPath id="panelClip1"><rect width="195" height="250" rx="14" /></clipPath></defs>
              <rect width="195" height="250" rx="14" fill="#ffffff" stroke="#e5e5e5" />
              <g clipPath="url(#panelClip1)">
                <circle cx="18" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="27" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="36" cy="16" r="2.3" fill="#e2e5ea" />
                <text x="181" y="19" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="6.5" fill="#a9adb4">process.py</text>
                <line x1="0" y1="30" x2="195" y2="30" stroke="#eef0f3" />
                <g fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="7" fill="#c4c8cf" textAnchor="end">
                  <text x="26" y="50">1</text>
                  <text x="26" y="64">2</text>
                  <text x="26" y="78">3</text>
                  <text x="26" y="92">4</text>
                  <text x="26" y="106">5</text>
                  <text x="26" y="120">6</text>
                  <text x="26" y="134">7</text>
                </g>
                <g fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="7" fill="#4b4f57">
                  <text y="50"><tspan x="34" fill="#2f6feb">def </tspan><tspan>process(items):</tspan></text>
                  <text y="64"><tspan x="44">result = []</tspan></text>
                  <text y="78"><tspan x="44" fill="#2f6feb">for </tspan><tspan>item </tspan><tspan fill="#2f6feb">in </tspan><tspan>items:</tspan></text>
                  <text y="92"><tspan x="54" fill="#2f6feb">if </tspan><tspan>check(item):</tspan></text>
                  <text y="106"><tspan x="64">item.valid = </tspan><tspan fill="#1f9d6b">True</tspan></text>
                  <text y="120"><tspan x="44">results.append(item)</tspan></text>
                  <text y="134"><tspan x="44" fill="#2f6feb">return </tspan><tspan>results</tspan></text>
                </g>
              </g>
            </svg>
          <span className="trend-col-sep" style={{ gridColumn: '2', gridRow: '2' }} aria-hidden="true">→</span>
          <svg className="trend-panel" style={{ gridColumn: '3', gridRow: '2' }} viewBox="0 0 195 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <clipPath id="panelClip2"><rect width="195" height="250" rx="14" /></clipPath>
                <filter id="acShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1a2540" floodOpacity="0.12" />
                </filter>
              </defs>
              <rect width="195" height="250" rx="14" fill="#ffffff" stroke="#e5e5e5" />
              <g clipPath="url(#panelClip2)">
                <circle cx="18" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="27" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="36" cy="16" r="2.3" fill="#e2e5ea" />
                <text x="181" y="19" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="6.5" fill="#a9adb4">app.ts</text>
                <line x1="0" y1="30" x2="195" y2="30" stroke="#eef0f3" />
                <g fill="#e7eaef">
                  <rect x="24" y="44" width="86" height="3.4" rx="1.7" />
                  <rect x="24" y="56" width="64" height="3.4" rx="1.7" />
                </g>
                <g fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="8">
                  <text x="24" y="75"><tspan fill="#2f6feb">const </tspan><tspan fill="#4b4f57">u = user.</tspan></text>
                  <rect x="83" y="68.5" width="1.4" height="9" fill="#2f6feb" />
                </g>
                <g filter="url(#acShadow)">
                  <rect x="40" y="84" width="118" height="86" rx="8" fill="#ffffff" stroke="#e1e5ec" />
                  <rect x="40" y="86" width="118" height="20" rx="6" fill="#2f6feb" fillOpacity="0.08" />
                  <g fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="7.5">
                    <rect x="48" y="90" width="11" height="11" rx="2.5" fill="#2f6feb" />
                    <text x="64" y="99" fill="#2f6feb" fontWeight="600">getName()</text>
                    <rect x="48" y="111" width="11" height="11" rx="2.5" fill="#d6dbe4" />
                    <text x="64" y="120" fill="#6b6f78">getEmail()</text>
                    <rect x="48" y="132" width="11" height="11" rx="2.5" fill="#d6dbe4" />
                    <text x="64" y="141" fill="#6b6f78">getId()</text>
                    <rect x="48" y="153" width="11" height="11" rx="2.5" fill="#d6dbe4" />
                    <text x="64" y="162" fill="#6b6f78">isActive</text>
                  </g>
                </g>
                <g fill="#e7eaef">
                  <rect x="24" y="190" width="58" height="3.4" rx="1.7" />
                  <rect x="24" y="202" width="92" height="3.4" rx="1.7" />
                  <rect x="24" y="214" width="44" height="3.4" rx="1.7" />
                </g>
              </g>
            </svg>
          <span className="trend-col-sep" style={{ gridColumn: '4', gridRow: '2' }} aria-hidden="true">→</span>
          <svg className="trend-panel" style={{ gridColumn: '5', gridRow: '2' }} viewBox="0 0 195 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <clipPath id="panelClip3"><rect width="195" height="250" rx="14" /></clipPath>
                <linearGradient id="vibeImg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2f6feb" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2f6feb" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <rect width="195" height="250" rx="14" fill="#ffffff" stroke="#e5e5e5" />
              <g clipPath="url(#panelClip3)">
                <circle cx="18" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="27" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="36" cy="16" r="2.3" fill="#e2e5ea" />
                <text x="181" y="19" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="6.5" fill="#a9adb4">prompt</text>
                <line x1="0" y1="30" x2="195" y2="30" stroke="#eef0f3" />
                <g transform="translate(16 42)">
                  <rect width="163" height="26" rx="13" fill="#ffffff" stroke="#cdd6e6" />
                  <path d="M12 13 l1.6 -4.4 l1.6 4.4 l4.4 1.6 l-4.4 1.6 l-1.6 4.4 l-1.6 -4.4 l-4.4 -1.6 z" fill="#2f6feb" />
                  <text x="26" y="16.5" fontFamily="Inter, system-ui, sans-serif" fontSize="8.5" fill="#3b3f47">Make it look better.</text>
                  <circle cx="150" cy="13" r="9" fill="#2f6feb" />
                  <path d="M146.5 13 h6.5 M150.5 10 l3 3 l-3 3" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g transform="translate(28 84)">
                  <rect width="139" height="150" rx="10" fill="#fbfcfe" stroke="#e8ebf1" />
                  <rect x="14" y="14" width="111" height="44" rx="7" fill="url(#vibeImg)" />
                  <circle cx="32" cy="36" r="9" fill="#2f6feb" fillOpacity="0.35" />
                  <rect x="48" y="30" width="50" height="4" rx="2" fill="#2f6feb" fillOpacity="0.45" />
                  <rect x="48" y="40" width="34" height="4" rx="2" fill="#2f6feb" fillOpacity="0.25" />
                  <rect x="14" y="70" width="111" height="6" rx="3" fill="#e6eaf1" />
                  <rect x="14" y="82" width="84" height="6" rx="3" fill="#eef1f5" />
                  <rect x="14" y="100" width="52" height="16" rx="8" fill="#2f6feb" />
                  <rect x="72" y="100" width="40" height="16" rx="8" fill="#ffffff" stroke="#cdd6e6" />
                  <rect x="14" y="128" width="111" height="8" rx="4" fill="#f1f3f7" />
                </g>
              </g>
            </svg>
          <span className="trend-col-sep" style={{ gridColumn: '6', gridRow: '2' }} aria-hidden="true">→</span>
          <svg className="trend-panel" style={{ gridColumn: '7', gridRow: '2' }} viewBox="0 0 195 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <clipPath id="panelClip4"><rect width="195" height="250" rx="14" /></clipPath>
                <radialGradient id="vortexHalo4" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2f6feb" stopOpacity="0.20" />
                  <stop offset="60%" stopColor="#2f6feb" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#2f6feb" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="195" height="250" rx="14" fill="#ffffff" stroke="#e5e5e5" />
              <g clipPath="url(#panelClip4)">
                <circle cx="18" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="27" cy="16" r="2.3" fill="#e2e5ea" />
                <circle cx="36" cy="16" r="2.3" fill="#e2e5ea" />
                <text x="181" y="19" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="6.5" fill="#a9adb4">orchestrator</text>
                <line x1="0" y1="30" x2="195" y2="30" stroke="#eef0f3" />
                <g transform="translate(97.5 98)" pointerEvents="none">
                  <circle r="46" fill="url(#vortexHalo4)" />
                  <g stroke="#c9d6f2" strokeWidth="1.3">
                    <line x1="0" y1="0" x2="-52" y2="-8" />
                    <line x1="0" y1="0" x2="52" y2="-8" />
                    <line x1="0" y1="0" x2="-34" y2="42" />
                    <line x1="0" y1="0" x2="34" y2="42" />
                  </g>
                  <g>
                    <circle cx="-52" cy="-8" r="8" fill="#ffffff" stroke="#2f6feb" strokeWidth="1.4" />
                    <path d="M-55 -8 l2 2 l4 -4" stroke="#2f6feb" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="52" cy="-8" r="8" fill="#ffffff" stroke="#2f6feb" strokeWidth="1.4" />
                    <path d="M49 -8 l2 2 l4 -4" stroke="#2f6feb" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="-34" cy="42" r="8" fill="#ffffff" stroke="#cdd6e6" strokeWidth="1.4" />
                    <circle cx="-34" cy="42" r="2.4" fill="#2f6feb" />
                    <circle cx="34" cy="42" r="8" fill="#ffffff" stroke="#cdd6e6" strokeWidth="1.4" />
                    <circle cx="34" cy="42" r="2.4" fill="#cdd6e6" />
                  </g>
                  <circle r="15" fill="#2f6feb" />
                  <path d="M0 -9 A9 9 0 1 1 -8 4.5" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <circle r="2.4" fill="#ffffff" />
                </g>
                <g transform="translate(31 178)">
                  <rect width="132" height="40" rx="9" fill="#ffffff" stroke="#e5e8ee" />
                  <circle cx="19" cy="20" r="10" fill="#2f6feb" />
                  <path d="M14 20 l4 4 l6 -8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="37" y="16" fontFamily="Inter, system-ui, sans-serif" fontSize="8" fontWeight="600" fill="#111">Project 'Launch'</text>
                  <text x="37" y="27" fontFamily="Inter, system-ui, sans-serif" fontSize="6.5" fill="#72747a">Agents deployed · 95%</text>
                  <rect x="37" y="31" width="86" height="3" rx="1.5" fill="#eef0f3" />
                  <rect x="37" y="31" width="82" height="3" rx="1.5" fill="#2f6feb" />
                </g>
              </g>
            </svg>
        </div>
      </div>
  </Slide>,

  <Slide
    key="03-evolution"
    label="03 Evolution"
    notes="Each step is an integration of the previous one. Pre-AI, copy-paste. Then autocomplete. Then chat. Then IDE plugins. Then CLI agents. Now agentic systems orchestrate full workflows. We moved from isolated tools to integrated ecosystems."
    className="slide-evolution"
    tag="Evolution"
    headline="Evolution of AI dev"
  >
    <div className="progression">
        <div className="step"><span className="idx">01</span><span>Pre-AI · autocomplete workflows</span></div>
        <div className="step"><span className="idx">02</span><span>ChatGPT assistance · copy/paste workflows</span></div>
        <div className="step here"><span className="idx">03</span><span>IDE plugins / CLI tools · manual agent control</span></div>
        <div className="step"><span className="idx">04</span><span>Agentic systems · automated development lifecycle</span></div>
      </div>
  </Slide>,

  <Slide
    key="04-pillars"
    label="04 Pillars"
    notes="The four pillars of any AI system: Tools (what AI can use), Context (what AI knows), Model (how AI reasons), Prompt (how AI is guided). Effective systems balance all four. People obsess over models and ignore the other three."
    className="slide-no-scroll"
    tag="Pillars"
    headline="AI engineering pillars"
  >
    <div className="pillars-venn">
        <svg viewBox="-195 -215 1150 1080" role="img" aria-label="Four overlapping pillars — Tools, Context, Model, Prompt — converging on AI">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <filter id="coreShadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#2f6feb" floodOpacity="0.30" />
            </filter>
            {/* Orbit paths: on the ring lines (r=340) */}
            <path id="op1" d="M535,155 A340,340,0,1,1,-145,155 A340,340,0,1,1,535,155" />
            <path id="op2" d="M905,155 A340,340,0,1,1,225,155 A340,340,0,1,1,905,155" />
            <path id="op3" d="M535,475 A340,340,0,1,1,-145,475 A340,340,0,1,1,535,475" />
            <path id="op4" d="M905,475 A340,340,0,1,1,225,475 A340,340,0,1,1,905,475" />
            {/* Intersection clip chain: area inside all 4 rings */}
            <clipPath id="cp1"><circle cx="195" cy="155" r="340" /></clipPath>
            <clipPath id="cp12" clipPath="url(#cp1)"><circle cx="565" cy="155" r="340" /></clipPath>
            <clipPath id="cp123" clipPath="url(#cp12)"><circle cx="195" cy="475" r="340" /></clipPath>
            <clipPath id="cp1234" clipPath="url(#cp123)"><circle cx="565" cy="475" r="340" /></clipPath>
            {/* Glow filter for orbit dots */}
            <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g className="venn-rings">
            <circle cx="195" cy="155" r="340" fill="#2f6feb" fillOpacity="0.13" stroke="#2f6feb" strokeOpacity="0.55" strokeWidth="2.5" />
            <circle cx="565" cy="155" r="340" fill="#17a34a" fillOpacity="0.13" stroke="#17a34a" strokeOpacity="0.55" strokeWidth="2.5" />
            <circle cx="195" cy="475" r="340" fill="#eab308" fillOpacity="0.15" stroke="#c79406" strokeOpacity="0.55" strokeWidth="2.5" />
            <circle cx="565" cy="475" r="340" fill="#dc2626" fillOpacity="0.12" stroke="#dc2626" strokeOpacity="0.50" strokeWidth="2.5" />
          </g>
          <circle className="venn-core-glow" cx="380" cy="315" r="210" fill="url(#coreGlow)" />
          <g className="venn-label" textAnchor="middle" dominantBaseline="middle">
            <text x="135" y="95" fill="#2f6feb">Tools</text>
            <text x="625" y="95" fill="#15803d">Context</text>
            <text x="135" y="535" fill="#a87908">Model</text>
            <text x="625" y="535" fill="#dc2626">Prompt</text>
          </g>
          {/* Exact intersection of all 4 rings filled blue */}
          <rect className="venn-intersection" x="-200" y="-220" width="1160" height="1100" fill="#2f6feb" clipPath="url(#cp1234)" />
          <text className="venn-core" x="380" y="322" textAnchor="middle" dominantBaseline="middle">AI</text>

          {/* Orbit dots — one per ring, different speed + phase */}
          <circle className="orbit-dot" r="6" fill="#2f6feb" filter="url(#dotGlow)" style={{ '--od': '700ms' } as CSSProperties}>
            <animateMotion dur="9.2s" repeatCount="indefinite" begin="-2.1s" rotate="auto">
              <mpath href="#op1" />
            </animateMotion>
          </circle>
          <circle className="orbit-dot" r="6" fill="#15803d" filter="url(#dotGlow)" style={{ '--od': '820ms' } as CSSProperties}>
            <animateMotion dur="7.6s" repeatCount="indefinite" begin="-5.3s" rotate="auto">
              <mpath href="#op2" />
            </animateMotion>
          </circle>
          <circle className="orbit-dot" r="6" fill="#a87908" filter="url(#dotGlow)" style={{ '--od': '940ms' } as CSSProperties}>
            <animateMotion dur="8.4s" repeatCount="indefinite" begin="-1.4s" rotate="auto">
              <mpath href="#op3" />
            </animateMotion>
          </circle>
          <circle className="orbit-dot" r="6" fill="#dc2626" filter="url(#dotGlow)" style={{ '--od': '1060ms' } as CSSProperties}>
            <animateMotion dur="6.9s" repeatCount="indefinite" begin="-3.7s" rotate="auto">
              <mpath href="#op4" />
            </animateMotion>
          </circle>
        </svg>
      </div>
  </Slide>,

  <Slide
    key="05-tools"
    label="05 Tools"
    notes="The tooling landscape is wide. IDEs (JetBrains, VSCode), desktop apps (Codex, Claude), CLI agents (OpenCode, Hermes), and MCP-integrated apps (Unity, Blender, Houdini). Wrappers and design surfaces extend the surface even further."
    tag="Tools"
    headline="Tooling landscape"
  >
    <div className="pillar-grid">
        <div className="pill"><div className="num">/01</div><h4>IDEs</h4><div className="subhead">Inline assistance while you code.</div><div className="tags"><span className="tag">JetBrains</span><span className="tag">VSCode</span><span className="tag">Cursor</span></div></div>
        <div className="pill"><div className="num">/02</div><h4>Desktop apps</h4><div className="subhead">Context-aware chat for projects.</div><div className="tags"><span className="tag">Codex</span><span className="tag">Claude</span></div></div>
        <div className="pill"><div className="num">/03</div><h4>CLI agents</h4><div className="subhead">Headless agents for automation and pipelines.</div><div className="tags"><span className="tag">OpenCode</span><span className="tag">Hermes</span><a className="tag" href="https://pi.dev/" target="_blank" rel="noopener noreferrer">PI</a></div></div>
        <div className="pill"><div className="num">/04</div><h4>MCP-clients</h4><div className="subhead">AI inside the creative tool.</div><div className="tags"><span className="tag">Unity</span><span className="tag">Blender</span><span className="tag">Houdini</span></div></div>
        <div className="pill"><div className="num">/05</div><h4>Design tools</h4><div className="subhead">Agentic design surfaces.</div><div className="tags"><span className="tag">Claude Design</span><a className="tag" href="https://open-design.ai/" target="_blank" rel="noopener noreferrer">Open Design</a></div></div>
        <div className="pill"><div className="num">/06</div><h4>Other</h4><div className="subhead">Emerging agent surfaces.</div><div className="tags"><span className="tag">CMUX</span><span className="tag">Wrap</span><span className="tag">OpenClaw</span></div></div>
      </div>
  </Slide>,

  <Slide
    key="06-mcp"
    label="06 MCP"
    notes="MCP — Model Context Protocol — is the integration layer. It connects AI to real tools and workflows. It's not just automation; it's the execution layer. With Context7 and similar, AI moves from chat to action."
    className="slide-mcp"
    tag="Tools · MCP"
  >
    <div className="mcp-logo" aria-label="Model Context Protocol">
        <svg className="mcp-mark" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <title>ModelContextProtocol</title>
          <path pathLength="1" d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
          <path pathLength="1" d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
        </svg>
        <svg className="mcp-wordmark" viewBox="0 0 335 24" fill="currentColor" fillRule="nonzero" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <title>ModelContextProtocol</title>
          <path d="M2 .292h4.736l6.341 15.503h.25L19.67.292h4.736v21.394H20.69V6.99h-.198L14.59 21.624h-2.775L5.911 6.957h-.198v14.73H2V.291zM35.44 22c-1.565 0-2.92-.345-4.068-1.034-1.148-.69-2.038-1.654-2.67-2.894-.626-1.24-.939-2.688-.939-4.345 0-1.658.313-3.11.939-4.357.632-1.246 1.522-2.214 2.67-2.904 1.147-.69 2.503-1.034 4.068-1.034 1.564 0 2.92.345 4.068 1.034 1.147.69 2.033 1.658 2.66 2.904.632 1.247.949 2.7.949 4.357s-.317 3.105-.95 4.345c-.626 1.24-1.512 2.204-2.66 2.894C38.36 21.656 37.005 22 35.44 22zm.02-3.03c.849 0 1.558-.233 2.129-.7.57-.473.994-1.107 1.272-1.9.285-.795.427-1.68.427-2.654 0-.982-.142-1.87-.427-2.664-.278-.8-.703-1.438-1.272-1.911-.57-.474-1.28-.71-2.128-.71-.87 0-1.593.236-2.17.71-.57.473-.998 1.11-1.283 1.911-.278.794-.417 1.682-.417 2.664 0 .975.14 1.86.417 2.653.285.794.713 1.428 1.283 1.901.577.467 1.3.7 2.17.7zm16.806 2.998c-1.258 0-2.384-.323-3.379-.97-.994-.649-1.78-1.589-2.357-2.822-.577-1.232-.866-2.73-.866-4.491 0-1.783.292-3.287.876-4.513.591-1.233 1.387-2.163 2.389-2.79 1.001-.633 2.117-.95 3.348-.95.938 0 1.71.16 2.315.48.605.314 1.085.694 1.44 1.14.355.438.63.852.824 1.242h.156V.292h3.786v21.394h-3.713V19.16h-.23c-.194.39-.476.804-.844 1.243-.369.431-.855.8-1.46 1.107-.605.306-1.367.46-2.285.46zm1.054-3.102c.8 0 1.481-.216 2.044-.648.564-.438.991-1.048 1.283-1.828.292-.78.438-1.688.438-2.726s-.146-1.94-.438-2.706c-.285-.766-.71-1.361-1.272-1.786-.556-.425-1.242-.637-2.055-.637-.842 0-1.544.219-2.107.658-.563.438-.987 1.044-1.272 1.817-.286.774-.428 1.658-.428 2.654 0 1.003.142 1.897.428 2.685.291.78.72 1.396 1.282 1.849.57.445 1.27.668 2.097.668zM71.915 22c-1.607 0-2.994-.334-4.162-1.003-1.161-.676-2.055-1.63-2.68-2.862-.626-1.24-.94-2.699-.94-4.377 0-1.65.314-3.1.94-4.346.632-1.253 1.515-2.228 2.649-2.925 1.133-.703 2.465-1.055 3.994-1.055.988 0 1.92.16 2.796.48.883.314 1.662.801 2.336 1.463.682.662 1.217 1.504 1.606 2.528.39 1.017.585 2.229.585 3.635v1.16H65.907v-2.549h9.512c-.007-.724-.163-1.368-.47-1.932a3.416 3.416 0 00-1.282-1.348c-.543-.327-1.175-.491-1.899-.491-.771 0-1.45.188-2.033.564-.584.37-1.04.857-1.367 1.463a4.209 4.209 0 00-.49 1.974v2.225c0 .933.17 1.734.511 2.402.341.662.817 1.17 1.429 1.526.612.348 1.328.522 2.149.522a4.56 4.56 0 001.491-.23c.445-.16.831-.393 1.158-.7a2.92 2.92 0 00.74-1.138l3.526.397a5.505 5.505 0 01-1.273 2.444c-.618.69-1.41 1.226-2.377 1.609-.967.376-2.073.564-3.317.564zM86.009.292v21.394h-3.776V.293h3.776zm29.619 7.219h-3.901a4.862 4.862 0 00-.615-1.703 4.578 4.578 0 00-1.116-1.274 4.652 4.652 0 00-1.523-.784 5.934 5.934 0 00-1.826-.271c-1.161 0-2.19.292-3.087.877-.897.578-1.599 1.428-2.107 2.549-.507 1.114-.761 2.476-.761 4.084 0 1.637.254 3.016.761 4.137.515 1.114 1.217 1.957 2.107 2.528.897.564 1.923.846 3.077.846.64 0 1.238-.083 1.794-.25a4.914 4.914 0 001.513-.763 4.653 4.653 0 001.783-2.904l3.901.02a8.414 8.414 0 01-.949 2.863 8.436 8.436 0 01-1.888 2.361 8.709 8.709 0 01-2.733 1.588c-1.043.376-2.2.564-3.473.564-1.877 0-3.553-.435-5.027-1.306-1.475-.87-2.636-2.127-3.484-3.771-.849-1.643-1.272-3.614-1.272-5.913 0-2.305.427-4.276 1.282-5.912.855-1.644 2.02-2.9 3.494-3.771C103.052.436 104.721 0 106.585 0c1.189 0 2.295.167 3.317.501a8.499 8.499 0 012.733 1.473 7.85 7.85 0 011.971 2.361c.521.926.862 1.985 1.022 3.176zM125.993 22c-1.564 0-2.92-.345-4.068-1.034-1.147-.69-2.037-1.654-2.67-2.894-.626-1.24-.938-2.688-.938-4.345 0-1.658.312-3.11.938-4.357.633-1.246 1.523-2.214 2.67-2.904 1.148-.69 2.504-1.034 4.068-1.034 1.565 0 2.921.345 4.068 1.034 1.147.69 2.034 1.658 2.66 2.904.632 1.247.949 2.7.949 4.357s-.317 3.105-.949 4.345c-.626 1.24-1.513 2.204-2.66 2.894-1.147.69-2.503 1.034-4.068 1.034zm.021-3.03c.848 0 1.558-.233 2.128-.7.57-.473.994-1.107 1.272-1.9.285-.795.428-1.68.428-2.654 0-.982-.143-1.87-.428-2.664-.278-.8-.702-1.438-1.272-1.911-.57-.474-1.28-.71-2.128-.71-.869 0-1.592.236-2.169.71-.571.473-.998 1.11-1.283 1.911-.278.794-.418 1.682-.418 2.664 0 .975.14 1.86.418 2.653.285.794.712 1.428 1.283 1.901.577.467 1.3.7 2.169.7zm14.637-6.685v9.401h-3.776V5.641h3.608v2.726h.188a4.585 4.585 0 011.763-2.141c.813-.53 1.819-.794 3.015-.794 1.105 0 2.068.237 2.889.71.827.474 1.467 1.16 1.919 2.058.459.899.685 1.989.678 3.27v10.216h-3.776v-9.631c0-1.072-.278-1.912-.835-2.518-.549-.605-1.31-.908-2.284-.908-.66 0-1.248.146-1.762.438-.508.286-.908.7-1.2 1.243-.285.544-.427 1.202-.427 1.975zm22.122-6.644v2.925h-9.21V5.641h9.21zm-6.936-3.844h3.776V16.86c0 .509.076.899.229 1.17.16.265.369.446.626.544.257.097.542.146.855.146a3.7 3.7 0 00.647-.052c.202-.035.355-.067.459-.094l.636 2.956c-.201.07-.49.146-.865.23a7.124 7.124 0 01-1.356.146c-.946.028-1.798-.115-2.556-.428a3.973 3.973 0 01-1.804-1.484c-.438-.668-.654-1.504-.647-2.507V1.797zM172.851 22c-1.606 0-2.993-.334-4.161-1.003-1.162-.676-2.055-1.63-2.681-2.862-.626-1.24-.939-2.699-.939-4.377 0-1.65.313-3.1.939-4.346.633-1.253 1.516-2.228 2.649-2.925 1.134-.703 2.465-1.055 3.995-1.055.988 0 1.919.16 2.796.48a6.32 6.32 0 012.336 1.463c.681.662 1.217 1.504 1.606 2.528.39 1.017.584 2.229.584 3.635v1.16h-13.131v-2.549h9.512c-.007-.724-.163-1.368-.469-1.932a3.418 3.418 0 00-1.283-1.348c-.542-.327-1.175-.491-1.898-.491-.772 0-1.45.188-2.034.564a3.88 3.88 0 00-1.367 1.463 4.212 4.212 0 00-.49 1.974v2.225c0 .933.17 1.734.511 2.402.341.662.817 1.17 1.429 1.526.612.348 1.328.522 2.148.522.55 0 1.047-.077 1.492-.23.445-.16.831-.393 1.158-.7.327-.306.574-.686.74-1.138l3.526.397a5.52 5.52 0 01-1.272 2.444c-.619.69-1.412 1.226-2.379 1.609-.966.376-2.072.564-3.317.564zm13.062-16.359l3.233 5.923 3.286-5.923h3.995l-4.83 8.023 4.913 8.022h-3.974l-3.39-5.776-3.358 5.776h-4.006l4.882-8.022-4.757-8.023h4.006zm21.434 0v2.925h-9.21V5.641h9.21zm-6.936-3.844h3.776V16.86c0 .509.076.899.229 1.17.16.265.369.446.626.544a2.4 2.4 0 00.855.146 3.7 3.7 0 00.647-.052c.202-.035.355-.067.459-.094l.636 2.956c-.201.07-.49.146-.866.23-.368.083-.82.132-1.356.146-.945.028-1.797-.115-2.555-.428a3.973 3.973 0 01-1.804-1.484c-.438-.668-.654-1.504-.647-2.507V1.797zm17.546 19.89V.291h8.011c1.641 0 3.018.307 4.13.92 1.12.613 1.965 1.455 2.535 2.528.577 1.065.866 2.277.866 3.635 0 1.372-.289 2.59-.866 3.656-.577 1.066-1.429 1.905-2.555 2.518-1.127.606-2.514.909-4.162.909h-5.309v-3.186h4.787c.96 0 1.745-.168 2.357-.502.612-.334 1.064-.794 1.356-1.379.3-.585.449-1.257.449-2.016 0-.759-.149-1.428-.449-2.006-.292-.578-.747-1.027-1.366-1.347-.612-.327-1.401-.491-2.368-.491h-3.546v18.155h-3.87zm18.736 0V5.64h3.66v2.674h.169c.29-.926.792-1.64 1.502-2.141.716-.509 1.533-.763 2.451-.763.208 0 .44.01.697.032.266.013.484.038.658.073v3.478c-.159-.055-.413-.104-.762-.146a6.967 6.967 0 00-.991-.073c-.689 0-1.307.15-1.857.45-.542.292-.97.699-1.282 1.221-.312.523-.468 1.125-.468 1.808v9.432h-3.777zm17.973.313c-1.563 0-2.919-.345-4.066-1.034-1.147-.69-2.038-1.654-2.671-2.894-.627-1.24-.939-2.688-.939-4.345 0-1.658.312-3.11.939-4.357.633-1.246 1.524-2.214 2.671-2.904 1.147-.69 2.503-1.034 4.066-1.034 1.566 0 2.922.345 4.069 1.034 1.148.69 2.035 1.658 2.659 2.904.633 1.247.948 2.7.948 4.357s-.315 3.105-.948 4.345c-.624 1.24-1.511 2.204-2.659 2.894-1.147.69-2.503 1.034-4.069 1.034zm.021-3.03c.848 0 1.558-.233 2.13-.7.569-.473.994-1.107 1.27-1.9.287-.795.428-1.68.428-2.654 0-.982-.141-1.87-.428-2.664-.276-.8-.701-1.438-1.27-1.911-.572-.474-1.282-.71-2.13-.71-.868 0-1.591.236-2.169.71-.569.473-.997 1.11-1.282 1.911-.278.794-.419 1.682-.419 2.664 0 .975.141 1.86.419 2.653.285.794.713 1.428 1.282 1.901.578.467 1.301.7 2.169.7zM273.55 5.641v2.925h-9.213V5.641h9.213zm-6.936-3.844h3.775V16.86c0 .509.077.899.23 1.17.159.265.367.446.624.544.257.097.541.146.856.146.236 0 .45-.018.646-.052.202-.035.355-.067.459-.094l.636 2.956c-.202.07-.489.146-.866.23-.367.083-.82.132-1.355.146-.945.028-1.799-.115-2.555-.428a3.97 3.97 0 01-1.805-1.484c-.437-.668-.655-1.504-.645-2.507V1.797zM283.524 22c-1.567 0-2.922-.345-4.069-1.034-1.148-.69-2.038-1.654-2.671-2.894-.625-1.24-.94-2.688-.94-4.345 0-1.658.315-3.11.94-4.357.633-1.246 1.523-2.214 2.671-2.904 1.147-.69 2.502-1.034 4.069-1.034 1.563 0 2.919.345 4.066 1.034 1.147.69 2.035 1.658 2.659 2.904.633 1.247.951 2.7.951 4.357s-.318 3.105-.951 4.345c-.624 1.24-1.512 2.204-2.659 2.894-1.147.69-2.503 1.034-4.066 1.034zm.018-3.03c.851 0 1.557-.233 2.13-.7.569-.473.994-1.107 1.272-1.9.285-.795.429-1.68.429-2.654 0-.982-.144-1.87-.429-2.664-.278-.8-.703-1.438-1.272-1.911-.573-.474-1.279-.71-2.13-.71-.869 0-1.591.236-2.169.71-.569.473-.997 1.11-1.282 1.911-.278.794-.416 1.682-.416 2.664 0 .975.138 1.86.416 2.653.285.794.713 1.428 1.282 1.901.578.467 1.3.7 2.169.7zm17.85 3.03c-1.6 0-2.971-.352-4.119-1.055-1.141-.704-2.022-1.675-2.64-2.915-.612-1.246-.918-2.681-.918-4.304 0-1.629.312-3.067.94-4.314.624-1.253 1.508-2.228 2.649-2.925 1.147-.703 2.503-1.055 4.066-1.055 1.301 0 2.454.24 3.454.72 1.007.474 1.812 1.146 2.408 2.017.6.864.94 1.873 1.022 3.03h-3.607a3.477 3.477 0 00-1.043-1.933c-.542-.522-1.27-.784-2.182-.784-.771 0-1.447.21-2.031.627-.585.411-1.041 1.003-1.368 1.776-.318.773-.48 1.7-.48 2.779 0 1.093.162 2.034.48 2.82.321.78.768 1.383 1.346 1.807.585.418 1.27.627 2.053.627.557 0 1.056-.104 1.493-.313a3.018 3.018 0 001.117-.93c.297-.404.502-.895.615-1.473h3.607c-.088 1.135-.422 2.142-1 3.02-.578.87-1.362 1.552-2.356 2.047-.994.487-2.163.731-3.506.731zm16.953 0c-1.567 0-2.922-.345-4.07-1.034-1.147-.69-2.037-1.654-2.667-2.894-.628-1.24-.94-2.688-.94-4.345 0-1.658.312-3.11.94-4.357.63-1.246 1.52-2.214 2.667-2.904 1.148-.69 2.503-1.034 4.07-1.034 1.563 0 2.919.345 4.066 1.034 1.147.69 2.034 1.658 2.662 2.904.63 1.247.948 2.7.948 4.357s-.318 3.105-.948 4.345c-.628 1.24-1.515 2.204-2.662 2.894S319.908 22 318.345 22zm.021-3.03c.848 0 1.557-.233 2.126-.7.57-.473.995-1.107 1.273-1.9.285-.795.429-1.68.429-2.654 0-.982-.144-1.87-.429-2.664-.278-.8-.703-1.438-1.273-1.911-.569-.474-1.278-.71-2.126-.71-.869 0-1.594.236-2.169.71-.572.473-1.001 1.11-1.285 1.911-.279.794-.416 1.682-.416 2.664 0 .975.137 1.86.416 2.653.284.794.713 1.428 1.285 1.901.575.467 1.3.7 2.169.7zM333 .292v21.394h-3.776V.293H333z" />
        </svg>
      </div>
      <h2 className="deck-headline">From chat to action</h2>
      <span className="mcp-tags-label">Unity</span>
      <div className="mcp-tags">
        <a className="tag" href="https://github.com/CoplayDev/unity-mcp" target="_blank" rel="noopener"><span className="tag-link">🔗</span>Coplay</a>
        <a className="tag" href="https://github.com/AnkleBreaker-Studio/unity-mcp-server" target="_blank" rel="noopener"><span className="tag-link">🔗</span>AnkleBreaker</a>
        <a className="tag" href="https://github.com/IvanMurzak/Unity-MCP" target="_blank" rel="noopener"><span className="tag-link">🔗</span>Ivan Murzak</a>
        <a className="tag" href="https://github.com/german-krasnikov/unity-kiss-mcp" target="_blank" rel="noopener"><span className="tag-link">🔗</span>German Krasnikov</a>
      </div>
      <span className="mcp-prosconlabel">Pros</span>
      <ul className="arrow-list tight">
        <li>Connects AI to real tools and workflows</li>
        <li>Auto-fixes and validates code (compile, detect errors, suggest fixes)</li>
        <li>Runs editor tasks automatically (imports, references, setup)</li>
        <li>Maintains full project context (scene awareness, no re-explaining)</li>
      </ul>
      <span className="mcp-prosconlabel">Cons</span>
      <ul className="arrow-list tight cons">
        <li>Burns context fast</li>
        <li>Not plug-and-play (stdio vs HTTP)</li>
        <li>Not always stable (rapidly evolving stack)</li>
      </ul>
  </Slide>,

  <Slide
    key="07-harness"
    label="07 Harness"
    notes="The harness is the orchestrator — the layer that wires agents, tools, and workflows together. Whoever controls the harness controls outcomes. Black-box harnesses limit you. Open ones let you customize and scale."
    tag="Tools · Harness"
    headline="AI’s core power"
    subhead={<>The harness defines what the model can actually do.</>}
  >
    <div className="harness-content">
    
        <ul className="arrow-list tight">
          <li><div className="row"><span>Harness — orchestration layer around an AI model</span><span className="products"><span>tools</span><span>workflows</span><span>integrations</span></span></div></li>
          <li>The harness defines what the AI can actually do</li>
          <li>Who controls the harness controls outcomes</li>
          <li><div className="row"><span>Closed systems limit control</span><span className="products"><span>OpenAI</span><span>Anthropic</span><span>Google</span><span>Cursor</span></span></div></li>
          <li><div className="row"><span>Open systems let you build and scale your harness</span><span className="products"><span>Pi</span><span>OpenCode</span></span></div></li>
        </ul>
      </div>
  </Slide>,

  <Slide
    key="08-build-tools"
    label="08 Build Tools"
    notes="The shift everyone misses: stop only USING tools — start BUILDING them. AI is most effective when wired into your workflow. Custom toolchains unlock real productivity. This is the prerequisite for true agentic engineering."
    tag="Tools · Build"
    headline="Build your stack"
    subhead={<>With AI, building tools is no longer optional — it's the baseline.</>}
  >
    <ul className="arrow-list tight">
        <li>Shift from using tools → building tools</li>
        <li>AI only effective when integrated into your workflow</li>
        <li>Custom toolchains unlock real productivity</li>
        <li>Required to reach true agentic engineering</li>
      </ul>
  </Slide>,

  <Slide
    key="09-context"
    label="09 Context"
    notes="Context is the real bottleneck. It's limited and expensive. Most of the value comes from a focused subset — roughly the top 70%. Session compression destroys quality. Smart selection beats large windows."
    tag="Context"
    headline="Context bottleneck"
    subhead={<>Limited context limits intelligence.</>}
  >
    <ul className="arrow-list tight">
        <li>Context is limited — and expensive</li>
        <li>Most value lives in a focused ~70% subset</li>
        <li>Compression degrades quality</li>
        <li><div className="row"><span>MCP is a major context consumer</span><span className="products"><span>context mode</span></span></div></li>
        <li>Subagents split work into isolated contexts</li>
      </ul>
  </Slide>,

  <Slide
    key="10-model"
    label="10 Model"
    notes="There is no universal model. The best model depends on the task, context, and constraints. Stronger is not always better: latency, cost, and determinism often beat raw capability. Match the model to the workflow, not the hype."
    tag="Model"
    headline="No universal model"
    subhead={<>Choose the right model for the job—not the most advanced one.</>}
  >
    <ul className="arrow-list tight">
        <li>The “best” model depends on the task, context, and constraints</li>
        <li>Stronger ≠ better for every use case</li>
        <li>Latency, cost, and determinism often beat raw capability</li>
        <li>Match model to workflow, not hype</li>
      </ul>
  </Slide>,

  <Slide
    key="11-mirror"
    label="11 Mirror"
    notes="AI is a mirror. WYASWYG — What You Ask Is What You Get. WIASWYG — What Is Asked Shapes Output. Better input, better output. Garbage in, garbage out — at higher resolution than ever."
    tag="Prompt · Engineering"
    headline="AI mirrors intent"
  >
    <div className="pillar-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1400px' }}>
        <div className="pill"><div className="num">/01</div><h4>WYAIWYG</h4><div className="subhead">What You Ask Is What You Get.</div><div className="pill-tags"><span>prompt</span><span>skills</span><span>references</span></div></div>
        <div className="pill"><div className="num">/02</div><h4>WISIWYG</h4><div className="subhead">What It Sees Is What You Get.</div><div className="pill-tags"><span>structure</span><span>code style</span><span>patterns</span></div></div>
        <div className="pill"><div className="num">/03</div><h4>GIGO</h4><div className="subhead">Garbage In Garbage Out.</div><div className="pill-tags"><span>DATA QUALITY</span><span>DATA BIAS</span></div></div>
      </div>
  </Slide>,

  <Slide
    key="11-skills"
    label="11 Skills"
    notes="Skills you need to guide AI: structuring problems clearly, knowing when to guide vs. automate, defining constraints and workflows, and bringing real domain knowledge. AI doesn't replace expertise — it amplifies it."
    tag="Prompt · Skills"
    headline="Guiding AI"
    subhead={<>Better inputs &rarr; exponentially better outputs.</>}
  >
    <span className="deck-section-label">Pros</span>
      <ul className="arrow-list tight">
        <li>Define clear constraints upfront</li>
        <li>Automate domain knowledge injection</li>
        <li>Define task oriented knowlage</li>
      </ul>
      <span className="deck-section-label" style={{ marginTop: 'var(--mcp-section-gap,clamp(28px,2.6vw,44px))' } as CSSProperties}>Cons</span>
      <ul className="arrow-list tight cons">
        <li>Skill not the silver bullet &mdash; ate context</li>
        <li>Too generic skill not adds much to code quality</li>
      </ul>
  </Slide>,

  <Slide
    key="14-unity"
    label="14 Unity"
    notes="Unity-specific: combine no-code and code approaches. Use Shader Graph and HLSL where each is right. Keep systems decoupled. Build modular tools and editors that AI can drive without breaking everything else."
    tag="Unity"
    headline="AI in Unity"
  >
    <ul className="arrow-list tight" style={{ fontSize: 'clamp(14px, 1.1vw, 21px)' }}>
        <li>Prefer code over graphs (UITK, HLSL)</li>
        <li>Decouple core logic, data, and presentation layers</li>
        <li>Expose tools via APIs (Editor scripts, MCP-style access)</li>
        <li>Structure code into clear modules (assemblies, namespaces) AI can navigate</li>
        <li>Prefer Dependency Injection over hard references</li>
      </ul>
  </Slide>,

  <Slide
    key="15-unity-ui"
    label="15 Unity UI"
    notes="UI development stack: 2D — UITK (UXML+USS), OneJS. 3D — spatial layouts from reusable components. Code-based, component-driven UI scales better with AI."
    className="slide-ui"
    tag="Unity · UI"
    headline="AI-driven UI"
    subhead={<>Code-based, component-driven UI scales better with AI.</>}
  >
    <div className="ui-workflow-grid" aria-label="UI workflow split between 2D and 3D systems">
        <article className="ui-lane">
          <span className="lane-label">2D UI</span>
          <h3>Screen systems</h3>
          <div className="ui-items">
            <div className="ui-item">UITK (UXML + USS)</div>
            <div className="ui-item has-link"><a className="deck-link" href="https://v3.onejs.com/" target="_blank" rel="noopener noreferrer">OneJS (React + Tailwind)</a></div>
            <div className="ui-item">Layout engine (Flexbox)</div>
          </div>
        </article>
        <article className="ui-lane">
          <span className="lane-label">3D UI</span>
          <h3>Spatial layouts</h3>
          <div className="ui-items">
            <div className="ui-item">Reusable components</div>
            <div className="ui-item has-link"><a className="deck-link" href="https://www.flexalon.com/" target="_blank" rel="noopener noreferrer">Layout engine (Flexon)</a></div>
          </div>
        </article>
      </div>
  </Slide>,

  <Slide
    key="16-shifting"
    label="16 Shifting"
    notes="Engineering isn't disappearing — it's shifting. Mindset: curiosity, experimentation, continuous learning, breadth plus depth. Focus: orchestrate AI, build harnesses, design workflows, turn tasks into reusable systems."
    tag="Engineering · Future"
    headline="Engineering shift"
    subhead={<>Engineering is not disappearing — it’s evolving.</>}
  >
    <div className="two-col" style={{ marginTop: '0' }}>
        <div>
          <h3>Mindset</h3>
          <ul className="arrow-list tight">
            <li>Curiosity over certainty</li>
            <li>Experiment — expect imperfect results</li>
            <li>Comfortable with things not working immediately</li>
            <li>Broad cross-domain knowledge with a focus on AI engineering</li>
          </ul>
        </div>
        <div>
          <h3>Focus</h3>
          <ul className="arrow-list tight">
            <li>Orchestrate AI, don't just write code</li>
            <li>Build harnesses around models</li>
            <li>Design workflows, not one-off solutions</li>
            <li>Turn tasks into reusable systems</li>
          </ul>
        </div>
      </div>
  </Slide>,

  <Slide
    key="18-progression"
    label="18 Progression"
    notes="Levels of abstraction: prompts, structured input (markdown, schemas), frameworks, higher-level orchestration. Moving up the stack increases leverage — and the cost of mistakes — at the same time."
    className="slide-levels"
    tag="Engineering · Progression"
    headline="AI engineering levels"
    subhead={<>From prompting to building orchestrated systems.</>}
  >
    <div className="progression" style={{ marginTop: '0' }}>
        <div className="step"><span className="idx">L1</span><span>Prompts — raw interaction</span></div>
        <div className="step"><span className="idx">L2</span><span>Structured context — defined inputs, rules, and reusable skills</span></div>
        <div className="step"><span className="idx">L3</span><span>Tools &amp; pipelines — CLIs, automation, workflows</span></div>
        <div className="step"><span className="idx">L4</span><span>Orchestration — multi-agent systems</span></div>
      </div>
  </Slide>,

  <Slide
    key="19-goal"
    label="19 Goal"
    notes="Where this is all heading. Clear task understanding. Reliable execution — no hallucinations during runtime. Validation after execution. Testable, repeatable workflows. Parallel execution across agents. Thank you."
    className="slide-goal"
    tag="Engineering · Goal"
    headline="Agentic engineering"
  >
    <ul className="arrow-list tight">
        <li>You make AI understand your intent</li>
        <li>You know exactly what it will produce</li>
        <li>The output is controlled, not random</li>
        <li>You refine the process until it's repeatable</li>
      </ul>
      <div className="flow-graph">
          <svg viewBox="0 0 400 650" overflow="visible" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: 'var(--font-body)' } as CSSProperties}>
            <defs>
              <marker id="arrV" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M1,1 L7,4 L1,7 Z" fill="#2f6feb" />
              </marker>
              <marker id="arrLoop" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M1,1 L7,4 L1,7 Z" fill="#6b6b6b" />
              </marker>
              <filter id="flowDotGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <g className="flow-node" style={{ '--nd': '60ms' } as CSSProperties}>
              <rect x="70" y="0" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">DEFINE TASK</text>
              <text x="220" y="47" textAnchor="middle" fontSize="12" fill="#6b6b6b">intent, constraints</text>
            </g>

            <line className="flow-arrow" style={{ '--nd': '200ms' } as CSSProperties} x1="220" y1="66" x2="220" y2="102" stroke="#2f6feb" strokeWidth="1.5" markerEnd="url(#arrV)" />

            <g className="flow-node" style={{ '--nd': '240ms' } as CSSProperties}>
              <rect x="70" y="106" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="132" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">PLAN / RESEARCH</text>
              <text x="220" y="153" textAnchor="middle" fontSize="12" fill="#6b6b6b">explore options, tools</text>
            </g>

            <line className="flow-arrow" style={{ '--nd': '380ms' } as CSSProperties} x1="220" y1="172" x2="220" y2="208" stroke="#2f6feb" strokeWidth="1.5" markerEnd="url(#arrV)" />

            <g className="flow-node" style={{ '--nd': '420ms' } as CSSProperties}>
              <rect x="70" y="212" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="238" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">EXECUTE (via AGENTS)</text>
              <text x="220" y="259" textAnchor="middle" fontSize="12" fill="#6b6b6b">code, tools, actions</text>
            </g>

            <line className="flow-arrow" style={{ '--nd': '560ms' } as CSSProperties} x1="220" y1="278" x2="220" y2="314" stroke="#2f6feb" strokeWidth="1.5" markerEnd="url(#arrV)" />

            <g className="flow-node" style={{ '--nd': '600ms' } as CSSProperties}>
              <rect x="70" y="318" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="344" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">TEST / VALIDATE</text>
              <text x="220" y="365" textAnchor="middle" fontSize="12" fill="#6b6b6b">checks, outputs, QA</text>
            </g>

            <line className="flow-arrow" style={{ '--nd': '740ms' } as CSSProperties} x1="220" y1="384" x2="220" y2="420" stroke="#2f6feb" strokeWidth="1.5" markerEnd="url(#arrV)" />

            <g className="flow-node" style={{ '--nd': '780ms' } as CSSProperties}>
              <rect x="70" y="424" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="450" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">OBSERVE / FEEDBACK</text>
              <text x="220" y="471" textAnchor="middle" fontSize="12" fill="#6b6b6b">errors, results, logs</text>
            </g>

            <line className="flow-arrow" style={{ '--nd': '920ms' } as CSSProperties} x1="220" y1="490" x2="220" y2="526" stroke="#2f6feb" strokeWidth="1.5" markerEnd="url(#arrV)" />

            <g className="flow-node" style={{ '--nd': '960ms' } as CSSProperties}>
              <rect x="70" y="530" width="300" height="66" rx="8" fill="#fff" stroke="#2f6feb" strokeWidth="1.5" />
              <text x="220" y="556" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2f6feb" letterSpacing="0.08em">REFINE CONTEXT</text>
              <text x="220" y="577" textAnchor="middle" fontSize="12" fill="#6b6b6b">prompt, tools, rules</text>
            </g>

            <path id="loopPath" className="flow-loop" style={{ '--nd': '1120ms' } as CSSProperties} d="M70,563 L28,563 L28,33 L68,33" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrLoop)" />

            <circle className="flow-loop-dot" r="4" fill="#2f6feb" filter="url(#flowDotGlow)">
              <animateMotion id="flowLoopMotion" dur="5.5s" repeatCount="indefinite" begin="indefinite" calcMode="linear">
                <mpath href="#loopPath" />
              </animateMotion>
            </circle>

            <g className="flow-loop-label" style={{ '--nd': '1380ms' } as CSSProperties}>
              <rect x="1" y="289" width="54" height="18" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
              <text fontSize="11" fill="#6b6b6b" letterSpacing="0.08em" textAnchor="middle" dominantBaseline="middle" x="28" y="298">LOOP ↺</text>
            </g>
          </svg>
      </div>
  </Slide>,

  <Slide
    key="20-ai-workflow"
    label="20 AI Workflow"
    notes="The AI workflow stack: agents like Pi, cloud infra underneath, MCP integrations bridging tools, and a custom tooling layer on top. It's designed for automation — not just assistance."
    tag="Workflow · AI"
    headline="Agentic workflow stack"
  >
    <div className="ui-workflow-grid" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }} aria-label="Agentic workflow stack">
        <article className="ui-lane">
          <span className="lane-label">AGENT</span>
          <p className="lane-sub">Task definition, iteration loop</p>
          <div className="ui-items">
            <div className="ui-item has-link"><a className="deck-link" href="https://pi.dev/" target="_blank" rel="noopener noreferrer">Pi</a></div>
            <div className="ui-item">Copilot</div>
            <div className="ui-item">Spec Driven Development</div>
          </div>
        </article>
        <article className="ui-lane">
          <span className="lane-label">Design</span>
          <p className="lane-sub">AI-driven UI and design systems</p>
          <div className="ui-items">
            <div className="ui-item has-link"><a className="deck-link" href="https://open-design.ai/" target="_blank" rel="noopener noreferrer">Open Design</a></div>
            <div className="ui-item">Claude Design</div>
          </div>
        </article>
        <article className="ui-lane">
          <span className="lane-label">Execution</span>
          <p className="lane-sub">Instant validation and analisys</p>
          <div className="ui-items">
            <div className="ui-item has-link"><a className="deck-link" href="https://github.com/IvanMurzak/Unity-MCP" target="_blank" rel="noopener noreferrer">Unity (MCP)</a></div>
            <div className="ui-item has-link"><a className="deck-link" href="https://github.com/healkeiser/fxhoudinimcp" target="_blank" rel="noopener noreferrer">Houdini (MCP)</a></div>
          </div>
        </article>
        <article className="ui-lane">
          <span className="lane-label">UNITY</span>
          <p className="lane-sub">Code based architecture</p>
          <div className="ui-items">
            <div className="ui-item">UITK (UXML + USS)</div>
            <div className="ui-item has-link"><a className="deck-link" href="https://v3.onejs.com/" target="_blank" rel="noopener noreferrer">OneJS (React + Tailwind)</a></div>
            <div className="ui-item">HLS</div>
          </div>
        </article>
      </div>
  </Slide>,

  <Slide
    key="21-end"
    label="21 End"
    notes="Closing slide. A retro ZX Spectrum-inspired wireframe structure signals the end of the presentation."
    className="slide-zx-end slide-no-scroll dark"
    tag="The End"
    headline="Thank you"
  >
    <p className="deck-subhead zx-end-subhead">Questions?</p>
      <div className="zx-demo" aria-hidden="true">
        <div className="zx-cube-frame">
          <canvas className="zx-cube-canvas" id="zxCanvasCube" width="600" height="600"></canvas>
        </div>
        <div className="zx-tap-compute"><span className="desktop-label">CLICK TO COMPUTE</span><span className="mobile-label">TAP TO COMPUTE</span></div>
      </div>
  </Slide>,
];
