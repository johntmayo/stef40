'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getUserName } from '@/lib/auth'
import { getUserMood, updateUserMood } from '@/lib/useGoogleSheets'

const MOODS = [
  { id: 'quiet-moss', label: 'Quiet Moss', emoji: '🌿' },
  { id: 'chaotic-squirrel', label: 'Chaotic Squirrel', emoji: '🐿️' },
  { id: 'ancient-burl', label: 'Ancient Burl', emoji: '🌳' },
]

const MOOD_ICONS: Record<string, string> = {
  'quiet-moss': '🌿',
  'chaotic-squirrel': '🐿️',
  'ancient-burl': '🌳',
}

export default function Canopy() {
  const [userName, setUserName] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
    if (name) {
      loadUserMood(name)
    }
  }, [])

  const loadUserMood = async (name: string) => {
    try {
      const mood = await getUserMood(name)
      setCurrentMood(mood)
    } catch (error) {
      console.error('Failed to load mood:', error)
    }
  }

  const handleMoodChange = async (moodId: string) => {
    if (!userName || isUpdating) return
    
    setIsUpdating(true)
    try {
      await updateUserMood(userName, moodId)
      setCurrentMood(moodId)
    } catch (error) {
      console.error('Failed to update mood:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!userName) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="p-6 md:p-12"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl md:text-5xl font-serif text-moss-deep mb-4"
        >
          Welcome back to the clearing, {userName}
          {currentMood && (
            <span className="ml-3 text-2xl md:text-4xl">
              {MOOD_ICONS[currentMood]}
            </span>
          )}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8"
        >
          <p className="text-moss-deep/70 mb-4 text-sm md:text-base">
            What is your woodland mood today?
          </p>
          <div className="flex flex-wrap gap-4">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.id}
                onClick={() => handleMoodChange(mood.id)}
                disabled={isUpdating}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-6 py-3 rounded-full border-2 transition-all
                  ${currentMood === mood.id
                    ? 'bg-moss-deep text-mist-light border-moss-deep'
                    : 'bg-white text-moss-deep border-moss-deep/30 hover:border-moss-deep/50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="mr-2 text-xl">{mood.emoji}</span>
                <span className="font-medium">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

