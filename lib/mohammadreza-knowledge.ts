/**
 * Knowledge base for the site resume chatbot.
 * Keep in sync with swe-cv/configuration-en.yaml and the live About / Experience content.
 */
export const PERSON_NAME = 'Mohammadreza Hosseini'

export const SUGGESTED_QUESTIONS = [
  'What does Mohammadreza do right now?',
  'What edge AI experience does he have?',
  'Tell me about PassaTeoria',
  'Is he available to work in the Netherlands?',
  'What are his strongest technical skills?',
]

export const KNOWLEDGE_BASE = `
Name: Mohammadreza Hosseini
Primary focus: Edge AI / Computer Vision engineer — real-time vision systems from model optimization to production serving on edge devices and Kubernetes.
Also described as: Applied AI Engineer with 3+ years deploying production AI in computer vision and NLP.

Location / authorization:
- Based in the Netherlands
- Dutch Orientation Year (Zoekjaar) valid through 30 July 2027 (Arbeid vrij toegestaan / TWV not required)
- No sponsorship or IND filing required to start immediately
- Available immediately; willing to relocate within the Netherlands / EU for on-site or hybrid Edge AI, Computer Vision, or AI platform/serving roles

Contact:
- Email: m.hosseini.eng@outlook.com
- Phone: +31 6 1621 8039
- GitHub: https://github.com/mowhammadrezaa
- LinkedIn: https://linkedin.com/in/mohammadreza-hosseini
- Instagram: https://www.instagram.com/mohammadreza.hosseini.88
- Site: https://mowhammadrezaa-github-io.vercel.app

Current roles:
1) Computer Vision Engineer at AWENTIA (Nov 2024 – Present)
- Builds C++/GStreamer pipelines on Hailo and NVIDIA stacks (DeepStream, TensorRT, OpenVINO)
- Deploys models with Triton Inference Server
- Automated dataset collection / embedded IoT firmware; ~40% less manual data collection
- Real-time image pipelines with custom pre/post-processing and tensor decoders
- Cross-platform edge runtime debugging with compiler/platform teams
- Kubernetes + Triton + CI/CD; ~60% reduction in deployment time
- Cross-industry computer vision SDKs integrating AI into edge devices for client automation

2) Founder & Full-Stack Engineer, PassaTeoria (Jun 2026 – Present)
- Product: https://passateoria.it — Italian driving theory exam (patente A1/A/B)
- Cross-platform web, Android (Google Play), iOS from one Expo / React Native codebase
- Content: 25-lesson course (656 sections, ~87k words), 7,139 true/false quizzes, 4,500+ term dictionary with tap-to-translate and Italian pronunciation; native content in 7 languages + on-demand AI translation for 170+ languages
- Freemium SaaS: Google OAuth, Stripe Checkout (web), Google Play Billing (Android), device entitlement, rate limiting, GDPR deletion
- Ops: Supabase (Postgres, Auth, RLS), Express API, Docker on GCP (Terraform), Cloudflare TLS, Telegram admin bot

Previous roles:
- AI Integration Engineer, NOVA XR (Apr 2024 – Jul 2024): real-time AI in Unreal Engine; ~20ms inference; Docker/Kubernetes serving
- Teaching Assistant, University of Bologna (Sep 2022 – Sep 2025): taught AI concepts to 300+ students; worked with Professors Simone Martini and Michael Lodi

Education:
- M.S. in Artificial Intelligence, University of Bologna (Sep 2021 – Oct 2024), GPA 3.78 — Bologna, Italy
- B.S. in Computer Science, University of Damghan (Feb 2015 – Feb 2019) — Damghan, Iran

Selected projects:
- Real-Time Multi-Class Safety Detection Pipeline (AWENTIA): C++/GStreamer on Hailo; humans/animals/tools/machinery; Global Shutter camera; stable 30 FPS
- Medicine Packet Identification Pipeline (AWENTIA): C++/GStreamer on Hailo for detection/identification in QC workflows
- Open-Vocabulary Detection with OWLv2 on Jetson Orin (AWENTIA): full OWLv2 + Triton; prompt-based detection; ~4 FPS
- Grounded-SAM on OAK-Depth VPU (personal): box detection/size/orientation/QR on pallets; ~2 FPS on-device
- PassaTeoria (see above)

Publication (2024):
Shami, S., Haecker, B., Aberger, J., Hosseini, M., Pestana, J., Krisper, M., 2024. Comparative Analysis of Transfer and Continual Learning for Vision Based Particle Classification in Plastics Sorting for Recycling. Proceedings of the Recy & Depotech Conference 2024, Montanuniversität Leoben.

Skills (selected):
- Languages: Python, C++, JavaScript, TypeScript, Prolog, Bash, SQL
- AI/data: PyTorch, TensorFlow, Scikit-learn, Transformers, OpenCV, LangChain, SpaCy, NLTK, Pandas, NumPy, Apache Spark, Hugging Face
- Edge & serving: NVIDIA TensorRT, NVIDIA DeepStream, OpenVINO, GStreamer, Triton Inference Server, Hailo, Jetson
- Platforms: Docker, Kubernetes, CI/CD, Terraform, Linux, Git, AWS, Azure, GCP, MLflow, Apache Airflow
- Product/web: React, React Native, Expo, Django, Flask, Gradio, PostgreSQL, Supabase, Redis, Stripe

Certifications:
- AWS Cloud Quest, Cloud Practitioner
- The Protection of Personal Data (GDPR and Cybersecurity)
- Google Cloud Digital Leader Training
- Google Cloud Engineer and DevOps

Spoken languages: English (C1), Italian (A1)
Focus areas: Edge AI, Computer Vision, Real-time Inference, AI Platform / Serving; also NLP and full-stack product development
Hobbies: Hiking, Chess, Table Tennis
`.trim()

export const DUTCH_SUGGESTED_QUESTIONS = [
  'Wat doet Mohammadreza momenteel?',
  'Welke ervaring heeft hij met edge-AI?',
  'Vertel me over PassaTeoria',
  'Is hij beschikbaar voor werk in Nederland?',
  'Wat zijn zijn sterkste technische vaardigheden?',
]

export const DUTCH_KNOWLEDGE_BASE = `
Naam: Mohammadreza Hosseini
Hoofdfocus: engineer op het gebied van edge-AI en computer vision — realtime visionsystemen, van modeloptimalisatie tot productie-implementatie op edgeapparaten en Kubernetes.
Ook omschreven als: Applied AI Engineer met meer dan 3 jaar ervaring in het in productie brengen van AI voor computer vision en NLP.

Locatie / werkvergunning:
- Gevestigd in Nederland
- Nederlandse verblijfsvergunning zoekjaar, geldig tot en met 30 juli 2027 (arbeid vrij toegestaan; geen TWV vereist)
- Geen sponsoring of IND-aanvraag nodig om direct te kunnen beginnen
- Per direct beschikbaar; bereid om binnen Nederland / de EU te verhuizen voor functies op locatie of in hybride vorm op het gebied van edge-AI, computer vision of AI-platformen/model-serving

Contact:
- E-mail: m.hosseini.eng@outlook.com
- Telefoon: +31 6 1621 8039
- GitHub: https://github.com/mowhammadrezaa
- LinkedIn: https://linkedin.com/in/mohammadreza-hosseini
- Instagram: https://www.instagram.com/mohammadreza.hosseini.88
- Website: https://mowhammadrezaa-github-io.vercel.app

Huidige functies:
1) Computer Vision Engineer bij AWENTIA (november 2024 – heden)
- Bouwt C++/GStreamer-pipelines op Hailo- en NVIDIA-stacks (DeepStream, TensorRT, OpenVINO)
- Implementeert modellen met Triton Inference Server
- Automatiseerde datasetverzameling en embedded IoT-firmware; circa 40% minder handmatige dataverzameling
- Realtime beeldpipelines met aangepaste voor- en nabewerking en tensordecoders
- Debugt edge-runtimes op meerdere platformen, in samenwerking met compiler- en platformteams
- Kubernetes + Triton + CI/CD; circa 60% kortere implementatietijd
- Ontwikkelt sectoroverstijgende computer-vision-SDK's waarmee klanten AI in edgeapparaten kunnen integreren voor automatisering

2) Oprichter & Full-Stack Engineer, PassaTeoria (juni 2026 – heden)
- Product: https://passateoria.it — theorie-examen voor het Italiaanse rijbewijs (patente A1/A/B)
- Cross-platform web-, Android- (Google Play) en iOS-app vanuit één Expo/React Native-codebase
- Inhoud: cursus met 25 lessen (656 onderdelen, circa 87.000 woorden), 7.139 waar/onwaar-vragen en een woordenboek met meer dan 4.500 termen, tikken-om-te-vertalen en Italiaanse uitspraak; native content in 7 talen plus AI-vertaling op aanvraag voor meer dan 170 talen
- Freemium-SaaS: Google OAuth, Stripe Checkout (web), Google Play Billing (Android), apparaatrechten, rate limiting en verwijdering conform de AVG
- Operations: Supabase (Postgres, Auth, RLS), Express-API, Docker op GCP (Terraform), Cloudflare TLS en een Telegram-beheerbot

Eerdere functies:
- AI Integration Engineer, NOVA XR (april 2024 – juli 2024): realtime AI in Unreal Engine; circa 20 ms inferentietijd; serving met Docker/Kubernetes
- Onderwijsassistent, Universiteit van Bologna (september 2022 – september 2025): gaf les over AI-concepten aan meer dan 300 studenten; werkte samen met professoren Simone Martini en Michael Lodi

Opleiding:
- M.Sc. Artificial Intelligence, Universiteit van Bologna (september 2021 – oktober 2024), GPA 3,78 — Bologna, Italië
- B.Sc. Computer Science, Universiteit van Damghan (februari 2015 – februari 2019) — Damghan, Iran

Geselecteerde projecten:
- Realtime detectiepipeline voor meerdere veiligheidsklassen (AWENTIA): C++/GStreamer op Hailo; mensen/dieren/gereedschappen/machines; global-shuttercamera; stabiele 30 FPS
- Identificatiepipeline voor medicijnverpakkingen (AWENTIA): C++/GStreamer op Hailo voor detectie en identificatie in kwaliteitscontroleprocessen
- Open-vocabulary-detectie met OWLv2 op Jetson Orin (AWENTIA): volledige OWLv2 + Triton; promptgestuurde detectie; circa 4 FPS
- Grounded-SAM op OAK-Depth VPU (persoonlijk): detectie van dozen, formaat, oriëntatie en QR-codes op pallets; circa 2 FPS op het apparaat
- PassaTeoria (zie hierboven)

Publicatie (2024):
Shami, S., Haecker, B., Aberger, J., Hosseini, M., Pestana, J., Krisper, M., 2024. Comparative Analysis of Transfer and Continual Learning for Vision Based Particle Classification in Plastics Sorting for Recycling. Proceedings of the Recy & Depotech Conference 2024, Montanuniversität Leoben.

Vaardigheden (selectie):
- Programmeertalen: Python, C++, JavaScript, TypeScript, Prolog, Bash, SQL
- AI/data: PyTorch, TensorFlow, Scikit-learn, Transformers, OpenCV, LangChain, SpaCy, NLTK, Pandas, NumPy, Apache Spark, Hugging Face
- Edge & serving: NVIDIA TensorRT, NVIDIA DeepStream, OpenVINO, GStreamer, Triton Inference Server, Hailo, Jetson
- Platformen: Docker, Kubernetes, CI/CD, Terraform, Linux, Git, AWS, Azure, GCP, MLflow, Apache Airflow
- Product/web: React, React Native, Expo, Django, Flask, Gradio, PostgreSQL, Supabase, Redis, Stripe

Certificeringen:
- AWS Cloud Quest, Cloud Practitioner
- The Protection of Personal Data (GDPR and Cybersecurity)
- Google Cloud Digital Leader Training
- Google Cloud Engineer and DevOps

Gesproken talen: Engels (C1), Italiaans (A1)
Aandachtsgebieden: edge-AI, computer vision, realtime inferentie, AI-platformen/model-serving; daarnaast NLP en full-stack productontwikkeling
Hobby's: wandelen, schaken, tafeltennis
`.trim()

export const CHAT_KNOWLEDGE = {
  en: {
    knowledgeBase: KNOWLEDGE_BASE,
    suggestedQuestions: SUGGESTED_QUESTIONS,
  },
  nl: {
    knowledgeBase: DUTCH_KNOWLEDGE_BASE,
    suggestedQuestions: DUTCH_SUGGESTED_QUESTIONS,
  },
} as const
