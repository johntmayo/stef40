'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getUserName } from '@/lib/auth'
import { getEvents, updateEventResponse, Event } from '@/lib/useGoogleSheets'
import { formatEventDateTime } from '@/lib/formatEvent'

export default function RootSystem() {
  const [userName, setUserName] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
    if (name) {
      loadEvents(name)
    }
  }, [])

  const loadEvents = async (name: string) => {
    setLoading(true)
    try {
      const eventsData = await getEvents(name)
      // Ensure we always set an array
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const setResponse = async (eventId: string, response: 'in' | 'out') => {
    if (!userName || updating) return
    setUpdating(eventId)
    try {
      await updateEventResponse(eventId, userName, response)
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, responses: { ...(event.responses || {}), [userName]: response } }
            : event
        )
      )
    } catch (error) {
      console.error('Failed to update response:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-moss-deep/70">Loading events...</p>
        </div>
      </div>
    )
  }

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
          RSVPs
        </motion.h2>
        <p className="event-meta mb-8 text-sm md:text-base">
          Let us know if you&apos;re coming to each event
        </p>

        <div className="space-y-4">
          {events.map((event, index) => {
            const responses = event.responses && typeof event.responses === 'object' ? event.responses : {}
            const myResponse = userName ? responses[userName] : undefined
            const { dateLine, timeLocationLine } = formatEventDateTime(event)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="theme-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-serif event-heading">
                        {event.name || 'Untitled Event'}
                      </h3>
                      {event.isSecret && (
                        <span className="text-xs px-2 py-1 rounded-full event-badge">
                          Secret
                        </span>
                      )}
                    </div>
                    {dateLine && <p className="event-meta text-sm mb-0.5">{dateLine}</p>}
                    {timeLocationLine && <p className="event-meta text-sm mb-2 opacity-90">{timeLocationLine}</p>}
                    {event.description && (
                      <p className="text-sm event-meta mt-2 opacity-90">
                        {event.description}
                      </p>
                    )}
                    {myResponse && (
                      <p className="text-sm mt-2 event-meta">
                        You&apos;re {myResponse === 'in' ? 'going' : 'not going'}.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <motion.button
                      type="button"
                      onClick={() => setResponse(event.id, 'in')}
                      disabled={updating === event.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        px-4 py-2 rounded-md border-2 font-medium transition-all text-sm
                        ${myResponse === 'in'
                          ? 'bg-moss-deep text-mist-light border-moss-deep'
                          : 'border-current opacity-70 hover:opacity-100'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      style={myResponse !== 'in' ? { borderColor: 'var(--border-color)', color: 'var(--page-text)' } : undefined}
                    >
                      {updating === event.id ? '…' : "I'm going"}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setResponse(event.id, 'out')}
                      disabled={updating === event.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        px-4 py-2 rounded-md border-2 font-medium transition-all text-sm
                        ${myResponse === 'out'
                          ? 'border-red-400 bg-red-400/20 text-red-700 dark:text-red-300'
                          : 'border-current opacity-70 hover:opacity-100'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      style={myResponse !== 'out' ? { borderColor: 'var(--border-color)', color: 'var(--page-text)' } : undefined}
                    >
                      {updating === event.id ? '…' : "I'm not going"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {events.length === 0 && (
            <p className="text-moss-deep/70 text-center py-12">
              No events found. The forest is quiet.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

