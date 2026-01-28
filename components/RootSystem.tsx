'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getUserName } from '@/lib/auth'
import { getEvents, updateEventResponse, Event } from '@/lib/useGoogleSheets'

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

  const handleToggle = async (eventId: string, currentResponse: 'in' | 'out' | undefined) => {
    if (!userName || updating) return

    const newResponse = currentResponse === 'in' ? 'out' : 'in'
    setUpdating(eventId)

    try {
      await updateEventResponse(eventId, userName, newResponse)
      // Update local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, responses: { ...event.responses, [userName]: newResponse } }
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
          The Root System
        </motion.h2>
        <p className="text-moss-deep/70 mb-8 text-sm md:text-base">
          Toggle your presence for each gathering
        </p>

        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-moss-deep/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif text-moss-deep">
                      {event.name || 'Untitled Event'}
                    </h3>
                    {event.isSecret && (
                      <span className="text-xs px-2 py-1 bg-moss-deep/10 text-moss-deep rounded-full">
                        Secret Offering
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
                </div>

                <div className="ml-4">
                  <motion.button
                    onClick={() => handleToggle(event.id, event.responses && typeof event.responses === 'object' ? event.responses[userName || ''] : undefined)}
                    disabled={updating === event.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-6 py-2 rounded-md border-2 font-medium transition-all
                      ${
                        event.responses && typeof event.responses === 'object' && event.responses[userName || ''] === 'in'
                          ? 'bg-moss-deep text-mist-light border-moss-deep'
                          : 'bg-white text-moss-deep border-moss-deep/30 hover:border-moss-deep/50'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {updating === event.id
                      ? '...'
                      : event.responses && typeof event.responses === 'object' && event.responses[userName || ''] === 'in'
                      ? 'In'
                      : 'Out'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

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

