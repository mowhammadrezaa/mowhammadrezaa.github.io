import {randomBytes} from 'node:crypto'
import {createReadStream, existsSync} from 'node:fs'
import {basename, join} from 'node:path'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

/**
 * One-off seed: migrate CV + site content into Sanity (project wy8j5q89).
 * Usage: node --env-file=.env.local scripts/seed-content.mjs
 */
import {createClient} from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const assetsDir = join(root, 'scripts/assets')
const legacyAssetsDir = join(root, 'public/migrate-assets')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN',
  )
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

function linkBlock(label, href, {before = '', after = ''} = {}) {
  const markKey = key()
  const children = []
  if (before) children.push({_type: 'span', _key: key(), text: before, marks: []})
  children.push({_type: 'span', _key: key(), text: label, marks: [markKey]})
  if (after) children.push({_type: 'span', _key: key(), text: after, marks: []})
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [{_type: 'link', _key: markKey, href}],
    children,
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

function milestone({title, description, points, tags, start, end, image, imageLayout}) {
  return {
    _type: 'milestone',
    _key: key(),
    title,
    description,
    ...(points?.length ? {points} : {}),
    tags: tags || [],
    duration: {
      _type: 'duration',
      start,
      end: end || undefined,
    },
    ...(image ? {image} : {}),
    ...(imageLayout ? {imageLayout} : {}),
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
    cover: 'project-safety-detection-cover.png',
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
    cover: 'project-medicine-packet-cover.jpg',
    coverVideo: '/videos/project-medicine-packet-cover.mp4',
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
    cover: 'project-owlv2-cover.png',
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
    cover: 'passateoria-cover.jpg',
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

const projectTranslationsNl = {
  'project-safety-detection': {
    title: 'Realtime detectiepijplijn voor meerdere veiligheidsklassen',
    overview:
      'Productiepijplijn in C++/GStreamer op Hailo Edge AI-hardware voor realtime detectie van meerdere veiligheidsklassen met 30 FPS.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'Edge AI', 'Hailo', 'GStreamer'],
    bullets: [
      'Een productiepijplijn in C++/GStreamer gebouwd op Hailo Edge AI-hardware om mensen, dieren, industrieel gereedschap en machines in realtime te detecteren.',
      'Een global-shuttercamera geïntegreerd om machinetrillingen te compenseren en bewegingsonscherpte te verminderen.',
      'YOLO-inferentie en streamverwerking geoptimaliseerd voor stabiele end-to-endprestaties van 30 FPS.',
    ],
  },
  'project-medicine-packet': {
    title: 'Detectie- en identificatiepijplijn voor medicijnverpakkingen',
    overview:
      'Volledige C++/GStreamer-beeldverwerkingspijplijn op Hailo voor detectie en identificatie van medicijnverpakkingen in kwaliteitscontroleprocessen.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'Edge AI', 'Kwaliteitscontrole'],
    bullets: [
      'Een volledige C++/GStreamer-beeldverwerkingspijplijn ontwikkeld die op Hailo Edge AI-hardware draait voor de detectie en identificatie van medicijnverpakkingen.',
      'Een robuuste identificatiefase geïmplementeerd ter ondersteuning van de daaropvolgende controle van de juistheid van verpakkingen.',
      'Een productieklare realtime pijplijn opgeleverd voor geautomatiseerde kwaliteitscontroleprocessen.',
    ],
  },
  'project-owlv2': {
    title: 'Open-vocabulary-detectie met OWLv2 op Jetson Orin',
    overview:
      'Volledige OWLv2-inferentiepijplijn op Jetson Orin met Triton Inference Server voor promptgestuurde open-vocabulary-detectie.',
    client: 'AWENTIA',
    tags: ['Computer Vision', 'OWLv2', 'Jetson', 'Triton'],
    bullets: [
      'De volledige OWLv2-inferentiepijplijn op Jetson Orin geïmplementeerd met Triton Inference Server voor toepassing aan de edge.',
      'Promptgestuurde open-vocabulary-detectie op basis van tekst- of afbeeldingsquery’s mogelijk gemaakt.',
      'Modelserving en nabewerking geoptimaliseerd om onder productieachtige omstandigheden 4 FPS te behalen.',
    ],
  },
  'project-grounded-sam': {
    title: 'Grounded-SAM op OAK-Depth VPU voor palletbewerkingen',
    overview:
      'Grounded-SAM op de VPU van een OAK-Depth-camera voor doosdetectie, schatting van formaat en oriëntatie, en het lezen van QR-labels op pallets.',
    client: 'Persoonlijk project',
    tags: ['Computer Vision', 'Grounded-SAM', 'OAK-D'],
    bullets: [
      'Grounded-SAM op de VPU van de OAK-Depth-camera geïmplementeerd om dozen op pallets te detecteren voor palletiseren en depalletiseren.',
      'Schatting van doosformaat en -oriëntatie toegevoegd, evenals het lezen van labels, waaronder het uitlezen van QR-codes.',
      'Op het apparaat 2 FPS behaald terwijl de volledige detectie- en verwerkingspijplijn draaide.',
    ],
  },
  'project-passateoria': {
    title: 'PassaTeoria',
    overview:
      'Cross-platform EdTech-product voor het Italiaanse rijtheorie-examen — web, Android en iOS vanuit één Expo-codebase.',
    client: 'PassaTeoria',
    tags: ['EdTech', 'React Native', 'Expo', 'Full-stack'],
    bullets: [
      'PassaTeoria opgericht en uitgebracht voor rijbewijzen A1/A/B, met web, Android en iOS vanuit één Expo/React Native-codebase.',
      'Een database-first contentplatform gebouwd: een cursus met 25 lessen, 7.139 quizvragen en een woordenboek met meer dan 4.500 termen, met meertalige ondersteuning.',
      'Een freemium-SaaS ontworpen: Google OAuth, Stripe, Play Billing, AVG-conforme verwijdering, Supabase, een Express-API en Docker op GCP.',
    ],
  },
  'project-abbr-nlp': {
    title: 'Disambiguatie van medische afkortingen',
    overview:
      'Medisch NLP-systeem dat TinyBERT, BioBERT en SciBERT gebruikt om klinische afkortingen te disambigueren (F1 tot 0,89).',
    client: 'Persoonlijk / onderzoek',
    tags: ['NLP', 'Medische AI', 'BERT'],
    bullets: [
      'Een systeem voor disambiguatie van medische afkortingen ontwikkeld met negative sampling.',
      'TinyBERT, BioBERT en SciBERT gefinetuned, waarbij met SciBERT een F1-score van 0,81 werd behaald.',
      'Een MeDAL-dataset met 5 miljoen records verwerkt; foutanalyse verhoogde de F1-score voor belangrijke afkortingen van 77% naar 89%.',
    ],
  },
  'project-skin-images': {
    title: 'Generatie van klinische huidafbeeldingen',
    overview:
      'ControlNet-pijplijn getraind op aangepaste datasets met huidtinten voor de generatie van synthetische klinische huidafbeeldingen.',
    client: 'Persoonlijk / onderzoek',
    tags: ['Computer Vision', 'Generatieve AI', 'ControlNet'],
    bullets: [
      'Een ML-pijplijn gebouwd met ControlNet, getraind op aangepaste datasets met huidtinten.',
      'Het maken van maskers, extraheren van huidtinten en genereren van prompts geautomatiseerd voor meer dan 12.000 afbeeldingen.',
      'Gemiddelde PSNR van 27,19, gemiddelde SSIM van 0,67 en FID van 69,38 behaald.',
    ],
  },
  'project-smartform': {
    title: 'Chrome-extensie voor het automatisch invullen van slimme formulieren',
    overview:
      'Chrome-extensie die OpenAI gebruikt om formulieren automatisch in te vullen op basis van opgeslagen configuratie en gebruikersspecifieke prompts.',
    client: 'Persoonlijk project',
    tags: ['Chrome-extensie', 'OpenAI', 'Automatisering'],
    bullets: [
      'Vereenvoudigt het invullen van formulieren door configuratiegegevens en gebruikersspecifieke prompts te beheren.',
      'Integreert met de OpenAI-API om antwoorden voor onvolledig ingevulde velden te genereren.',
      'Slaat gegevens blijvend op met Chrome Storage en ondersteunt tekst-, e-mail- en keuzelijstvelden.',
    ],
  },
  'project-websocket-actor': {
    title: 'WebSocketActor',
    overview:
      'C++-plug-in voor Unreal Engine voor realtime WebSocket-communicatie met dynamische texture-updates op basis van binaire gegevens.',
    client: 'Persoonlijk / NOVA XR',
    tags: ['Unreal Engine', 'C++', 'WebSocket'],
    bullets: [
      'Maakt realtime WebSocket-communicatie voor Unreal Engine-applicaties mogelijk.',
      'Verwerkt tekst en binaire gegevens en zet binaire gegevens om in textures die in realtime op materialen worden toegepast.',
      'Bevat foutopsporing op het scherm en eenvoudige integratie met aanpasbare verbindingsinstellingen.',
    ],
  },
}

async function main() {
  console.log('Seeding Sanity project', projectId, dataset)

  const introImage =
    (await uploadImage(join(assetsDir, 'about-portrait.png'))) ||
    (await uploadImage(join(legacyAssetsDir, 'intro.jpg')))
  const educationImage =
    (await uploadImage(join(assetsDir, 'education-unibo-cover.png'))) ||
    (await uploadImage(join(legacyAssetsDir, 'education.jpg')))
  const educationDamghanImage = await uploadImage(join(assetsDir, 'education-damghan-cover.png'))
  const workImage = await uploadImage(join(legacyAssetsDir, 'work-experience.png'))
  const workIconAwentia = await uploadImage(join(assetsDir, 'work-icon-awentia.png'))
  const workIconPassateoria = await uploadImage(join(assetsDir, 'work-icon-passateoria.png'))
  const workIconNova = await uploadImage(join(assetsDir, 'work-icon-nova-xr.png'))
  const workIconUnibo = await uploadImage(join(assetsDir, 'work-icon-unibo.png'))

  const coverCache = {}
  for (const name of [
    'intro.jpg',
    'education.jpg',
    'work-experience.png',
    'passateoria-cover.jpg',
    'about-portrait.png',
    'project-safety-detection-cover.png',
    'project-medicine-packet-cover.jpg',
    'project-owlv2-cover.png',
  ]) {
    const path = [join(assetsDir, name), join(legacyAssetsDir, name)].find((p) => existsSync(p))
    if (name === 'about-portrait.png' && introImage) coverCache[name] = introImage
    else if (name === 'intro.jpg' && introImage) coverCache[name] = introImage
    else if (name === 'education.jpg' && educationImage) coverCache[name] = educationImage
    else if (name === 'work-experience.png')
      coverCache[name] = workImage || workIconAwentia || workIconNova
    else if (path) coverCache[name] = await uploadImage(path)
  }

  // Projects
  const projectDocs = []
  for (const p of projects) {
    const cover = coverCache[p.cover]
    if (!cover) throw new Error(`Missing cover for ${p.title}`)
    for (const language of ['en', 'nl']) {
      const content = language === 'en' ? p : projectTranslationsNl[p.id]
      const doc = {
        _id: language === 'en' ? p.id : `${p.id}-nl`,
        _type: 'project',
        language,
        title: content.title,
        slug: {_type: 'slug', current: p.slug},
        overview: [block(content.overview)],
        coverImage: cover,
        client: content.client,
        tags: content.tags,
        duration: {
          _type: 'duration',
          start: p.duration.start ? new Date(p.duration.start).toISOString() : undefined,
          end: p.duration.end ? new Date(p.duration.end).toISOString() : undefined,
        },
        ...(p.site ? {site: p.site} : {}),
        ...(p.coverVideo ? {coverVideoUrl: p.coverVideo} : {}),
        description: bulletList(content.bullets),
      }
      projectDocs.push(doc)
    }
  }

  const showcaseRefs = (language) =>
    projects
      .filter((p) => p.showcase)
      .map((p) => ({
        _type: 'reference',
        _ref: language === 'en' ? p.id : `${p.id}-nl`,
        _key: key(),
      }))

  // Pages
  const aboutPage = {
    _id: 'page-about',
    _type: 'page',
    language: 'en',
    title: 'About',
    slug: {_type: 'slug', current: 'about'},
    overview: [
      block(
        'Edge AI / Computer Vision engineer focused on real-time vision systems — from model optimization to production serving on edge devices and Kubernetes.',
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
      block(
        'I’m currently a Computer Vision Engineer at Awentia, where I build C++/GStreamer pipelines on Hailo and NVIDIA stacks (DeepStream, TensorRT, OpenVINO) and deploy models with Triton Inference Server. Recent impact includes reducing manual dataset collection effort by ~40%, cutting deployment time by ~60% through CI/CD, and delivering stable real-time pipelines (e.g. multi-class safety detection at ~30 FPS end-to-end).',
      ),
      linkBlock('passateoria.it', 'https://passateoria.it', {
        before: 'In parallel, I’m founding and shipping PassaTeoria (',
        after:
          '), a cross-platform EdTech product (web, Android, iOS) for the Italian driving theory exam — owning product, full-stack delivery, billing, and cloud operations end to end.',
      }),
      block(
        'Dutch Orientation Year (Zoekjaar) valid through 30 July 2027 — work freely permitted (TWV not required). Available immediately and open to relocating within the Netherlands / EU for on-site or hybrid Edge AI, Computer Vision, or AI platform/serving roles.',
      ),
      block(
        'Core stack: Python, C++, PyTorch, TensorRT, DeepStream, GStreamer, Triton, Docker, Kubernetes, Hailo, Jetson, GCP, CI/CD.',
      ),
    ],
  }

  const educationPage = {
    _id: 'page-education',
    _type: 'page',
    language: 'en',
    title: 'Education',
    slug: {_type: 'slug', current: 'education'},
    overview: [
      block(
        'M.S. in Artificial Intelligence (University of Bologna) and B.S. in Computer Science.',
      ),
    ],
    body: [
      timeline('Education', [
        milestone({
          title: 'University of Bologna',
          description:
            'Master of Science (M.S.) in Artificial Intelligence (GPA: 3.78) — Bologna, Italy',
          tags: ['M.S.', 'Artificial Intelligence'],
          start: '2021-09-01T00:00:00.000Z',
          end: '2024-10-01T00:00:00.000Z',
          image: educationImage || undefined,
          imageLayout: 'cover',
        }),
        milestone({
          title: 'University of Damghan',
          description: 'Bachelor of Science (B.S.) in Computer Science — Damghan, Iran',
          tags: ['B.S.', 'Computer Science'],
          start: '2015-02-01T00:00:00.000Z',
          end: '2019-02-01T00:00:00.000Z',
          image: educationDamghanImage || undefined,
          imageLayout: 'cover',
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
    language: 'en',
    title: 'Work Experience',
    slug: {_type: 'slug', current: 'work'},
    overview: [
      block(
        'Computer Vision Engineer at AWENTIA, founder of PassaTeoria, and prior AI / teaching roles.',
      ),
    ],
    body: [
      timeline('Experience', [
        milestone({
          title: 'AWENTIA',
          description: 'Computer Vision Engineer',
          tags: ['Computer Vision Engineer', 'Edge AI'],
          start: '2024-11-01T00:00:00.000Z',
          image: workIconAwentia || workImage || undefined,
          points: [
            'Consulted with cross-functional teams to translate business requirements into automated dataset collection systems, developing custom firmware for embedded IoT devices to capture sensor data, reducing manual data collection time by 40% and enabling scalable AI model development',
            'Led end-to-end development of production AI solutions from concept to deployment by studying research papers, open-source repositories, and product documentation to identify state-of-the-art approaches, creating cross-industry computer vision SDKs that integrated AI models into edge devices for client automation',
            'Engineered real-time image processing pipeline implementing custom pre/post-processing operators and inference tensor decoders using GStreamer, Hailo Edge AI Processors, and NVIDIA DeepStream with TensorRT and OpenVINO optimization, transforming raw model outputs into structured metadata for seamless application developer integration',
            'Collaborated with compiler and platform teams to diagnose and resolve complex compilation and deployment issues across multiple edge runtimes, ensuring reliable cross-platform model execution',
            'Deployed production-ready AI models into scalable Kubernetes environments using Triton Server, establishing CI/CD pipelines that reduced deployment time by 60% and enabled seamless integration of computer vision solutions across multiple client projects',
          ],
        }),
        milestone({
          title: 'PassaTeoria',
          description: 'Founder & Full-Stack Engineer',
          tags: ['Founder', 'Full-Stack', 'EdTech'],
          start: '2026-06-01T00:00:00.000Z',
          image: coverCache['passateoria-cover.jpg'] || workIconPassateoria || undefined,
          imageLayout: 'cover',
          points: [
            'Founded and shipped PassaTeoria (passateoria.it), a cross-platform EdTech product for the Italian driving theory exam (patente A1, A, B), delivering web, Android (Google Play), and iOS from one Expo / React Native codebase',
            'Built a database-first content platform: 25-lesson theory course (656 sections, ~87k words), 7,139 ministerial-style true/false quizzes, and a 4,500+ term dictionary with tap-to-translate and Italian pronunciation; native content in 7 languages plus on-demand AI translation for 170+ languages',
            'Designed the freemium SaaS layer end-to-end: Google OAuth, Stripe Checkout on web, Google Play Billing on Android, device entitlement, rate limiting / abuse controls, and GDPR-compliant account deletion',
            'Owned production operations: Supabase (Postgres, Auth, RLS) for course content and learner progress, an Express API for billing and translations, Docker on GCP provisioned with Terraform, Cloudflare TLS, and a Telegram admin bot for premium grants and comment moderation',
          ],
        }),
        milestone({
          title: 'NOVA XR',
          description: 'AI Integration Engineer',
          tags: ['AI Integration Engineer'],
          start: '2024-04-01T00:00:00.000Z',
          end: '2024-07-01T00:00:00.000Z',
          image: workIconNova || undefined,
          points: [
            'Collaborated with client teams to diagnose real-time AI integration challenges, translating requirements into technical specifications and deploying low-latency inference pipelines achieving 20ms inference time for production AI vision systems within Unreal Engine',
            'Deployed production AI services using Docker and Kubernetes for scalable model serving and load balancing, ensuring reliable performance for client-facing applications',
          ],
        }),
        milestone({
          title: 'University of Bologna',
          description: 'Teaching Assistant',
          tags: ['Teaching Assistant'],
          start: '2022-09-01T00:00:00.000Z',
          end: '2025-09-01T00:00:00.000Z',
          image: workIconUnibo || educationImage || undefined,
          points: [
            'Communicated complex AI concepts to 300+ non-technical students, translating technical specifications into accessible learning materials and collaborating with professors to align course content with industry requirements, resulting in improved student success rates',
            'Collaborated with Professors Simone Martini and Michael Lodi on course material preparation and assignment grading, bridging academic and practical AI applications',
          ],
        }),
      ]),
    ],
  }

  const skillsPage = {
    _id: 'page-skills',
    _type: 'page',
    language: 'en',
    title: 'Skills',
    slug: {_type: 'slug', current: 'skills'},
    overview: [
      block(
        'Languages, frameworks, cloud/DevOps tools, and certifications for applied AI engineering.',
      ),
    ],
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
      block(
        'Spoken languages: English (C1), Italian (A1). Specialized areas: Computer Vision, NLP, Automation, Full-Stack Product Development.',
      ),
    ],
  }

  const contactPage = {
    _id: 'page-contact',
    _type: 'page',
    language: 'en',
    title: 'Contact',
    slug: {_type: 'slug', current: 'contact'},
    overview: [
      block(
        'Reach out by email, phone, or social — happy to talk about Edge AI, computer vision, and product work.',
      ),
    ],
    body: [block('Contact details are shown on this page with one-click copy.')],
  }

  const projectsPage = {
    _id: 'page-projects',
    _type: 'page',
    language: 'en',
    title: 'Projects',
    slug: {_type: 'slug', current: 'projects'},
    overview: [
      block(
        'Selected edge AI, computer vision, and product work — from real-time pipelines to full-stack shipping.',
      ),
    ],
    body: [],
  }

  const aboutPageNl = {
    _id: 'page-about-nl',
    _type: 'page',
    language: 'nl',
    title: 'Over mij',
    slug: {_type: 'slug', current: 'about'},
    overview: [
      block(
        'Edge AI-/Computer Vision-engineer gericht op realtime beeldverwerkingssystemen — van modeloptimalisatie tot productie-inferentie op edge-apparaten en Kubernetes.',
      ),
    ],
    body: [
      ...(introImage
        ? [
            {
              ...introImage,
              _key: key(),
              caption: 'Mohammadreza Hosseini',
              alt: 'Portret',
            },
          ]
        : []),
      block(
        'Momenteel werk ik als Computer Vision Engineer bij Awentia, waar ik C++/GStreamer-pijplijnen bouw op Hailo- en NVIDIA-stacks (DeepStream, TensorRT, OpenVINO) en modellen implementeer met Triton Inference Server. Recente resultaten zijn onder meer circa 40% minder handmatige inspanning voor dataverzameling, circa 60% kortere implementatietijd dankzij CI/CD en stabiele realtime pijplijnen (bijvoorbeeld end-to-end detectie van meerdere veiligheidsklassen met circa 30 FPS).',
      ),
      linkBlock('passateoria.it', 'https://passateoria.it', {
        before: 'Daarnaast richt ik PassaTeoria (',
        after:
          ') op en breng ik het product uit: een cross-platform EdTech-product (web, Android, iOS) voor het Italiaanse rijtheorie-examen, waarbij ik van begin tot eind verantwoordelijk ben voor het product, de full-stackontwikkeling, betalingen en cloudactiviteiten.',
      }),
      block(
        'Nederlandse verblijfsvergunning voor het zoekjaar, geldig tot en met 30 juli 2027 — arbeid vrij toegestaan (TWV niet vereist). Per direct beschikbaar en bereid om binnen Nederland / de EU te verhuizen voor functies op locatie of in hybride vorm op het gebied van Edge AI, Computer Vision of AI-platforms en modelserving.',
      ),
      block(
        'Kerntechnologieën: Python, C++, PyTorch, TensorRT, DeepStream, GStreamer, Triton, Docker, Kubernetes, Hailo, Jetson, GCP, CI/CD.',
      ),
    ],
  }

  const educationPageNl = {
    _id: 'page-education-nl',
    _type: 'page',
    language: 'nl',
    title: 'Opleiding',
    slug: {_type: 'slug', current: 'education'},
    overview: [
      block(
        'Master of Science in Artificial Intelligence (Universiteit van Bologna) en Bachelor of Science in Computer Science.',
      ),
    ],
    body: [
      timeline('Opleiding', [
        milestone({
          title: 'Universiteit van Bologna',
          description:
            'Master of Science (M.S.) in Artificial Intelligence (GPA: 3,78) — Bologna, Italië',
          tags: ['M.S.', 'Artificial Intelligence'],
          start: '2021-09-01T00:00:00.000Z',
          end: '2024-10-01T00:00:00.000Z',
          image: educationImage || undefined,
          imageLayout: 'cover',
        }),
        milestone({
          title: 'Universiteit van Damghan',
          description: 'Bachelor of Science (B.S.) in Computer Science — Damghan, Iran',
          tags: ['B.S.', 'Computer Science'],
          start: '2015-02-01T00:00:00.000Z',
          end: '2019-02-01T00:00:00.000Z',
          image: educationDamghanImage || undefined,
          imageLayout: 'cover',
        }),
      ]),
      block('Publicatie'),
      ...bulletList([
        'Shami, S., Haecker, B., Aberger, J., Hosseini, M., Pestana, J., Krisper, M., 2024. Comparative Analysis of Transfer and Continual Learning for Vision Based Particle Classification in Plastics Sorting for Recycling. Proceedings of the Recy & Depotech Conference 2024, Montanuniversität Leoben.',
      ]),
    ],
  }

  const workPageNl = {
    _id: 'page-work-nl',
    _type: 'page',
    language: 'nl',
    title: 'Werkervaring',
    slug: {_type: 'slug', current: 'work'},
    overview: [
      block(
        'Computer Vision Engineer bij AWENTIA, oprichter van PassaTeoria en eerdere functies in AI en onderwijs.',
      ),
    ],
    body: [
      timeline('Ervaring', [
        milestone({
          title: 'AWENTIA',
          description: 'Computer Vision Engineer',
          tags: ['Computer Vision Engineer', 'Edge AI'],
          start: '2024-11-01T00:00:00.000Z',
          image: workIconAwentia || workImage || undefined,
          points: [
            'Samengewerkt met multidisciplinaire teams om bedrijfsvereisten te vertalen naar geautomatiseerde systemen voor dataverzameling; aangepaste firmware ontwikkeld voor ingebedde IoT-apparaten om sensorgegevens vast te leggen, waardoor de tijd voor handmatige dataverzameling met 40% afnam en schaalbare ontwikkeling van AI-modellen mogelijk werd',
            'De end-to-endontwikkeling van productieklare AI-oplossingen geleid, van concept tot implementatie, door onderzoekspapers, open-sourcerepository’s en productdocumentatie te bestuderen om state-of-the-artmethoden te identificeren; sectoroverschrijdende computer vision-SDK’s ontwikkeld die AI-modellen in edge-apparaten integreerden voor automatisering bij klanten',
            'Een realtime beeldverwerkingspijplijn ontwikkeld met aangepaste operators voor voor- en nabewerking en decoders voor inferentietensors, met GStreamer, Hailo Edge AI-processors en NVIDIA DeepStream met TensorRT- en OpenVINO-optimalisatie; ruwe modeluitvoer omgezet in gestructureerde metadata voor naadloze integratie door applicatieontwikkelaars',
            'Samengewerkt met compiler- en platformteams om complexe compilatie- en implementatieproblemen in meerdere edge-runtimes te diagnosticeren en op te lossen, zodat modellen betrouwbaar op verschillende platforms konden worden uitgevoerd',
            'Productieklare AI-modellen geïmplementeerd in schaalbare Kubernetes-omgevingen met Triton Server en CI/CD-pijplijnen opgezet die de implementatietijd met 60% verkortten en een naadloze integratie van computer vision-oplossingen in meerdere klantprojecten mogelijk maakten',
          ],
        }),
        milestone({
          title: 'PassaTeoria',
          description: 'Oprichter & Full-stackengineer',
          tags: ['Oprichter', 'Full-stack', 'EdTech'],
          start: '2026-06-01T00:00:00.000Z',
          image: coverCache['passateoria-cover.jpg'] || workIconPassateoria || undefined,
          imageLayout: 'cover',
          points: [
            'PassaTeoria (passateoria.it) opgericht en uitgebracht, een cross-platform EdTech-product voor het Italiaanse rijtheorie-examen (rijbewijs A1, A, B), met web, Android (Google Play) en iOS vanuit één Expo/React Native-codebase',
            'Een database-first contentplatform gebouwd: een theoriecursus met 25 lessen (656 secties, circa 87.000 woorden), 7.139 waar/onwaarquizvragen in ministeriële stijl en een woordenboek met meer dan 4.500 termen, inclusief tikken-om-te-vertalen en Italiaanse uitspraak; native content in 7 talen plus AI-vertaling op aanvraag voor meer dan 170 talen',
            'De freemium-SaaS-laag end-to-end ontworpen: Google OAuth, Stripe Checkout op het web, Google Play Billing op Android, apparaatrechten, snelheidsbeperking en misbruikbeheersing, en AVG-conforme accountverwijdering',
            'Verantwoordelijk geweest voor productieactiviteiten: Supabase (Postgres, Auth, RLS) voor cursusinhoud en voortgang van cursisten, een Express-API voor betalingen en vertalingen, Docker op GCP ingericht met Terraform, Cloudflare TLS en een Telegram-beheerbot voor het toekennen van premiumtoegang en het modereren van reacties',
          ],
        }),
        milestone({
          title: 'NOVA XR',
          description: 'AI Integration Engineer',
          tags: ['AI Integration Engineer'],
          start: '2024-04-01T00:00:00.000Z',
          end: '2024-07-01T00:00:00.000Z',
          image: workIconNova || undefined,
          points: [
            'Samengewerkt met klantteams om uitdagingen rond realtime AI-integratie te diagnosticeren, vereisten vertaald naar technische specificaties en inferentiepijplijnen met lage latentie geïmplementeerd die voor productie-AI-beeldverwerkingssystemen binnen Unreal Engine een inferentietijd van 20 ms behaalden',
            'Productieklare AI-services geïmplementeerd met Docker en Kubernetes voor schaalbare modelserving en taakverdeling, met betrouwbare prestaties voor klantgerichte applicaties',
          ],
        }),
        milestone({
          title: 'Universiteit van Bologna',
          description: 'Onderwijsassistent',
          tags: ['Onderwijsassistent'],
          start: '2022-09-01T00:00:00.000Z',
          end: '2025-09-01T00:00:00.000Z',
          image: workIconUnibo || educationImage || undefined,
          points: [
            'Complexe AI-concepten uitgelegd aan meer dan 300 niet-technische studenten, technische specificaties vertaald naar toegankelijke lesmaterialen en met docenten samengewerkt om de cursusinhoud af te stemmen op eisen uit de sector, wat leidde tot betere studieresultaten',
            'Samengewerkt met professoren Simone Martini en Michael Lodi aan de voorbereiding van cursusmateriaal en de beoordeling van opdrachten, waarbij academische en praktische AI-toepassingen met elkaar werden verbonden',
          ],
        }),
      ]),
    ],
  }

  const skillsPageNl = {
    _id: 'page-skills-nl',
    _type: 'page',
    language: 'nl',
    title: 'Vaardigheden',
    slug: {_type: 'slug', current: 'skills'},
    overview: [
      block(
        'Talen, frameworks, cloud- en DevOps-tools en certificeringen voor toegepaste AI-engineering.',
      ),
    ],
    body: [
      block('Programmeertalen'),
      ...bulletList(['Python', 'C++', 'JavaScript', 'TypeScript', 'Prolog', 'Bash', 'SQL']),
      block('Frameworks en bibliotheken'),
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
      block('Tools en platforms'),
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
      block('Certificeringen'),
      ...bulletList([
        'AWS Cloud Quest, Cloud Practitioner',
        'The Protection of Personal Data (GDPR and Cybersecurity)',
        'Google Cloud Digital Leader Training',
        'Google Cloud Engineer and DevOps',
      ]),
      block(
        'Gesproken talen: Engels (C1), Italiaans (A1). Specialisaties: Computer Vision, NLP, automatisering en full-stackproductontwikkeling.',
      ),
    ],
  }

  const contactPageNl = {
    _id: 'page-contact-nl',
    _type: 'page',
    language: 'nl',
    title: 'Contact',
    slug: {_type: 'slug', current: 'contact'},
    overview: [
      block(
        'Neem contact op via e-mail, telefoon of sociale media — ik praat graag over Edge AI, computer vision en productontwikkeling.',
      ),
    ],
    body: [
      block('De contactgegevens staan op deze pagina en kunnen met één klik worden gekopieerd.'),
    ],
  }

  const projectsPageNl = {
    _id: 'page-projects-nl',
    _type: 'page',
    language: 'nl',
    title: 'Projecten',
    slug: {_type: 'slug', current: 'projects'},
    overview: [
      block(
        'Een selectie van werk op het gebied van Edge AI, computer vision en producten — van realtime pijplijnen tot full-stackproductoplevering.',
      ),
    ],
    body: [],
  }

  const pages = [
    aboutPage,
    educationPage,
    workPage,
    skillsPage,
    contactPage,
    projectsPage,
    aboutPageNl,
    educationPageNl,
    workPageNl,
    skillsPageNl,
    contactPageNl,
    projectsPageNl,
  ]

  const home = {
    _id: 'home',
    _type: 'home',
    language: 'en',
    title: 'Mohammadreza Hosseini',
    overview: [
      block(
        'Edge AI / Computer Vision engineer focused on real-time vision systems — from model optimization to production serving on edge devices and Kubernetes.',
      ),
    ],
    showcaseProjects: showcaseRefs('en'),
  }

  const homeNl = {
    _id: 'home-nl',
    _type: 'home',
    language: 'nl',
    title: 'Mohammadreza Hosseini',
    overview: [
      block(
        'Edge AI-/Computer Vision-engineer gericht op realtime beeldverwerkingssystemen — van modeloptimalisatie tot productie-inferentie op edge-apparaten en Kubernetes.',
      ),
    ],
    showcaseProjects: showcaseRefs('nl'),
  }

  const menuItems = (language) => {
    const suffix = language === 'en' ? '' : '-nl'
    return [
      {_type: 'reference', _ref: `home${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-about${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-work${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-projects${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-education${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-skills${suffix}`, _key: key()},
      {_type: 'reference', _ref: `page-contact${suffix}`, _key: key()},
    ]
  }

  const settings = {
    _id: 'settings',
    _type: 'settings',
    language: 'en',
    menuItems: menuItems('en'),
    footer: [
      block('Mohammadreza Hosseini · Edge AI / Computer Vision'),
      linkBlock('GitHub', 'https://github.com/mowhammadrezaa'),
      linkBlock('LinkedIn', 'https://linkedin.com/in/mohammadreza-hosseini'),
    ],
    ...(introImage ? {ogImage: introImage} : {}),
  }

  const settingsNl = {
    _id: 'settings-nl',
    _type: 'settings',
    language: 'nl',
    menuItems: menuItems('nl'),
    footer: [
      block('Mohammadreza Hosseini · Edge AI / Computer Vision'),
      linkBlock('GitHub', 'https://github.com/mowhammadrezaa'),
      linkBlock('LinkedIn', 'https://linkedin.com/in/mohammadreza-hosseini'),
    ],
    ...(introImage ? {ogImage: introImage} : {}),
  }

  let tx = client.transaction()
  for (const doc of [...projectDocs, ...pages, home, homeNl, settings, settingsNl]) {
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
