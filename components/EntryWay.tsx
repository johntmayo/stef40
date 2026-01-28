'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { setUserName, verifyMagicWord } from '@/lib/auth'

// Fallback guest names - these will be used if API doesn't return guest list
const FALLBACK_GUEST_NAMES = [
  'Stef',
  'Alex',
  'Jordan',
  'Morgan',
  'Riley',
  'Casey',
  'Taylor',
  'Sam',
]

export default function EntryWay() {
  const [selectedName, setSelectedName] = useState('')
  const [magicWord, setMagicWord] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [guestNames, setGuestNames] = useState<string[]>(FALLBACK_GUEST_NAMES)
  const [loadingGuests, setLoadingGuests] = useState(true)
  const router = useRouter()

  // Try to fetch guest names from the API
  useEffect(() => {
    const fetchGuestNames = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
        if (!url) {
          setLoadingGuests(false)
          return
        }
        
        // Try to get guests from the API
        const response = await fetch(`${url}?action=getGuests`)
        if (response.ok) {
          const data = await response.json()
          // Handle different possible response formats
          if (data.Guests && Array.isArray(data.Guests) && data.Guests.length > 0) {
            setGuestNames(data.Guests)
          } else if (Array.isArray(data) && data.length > 0) {
            setGuestNames(data)
          } else if (data.guests && Array.isArray(data.guests)) {
            setGuestNames(data.guests)
          }
        }
      } catch (error) {
        console.log('Could not fetch guest names from API, using fallback list')
      } finally {
        setLoadingGuests(false)
      }
    }

    fetchGuestNames()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedName) {
      setError('Please identify yourself in the grove')
      return
    }

    if (!verifyMagicWord(magicWord)) {
      setError('The magic word does not resonate with the forest')
      return
    }

    setIsLoading(true)
    setUserName(selectedName)
    
    // Smooth transition
    setTimeout(() => {
      router.push('/canopy')
    }, 500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-moss-deep/40" />
        <div className="absolute inset-0 dappled-light" />
      </div>

      {/* Login Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 min-h-screen flex items-center justify-center p-6"
      >
        <div className="bg-mist-light/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-12 max-w-md w-full border border-moss-deep/10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-center mb-2 text-moss-deep"
          >
            The Redwood Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center text-moss-deep/70 mb-8 text-sm"
          >
            Enter the grove
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-moss-deep mb-2">
                Identify yourself in the grove
              </label>
              <select
                id="name"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                disabled={loadingGuests}
                className="w-full px-4 py-3 bg-white border border-moss-deep/20 rounded-md focus:outline-none focus:ring-2 focus:ring-moss-deep/30 focus:border-moss-deep/40 text-moss-deep disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingGuests ? 'Loading guests...' : 'Select your name...'}
                </option>
                {guestNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="magicWord" className="block text-sm font-medium text-moss-deep mb-2">
                Magic Word
              </label>
              <input
                id="magicWord"
                type="text"
                value={magicWord}
                onChange={(e) => setMagicWord(e.target.value)}
                placeholder="Whisper the secret..."
                className="w-full px-4 py-3 bg-white border border-moss-deep/20 rounded-md focus:outline-none focus:ring-2 focus:ring-moss-deep/30 focus:border-moss-deep/40 text-moss-deep placeholder:text-moss-deep/40"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-moss-deep text-mist-light rounded-md font-medium hover:bg-moss-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entering the grove...' : 'Enter'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

