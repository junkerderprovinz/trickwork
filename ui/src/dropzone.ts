import type { Store } from './state'

export function mountDropzone(container: HTMLElement, store: Store): void {
  const zone = document.createElement('div')
  zone.className = 'dropzone'
  zone.textContent = 'Drop images here, or click to choose files'
  zone.tabIndex = 0

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.style.display = 'none'

  zone.addEventListener('click', () => input.click())
  zone.addEventListener('dragover', (event) => {
    event.preventDefault()
    zone.classList.add('dropzone--active')
  })
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dropzone--active')
  })
  zone.addEventListener('drop', (event) => {
    event.preventDefault()
    zone.classList.remove('dropzone--active')
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (files.length > 0) void store.addFiles(files)
  })
  input.addEventListener('change', () => {
    const files = Array.from(input.files ?? [])
    if (files.length > 0) void store.addFiles(files)
    input.value = ''
  })

  container.appendChild(zone)
  container.appendChild(input)
}
