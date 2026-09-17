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
