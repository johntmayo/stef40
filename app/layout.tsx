import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Redwood Portal',
  description: 'A 40th Birthday retreat in the Redwoods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

