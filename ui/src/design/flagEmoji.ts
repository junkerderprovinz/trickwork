// A native <option> holds only text, so languages carry regional indicator
// emoji rather than flag images. Windows shows them as two-letter tags, which
// the custom dropdown covers with a flag webfont (.dropdown-option-flag).

/**
 * Converts an ISO 3166-1 alpha-2 code ("gb", "DE") to its flag emoji by mapping
 * each letter to its regional indicator symbol (U+1F1E6 for 'A').
 */
export function flagEmoji(isoCode: string): string {
  return Array.from(isoCode.toUpperCase())
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join('');
}
