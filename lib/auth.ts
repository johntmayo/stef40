const MAGIC_WORD = process.env.NEXT_PUBLIC_MAGIC_WORD || 'redwood'

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('redwood_userName')
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('redwood_userName')
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('redwood_userName', name)
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('redwood_userName')
}

export function verifyMagicWord(word: string): boolean {
  return word.toLowerCase().trim() === MAGIC_WORD.toLowerCase()
}

