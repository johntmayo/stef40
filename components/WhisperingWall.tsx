'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserName } from '@/lib/auth'
import { getGuestNotes, addGuestNote, GuestNote } from '@/lib/useGoogleSheets'

const LEAF_COLORS = [
  'bg-green-50',
  'bg-green-100',
  'bg-emerald-50',
  'bg-emerald-100',
  'bg-teal-50',
  'bg-teal-100',
]

export default function WhisperingWall() {
  const [userName, setUserName] = useState<string | null>(null)
  const [notes, setNotes] = useState<GuestNote[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const notesData = await getGuestNotes()
      setNotes(notesData)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !message.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addGuestNote(userName, message.trim())
      setMessage('')
      await loadNotes()
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRandomRotation = () => {
    return Math.random() * 10 - 5 // -5 to 5 degrees
  }

  const getRandomColor = () => {
    return LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="p-6 md:p-12"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-moss-deep mb-8"
        >
          The Whispering Wall
        </motion.h2>
        <p className="text-moss-deep/70 mb-8 text-sm md:text-base">
          Leave a note for the grove
        </p>

        {/* Add Note Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mb-12"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            maxLength={200}
            className="w-full px-4 py-3 bg-white border border-moss-deep/20 rounded-md focus:outline-none focus:ring-2 focus:ring-moss-deep/30 focus:border-moss-deep/40 text-moss-deep placeholder:text-moss-deep/40 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-moss-deep/50">
              {message.length}/200
            </span>
            <motion.button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-moss-deep text-mist-light rounded-md font-medium hover:bg-moss-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Leaving note...' : 'Leave Note'}
            </motion.button>
          </div>
        </motion.form>

        {/* Notes Grid */}
        {loading ? (
          <p className="text-moss-deep/70 text-center py-12">Loading whispers...</p>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            <AnimatePresence>
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: getRandomRotation() }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    ${getRandomColor()}
                    border border-moss-deep/10
                    rounded-lg p-4 mb-6 break-inside-avoid
                    shadow-sm hover:shadow-md transition-shadow
                  `}
                  style={{
                    transform: `rotate(${getRandomRotation()}deg)`,
                  }}
                >
                  <p className="text-sm text-moss-deep/90 mb-2 italic">
                    "{note.message}"
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-moss-deep/10">
                    <span className="text-xs font-medium text-moss-deep/70">
                      — {note.name}
                    </span>
                    <span className="text-xs text-moss-deep/50">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && notes.length === 0 && (
          <p className="text-moss-deep/70 text-center py-12">
            The wall is quiet. Be the first to whisper.
          </p>
        )}
      </div>
    </motion.div>
  )
}

