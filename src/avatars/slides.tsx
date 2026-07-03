/**
 * Avatar Solutions — deck content.
 * This file is CONTENT ONLY: edit text, media and slide order here.
 * Layout and behavior come from src/deck and src/components.
 */
import { DeckConfig } from '../deck/Deck';
import { Slide } from '../deck/Slide';
import {
  ArrowList,
  CoverArt3D,
  CoverSlide,
  EndSlide,
  Img,
  Media,
  MeshCompare,
  Note,
  Pipeline,
  SplitMedia,
  Subhead,
  TagRow,
  VideoLoop,
} from '../components';
import { initHeroCanvas } from './hero.js';
import { initCover3d } from './cover3d.js';

export const deckConfig: DeckConfig = {
  storageKey: 'avatar-solutions-deck-position',
  darkSlides: [0, 2, 5, 9, 11],
  tag: 'Overview',
  deckTitle: 'Avatar Solutions',
  fx: [initHeroCanvas, initCover3d],
};

export const slides = [
  <CoverSlide
    key="cover"
    label="01 Cover"
    notes="This is the Design COE overview of our avatar creation pipeline — from body and face through to real-time animation and rendering — followed by process details and a case study."
    kicker="Digital Human Pipeline"
    title={<>Avatar<br />Solutions</>}
    description="3D Design · Technical Art · XR Development"
    art={<CoverArt3D />}
  />,

  <Slide
    key="pipeline"
    label="04 Pipeline"
    notes="Six stages take a real person to a fully rigged, real-time avatar. Body creation blocks the base shape; face reconstruction rebuilds the face in 3D; retopology cleans the geometry; cloth is designed and simulated; character design adds expressions, hair and makeup; and finally AI-driven facial animation and real-time rendering bring the avatar to life."
    tag="Overview · Pipeline"
    headline="Avatar creation pipeline"
    subhead="Six stages take a real person to a fully rigged, real-time avatar — each backed by dedicated tools."
  >
    <div className="pipeline-content">
      <Pipeline
        steps={[
          { title: 'Body Creation', desc: 'Base shape of the face and body.', tools: ['Character Creator', 'Houdini'] },
          { title: 'Face Reconstruction', desc: '3D reconstruction of the face from captured imagery.', tools: ['Reality Capture'] },
          { title: 'Mesh Retopology', desc: 'Geometry retopology and projection onto the base mesh.', tools: ['Wrap4D'] },
          { title: 'Cloth Creation', desc: 'Garment design and cloth simulation.', tools: ['Marvelous Designer'] },
          { title: 'Character Design', desc: 'Facial expressions, makeup, hair and animation.', tools: ['Character Creator', 'iClone'] },
          { title: 'Animate & Render', desc: 'AI-based facial animation and real-time rendering.', tools: ['Omniverse', 'Audio2Face'] },
        ]}
      />
    </div>
  </Slide>,

  <Slide
    key="rnd"
    label="05 R&D"
    notes="Our R&D focus: AI-driven facial animation and voice synthesis. Using facial recognition, 3D modeling, emotion analysis and text-to-speech, we produce lifelike expressions and human-like speech — the foundation for believable avatars and immersive interaction across gaming, entertainment, VR and voice assistants."
    tag="Overview · R&D Phase"
    headline={<>AI-driven face &amp; voice</>}
  >
    <SplitMedia
      text={
        <>
          <Subhead style={{ marginTop: 0 }}>
            AI-driven facial animation and voice synthesis produce lifelike facial expressions and human-like
            speech — the foundation for believable avatars and immersive interaction.
          </Subhead>
          <ArrowList
            tight
            style={{ marginTop: 8 }}
            items={[
              <>Facial recognition &amp; 3D modeling</>,
              'Emotion analysis for expression',
              'Text-to-speech voice synthesis',
            ]}
          />
          <Note style={{ marginTop: 18 }}>Applied across gaming, entertainment, virtual reality and voice assistants.</Note>
        </>
      }
      media={
        <Media ariaLabel="R&D reel — AI facial animation and voice synthesis">
          <VideoLoop src="assets/avatar1.mp4" />
        </Media>
      }
    />
  </Slide>,

  <Slide
    key="face-reconstruction"
    label="07 Face Reconstruction"
    notes="Image-to-3D face reconstruction transforms 2D images — photographs or video — into detailed, accurate 3D representations of the face. It underpins computer graphics, facial recognition, VR and medical imaging."
    tag="Process · Face Reconstruction"
    headline="From photos to a 3D face"
  >
    <SplitMedia
      text={
        <>
          <Subhead style={{ marginTop: 0 }}>
            Image-to-3D reconstruction turns 2D photographs and video into detailed, accurate 3D representations
            of a human face.
          </Subhead>
          <ArrowList
            tight
            style={{ marginTop: 8 }}
            items={[
              'Multi-view capture to dense point cloud',
              'Lifelike 3D facial models from 2D source',
              'Feeds graphics, VR and medical imaging',
            ]}
          />
        </>
      }
      media={
        <Media parallax ariaLabel="Face reconstruction — capture to 3D model">
          <Img src="assets/image-to-3d.png" alt="Image-to-3D face reconstruction preview" />
        </Media>
      }
    />
  </Slide>,

  <Slide
    key="retopology"
    label="08 Mesh Retopology"
    notes="Base mesh retopology turns a high-poly, complex scan into a simplified, optimized, clean base mesh — efficient, animation-ready geometry used across games, animation, VFX and product design."
    tag="Process · Mesh Retopology"
    headline="High-poly to clean base mesh"
  >
    <SplitMedia
      text={
        <>
          <Subhead style={{ marginTop: 0 }}>
            Retopology rebuilds a dense scan as a simplified, optimized base mesh — clean edge flow that is
            efficient and ready for animation.
          </Subhead>
          <ArrowList
            tight
            style={{ marginTop: 8 }}
            items={[
              'Simplified, optimized topology',
              'Deformation-friendly edge flow',
              'Detail projected back onto the base',
            ]}
          />
        </>
      }
      media={
        <MeshCompare
          ariaLabel="Retopology comparison — base mesh to clean retopology"
          before={{ src: 'assets/base-mesh.png', alt: 'Base mesh before retopology', label: 'Base' }}
          after={{ src: 'assets/retopo-mesh.png', alt: 'Retopologized clean mesh', label: 'Retopo' }}
        />
      }
    />
  </Slide>,

  <Slide
    key="character-design"
    label="09 Character Design"
    notes="Realistic human body texturing and rendering: lifelike textures applied to the 3D model and rendered for high realism — used across film, games, medical visualization and VR."
    tag="Process · Character Design"
    headline={<>Texturing &amp; realistic render</>}
  >
    <SplitMedia
      text={
        <>
          <Subhead style={{ marginTop: 0 }}>
            Lifelike textures are authored and applied to the model, then rendered to achieve a high level of realism.
          </Subhead>
          <ArrowList
            tight
            style={{ marginTop: 8 }}
            items={[
              <>Skin, hair, makeup &amp; garment materials</>,
              'Physically based texturing & lighting',
              'Rendering tuned for believable realism',
            ]}
          />
        </>
      }
      media={
        <Media parallax ariaLabel="Character design — textured, rendered avatar">
          <Img src="assets/render.png" alt="Textured and realistically rendered avatar preview" />
        </Media>
      }
    />
  </Slide>,

  <Slide
    key="jade"
    label="11 Jade"
    notes="Jade is a digital avatar designed for the Singapore Fintech Festival — an innovative, intelligent digital assistant. Her sleek, futuristic, holographic look blends modern and traditional elements, reflecting Singapore's cultural heritage while emphasizing the forward-thinking nature of fintech."
    tag="Case Study · Jade"
    headline="Jade — a digital host"
  >
    <SplitMedia
      text={
        <>
          <Subhead style={{ marginTop: 0 }}>
            A digital avatar built for the Singapore Fintech Festival — an innovative, intelligent digital
            assistant with a radiant, holographic presence.
          </Subhead>
          <ArrowList
            tight
            style={{ marginTop: 8 }}
            items={[
              'Sleek, futuristic, holographic design',
              <>Modern &amp; traditional elements in balance</>,
              "Reflects Singapore's cultural heritage",
            ]}
          />
          <TagRow label="Delivered for" style={{ marginTop: 0 }} />
          <TagRow tags={['Singapore Fintech Festival', 'Digital Assistant', 'Real-time']} />
        </>
      }
      media={
        <Media ariaLabel="Jade — digital avatar for the Singapore Fintech Festival">
          <VideoLoop src="assets/jade.webm" />
        </Media>
      }
    />
  </Slide>,

  <EndSlide
    key="end"
    label="12 End"
    notes="Thank you. Happy to walk through any stage of the pipeline — from body creation and face reconstruction to retopology, character design, or the AI-driven animation and rendering."
  />,
];
