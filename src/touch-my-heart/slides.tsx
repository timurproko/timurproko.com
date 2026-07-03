/**
 * Touch My Heart — deck content.
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
  storageKey: 'touch-my-heart-deck-position',
  darkSlides: [0, 11],
  tag: 'Trend',
  deckTitle: 'Touch My Heart',
  fx: [initHeroCanvas, initCover3d],
};

export const slides = [
  <CoverSlide
    key="cover"
    label="01 Cover"
    notes="Welcome. Touch My Heart is an XR experience for Magic Leap that takes users deep inside the human heart. I led experience design and technical art on the project."
    kicker="XR Experience · Magic Leap"
    title={<>Touch<br />My Heart</>}
    description="3D/UX Design · Technical Art · XR Development"
    art={<CoverArt3D />}
  />,

  <Slide
    key="02-about"
    label="02 About"
    notes="Touch My Heart is an immersive AR application on Magic Leap — a realistic, educational encounter with the heart's anatomy and the sounds of various diseases. Three pillars: the AR glasses, haptics, and medically accurate visualization and sound."
    tag="About · Project"
    headline="Inside the human heart"
    subhead={<>A cutting-edge XR experience that takes users deep into the inner workings of the human heart — a realistic, educational encounter with its anatomy and the sound of various diseases.</>}
  >
    <div className="about-content">
    
        <div className="pillar-grid">
          <div className="pill"><div className="pill-illo"><svg className="illo-svg" viewBox="0 0 92 60" aria-hidden="true"><path className="stroke faint" d="M12 20 Q46 4 80 20" /><path className="stroke" d="M10 34 h72 a4 4 0 0 1 4 4 v6 a10 10 0 0 1 -10 10 H16 a10 10 0 0 1 -10 -10 v-6 a4 4 0 0 1 4 -4 Z" /><path className="stroke faint" d="M46 34 V54" /><circle className="accent fill" cx="27" cy="44" r="7" /><circle className="accent fill" cx="65" cy="44" r="7" /></svg></div><div className="num">/01</div><h4>Magic Leap AR glasses</h4><div className="subhead">Spatial anatomy rendered in the user's real environment.</div><div className="tags"><span className="tag">AR</span><span className="tag">Spatial</span></div></div>
          <div className="pill"><div className="pill-illo"><svg className="illo-svg" viewBox="0 0 76 60" aria-hidden="true"><path className="stroke" d="M38 58 V34" /><circle className="accent fill" cx="38" cy="28" r="6" /><path className="accent" d="M24 27 a14 14 0 0 1 28 0" /><path className="accent faint" d="M16 26 a22 22 0 0 1 44 0" /><path className="accent faint" d="M8 25 a30 30 0 0 1 60 0" /></svg></div><div className="num">/02</div><h4>Ultraleap haptics</h4><div className="subhead">Mid-air touch — feel the heartbeat with your bare hands.</div><div className="tags"><span className="tag">Haptics</span><span className="tag">Hand tracking</span></div></div>
          <div className="pill"><div className="pill-illo"><svg className="illo-svg" viewBox="0 0 78 60" aria-hidden="true"><path className="stroke fill" d="M39 53 C15 37 9 24 18 15 C24 9 33 11 39 20 C45 11 54 9 60 15 C69 24 63 37 39 53 Z" /><path className="accent" d="M12 34 H27 l4 -11 5 22 4 -15 3 8 H66" /></svg></div><div className="num">/03</div><h4>Accurate visuals &amp; sound</h4><div className="subhead">Medically correct anatomy paired with true disease sounds.</div><div className="tags"><span className="tag">Medical</span><span className="tag">Audio</span></div></div>
        </div>
      </div>
  </Slide>,

  <Slide
    key="03-design-research"
    label="03 Design Research"
    notes="From the beginning my role was to research the project boundaries — understand every aspect, gather early ideas from the team and stakeholders, and quickly conceptualize the design direction."
    tag="Process · Design Research"
    headline="Mapping the whole problem"
  >
    <div className="split-media">
        <div className="col-text">
          <p className="deck-subhead" style={{ marginTop: '0' }}>From day one my role was to understand every dimension of the project — and turn scattered inputs into a clear design direction, fast.</p>
          <ul className="arrow-list tight" style={{ marginTop: '8px' }}>
            <li>Mapped the project boundaries and constraints</li>
            <li>Gathered early ideas from team and stakeholders</li>
            <li>Conceptualized the design direction quickly</li>
          </ul>
        </div>
        <div className="col-media"><div className="media-ph parallax-media" aria-label="Research boards and mood image"><img src="assets/research.png" alt="Research boards and mood references for Touch My Heart" loading="lazy" decoding="async" draggable={false} /></div></div>
      </div>
  </Slide>,

  <Slide
    key="04-platforms"
    label="04 Platforms"
    notes="To stay current with the XR industry I surveyed design guidelines across the major platforms. Apple Vision Pro had just been announced with detailed design material, so it became a primary reference. Magic Leap was our delivery target."
    tag="Process · Platforms Research"
    headline="Learning from XR platforms"
    subhead={<>I studied design guidelines across the major platforms. With Apple Vision Pro freshly announced, its interaction patterns became a primary reference point.</>}
  >
    <div className="platforms-content">
    
        <div className="pillar-grid platform-grid">
          <div className="pill"><div className="device-preview"><img src="assets/apple-vision.webp" alt="Apple Vision Pro device preview" loading="lazy" /></div><div className="num" style={{ color: '#c81d3f' }}>REFERENCE</div><h4>Apple Vision Pro</h4><div className="subhead">Freshly announced, richly documented interaction model.</div></div>
          <div className="pill"><div className="device-preview"><img src="assets/meta-quest.webp" alt="Meta Quest device preview" loading="lazy" /></div><div className="num" style={{ color: '#c81d3f' }}>REFERENCE</div><h4>Meta Quest</h4><div className="subhead">Mature hand-tracking and comfort guidelines.</div></div>
          <div className="pill"><div className="device-preview"><img src="assets/microsoft-hololens2.webp" alt="Microsoft HoloLens 2 device preview" loading="lazy" /></div><div className="num" style={{ color: '#c81d3f' }}>REFERENCE</div><h4>Microsoft HoloLens</h4><div className="subhead">Enterprise-grade spatial UX patterns.</div></div>
          <div className="pill" style={{ borderColor: '#c81d3f', background: 'color-mix(in oklab,#c81d3f,transparent 94%)' }}><div className="device-preview"><img src="assets/magic-leap2.webp" alt="Magic Leap 2 device preview" loading="lazy" /></div><div className="num" style={{ color: '#c81d3f' }}>TARGET</div><h4>Magic Leap</h4><div className="subhead">Our delivery device — the design had to fit its optics.</div></div>
        </div>
      </div>
  </Slide>,

  <Slide
    key="05-medical-research"
    label="05 Medical Research"
    notes="My role was to generate precise, medically-correct 3D representations of the two most prevalent heart diseases — creating shapes and animations for aortic stenosis and atrial fibrillation."
    tag="Process · Medical Research"
    headline="Two conditions, medically accurate"
    subhead={<>I produced precise 3D representations — shape, motion and sound — for the two most prevalent heart conditions.</>}
  >
    <div className="medical-content">
    
        <div className="cond-grid">
          <div className="cond-card"><div className="cond-media"><svg className="cond-svg" viewBox="0 0 320 220" role="img" aria-label="Aortic valve opening and closing"><circle className="ln" cx="160" cy="122" r="80" strokeWidth="1.4" opacity="0.28" /><circle className="ln" cx="160" cy="122" r="72" strokeWidth="3" opacity="0.9" /><g className="av-closed"><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 78%)" strokeWidth="2.6" d="M160 50 A72 72 0 0 0 98 158 Q 120 142 160 122 Q 168 84 160 50 Z" /><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 78%)" strokeWidth="2.6" d="M98 158 A72 72 0 0 0 222 158 Q 190 152 160 122 Q 130 152 98 158 Z" /><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 78%)" strokeWidth="2.6" d="M222 158 A72 72 0 0 0 160 50 Q 152 84 160 122 Q 200 142 222 158 Z" /></g><g className="av-open"><path className="av-lumen" d="M160 94 L192 140 L128 140 Z" /><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 80%)" strokeWidth="2.6" d="M160 50 A72 72 0 0 0 98 158 Q 112 152 128 140 Q 150 114 160 94 Q 164 72 160 50 Z" /><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 80%)" strokeWidth="2.6" d="M98 158 A72 72 0 0 0 222 158 Q 208 152 192 140 Q 160 130 128 140 Q 112 152 98 158 Z" /><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 80%)" strokeWidth="2.6" d="M222 158 A72 72 0 0 0 160 50 Q 156 72 160 94 Q 172 114 192 140 Q 208 152 222 158 Z" /></g></svg></div><div className="cond-meta"><span className="cond-num">Condition 01</span><h3>Aortic Stenosis</h3><p>A narrowed aortic valve — modeled with its characteristic restricted flow and murmur.</p></div></div>
          <div className="cond-card"><div className="cond-media"><svg className="cond-svg" viewBox="0 0 320 220" role="img" aria-label="Fibrillating heart with an irregular ECG rhythm"><g className="af-heart"><path className="ln" fill="color-mix(in oklab, var(--accent), transparent 80%)" strokeWidth="3" d="M160 130 C 116 98, 92 72, 116 50 C 132 36, 152 42, 160 60 C 168 42, 188 36, 204 50 C 228 72, 204 98, 160 130 Z" /></g><path className="ln" strokeWidth="2" opacity="0.24" d="M24 182 c4 -4 8 4 12 0 c4 -4 8 4 12 0 l3 2 3 -30 3 40 3 -12 c5 4 9 -2 14 0 c4 -3 7 3 11 0 l3 1 3 -26 3 34 3 -9 c6 4 10 -3 16 0 c6 4 10 -3 16 0 c5 3 9 -2 13 0 l3 2 3 -34 3 44 3 -12 c4 3 8 -2 12 0 l3 1 3 -22 3 30 3 -8 c6 4 11 -3 17 0 c6 4 11 -3 17 0 l3 2 3 -30 3 40 3 -11 c5 3 10 -2 15 0 c6 4 10 -3 16 0 l3 1 3 -26 3 34 3 -9 c6 4 11 -3 17 0 L296 182" /><path className="ln af-ecg-lit" strokeWidth="2.8" d="M24 182 c4 -4 8 4 12 0 c4 -4 8 4 12 0 l3 2 3 -30 3 40 3 -12 c5 4 9 -2 14 0 c4 -3 7 3 11 0 l3 1 3 -26 3 34 3 -9 c6 4 10 -3 16 0 c6 4 10 -3 16 0 c5 3 9 -2 13 0 l3 2 3 -34 3 44 3 -12 c4 3 8 -2 12 0 l3 1 3 -22 3 30 3 -8 c6 4 11 -3 17 0 c6 4 11 -3 17 0 l3 2 3 -30 3 40 3 -11 c5 3 10 -2 15 0 c6 4 10 -3 16 0 l3 1 3 -26 3 34 3 -9 c6 4 11 -3 17 0 L296 182" /></svg></div><div className="cond-meta"><span className="cond-num">Condition 02</span><h3>Atrial Fibrillation</h3><p>An irregular, rapid rhythm — captured in both the motion and the sound of the beat.</p></div></div>
        </div>
      </div>
  </Slide>,

  <Slide
    key="06-ux-concept"
    label="06 UX Concept"
    notes="I focused on a concept of user experience that transcends the technology and encompasses the full spectrum of human interaction within the application."
    tag="Design · Experience Concept"
    headline="Beyond the technology"
    subhead={<>The concept had to transcend the hardware — designing for the full spectrum of human interaction inside the application.</>}
  >
    <ul className="arrow-list tight">
        <li>Human-centered interaction, not device-centered</li>
        <li>Natural gestures paired with haptic feedback</li>
        <li>An experience that teaches through presence</li>
      </ul>
  </Slide>,

  <Slide
    key="07-prototype"
    label="07 Prototype"
    notes="I generated a clickable prototype of the experience to ensure comprehensive collaboration among team members and stakeholders — expediting collaboration and development, and enabling prompt collection of user feedback for a better final product."
    tag="Design · XR Prototype"
    headline="A clickable XR prototype"
  >
    <div className="split-media">
        <div className="col-text">
          <p className="deck-subhead" style={{ marginTop: '0' }}>A prototype of the forthcoming experience aligned the whole team early — and turned feedback into a better final product.</p>
          <ul className="arrow-list tight" style={{ marginTop: '8px' }}>
            <li>Aligns team and stakeholders early</li>
            <li>Speeds up collaboration and development</li>
            <li>Collects user feedback before the build</li>
          </ul>
        </div>
        <div className="col-media"><div className="media-ph parallax-media prototype-media" aria-label="Clickable XR prototype flow"><img src="assets/prototype.png?v=2" alt="Clickable XR prototype flow and Figma screens for Touch My Heart" loading="lazy" decoding="async" draggable={false} /></div></div>
      </div>
  </Slide>,

  <Slide
    key="08-modelling"
    label="08 Modelling"
    notes="I adjusted a heart model for precise animation of different heart diseases. Using a non-destructive procedural method, I achieved both realism and adaptability for frequent refinements — medical visualization meeting advanced 3D modeling."
    tag="3D · Procedural Modelling"
    headline="Realistic, yet adjustable"
  >
    <div className="split-media">
        <div className="col-text">
          <p className="deck-subhead" style={{ marginTop: '0' }}>A non-destructive procedural workflow drives the heart model — realistic enough for medicine, flexible enough to refine each disease animation without rebuilding.</p>
        </div>
        <div className="col-media"><div className="media-ph" aria-label="Procedural heart wireframe modelling video"><video src="assets/wireframe.mp4" muted loop playsInline preload="metadata"></video></div></div>
      </div>
  </Slide>,

  <Slide
    key="09-heart-states"
    label="09 Heart States"
    notes="Three states of the same procedural model: a normal heart, aortic stenosis, and atrial fibrillation — each with its own shape, motion and sound."
    tag="3D · Heart States"
    headline="One model, three conditions"
  >
    <div className="state-grid">
        <div className="state"><div className="media-ph" aria-label="Normal heart condition video preview"><video src="assets/condition_normal.mp4" muted loop playsInline preload="metadata"></video></div><DeckItemHeading className="state-label">Normal heart</DeckItemHeading></div>
        <div className="state"><div className="media-ph" aria-label="Aortic stenosis condition video preview"><video src="assets/condition_as.mp4" muted loop playsInline preload="metadata"></video></div><DeckItemHeading className="state-label">Aortic stenosis</DeckItemHeading></div>
        <div className="state"><div className="media-ph" aria-label="Atrial fibrillation condition video preview"><video src="assets/condition_af.mp4" muted loop playsInline preload="metadata"></video></div><DeckItemHeading className="state-label">Atrial fibrillation</DeckItemHeading></div>
      </div>
  </Slide>,

  <Slide
    key="10-shading"
    label="10 Shading"
    notes="As a concluding phase I crafted procedural shader graphs to establish the final look and texture for a real-time heart model. An intriguing challenge was enabling interactive slicing of the heart across various axes."
    tag="3D · Shading &amp; Lighting"
    headline="The final look, in real time"
  >
    <div className="split-media">
        <div className="col-text">
          <p className="deck-subhead" style={{ marginTop: '0' }}>Procedural shader graphs defined the ultimate appearance and texture for real-time — including interactive slicing of the heart across any axis.</p>
        </div>
        <div className="col-media"><div className="media-ph" aria-label="Real-time rendered heart shader preview video"><video src="assets/render.mp4" muted loop playsInline preload="metadata"></video></div></div>
      </div>
  </Slide>,

  <Slide
    key="11-unity-scripting"
    label="11 Unity Scripting"
    notes="The concluding engineering phase — bringing it together in engine. Wiring interaction, slicing and real-time behaviour into the Magic Leap runtime with Ultraleap input."
    tag="Engineering · Unity"
    headline="Bringing it together in engine"
    subhead={<>Wiring interaction, slicing and real-time behaviour into the Magic Leap runtime.</>}
  >
    <ul className="arrow-list tight">
        <li>Interactive slicing across arbitrary axes</li>
        <li>Real-time disease animation states</li>
        <li>Magic Leap and Ultraleap input integration</li>
      </ul>
  </Slide>,

  <Slide
    key="12-end"
    label="12 End"
    notes="Thank you. Happy to walk through any part of the process — from medical research to procedural modeling, shading, or the Unity runtime."
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
