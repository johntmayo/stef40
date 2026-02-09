'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUserName, STEF_ADMIN_NAME } from '@/lib/auth'
import Navigation from '@/components/Navigation'
import {
  getGuests,
  getAllEvents,
  createEvent,
  addPost,
  type Event,
  type CreateEventPayload,
} from '@/lib/useGoogleSheets'

export default function AdminPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [guests, setGuests] = useState<string[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [eventForm, setEventForm] = useState<CreateEventPayload>({
    name: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    isSecret: false,
    inviteList: [],
  })
  const [postMessage, setPostMessage] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)
  const [savingPost, setSavingPost] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
    if (name !== STEF_ADMIN_NAME) {
      router.replace('/')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [guestList, eventsList] = await Promise.all([getGuests(), getAllEvents()])
      setGuests(guestList)
      setEvents(eventsList)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventForm.name.trim() || !eventForm.date.trim()) {
      showMsg('err', 'Name and date are required.')
      return
    }
    setSavingEvent(true)
    try {
      await createEvent({
        ...eventForm,
        inviteList: eventForm.inviteList || [],
        responses: {},
      })
      showMsg('ok', 'Event created.')
      setEventForm({ name: '', date: '', time: '', endTime: '', location: '', description: '', isSecret: false, inviteList: [] })
      await loadData()
    } catch (err) {
      showMsg('err', err instanceof Error ? err.message : 'Failed to create event.')
    } finally {
      setSavingEvent(false)
    }
  }

  const handleInviteToggle = (name: string) => {
    const list = eventForm.inviteList || []
    if (list.includes(name)) {
      setEventForm({ ...eventForm, inviteList: list.filter((n) => n !== name) })
    } else {
      setEventForm({ ...eventForm, inviteList: [...list, name] })
    }
  }

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postMessage.trim()) return
    setSavingPost(true)
    try {
      await addPost(STEF_ADMIN_NAME, postMessage.trim())
      showMsg('ok', 'Post added to the Guestbook.')
      setPostMessage('')
    } catch (err) {
      showMsg('err', err instanceof Error ? err.message : 'Failed to add post.')
    } finally {
      setSavingPost(false)
    }
  }

  const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '#'

  if (userName !== STEF_ADMIN_NAME) return null

  return (
    <>
      <Navigation />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-12 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl md:text-4xl font-serif mb-2" style={{ color: 'var(--page-text)' }}>
        Admin
      </h1>
      <p className="text-sm opacity-80 mb-8" style={{ color: 'var(--page-text)' }}>
        Create events, make posts, and see who has RSVP&apos;d. Only you can see this page.
      </p>

      {message && (
        <div
          className={`mb-6 px-4 py-2 rounded-md ${message.type === 'ok' ? 'bg-green-500/20 text-green-800' : 'bg-red-500/20 text-red-800'}`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="opacity-70" style={{ color: 'var(--page-text)' }}>Loading…</p>
      ) : (
        <div className="space-y-10">
          {/* Create Event */}
          <section className="theme-card border rounded-lg p-6" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-serif mb-4" style={{ color: 'var(--page-text)' }}>
              Create event
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                  Event name *
                </label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border bg-transparent"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                    Start time
                  </label>
                  <input
                    type="text"
                    value={eventForm.time || ''}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="e.g. 6:00 PM"
                    className="w-full px-3 py-2 rounded border bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                    End time
                  </label>
                  <input
                    type="text"
                    value={eventForm.endTime || ''}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    placeholder="e.g. 8:00 PM"
                    className="w-full px-3 py-2 rounded border bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location || ''}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="e.g. Main Lodge"
                    className="w-full px-3 py-2 rounded border bg-transparent"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80" style={{ color: 'var(--page-text)' }}>
                  Description
                </label>
                <textarea
                  value={eventForm.description || ''}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded border bg-transparent resize-none"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSecret"
                  checked={eventForm.isSecret || false}
                  onChange={(e) => setEventForm({ ...eventForm, isSecret: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isSecret" className="text-sm opacity-80" style={{ color: 'var(--page-text)' }}>
                  Secret (only invited guests see this event)
                </label>
              </div>
              {eventForm.isSecret && guests.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80" style={{ color: 'var(--page-text)' }}>
                    Invite these guests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {guests.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleInviteToggle(g)}
                        className={`px-3 py-1 rounded-full text-sm border ${(eventForm.inviteList || []).includes(g) ? 'opacity-100 ring-2' : 'opacity-60'}`}
                        style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={savingEvent}
                className="px-4 py-2 rounded font-medium bg-moss-deep text-mist-light hover:bg-moss-light disabled:opacity-50"
              >
                {savingEvent ? 'Creating…' : 'Create event'}
              </button>
            </form>
          </section>

          {/* Make post */}
          <section className="theme-card border rounded-lg p-6" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-serif mb-4" style={{ color: 'var(--page-text)' }}>
              Make a post
            </h2>
            <p className="text-sm opacity-80 mb-3" style={{ color: 'var(--page-text)' }}>
              This will appear on the Guestbook as a post from you (the host).
            </p>
            <form onSubmit={handleAddPost} className="space-y-3">
              <textarea
                value={postMessage}
                onChange={(e) => setPostMessage(e.target.value)}
                placeholder="Your message..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded border bg-transparent resize-none"
                style={{ borderColor: 'var(--border-color)', color: 'var(--page-text)' }}
              />
              <button
                type="submit"
                disabled={savingPost || !postMessage.trim()}
                className="px-4 py-2 rounded font-medium bg-moss-deep text-mist-light hover:bg-moss-light disabled:opacity-50"
              >
                {savingPost ? 'Posting…' : 'Post to Guestbook'}
              </button>
            </form>
          </section>

          {/* RSVPs */}
          <section className="theme-card border rounded-lg p-6" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-serif mb-4" style={{ color: 'var(--page-text)' }}>
              Who has RSVP&apos;d
            </h2>
            {events.length === 0 ? (
              <p className="text-sm opacity-70" style={{ color: 'var(--page-text)' }}>
                No events yet. Create one above or add rows in the Itinerary sheet.
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((ev) => {
                  const responses = (ev.responses && typeof ev.responses === 'object' ? ev.responses : {}) as Record<string, 'in' | 'out'>
                  const ins = Object.entries(responses).filter(([, v]) => v === 'in').map(([n]) => n)
                  const outs = Object.entries(responses).filter(([, v]) => v === 'out').map(([n]) => n)
                  return (
                    <div
                      key={ev.id}
                      className="border rounded p-4"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="font-medium mb-1" style={{ color: 'var(--page-text)' }}>
                        {ev.name || 'Untitled'}
                        {ev.date && (
                          <span className="text-sm font-normal opacity-80 ml-2">
                            {ev.date}
                            {ev.time && ` · ${ev.time}`}
                            {ev.endTime && ` – ${ev.endTime}`}
                            {ev.location && ` · ${ev.location}`}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-green-700 dark:text-green-400">
                          In: {ins.length ? ins.join(', ') : '—'}
                        </span>
                        <span className="text-amber-700 dark:text-amber-400">
                          Out: {outs.length ? outs.join(', ') : '—'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <p className="text-sm opacity-70" style={{ color: 'var(--page-text)' }}>
            <a href={googleSheetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              Open the Google Sheet
            </a>{' '}
            to edit events, guests, and mist level directly.
          </p>
        </div>
      )}
    </motion.div>
    </>
  )
}
