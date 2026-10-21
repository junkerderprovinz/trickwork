import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const wails = vi.hoisted(() => ({
  isDesktop: vi.fn(() => true),
  callApp: vi.fn(async (): Promise<unknown> => ''),
}))
vi.mock('./wails', () => wails)

let stored: Map<string, string>

beforeEach(() => {
  stored = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
  })
  wails.isDesktop.mockReturnValue(true)
  wails.callApp.mockReset()
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function boot(installLanguage: string): Promise<string> {
  wails.callApp.mockResolvedValue(installLanguage)
  const i18n = await import('./i18n')
  await i18n.applyCachedLocale()
  return i18n.currentLocale()
}

describe('the installer language', () => {
  it('is what a first start shows, and is kept as a choice', async () => {
    expect(await boot('de')).toBe('de')
    expect(stored.get('trickwork-locale')).toBe('de')
  })

  it('gives way to a language picked in the app', async () => {
    stored.set('trickwork-locale', 'en')
    expect(await boot('de')).toBe('en')
    expect(wails.callApp).not.toHaveBeenCalled()
  })

  it('changes nothing when the app has no such language', async () => {
    expect(await boot('xx')).toBe('en')
    expect(stored.has('trickwork-locale')).toBe(false)
  })

  it('changes nothing when no installer chose one', async () => {
    expect(await boot('')).toBe('en')
    expect(stored.has('trickwork-locale')).toBe(false)
  })

  it('is not asked for outside the desktop app', async () => {
    wails.isDesktop.mockReturnValue(false)
    expect(await boot('de')).toBe('en')
    expect(wails.callApp).not.toHaveBeenCalled()
  })
})
