'use client'

import ReactMarkdown from 'react-markdown'

import styles from './PuterResumeChat.module.css'

export function ChatMarkdown({content}: {content: string}) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        components={{
          a: ({href, children}) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
