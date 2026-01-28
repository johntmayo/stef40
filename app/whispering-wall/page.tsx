'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { isAuthenticated } from '@/lib/auth'
import Navigation from '@/components/Navigation'
import WhisperingWall from '@/components/WhisperingWall'

export default function WhisperingWallPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <>
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WhisperingWall />
      </motion.div>
    </>
  )
}

