'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEvents, getMistLevel, Event, MistLevel } from '@/lib/useGoogleSheets'
import { getUserName } from '@/lib/auth'

export default function ForestPath() {
  const [userName, setUserName] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [mistLevel, setMistLevel] = useState<MistLevel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
    loadData(name)
  }, [])

  const loadData = async (name: string | null) => {
    setLoading(true)
    try {
      const [eventsData, mistData] = await Promise.all([
        getEvents(name || ''),
        getMistLevel(),
      ])
      setEvents(eventsData)
      setMistLevel(mistData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-moss-deep/70">Loading the path...</p>
        </div>
      </div>
    )
  }

  // Ensure events is an array and sort by date
  const eventsArray = Array.isArray(events) ? events : []
  const sortedEvents = eventsArray.sort((a, b) => {
    try {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateA - dateB
    } catch {
      return 0
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="p-6 md:p-12"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-moss-deep mb-8"
        >
          The Forest Path
        </motion.h2>

        {/* Mist Level */}
        {mistLevel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 bg-white border border-moss-deep/20 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌫️</span>
              <div>
                <h3 className="text-lg font-serif text-moss-deep mb-1">
                  Mist Level: {mistLevel.level}
                </h3>
                <p className="text-sm text-moss-deep/70">{mistLevel.message}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line (Trunk) */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-moss-deep/20" />

          {/* Events */}
          <div className="space-y-8">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12 md:pl-20"
              >
                {/* Branch Point */}
                <div className="absolute left-2 md:left-6 top-6 w-4 h-4 bg-moss-deep rounded-full border-4 border-mist-light" />

                {/* Event Card */}
                <div className="bg-white border border-moss-deep/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-serif text-moss-deep">
                      {event.name || 'Untitled Event'}
                    </h3>
                    {event.isSecret && (
                      <span className="text-xs px-2 py-1 bg-moss-deep/10 text-moss-deep rounded-full">
                        Secret
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-moss-deep/60 mb-2">
                    {event.date || ''} {event.time && `• ${event.time}`}
                  </p>
                  {event.description && (
                    <p className="text-sm text-moss-deep/70 mt-2">
                      {event.description}
                    </p>
                  )}
                  {userName && event.responses && typeof event.responses === 'object' && event.responses[userName] && (
                    <div className="mt-3 pt-3 border-t border-moss-deep/10">
                      <span className="text-xs text-moss-deep/60">
                        Your response: <span className="font-medium capitalize">{event.responses[userName]}</span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {sortedEvents.length === 0 && (
            <p className="text-moss-deep/70 text-center py-12">
              The path is clear. Events will appear here.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

