// The header logo, the designer's file as .github/assets/gen-icons.mjs copies
// it into ui/public. An image keeps the classes of its own <style> to itself,
// which inlined markup would spread across the page.
export function brandLogo(): string {
  return '<img src="/logo.svg" class="app-brand-logo" alt="" aria-hidden="true">'
}
