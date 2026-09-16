import type {InferValue, SanityQueries} from 'next-sanity'

import {CustomPortableText} from '@/components/CustomPortableText'

type PortableValue = InferValue<SanityQueries[keyof SanityQueries]>

type SkillGroup = {
  label: string
  items: string[]
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Python', 'C++', 'JavaScript', 'TypeScript', 'Prolog', 'Bash', 'SQL'],
  },
  {
    label: 'AI & data',
    items: [
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'Transformers',
      'OpenCV',
      'LangChain',
      'SpaCy',
      'NLTK',
      'Pandas',
      'NumPy',
      'Apache Spark',
      'Hugging Face',
    ],
  },
  {
    label: 'Edge & serving',
    items: [
      'NVIDIA TensorRT',
      'NVIDIA DeepStream',
      'OpenVINO',
      'GStreamer',
      'Triton Inference Server',
      'Hailo',
      'Jetson',
    ],
  },
  {
    label: 'Platforms & DevOps',
    items: [
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Terraform',
      'Linux',
      'Git',
      'AWS',
      'Azure',
      'GCP',
      'MLflow',
      'Apache Airflow',
    ],
  },
  {
    label: 'Product & web',
    items: [
      'React',
      'React Native',
      'Expo',
      'Django',
      'Flask',
      'Gradio',
      'PostgreSQL',
      'Supabase',
      'Redis',
      'Stripe',
    ],
  },
]

const CERTIFICATIONS = [
  'AWS Cloud Quest, Cloud Practitioner',
  'The Protection of Personal Data (GDPR and Cybersecurity)',
  'Google Cloud Digital Leader Training',
  'Google Cloud Engineer and DevOps',
]

interface SkillsSectionProps {
  id: string | null
  type: string | null
  title?: string | null
  overview?: PortableValue | null
}

export function SkillsSection({id, type, title, overview}: SkillsSectionProps) {
  return (
    <article className="mx-auto max-w-4xl">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
        Toolkit
      </p>
      {title && (
        <h1
          className="mt-2 font-serif text-4xl tracking-tight text-black md:text-5xl"
          data-testid="page-title"
        >
          {title}
        </h1>
      )}

      {Array.isArray(overview) && overview.length > 0 && (
        <div className="mt-5 max-w-2xl text-pretty font-serif text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-snug">
          <CustomPortableText
            id={id}
            type={type}
            path={['overview']}
            paragraphClasses="text-inherit"
            value={overview}
          />
        </div>
      )}

      <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {SKILL_GROUPS.map((group) => (
          <section
            key={group.label}
            className="grid gap-1.5 py-3.5 md:grid-cols-[9.5rem_minmax(0,1fr)] md:items-baseline md:gap-6 md:py-4"
          >
            <h2 className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gray-400">
              {group.label}
            </h2>
            <p className="font-mono text-[0.8125rem] leading-relaxed text-gray-700 md:text-sm">
              {group.items.join(' · ')}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gray-400">
          Certifications
        </h2>
        <ul className="mt-3 space-y-1.5">
          {CERTIFICATIONS.map((cert) => (
            <li
              key={cert}
              className="border-l-2 border-black/15 pl-3 font-serif text-sm leading-snug text-gray-700 md:text-[0.95rem]"
            >
              {cert}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-5 border-t border-black/[0.08] pt-6 md:grid-cols-2 md:gap-8">
        <aside>
          <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gray-400">
            Spoken languages
          </p>
          <p className="mt-2 font-serif text-sm text-gray-700 md:text-[0.95rem]">
            English (C1), Italian (A1)
          </p>
        </aside>
        <aside>
          <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gray-400">
            Focus areas
          </p>
          <p className="mt-2 font-serif text-sm text-gray-700 md:text-[0.95rem]">
            Edge AI, Computer Vision, Real-time Inference, AI Platform / Serving
          </p>
        </aside>
      </div>
    </article>
  )
}
