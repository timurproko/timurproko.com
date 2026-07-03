/**
 * CorelDRAW for macOS — deck content.
 * This file is CONTENT ONLY: edit text, media and slide order here.
 * Layout and behavior come from src/deck and src/components.
 * (Generated from the legacy page markup; refactor slides into
 * src/components primitives incrementally as they get edited.)
 */
import { CSSProperties } from 'react';
import { DeckConfig } from '../deck/Deck';
import { Slide } from '../deck/Slide';
import { CoverArt3D, CoverSlide, DeckList } from '../components';
import { initHeroCanvas } from './hero.js';

export const deckConfig: DeckConfig = {
  storageKey: 'coreldraw-macos-deck-position',
  darkSlides: [0, 3, 7, 12, 17, 19],
  tag: 'Overview',
  deckTitle: 'CorelDRAW for macOS',
  fx: [initHeroCanvas],
};

export const slides = [
  <CoverSlide
    key="cover"
    label="01 Cover"
    notes="A UX case study on bringing CorelDRAW Graphics Suite to macOS — balancing business goals, user needs and technical reality, staged across three releases."
    kicker="UX Case Study · Graphics Suite"
    title={<>CorelDRAW<br />for macOS</>}
    description="DESIGN STRATEGY · UX/UI DESIGN"
    art={
      <CoverArt3D>
      <svg className="cover-balloon" viewBox="0 0 300 400" role="img" aria-label="Hot-air balloon">
        <defs>
          <linearGradient id="gBody" x1="0.28" y1="0.02" x2="0.66" y2="1">
            <stop offset="0" stopColor="#0a4a2b" />
            <stop offset="0.26" stopColor="#0f8347" />
            <stop offset="0.54" stopColor="#1cb463" />
            <stop offset="0.8" stopColor="#3fe084" />
            <stop offset="1" stopColor="#9bf7c6" />
          </linearGradient>
          <radialGradient id="gShine" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gBasket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22c55e" />
            <stop offset="1" stopColor="#8ff3bf" />
          </linearGradient>
          <clipPath id="balloonClip"><path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" /></clipPath>
        </defs>
        {/* body */}
        <path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" fill="url(#gBody)" />
        {/* glossy highlights, clipped to the canopy */}
        <g clipPath="url(#balloonClip)">
          <ellipse cx="118" cy="132" rx="62" ry="112" transform="rotate(-24 118 132)" fill="url(#gShine)" />
        </g>
        {/* subtle edge */}
        <path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" fill="none" stroke="rgba(5,40,22,0.28)" strokeWidth="1.4" />
        {/* ropes + basket */}
        <path d="M146 336 L138 360 M154 336 L162 360" stroke="rgba(200,250,220,0.5)" strokeWidth="2.2" fill="none" />
        <path d="M135 360 L165 360 L171 390 L129 390 Z" fill="url(#gBasket)" stroke="rgba(6,45,26,0.25)" strokeWidth="1" />
        <ellipse cx="150" cy="363" rx="15" ry="3" fill="#ffffff" opacity="0.28" />
      </svg>
      </CoverArt3D>
    }
  />,

  <Slide
    key="02-ux-fusion"
    label="02 UX Fusion"
    notes="Good UX sits where business goals, user needs and technical ability overlap. We design the macOS product for that intersection — not for any single force."
    className="slide-no-scroll"
    tag="Framing · What is UX"
    headline="UX is a fusion of three forces"
    subhead={<>A successful macOS product lives where business goals, real user needs and technical ability overlap — not where any one of them wins alone.</>}
  >
    <div className="pillars-venn">
        <svg viewBox="0 0 940 660" role="img" aria-label="UX as the intersection of Business, Users and Technology">
          <g className="venn-rings">
            <circle cx="470" cy="250" r="225" fill="#4fc487" fillOpacity="0.62" />
            <circle cx="340" cy="440" r="225" fill="#2fae64" fillOpacity="0.62" />
            <circle cx="600" cy="440" r="225" fill="#7ad49f" fillOpacity="0.62" />
          </g>
          <circle className="venn-core-circle" cx="470" cy="378" r="104" fill="#0d7a3b" />
          <g className="venn-label">
            <text x="470" y="150" textAnchor="middle">Business</text>
            <text x="238" y="486" textAnchor="middle">Users</text>
            <text x="702" y="486" textAnchor="middle">Tech</text>
          </g>
          <text className="venn-core" x="470" y="378" textAnchor="middle" dominantBaseline="central">UX</text>
        </svg>
      </div>
  </Slide>,

  <Slide
    key="03-challenge"
    label="03 Challenge"
    notes="The core challenge: turn today's friction into a loyal Mac user, without ever dropping below Corel's design standards."
    tag="Framing · The Challenge"
    headline="The Corel macOS UX challenge"
    subhead={<>Turn today's friction into a loyal Mac user — without dropping below Corel's design standards along the way.</>}
  >
    <div className="two-col">
        <div>
          <h3>Today's friction</h3>
          <ul className="arrow-list tight">
            <li>Not-loyal, hard-to-win users</li>
            <li>Heavy technical debt</li>
            <li>Tool complexity &amp; feature cascade</li>
            <li>Missing native macOS features</li>
          </ul>
        </div>
        <div>
          <h3>Target outcome</h3>
          <ul className="arrow-list tight">
            <li>A loyal, returning Mac user</li>
            <li>A native, modern experience</li>
            <li>A unified, maintainable product</li>
            <li>Room to follow UX trends</li>
          </ul>
        </div>
      </div>
  </Slide>,

  <Slide
    key="04-business"
    label="04 Business"
    notes="The business lens: research the market, set standards, and sequence the work so progress ships without compromising design quality."
    className="slide-section dark slide-no-scroll"
    tag="Research · Business"
  >
    <div className="section-num">Lens 01 — Business</div>
      <h2 className="section-title">Business</h2>
      <p className="section-sub">Progress over perfection — but never below design standards.</p>
  </Slide>,

  <Slide
    key="05-milestones"
    label="05 Milestones"
    notes="Three phases move Corel from resolving technical debt in 2017 to a genuinely macOS-native experience by 2019."
    tag="Business · Strategy"
    headline="Strategic milestones"
    subhead={<>Three phases move Corel from resolving technical debt to a genuinely macOS-native experience.</>}
  >
    <div className="pillar-grid">
        <div className="pill"><span className="num">Phase 1</span><h4>Prepare the MVP</h4><p className="subhead">Resolve technical debt and ship the minimum viable set of macOS features.</p><div className="pill-tags"><span>Technical debt</span><span>Min macOS features</span><span>macOS MVP</span></div></div>
        <div className="pill"><span className="num">Phase 2</span><h4>Improve the experience</h4><p className="subhead">Toolbars, dockers and native support; simplify features cross-platform and start user research.</p><div className="pill-tags"><span>Toolbar &amp; dockers</span><span>Native support</span><span>New audience</span></div></div>
        <div className="pill"><span className="num">Phase 3</span><h4>Go fully native</h4><p className="subhead">Support all native features including Touch Bar, target key audiences, and introduce context-sensitive, real-time UX.</p><div className="pill-tags"><span>Touch Bar</span><span>Real-time preview</span><span>Context-sensitive</span></div></div>
      </div>
  </Slide>,

  <Slide
    key="06-timeline"
    label="06 Timeline"
    notes="Separate Windows and macOS tracks converge on a shared core UX team and a unified release by 2019. In Jan 2017 we are at Phase 1."
    tag="Business · Roadmap"
    headline="Unifying the roadmap"
    subhead={<>Separate Windows and macOS tracks converge on a shared core UX team and a unified release.</>}
  >
    <DeckList
      variant="rows"
      items={[
        { index: 'P1', label: 'Resolve technical debt, prepare the macOS MVP' },
        { index: 'P2', label: 'Ship Windows & macOS releases, begin cross-platform simplification' },
        { index: 'P3', label: 'Unified Windows / macOS release led by a shared core UX team' },
      ]}
    />
  </Slide>,

  <Slide
    key="07-paradigm"
    label="07 Paradigm"
    notes="Each phase moves the product from feature-driven thinking toward a user-centered one."
    tag="Business · Mindset"
    headline="A shift in paradigm"
    subhead={<>Each phase moves the product further from feature-driven thinking toward a user-centered one.</>}
  >
    <div className="two-col">
        <div>
          <h3>From — feature-driven</h3>
          <ul className="arrow-list tight">
            <li>Ship parity with Windows</li>
            <li>Expose every capability</li>
            <li>Optimise for power users</li>
          </ul>
        </div>
        <div>
          <h3>To — user-centered</h3>
          <ul className="arrow-list tight">
            <li>Start from user goals</li>
            <li>Progressive disclosure</li>
            <li>Simplify for every audience</li>
          </ul>
        </div>
      </div>
  </Slide>,

  <Slide
    key="08-users"
    label="08 Users"
    notes="The users lens: understand who uses Corel, why engagement is weak, and what would earn their loyalty."
    className="slide-section dark slide-no-scroll"
    tag="Research · Users"
  >
    <div className="section-num">Lens 02 — Users</div>
      <h2 className="section-title">Users</h2>
      <p className="section-sub">Progress over perfection — but never below design standards.</p>
  </Slide>,

  <Slide
    key="09-stats"
    label="09 Stats"
    notes="Research highlights: 40% are lost on first engagement, 85% learn by trial and error, 30% find it too expensive, 21% are satisfied as-is, 12% cite bad UX."
    tag="Users · Findings"
    headline="Stats that set the brief"
    subhead={<>Where CorelDRAW loses people — and how they cope when they stay.</>}
  >
    <div className="two-col">
        <div>
          <div className="stat-number">40%</div>
          <p className="stat-caption">of prospects are lost on the very first engagement</p>
        </div>
        <div>
          <h3>The rest of the picture</h3>
          <ul className="arrow-list tight">
            <li><span><strong style={{ color: 'var(--accent)', fontWeight: '700' } as CSSProperties}>85%</strong> — learn by trial and error</span></li>
            <li><span><strong style={{ color: 'var(--accent)', fontWeight: '700' } as CSSProperties}>30%</strong> — say it is too expensive</span></li>
            <li><span><strong style={{ color: 'var(--accent)', fontWeight: '700' } as CSSProperties}>21%</strong> — are satisfied as-is</span></li>
            <li><span><strong style={{ color: 'var(--accent)', fontWeight: '700' } as CSSProperties}>12%</strong> — cite bad UX</span></li>
          </ul>
        </div>
      </div>
  </Slide>,

  <Slide
    key="10-audience"
    label="10 Audience"
    notes="CorelDRAW serves occasional business users, hobbyists and full-time professionals — each with different goals, skill and output."
    tag="Users · Segments"
    headline="A highly diversified audience"
    subhead={<>From occasional business users to full-time professionals — each with different goals and skill.</>}
  >
    <div className="pillar-grid">
        <div className="pill"><span className="num">Segment 01</span><h4>Occasional business</h4><p className="subhead">Needs quick, correct results for everyday business collateral.</p><div className="pill-tags"><span>Business cards</span><span>Signs</span><span>Newsletters</span></div></div>
        <div className="pill"><span className="num">Segment 02</span><h4>Hobbyist &amp; graphic</h4><p className="subhead">Creates occasionally; values approachability over depth.</p><div className="pill-tags"><span>Greeting cards</span><span>Photos</span><span>Illustration</span></div></div>
        <div className="pill"><span className="num">Segment 03</span><h4>Professional</h4><p className="subhead">Depends on Corel daily across print, web and technical work.</p><div className="pill-tags"><span>Logos &amp; brochures</span><span>Technical &amp; CAD</span><span>Apparel &amp; web</span></div></div>
      </div>
  </Slide>,

  <Slide
    key="11-personas"
    label="11 Personas"
    notes="Loyal users are ready to move to macOS for different reasons: familiarity (Peter), a stable ecosystem (Joyce), or raw performance and integration (Burt)."
    tag="Users · Personas"
    headline="Loyal users, three ways"
    subhead={<>Loyal users move to macOS for different reasons — familiarity, a stable ecosystem, or raw performance.</>}
  >
    <div className="pillar-grid">
        <div className="pill"><span className="num">Peter · 32</span><h4>Freelance designer</h4><p className="subhead">Design-educated and artistic. Recently on macOS because "Mac is for designers." Wants Windows familiarity, better performance and native UI.</p><div className="pill-tags"><span>Price: sensitive</span><span>Reuse license</span></div></div>
        <div className="pill"><span className="num">Joyce · 45</span><h4>Layout &amp; small studio</h4><p className="subhead">No design education; leads a few designers. Moving her workflow to macOS for a stable, virus-free ecosystem. Slow to learn new tools.</p><div className="pill-tags"><span>Price: sensitive</span><span>Group license</span></div></div>
        <div className="pill"><span className="num">Burt · 57</span><h4>Sign maker</h4><p className="subhead">Technical and mature in his tools. Considers macOS for hardware integration and performance — Corel is one link in his chain.</p><div className="pill-tags"><span>Price: less sensitive</span><span>Integration</span></div></div>
      </div>
  </Slide>,

  <Slide
    key="12-conclusions"
    label="12 Conclusions"
    notes="Clear problems to solve — expensive, weak first-run, fuzzy audience — plus a clear signal that we need to keep researching with surveys and feature analysis."
    tag="Users · Conclusions"
    headline="What the research told us"
    subhead={<>Clear problems to solve — and a clear signal that we need to keep researching.</>}
  >
    <div className="two-col">
        <div>
          <h3>What we know</h3>
          <ul className="arrow-list tight">
            <li>The tool is seen as expensive</li>
            <li>Weak first-run engagement</li>
            <li>Fuzzy, hard-to-target audience</li>
          </ul>
        </div>
        <div>
          <h3>What we will do next</h3>
          <ul className="arrow-list tight">
            <li>Qualitative user research</li>
            <li>Surveys at scale</li>
            <li>Feature-by-feature analysis</li>
          </ul>
        </div>
      </div>
  </Slide>,

  <Slide
    key="13-tech"
    label="13 Tech"
    notes="The tech lens: a shared codebase, heavy debt and framework limits mean we sequence carefully rather than expecting dramatic change overnight."
    className="slide-section dark slide-no-scroll"
    tag="Research · Tech"
  >
    <div className="section-num">Lens 03 — Tech</div>
      <h2 className="section-title">Tech</h2>
      <p className="section-sub">Progress over perfection — but never below design standards.</p>
  </Slide>,

  <Slide
    key="14-tech-challenges"
    label="14 Tech Challenges"
    notes="A unified source, heavy debt and Qt limits mean we cannot expect dramatic change overnight — so we sequence carefully."
    tag="Tech · Reality"
    headline="The technical reality"
    subhead={<>A shared codebase and heavy debt mean we can't expect dramatic change overnight — so we sequence carefully.</>}
  >
    <ul className="arrow-list tight">
        <li>One unified source code across platforms</li>
        <li>Significant accumulated technical debt</li>
        <li>Framework limitations (Qt)</li>
        <li>2018 feature set still to land</li>
        <li>macOS-specific features on top of all of it</li>
      </ul>
  </Slide>,

  <Slide
    key="15-cross-platform"
    label="15 Cross-Platform"
    notes="Two ways to handle Windows and macOS from one core: unify for a familiar, cheaper-to-support experience, or differentiate for an OS-optimised one. Each has trade-offs."
    tag="Tech · Strategy"
    headline="Unify or differentiate?"
    subhead={<>Two ways to handle Windows and macOS from one core — each with real trade-offs.</>}
  >
    <div className="ui-workflow-grid">
        <div className="ui-lane">
          <span className="lane-label">Option A</span>
          <h3>Cross-platform unification</h3>
          <p className="lane-sub">One shared experience on every platform.</p>
          <div className="ui-items">
            <div className="ui-item">Familiar to users on any platform</div>
            <div className="ui-item">Easier to develop and support</div>
          </div>
          <p className="ui-note">Trade-off — more effort to unify the design.</p>
        </div>
        <div className="ui-lane">
          <span className="lane-label">Option B</span>
          <h3>Platform differentiation</h3>
          <p className="lane-sub">Each OS gets a tailored experience.</p>
          <div className="ui-items">
            <div className="ui-item">Optimised for each operating system</div>
            <div className="ui-item">Can target different audiences</div>
          </div>
          <p className="ui-note">Trade-off — more to build, and poorer for shared audiences.</p>
        </div>
      </div>
  </Slide>,

  <Slide
    key="16-macos-principles"
    label="16 macOS Principles"
    notes="The principles we hold every macOS decision against: real-time preview, performance, clear structure, maximise context, progressive disclosure and consistency."
    tag="Tech · Native Experience"
    headline="What &quot;feels like macOS&quot; means"
    subhead={<>The principles we hold every macOS decision against.</>}
  >
    <div className="pillar-grid">
        <div className="pill"><span className="num">01</span><h4>Real-time preview</h4><p className="subhead">Show the end result as properties change.</p></div>
        <div className="pill"><span className="num">02</span><h4>Performance</h4><p className="subhead">Exploit the latest macOS and Apple hardware.</p></div>
        <div className="pill"><span className="num">03</span><h4>Clear structure</h4><p className="subhead">Make relationships between views and controls obvious.</p></div>
        <div className="pill"><span className="num">04</span><h4>Maximise context</h4><p className="subhead">Avoid feature cascade and irrelevant controls.</p></div>
        <div className="pill"><span className="num">05</span><h4>Progressive disclosure</h4><p className="subhead">Reveal complexity only when it is needed.</p></div>
        <div className="pill"><span className="num">06</span><h4>Consistency</h4><p className="subhead">Let users transfer skills from app to app.</p></div>
      </div>
  </Slide>,

  <Slide
    key="17-architecture"
    label="17 Architecture"
    notes="Re-map today's Windows-first UI structure onto common macOS UI architecture: single menu bar, inspectors, toolbars and native dialogs."
    tag="Tech · UI Architecture"
    headline="From Corel UI to macOS UI"
    subhead={<>Re-map today's Windows-first structure onto common macOS UI architecture.</>}
  >
    <div className="architecture-tabs" aria-label="UI architecture comparison">
        <input type="radio" name="architecture-view" id="arch-macos" checked tabIndex={-1} onKeyDown={(event) => { if (event.key.startsWith('Arrow')) event.preventDefault(); }} />
        <input type="radio" name="architecture-view" id="arch-corel" tabIndex={-1} onKeyDown={(event) => { if (event.key.startsWith('Arrow')) event.preventDefault(); }} />
        <div className="architecture-tab-controls" role="tablist" aria-label="Switch architecture graph">
          <label htmlFor="arch-macos" role="tab">macOS UI</label>
          <label htmlFor="arch-corel" role="tab">Corel UI</label>
        </div>
        <div className="architecture-stage">
          <div className="architecture-panel corel" role="tabpanel" aria-label="Corel UI architecture graph">
            <div className="media-ph">
              <svg className="architecture-graph" viewBox="0 0 725 436" role="img" aria-labelledby="corel-arch-title">
                <title id="corel-arch-title">Corel UI architecture current Windows structure</title>
                <defs><clipPath id="corel-arch-clip"><rect x="0.5" y="0.5" width="724" height="435" rx="16" ry="16" /></clipPath></defs>
                <rect className="frame" x="0.5" y="0.5" width="724" height="435" rx="16" ry="16" />
                <g clipPath="url(#corel-arch-clip)">
                <line className="line" x1="0" y1="19" x2="725" y2="19" />
                <line className="line" x1="0" y1="50" x2="725" y2="50" />
                <line className="line" x1="0" y1="81" x2="725" y2="81" />
                <line className="line" x1="0" y1="374" x2="725" y2="374" />
                <line className="line" x1="0" y1="405" x2="725" y2="405" />
                <line className="line" x1="42" y1="81" x2="42" y2="374" />
                <line className="soft-line" x1="462" y1="81" x2="462" y2="374" />
                <line className="line" x1="684" y1="81" x2="684" y2="374" />
                <text x="362.5" y="10">Menu bar</text>
                <text x="362.5" y="35">Tool bar</text>
                <text x="362.5" y="66">Property bar</text>
                <text className="vertical" x="22" y="228">Toolbox</text>
                <text x="252" y="229">Working Area</text>
                <text x="573" y="229">Docker</text>
                <text className="vertical" x="704" y="207">Color Panel</text>
                <text x="362.5" y="390">Status Bar</text>
                <text x="362.5" y="421">Document Palette</text>
                </g>
              </svg>
            </div>
          </div>
          <div className="architecture-panel macos" role="tabpanel" aria-label="macOS UI architecture graph">
            <div className="media-ph">
              <svg className="architecture-graph" viewBox="0 0 725 436" role="img" aria-labelledby="macos-arch-title">
                <title id="macos-arch-title">Common macOS UI architecture target structure</title>
                <defs><clipPath id="macos-arch-clip"><rect x="0.5" y="0.5" width="724" height="435" rx="16" ry="16" /></clipPath></defs>
                <rect className="frame" x="0.5" y="0.5" width="724" height="435" rx="16" ry="16" />
                <g clipPath="url(#macos-arch-clip)">
                <line className="line" x1="0" y1="19" x2="725" y2="19" />
                <line className="line" x1="0" y1="50" x2="725" y2="50" />
                <line className="soft-line" x1="175" y1="50" x2="175" y2="412" />
                <line className="line" x1="552" y1="50" x2="552" y2="412" />
                <line className="soft-line dash" x1="175" y1="68" x2="552" y2="68" />
                <line className="line" x1="0" y1="412" x2="725" y2="412" />
                <text x="362.5" y="10">Menu bar</text>
                <text x="362.5" y="35">Tool bar</text>
                <text x="363.5" y="60">Hierarchy Navigation (contextual)</text>
                <text x="87.5" y="206"><tspan x="87.5">Document</tspan><tspan x="87.5" dy="16">Navigation</tspan></text>
                <text x="363.5" y="213">Working Area</text>
                <text x="638.5" y="206"><tspan x="638.5">Properties</tspan><tspan x="638.5" dy="16">(contextual)</tspan></text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
  </Slide>,

  <Slide
    key="18-vision"
    label="18 Vision"
    notes="The vision: turn the strategy into a shippable macOS experience through focused design workstreams."
    className="slide-section dark slide-no-scroll"
    tag="Direction · Vision"
  >
    <div className="section-num">Direction — Vision</div>
      <h2 className="section-title">Vision</h2>
      <p className="section-sub">Progress over perfection — but never below design standards.</p>
  </Slide>,

  <Slide
    key="19-next-steps"
    label="19 Next Steps"
    notes="Four workstreams turn strategy into a shippable macOS experience: UI breakdown, cross-platform layouts, core redesign and a shared design system."
    tag="Vision · Deliverables"
    headline="Where the design work goes next"
    subhead={<>Four workstreams turn the strategy into a shippable macOS experience.</>}
  >
    <div className="pillar-grid" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
        <div className="pill"><span className="num">01</span><h4>UI breakdown</h4><p className="subhead">Audit every screen, control and flow in today's product.</p></div>
        <div className="pill"><span className="num">02</span><h4>Cross-platform layouts</h4><p className="subhead">Define shared and platform-specific layout rules.</p></div>
        <div className="pill"><span className="num">03</span><h4>Core redesign</h4><p className="subhead">Rework the core interface around macOS principles.</p></div>
        <div className="pill"><span className="num">04</span><h4>Design system</h4><p className="subhead">A reusable system to keep both platforms consistent.</p></div>
      </div>
  </Slide>,

  <Slide
    key="20-ui-breakdown"
    label="20 UI Breakdown"
    notes="The UI breakdown makes each current interface region inspectable: hover over a zone to see the design questions and simplification work attached to it."
    tag="Vision · UI Breakdown"
    headline="Interactive UI breakdown"
    subhead={<>Hover over each Corel UI region to reveal the workstream behind it.</>}
  >
    <div className="breakdown-stage">
        <svg className="breakdown-svg" viewBox="160 36 1000 524" role="img" aria-labelledby="breakdown-title breakdown-desc">
          <title id="breakdown-title">Interactive CorelDRAW UI breakdown graph</title>
          <desc id="breakdown-desc">A schematic CorelDRAW interface with hoverable regions for menu bar, tool bar, property bar, framework, document work area, dockers, tool box, colour palettes, context menus, status bar and Touch Bar.</desc>
          <defs>
            <clipPath id="breakdown-window-clip">
              <rect x="280" y="96" width="780" height="384" rx="10" />
            </clipPath>
          </defs>

          <rect className="bar" x="240" y="36" width="840" height="30" />
          <text className="ui-label" x="660" y="51">MENU BAR</text>

          <rect className="window" x="280" y="96" width="780" height="384" rx="10" />
          <g clipPath="url(#breakdown-window-clip)">
          <circle cx="302" cy="116" r="6" fill="#e6e7e8" stroke="#b8b8b8" />
          <circle cx="320" cy="116" r="6" fill="#e6e7e8" stroke="#b8b8b8" />
          <circle cx="338" cy="116" r="6" fill="#e6e7e8" stroke="#b8b8b8" />
          <text className="ui-label" x="670" y="122" style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.01em', textTransform: 'none' } as CSSProperties}>CorelDRAW</text>

          <rect className="bar" x="280" y="146" width="780" height="48" />
          <text className="ui-label" x="670" y="170">TOOL BAR</text>
          <rect className="bar" x="280" y="194" width="780" height="34" />
          <text className="ui-label" x="670" y="211">PROPERTY BAR</text>
          <rect className="panel" x="280" y="228" width="42" height="229" />
          <text className="ui-label vertical-label" x="301" y="342.5">TOOL BOX</text>
          <rect className="panel" x="322" y="228" width="548" height="229" />
          <text className="ui-label" x="596" y="342.5">DOCUMENT WORK AREA</text>
          <rect className="panel" x="870" y="228" width="150" height="229" />
          <text className="ui-label" x="945" y="342.5">DOCKERS</text>
          <rect className="panel" x="1020" y="228" width="40" height="229" />
          <text className="ui-label vertical-label" x="1040" y="342.5">COLOUR PALETTES</text>
          <rect className="bar" x="280" y="457" width="780" height="23" />
          <text className="ui-label" x="670" y="469" style={{ fontSize: '13px' }}>STATUS BAR</text>

          <rect className="panel" x="348" y="328" width="140" height="130" rx="7" />
          <text className="ui-label" x="418" y="393" style={{ fontSize: '13px' }}>CONTEXT MENUS</text>
          </g>
          <rect className="window-outline" x="280" y="96" width="780" height="384" rx="10" />
          <rect className="touch" x="280" y="510" width="780" height="34" />
          <text className="ui-label" x="670" y="527">TOUCH BAR</text>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Framework details">
            <rect className="hotspot-fill" x="280" y="96" width="780" height="384" rx="10" />
            <g className="breakdown-tip">
              <rect x="170" y="166" width="250" height="112" />
              <text className="tip-title" x="184" y="188">Framework</text>
              <text className="tip-copy" x="184" y="210"><tspan x="184">Cursors, document tabs,</tspan><tspan x="184" dy="16">dialogs, split-screen views</tspan><tspan x="184" dy="16">and multi-window behaviour.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Menu bar details">
            <rect className="hotspot-fill" x="240" y="36" width="840" height="30" />
            <g className="breakdown-tip">
              <rect x="382" y="30" width="218" height="86" />
              <text className="tip-title" x="396" y="51">Menu Bar</text>
              <text className="tip-copy" x="396" y="72"><tspan x="396">Re-organisation, renaming</tspan><tspan x="396" dy="16">and shortcut-key cleanup.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Tool bar details">
            <rect className="hotspot-fill" x="280" y="146" width="780" height="48" />
            <g className="breakdown-tip">
              <rect x="790" y="72" width="238" height="94" />
              <text className="tip-title" x="804" y="94">Tool Bar</text>
              <text className="tip-copy" x="804" y="116"><tspan x="804">Mac-oriented controls,</tspan><tspan x="804" dy="16">customisability and icon/text</tspan><tspan x="804" dy="16">standardisation.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Property bar details">
            <rect className="hotspot-fill" x="280" y="194" width="780" height="34" />
            <g className="breakdown-tip">
              <rect x="450" y="238" width="250" height="94" />
              <text className="tip-title" x="464" y="260">Property Bar</text>
              <text className="tip-copy" x="464" y="282"><tspan x="464">Advanced drop-downs,</tspan><tspan x="464" dy="16">context sensitivity and</tspan><tspan x="464" dy="16">simplification.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Document work area details">
            <rect className="hotspot-fill" x="322" y="228" width="548" height="229" />
            <g className="breakdown-tip">
              <rect x="170" y="306" width="238" height="96" />
              <text className="tip-title" x="184" y="328">Document Work Area</text>
              <text className="tip-copy" x="184" y="350"><tspan x="184">Drag and drop, input gestures</tspan><tspan x="184" dy="16">and real-time previews.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Docker framework and dockers details">
            <rect className="hotspot-fill" x="870" y="228" width="150" height="229" />
            <g className="breakdown-tip">
              <rect x="900" y="164" width="246" height="112" />
              <text className="tip-title" x="914" y="186">Dockers</text>
              <text className="tip-copy" x="914" y="208"><tspan x="914">Tabs, freeform docking,</tspan><tspan x="914" dy="16">show/hide, consolidation and</tspan><tspan x="914" dy="16">context-sensitive controls.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Tool box details">
            <rect className="hotspot-fill" x="280" y="228" width="42" height="229" />
            <g className="breakdown-tip">
              <rect x="170" y="340" width="224" height="80" />
              <text className="tip-title" x="184" y="362">Tool Box</text>
              <text className="tip-copy" x="184" y="384"><tspan x="184">Tool consolidation, grouping</tspan><tspan x="184" dy="16">and customisability.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Context menus details">
            <rect className="hotspot-fill" x="348" y="328" width="140" height="130" rx="7" />
            <g className="breakdown-tip">
              <rect x="500" y="384" width="236" height="64" />
              <text className="tip-title" x="514" y="406">Context Menus</text>
              <text className="tip-copy" x="514" y="428">Basic transliteration and simplification.</text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Colour palettes details">
            <rect className="hotspot-fill" x="1020" y="228" width="40" height="229" />
            <g className="breakdown-tip">
              <rect x="900" y="352" width="218" height="86" />
              <text className="tip-title" x="914" y="374">Colour Palettes</text>
              <text className="tip-copy" x="914" y="396"><tspan x="914">Basic transliteration,</tspan><tspan x="914" dy="16">simplification and standards.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Status bar details">
            <rect className="hotspot-fill" x="280" y="457" width="780" height="23" />
            <g className="breakdown-tip">
              <rect x="900" y="400" width="222" height="72" />
              <text className="tip-title" x="914" y="422">Status Bar</text>
              <text className="tip-copy" x="914" y="444"><tspan x="914">Basic transliteration,</tspan><tspan x="914" dy="16">simplification and standards.</tspan></text>
            </g>
          </g>

          <g className="breakdown-hotspot" tabIndex={0} aria-label="Touch Bar details">
            <rect className="hotspot-fill" x="280" y="510" width="780" height="34" />
            <g className="breakdown-tip">
              <rect x="830" y="430" width="218" height="50" />
              <text className="tip-title" x="844" y="452">Touch Bar</text>
              <text className="tip-copy" x="844" y="472">Avoid property-bar duplication.</text>
            </g>
          </g>
        </svg>
      </div>
  </Slide>,

  <Slide
    key="21-coreldraw-on-macos"
    label="21 CorelDRAW on macOS"
    notes="Page capture from the source presentation PDF, page 4, shown inside a preview block."
    className="slide-no-scroll pdf-page-slide"
    tag="Vision · Reference"
    headline="CorelDRAW on macOS"
  >
    <div className="pdf-preview-block">
        <img src="../assets/corel-for-mac/counterpoint-page-4.png" alt="Counterpoint presentation page 4 showing CorelDRAW on macOS full-screen interface screenshot" />
      </div>
  </Slide>,

  <Slide
    key="22-end"
    label="22 End"
    notes="Thank you — happy to dig into any lens: business strategy, user research, or the technical path to a native macOS experience."
    className="slide-zx-end slide-no-scroll dark"
    tag="The End"
    headline="Thank You"
  >
    <p className="deck-subhead zx-end-subhead">Questions?</p>
      <div className="zx-demo" aria-hidden="true">
        <div className="zx-cube-frame">
          <canvas className="zx-cube-canvas" id="zxCanvasCube" width="600" height="600"></canvas>
        </div>
      </div>
  </Slide>,
];
