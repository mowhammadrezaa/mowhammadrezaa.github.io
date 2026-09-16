import './globals.css'
import type {Metadata} from 'next'
import {IBM_Plex_Mono, Inter, PT_Serif} from 'next/font/google'

const serif = PT_Serif({
  variable: '--font-serif',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['400', '700'],
})
const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  // @todo: understand why extrabold (800) isn't being respected when explicitly specified in this weight array
  // weight: ['500', '700', '800'],
})
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})

export const metadata: Metadata = {
  icons: {
    icon: [
      {url: '/icons/mh.ico', sizes: 'any'},
      {url: '/icons/mh-32.png', sizes: '32x32', type: 'image/png'},
      {url: '/icons/mh.png', sizes: '512x512', type: 'image/png'},
    ],
    shortcut: '/icons/mh.ico',
    apple: [{url: '/icons/mh-180.png', sizes: '180x180', type: 'image/png'}],
  },
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
