export const CHARSET_PRESETS = {
  standard: ' .:-=+*#%@'.split(''),
  detailed:
    ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split(
      '',
    ),
  blocks: ' ░▒▓█'.split(''),
} as const

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS
