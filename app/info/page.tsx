'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { isAuthenticated } from '@/lib/auth'
import Navigation from '@/components/Navigation'
import { getLogistics, type LogisticsItem } from '@/lib/useGoogleSheets'

export default function InfoPage() {
  const router = useRouter()
  const [items, setItems] = useState<LogisticsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
    const load = async () => {
      const data = await getLogistics()
      setItems(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (!isAuthenticated()) return null

  return (
    <>
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-12"
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif mb-2" style={{ color: 'var(--page-text)' }}>
            Info
          </h1>
          <p className="text-sm opacity-80 mb-8" style={{ color: 'var(--page-text)' }}>
            Basic logistics and details for the weekend
          </p>

          {loading ? (
            <p className="opacity-70" style={{ color: 'var(--page-text)' }}>Loading…</p>
          ) : items.length === 0 ? (
            <p className="opacity-70" style={{ color: 'var(--page-text)' }}>
              No info added yet. Add a &quot;Logistics&quot; sheet to your spreadsheet with columns <strong>key</strong> and <strong>value</strong> (e.g. &quot;When&quot;, &quot;June 14–16&quot;) and Stef can edit it there.
            </p>
          ) : (
            <dl className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="theme-card border rounded-lg p-5"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <dt className="text-sm font-medium opacity-80 mb-1" style={{ color: 'var(--page-text)' }}>
                    {item.key}
                  </dt>
                  <dd className="text-base whitespace-pre-wrap" style={{ color: 'var(--page-text)' }}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </motion.div>
    </>
  )
}
