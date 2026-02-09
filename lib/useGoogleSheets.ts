import { useState, useEffect } from 'react'

// Replace with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || ''

if (!GOOGLE_SCRIPT_URL && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_GOOGLE_SCRIPT_URL is not set. Please configure it in .env.local')
}

export interface Event {
  id: string
  name: string
  date: string
  time: string
  description: string
  isSecret: boolean
  inviteList: string[]
  responses: Record<string, 'in' | 'out'>
}

export interface GuestNote {
  id: string
  name: string
  message: string
  timestamp: string
  isHost?: boolean
}

export interface CreateEventPayload {
  id?: string
  name: string
  date: string
  time?: string
  description?: string
  isSecret?: boolean
  inviteList?: string[]
  responses?: Record<string, 'in' | 'out'>
}

export interface MistLevel {
  level: string
  message: string
}

export interface UserMood {
  name: string
  mood: string
}

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (endpoint: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=${endpoint}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const postData = async (endpoint: string, payload: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: endpoint,
          ...payload,
        }),
      })
      if (!response.ok) throw new Error('Failed to update data')
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchData,
    postData,
  }
}

export async function getEvents(userName: string): Promise<Event[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    console.warn('Google Script URL not configured')
    return []
  }
  try {
    const response = await fetch(`${url}?action=getEvents&userName=${userName}`)
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.Itinerary)) {
      return data.Itinerary
    } else if (data && Array.isArray(data.events)) {
      return data.events
    } else {
      console.warn('Unexpected events data format:', data)
      return []
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function updateEventResponse(
  eventId: string,
  userName: string,
  response: 'in' | 'out'
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    throw new Error('Google Script URL not configured')
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateEventResponse',
      eventId,
      userName,
      response,
    }),
  })
}

export async function getGuestNotes(): Promise<GuestNote[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    console.warn('Google Script URL not configured')
    return []
  }
  try {
    const response = await fetch(`${url}?action=getGuestNotes`)
    if (!response.ok) throw new Error('Failed to fetch notes')
    const data = await response.json()
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.Wall)) {
      return data.Wall
    } else if (data && Array.isArray(data.notes)) {
      return data.notes
    } else {
      console.warn('Unexpected notes data format:', data)
      return []
    }
  } catch (error) {
    console.error('Error fetching notes:', error)
    return []
  }
}

export async function addGuestNote(name: string, message: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    throw new Error('Google Script URL not configured')
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addGuestNote',
      name,
      message,
    }),
  })
}

export async function getMistLevel(): Promise<MistLevel> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    return { level: 'Unknown', message: 'Configuration needed' }
  }
  const response = await fetch(`${url}?action=getMistLevel`)
  if (!response.ok) throw new Error('Failed to fetch mist level')
  return response.json()
}

export async function updateUserMood(userName: string, mood: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    throw new Error('Google Script URL not configured')
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateUserMood',
      userName,
      mood,
    }),
  })
}

export async function getUserMood(userName: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    return null
  }
  const response = await fetch(`${url}?action=getUserMood&userName=${userName}`)
  if (!response.ok) throw new Error('Failed to fetch user mood')
  const data = await response.json()
  return data.mood || null
}

/** All events with responses (no secret filtering). For admin only. */
export async function getAllEvents(): Promise<Event[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) return []
  try {
    const response = await fetch(`${url}?action=getAllEvents`)
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching all events:', error)
    return []
  }
}

export async function getGuests(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) {
    console.warn('Google Script URL not configured')
    return []
  }
  try {
    const response = await fetch(`${url}?action=getGuests`)
    if (!response.ok) throw new Error('Failed to fetch guests')
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching guests:', error)
    return []
  }
}

export async function createEvent(event: CreateEventPayload): Promise<void> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) throw new Error('Google Script URL not configured')
  const payload = {
    ...event,
    id: event.id || (crypto.randomUUID?.() ?? `event-${Date.now()}`),
    inviteList: Array.isArray(event.inviteList) ? event.inviteList : [],
    responses: event.responses ?? {},
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createEvent', event: payload }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Failed to create event')
  }
}

export async function addPost(name: string, message: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (!url) throw new Error('Google Script URL not configured')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'addPost', name, message }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Failed to add post')
  }
}

