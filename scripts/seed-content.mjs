/**
 * One-off seed: migrate CV + site content into Sanity (project wy8j5q89).
 * Usage: node --env-file=.env.local scripts/seed-content.mjs
 */
import {createClient} from '@sanity/client'
import {createReadStream, existsSync} from 'node:fs'
import {basename, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {dirname} from 'node:path'
import {randomBytes} from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const assetsDir = join(root, 'public/migrate-assets')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-27',
  token,
  useCdn: false,
})

const key = () => randomBytes(6).toString('hex')

function block(text, {marks = [], markDefs = []} = {}) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs,
    children: [
      {
        _type: 'span',
        _key: key(),
        text,
        marks,
      },
    ],
  }
}

function blocksFromParagraphs(paragraphs) {
  return paragraphs.filter(Boolean).map((p) => block(p))
}

function bulletList(items) {
  return items.map((text) => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{_type: 'span', _key: key(), text, marks: []}],
  }))
}

function linkBlock(label, href) {
  const markKey = key()
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [{_type: 'link', _key: markKey, href}],
    children: [{_type: 'span', _key: key(), text: label, marks: [markKey]}],
  }
}

async function uploadImage(filePath, filename = basename(filePath)) {
  if (!existsSync(filePath)) {
    console.warn('Missing image:', filePath)
    return null
  }
  const asset = await client.assets.upload('image', createReadStream(filePath), {filename})
  console.log('Uploaded', filename, '→', asset._id)
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
  }
}

function milestone({title, description, tags, start, end, image}) {
  return {
    _type: 'milestone',
    _key: key(),
    title,
    description,
    tags: tags || [],
    duration: {
      _type: 'duration',
      start,
      end: end || undefined,
    },
    ...(image ? {image} : {}),
  }
}

function timeline(title, milestones) {
  return {
    _type: 'timeline',
    _key: key(),
    items: [
      {
        _key: key(),
        title,
        milestones,
      },
    ],
  }
}

const projects = [
  {
    id: 'project-safety-detection',
    title: 'Real-Time Multi-Class Safety Detection Pipeline',
    slug: 'safety-detection-pipeline',
    overview:
      'Production C++/GStreamer pipeline on Hailo edge AI hardware for real-time multi-class safety detection at 30 FPS.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'Edge AI', 'Hailo', 'GStreamer'],
    duration: {start: '2024-11-01', end: null},
    cover: 'work-experience.png',
    bullets: [
      'Built a production C++/GStreamer pipeline on Hailo edge AI hardware to detect humans, animals, industrial tools, and machinery in real time.',
      'Integrated a Global Shutter camera to counter machine vibration and reduce motion blur.',
      'Optimized YOLO inference and stream processing to deliver stable 30 FPS end-to-end performance.',
    ],
    showcase: true,
  },
  {
    id: 'project-medicine-packet',
    title: 'Medicine Packet Identification Pipeline',
    slug: 'medicine-packet-identification',
    overview:
      'Full C++/GStreamer vision pipeline on Hailo for medicine packet detection and identification in quality-control workflows.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'Edge AI', 'Quality Control'],
    duration: {start: '2024-11-01', end: null},
    cover: 'work-experience.png',
    bullets: [
      'Developed a full C++/GStreamer vision pipeline running on Hailo edge AI hardware for medicine packet detection and identification.',
      'Implemented a robust identification stage to support downstream validation of package correctness.',
      'Delivered a production-ready real-time pipeline for automated quality-control workflows.',
    ],
    showcase: true,
  },
  {
    id: 'project-owlv2',
    title: 'Open-Vocabulary Detection with OWLv2 on Jetson Orin',
    slug: 'owlv2-jetson-orin',
    overview:
      'Full OWLv2 inference pipeline on Jetson Orin with Triton Inference Server for prompt-based open-vocabulary detection.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'OWLv2', 'Jetson', 'Triton'],
    duration: {start: '2024-11-01', end: null},
    cover: 'work-experience.png',
    bullets: [
      'Implemented the full OWLv2 inference pipeline on Jetson Orin using Triton Inference Server for edge deployment.',
      'Enabled prompt-based open-vocabulary detection from text or image queries.',
      'Optimized serving and post-processing to achieve 4 FPS in production-like conditions.',
    ],
    showcase: true,
  },
  {
    id: 'project-grounded-sam',
    title: 'Grounded-SAM on OAK-Depth VPU for Pallet Operations',
    slug: 'grounded-sam-oak-depth',
    overview:
      'Grounded-SAM on OAK-Depth camera VPU for box detection, size/orientation estimation, and QR label reading on pallets.',
    client: 'Personal Project',
    tags: ['Computer Vision', 'Grounded-SAM', 'OAK-D'],
    duration: {start: '2025-01-01', end: null},
    cover: 'work-experience.png',
    bullets: [
      'Implemented Grounded-SAM on the OAK-Depth camera VPU to detect boxes on pallets for palletizing and depalletizing.',
      'Added box size and orientation estimation, plus label reading including QR code extraction.',
      'Reached 2 FPS on-device while running the full detection and parsing pipeline.',
    ],
    showcase: false,
  },
  {
    id: 'project-passateoria',
    title: 'PassaTeoria',
    slug: 'passateoria',
    overview:
      'Cross-platform EdTech product for the Italian driving theory exam — web, Android, and iOS from one Expo codebase.',
    client: 'PassaTeoria',
    site: 'https://passateoria.it',
    tags: ['EdTech', 'React Native', 'Expo', 'Full-Stack'],
    duration: {start: '2026-06-01', end: null},
    cover: 'intro.jpg',
    bullets: [
      'Founded and shipped PassaTeoria for patente A1/A/B with web, Android, and iOS from one Expo / React Native codebase.',
      'Built a database-first content platform: 25-lesson course, 7,139 quizzes, and a 4,500+ term dictionary with multilingual support.',
      'Designed freemium SaaS: Google OAuth, Stripe, Play Billing, GDPR deletion, Supabase, Express API, Docker on GCP.',
    ],
    showcase: true,
  },
  {
    id: 'project-abbr-nlp',
    title: 'Medical Abbreviation Disambiguation',
    slug: 'medical-abbreviation-disambiguation',
    overview:
      'Medical NLP system using TinyBERT, BioBERT, and SciBERT to disambiguate clinical abbreviations (F1 up to 0.89).',
    client: 'Personal / Research',
    site: 'https://github.com/mowhammadrezaa/ABBREVIATION_DISAMBIGUATION_MEDICAL_NLP',
    tags: ['NLP', 'Medical AI', 'BERT'],
    duration: {start: '2023-01-01', end: '2024-06-01'},
    cover: 'education.jpg',
    bullets: [
      'Developed a medical abbreviation disambiguation system using negative sampling.',
      'Fine-tuned TinyBERT, BioBERT, and SciBERT, achieving an F1 score of 0.81 with SciBERT.',
      'Processed a 5M-record MeDAL dataset; error analysis boosted F1 from 77% to 89% for key abbreviations.',
    ],
    showcase: false,
  },
  {
    id: 'project-skin-images',
    title: 'Generation of Clinical Skin Images',
    slug: 'clinical-skin-images',
    overview:
      'ControlNet pipeline trained on custom skin-tone datasets for synthetic clinical skin image generation.',
    client: 'Personal / Research',
    site: 'https://github.com/mowhammadrezaa/Generation-of-Clinical-Skin-Images',
    tags: ['Computer Vision', 'Generative AI', 'ControlNet'],
    duration: {start: '2023-06-01', end: '2024-06-01'},
    cover: 'education.jpg',
    bullets: [
      'Built an ML pipeline using ControlNet trained on custom skin-tone datasets.',
      'Automated mask creation, skin tone extraction, and prompt generation for over 12,000 images.',
      'Achieved Avg PSNR 27.19, Avg SSIM 0.67, and FID 69.38.',
    ],
    showcase: false,
  },
  {
    id: 'project-smartform',
    title: 'Smart Form Auto-Filler Chrome Extension',
    slug: 'smart-form-filler',
    overview:
      'Chrome extension that uses OpenAI to auto-fill forms from stored configuration and user-specific prompts.',
    client: 'Personal Project',
    site: 'https://github.com/mowhammadrezaa/SmartFormFiller',
    tags: ['Chrome Extension', 'OpenAI', 'Automation'],
    duration: {start: '2024-01-01', end: '2024-06-01'},
    cover: 'intro.jpg',
    bullets: [
      'Streamlines form filling by managing configuration data and user-specific prompts.',
      'Integrates with the OpenAI API to generate responses for incomplete fields.',
      'Persists data with Chrome Storage; supports text, email, and dropdown fields.',
    ],
    showcase: false,
  },
  {
    id: 'project-websocket-actor',
    title: 'WebSocketActor',
    slug: 'websocket-actor',
    overview:
      'C++ Unreal Engine plugin for real-time WebSocket communication with dynamic texture updates from binary data.',
    client: 'Personal / NOVA XR',
    site: 'https://github.com/mowhammadrezaa/WebSocketApp',
    tags: ['Unreal Engine', 'C++', 'WebSocket'],
    duration: {start: '2024-04-01', end: '2024-07-01'},
    cover: 'work-experience.png',
    bullets: [
      'Facilitates real-time WebSocket communication for Unreal Engine applications.',
      'Handles text and binary data, converting binary into textures applied to materials in real time.',
      'Includes on-screen debugging and easy integration with customizable connection settings.',
    ],
    showcase: false,
  },
]

async function main() {
  console.log('Seeding Sanity project', projectId, dataset)

  const introImage = await uploadImage(join(assetsDir, 'intro.jpg'))
  const educationImage = await uploadImage(join(assetsDir, 'education.jpg'))
  const workImage = await uploadImage(join(assetsDir, 'work-experience.png'))

  const coverCache = {}
  for (const name of ['intro.jpg', 'education.jpg', 'work-experience.png']) {
    const path = join(assetsDir, name)
    coverCache[name] =
      name === 'intro.jpg'
        ? introImage
        : name === 'education.jpg'
          ? educationImage
          : workImage
    if (!coverCache[name] && existsSync(path)) {
      coverCache[name] = await uploadImage(path)
    }
  }

  // Projects
  const projectDocs = []
  for (const p of projects) {
    const cover = coverCache[p.cover]
    if (!cover) throw new Error(`Missing cover for ${p.title}`)
    const doc = {
      _id: p.id,
      _type: 'project',
      title: p.title,
      slug: {_type: 'slug', current: p.slug},
      overview: [block(p.overview)],
      coverImage: cover,
      client: p.client,
      tags: p.tags,
      duration: {
        _type: 'duration',
        start: p.duration.start ? new Date(p.duration.start).toISOString() : undefined,
        end: p.duration.end ? new Date(p.duration.end).toISOString() : undefined,
      },
      ...(p.site ? {site: p.site} : {}),
      description: bulletList(p.bullets),
    }
    projectDocs.push(doc)
  }

  const showcaseRefs = projects
    .filter((p) => p.showcase)
    .map((p) => ({_type: 'reference', _ref: p.id, _key: key()}))

  // Pages
  const aboutPage = {
    _id: 'page-about',
    _type: 'page',
    title: 'About',
    slug: {_type: 'slug', current: 'about'},
    overview: [
      block(
        'Applied AI Engineer with 3+ years deploying production computer vision and NLP solutions.',
      ),
    ],
    body: [
      ...(introImage
        ? [
            {
              ...introImage,
              _key: key(),
              caption: 'Mohammadreza Hosseini',
              alt: 'Portrait',
            },
          ]
        : []),
      ...blocksFromParagraphs([
        'Oh hello there!',
        'I am an Artificial Intelligence Specialist with several years of experience in Python — for my friends, still the person who speaks more in code than words.',
        'Applied AI Engineer with 3+ years of experience deploying production AI solutions in computer vision and NLP. Proven track record of translating business requirements into technical specifications and delivering scalable AI systems. Expert in Python, PyTorch, and TensorFlow with client-facing experience integrating AI models into production environments.',
        'Dutch Orientation Year (Zoekjaar) through July 30, 2027 — no sponsorship required to start immediately.',
      ]),
      block('What I’m proud to have accomplished:'),
      ...bulletList([
        'AI Model Integration into Unreal Engine (Obsidian Gateway) — real-time AI vision pipeline for immersive experiences.',
        'Synthetic Medical Image Generation — synthetic clinical imagery for research and AI-driven solutions.',
        'Abbreviation Disambiguation in Medical NLP — precise interpretation of clinical abbreviations.',
        'Production edge CV pipelines at AWENTIA (Hailo, DeepStream, Triton) and PassaTeoria EdTech product.',
      ]),
      ...blocksFromParagraphs([
        'I thrive on learning new things and diving into fresh challenges. I’m precise, take deadlines seriously, and automate anything repetitive.',
        'Thanks for visiting — feel free to reach out via the Contact page.',
      ]),
    ],
  }

  const educationPage = {
    _id: 'page-education',
    _type: 'page',
    title: 'Education',
    slug: {_type: 'slug', current: 'education'},
    overview: [block('M.S. in Artificial Intelligence (University of Bologna) and B.S. in Computer Science.')],
    body: [
      timeline('Education', [
        milestone({
          title: 'University of Bologna',
          description: 'Master of Science (M.S.) in Artificial Intelligence (GPA: 3.78) — Bologna, Italy',
          tags: ['M.S.', 'Artificial Intelligence'],
          start: '2021-09-01T00:00:00.000Z',
          end: '2024-10-01T00:00:00.000Z',
          image: educationImage || undefined,
        }),
        milestone({
          title: 'University of Damghan',
          description: 'Bachelor of Science (B.S.) in Computer Science — Damghan, Iran',
          tags: ['B.S.', 'Computer Science'],
          start: '2015-02-01T00:00:00.000Z',
          end: '2019-02-01T00:00:00.000Z',
        }),
      ]),
      block('Publication'),
      ...bulletList([
        'Shami, S., Haecker, B., Aberger, J., Hosseini, M., Pestana, J., Krisper, M., 2024. Comparative Analysis of Transfer and Continual Learning for Vision Based Particle Classification in Plastics Sorting for Recycling. Proceedings of the Recy & Depotech Conference 2024, Montanuniversität Leoben.',
      ]),
    ],
  }

  const workPage = {
    _id: 'page-work',
    _type: 'page',
    title: 'Work Experience',
    slug: {_type: 'slug', current: 'work'},
    overview: [
      block('Computer Vision Engineer at AWENTIA, founder of PassaTeoria, and prior AI / teaching roles.'),
    ],
    body: [
      timeline('Experience', [
        milestone({
          title: 'AWENTIA',
          description:
            'Computer Vision Engineer — production edge AI pipelines (Hailo, DeepStream, Triton, Kubernetes).',
          tags: ['Computer Vision Engineer'],
          start: '2024-11-01T00:00:00.000Z',
          image: workImage || undefined,
        }),
        milestone({
          title: 'PassaTeoria',
          description:
            'Founder & Full-Stack Engineer — EdTech product for Italian driving theory exam (web, Android, iOS).',
          tags: ['Founder', 'Full-Stack'],
          start: '2026-06-01T00:00:00.000Z',
        }),
        milestone({
          title: 'NOVA XR',
          description:
            'AI Integration Engineer — low-latency AI vision in Unreal Engine (~20ms inference).',
          tags: ['AI Integration Engineer'],
          start: '2024-04-01T00:00:00.000Z',
          end: '2024-07-01T00:00:00.000Z',
        }),
        milestone({
          title: 'University of Bologna',
          description:
            'Teaching Assistant — AI concepts for 300+ students; coursework with Professors Martini and Lodi.',
          tags: ['Teaching Assistant'],
          start: '2022-09-01T00:00:00.000Z',
          end: '2025-09-01T00:00:00.000Z',
        }),
      ]),
    ],
  }

  const skillsPage = {
    _id: 'page-skills',
    _type: 'page',
    title: 'Skills',
    slug: {_type: 'slug', current: 'skills'},
    overview: [block('Languages, frameworks, cloud/DevOps tools, and certifications for applied AI engineering.')],
    body: [
      block('Languages'),
      ...bulletList(['Python', 'C++', 'JavaScript', 'TypeScript', 'Prolog', 'Bash', 'SQL']),
      block('Frameworks & libraries'),
      ...bulletList([
        'PyTorch',
        'TensorFlow',
        'Scikit-learn',
        'LangChain',
        'OpenCV',
        'SpaCy',
        'Transformers',
        'Django',
        'Flask',
        'React',
        'React Native',
        'Expo',
      ]),
      block('Tools & platforms'),
      ...bulletList([
        'Docker',
        'Kubernetes',
        'AWS',
        'Azure',
        'GCP',
        'Terraform',
        'NVIDIA TensorRT',
        'NVIDIA DeepStream',
        'OpenVINO',
        'MLflow',
        'PostgreSQL',
        'Supabase',
        'CI/CD',
      ]),
      block('Certifications'),
      ...bulletList([
        'AWS Cloud Quest, Cloud Practitioner',
        'The Protection of Personal Data (GDPR and Cybersecurity)',
        'Google Cloud Digital Leader Training',
        'Google Cloud Engineer and DevOps',
      ]),
      block('Spoken languages: English (C1), Italian (A1). Specialized areas: Computer Vision, NLP, Automation, Full-Stack Product Development.'),
    ],
  }

  const researchPage = {
    _id: 'page-research',
    _type: 'page',
    title: 'Research Interests',
    slug: {_type: 'slug', current: 'research'},
    overview: [
      block('Computer vision, generative AI, medical NLP, secure AI systems, and AI in game engines.'),
    ],
    body: [
      block(
        'My research interests span Artificial Intelligence, software engineering, and automation. I am particularly passionate about:',
      ),
      ...bulletList([
        'Computer Vision and 3D Reconstruction — image recognition, object detection, and 3D scene reconstruction for medical and entertainment contexts.',
        'Generative AI and Transformers — ControlNet and LLMs for creative content generation and language understanding.',
        'NLP in Medical Context — medical terminology, clinical communication, and abbreviation disambiguation.',
        'Network Security — secure integration of AI systems with privacy and robustness against threats.',
        'Backend Development and Automation — robust backends and workflow automation with AI capabilities.',
        'Web Scraping and Data Collection — ethical data collection for model training.',
        'Integration of AI into Gaming Engines — Unreal Engine and Unity for adaptive gameplay.',
      ]),
      block(
        'I am especially interested in bridging research and practical applications — real-time AI systems, automation, and generative AI for real-world challenges.',
      ),
    ],
  }

  const contactPage = {
    _id: 'page-contact',
    _type: 'page',
    title: 'Contact',
    slug: {_type: 'slug', current: 'contact'},
    overview: [block('Get in touch via email, LinkedIn, or GitHub.')],
    body: [
      block('I’d love to hear from you. Reach me through any of these channels:'),
      linkBlock('Email: mohammadrez.hossein3@unibo.it', 'mailto:mohammadrez.hossein3@unibo.it'),
      linkBlock('LinkedIn: mohammadreza-hosseini', 'https://linkedin.com/in/mohammadreza-hosseini'),
      linkBlock('GitHub: mowhammadrezaa', 'https://github.com/mowhammadrezaa'),
      linkBlock('Instagram', 'https://www.instagram.com/mohammadreza.hosseini.88'),
      block('Available immediately · Willing to relocate · Dutch Zoekjaar through Jul 2027'),
    ],
  }

  const pages = [aboutPage, educationPage, workPage, skillsPage, researchPage, contactPage]

  const home = {
    _id: 'home',
    _type: 'home',
    title: 'Mohammadreza Hosseini',
    overview: [
      block(
        'Applied AI Engineer — production computer vision & NLP. Building edge AI systems and full-stack products.',
      ),
    ],
    showcaseProjects: showcaseRefs,
  }

  const menuItems = [
    {_type: 'reference', _ref: 'home', _key: key()},
    {_type: 'reference', _ref: 'page-about', _key: key()},
    {_type: 'reference', _ref: 'page-education', _key: key()},
    {_type: 'reference', _ref: 'page-work', _key: key()},
    {_type: 'reference', _ref: 'page-skills', _key: key()},
    {_type: 'reference', _ref: 'page-research', _key: key()},
    {_type: 'reference', _ref: 'page-contact', _key: key()},
  ]

  const settings = {
    _id: 'settings',
    _type: 'settings',
    menuItems,
    footer: [
      block('Mohammadreza Hosseini · Applied AI Engineer'),
      linkBlock('GitHub', 'https://github.com/mowhammadrezaa'),
      linkBlock('LinkedIn', 'https://linkedin.com/in/mohammadreza-hosseini'),
    ],
    ...(introImage ? {ogImage: introImage} : {}),
  }

  let tx = client.transaction()
  for (const doc of [...projectDocs, ...pages, home, settings]) {
    tx = tx.createOrReplace(doc)
  }
  const result = await tx.commit()
  console.log('Committed', result.results?.length || 'ok', 'documents')
  console.log('Done. Open http://localhost:3000 and http://localhost:3000/studio')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
