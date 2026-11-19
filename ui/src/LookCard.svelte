<script lang="ts">
  import { onMount } from 'svelte'
  import { FieldRow, Selector, Toggle } from '@glimstone/svelte'
  import { SHAPES, MOTION_LEVELS, applyShape, leafTap, stormTap, type Motion, type Shape } from '@glimstone/core/appearance'
  import { LABEL_MODES, setLabelMode, type LabelMode } from '@glimstone/core/controls'
  import { applyOled, darkShowing, oledRefusal, storedOled, watchDarkShowing } from '@glimstone/core/theme'
  import LanguagePicker from './LanguagePicker.svelte'
  import { eggs, leafTaps, look, persist, stormTaps } from './appearance.svelte'
  import { repaintButtons } from './controlWidgets'
  import { svgSnippet, tr } from './live.svelte'
  import { LABEL_GLYPHS, MOTION_GLYPHS, segmentGlyph, SHAPE_GLYPHS, THEME_GLYPHS } from './icons'
  import type { TranslationKey } from './i18n'
  import { setMotion } from './looks'
  import { applyTheme, type ThemePref } from './theme'

  const SHAPE_KEYS: Record<Shape, TranslationKey> = {
    round: 'appearance.round',
    soft: 'appearance.soft',
    square: 'appearance.square',
    leaf: 'appearance.leaf',
  }
  const MOTION_KEYS: Record<Motion, TranslationKey> = {
    off: 'appearance.motionOff',
    subtle: 'appearance.motionSubtle',
    wild: 'appearance.motionWild',
    storm: 'appearance.motionStorm',
  }
  const LABEL_KEYS: Record<LabelMode, TranslationKey> = {
    text: 'appearance.labelText',
    textGlyph: 'appearance.labelTextGlyph',
    glyph: 'appearance.labelGlyph',
    reactive: 'appearance.labelReactive',
  }
  const THEMES: { id: ThemePref; key: TranslationKey }[] = [
    { id: 'dark', key: 'appearance.dark' },
    { id: 'light', key: 'appearance.light' },
    { id: 'system', key: 'appearance.system' },
  ]

  const glyph = (g: Parameters<typeof segmentGlyph>[0]) => svgSnippet(segmentGlyph(g))

  const themes = $derived(THEMES.map((c) => ({ id: c.id, label: tr(c.key), glyph: glyph(THEME_GLYPHS[c.id]) })))
  const shapes = $derived(
    (look.shape === 'leaf' || eggs.leaf ? [...SHAPES, 'leaf' as const] : SHAPES).map((s) => ({ id: s, label: tr(SHAPE_KEYS[s]), glyph: glyph(SHAPE_GLYPHS[s]) })),
  )
  const motions = $derived(
    (look.motion === 'storm' || eggs.storm ? [...MOTION_LEVELS, 'storm' as const] : MOTION_LEVELS).map((m) => ({
      id: m,
      label: tr(MOTION_KEYS[m]),
      glyph: glyph(MOTION_GLYPHS[m]),
    })),
  )
  const labels = $derived(LABEL_MODES.map((m) => ({ id: m, label: tr(LABEL_KEYS[m]), glyph: glyph(LABEL_GLYPHS[m]) })))

  function pickTheme(theme: ThemePref): void {
    look.theme = theme
    applyTheme(theme)
    persist()
  }

  function pickShape(shape: Shape): void {
    look.shape = shape
    applyShape(shape)
    persist()
  }

  // A run of taps on the chosen shape finds the leaf, and on the chosen motion
  // the storm.
  function tapShape(tapped: Shape): void {
    if (!leafTap(leafTaps, tapped, look.shape)) return
    eggs.leaf = true
    pickShape('leaf')
  }

  function pickMotion(motion: Motion): void {
    look.motion = motion
    setMotion(motion)
  }

  function tapMotion(tapped: Motion): void {
    if (!stormTap(stormTaps, tapped, look.motion)) return
    eggs.storm = true
    pickMotion('storm')
  }

  function pickLabels(mode: LabelMode): void {
    look.labelMode = mode
    setLabelMode('buttons', mode)
    repaintButtons()
  }

  // OLED belongs to this screen rather than to the person, so it stays on the
  // device. It counts only while the dark theme shows, and rests meanwhile
  // without letting go. Under Light it refuses, since there is no dark theme
  // to put on black.
  let oled = $state(storedOled())
  let dark = $state(darkShowing())
  const refused = $derived(
    oledRefusal(look.theme, {
      sentence: tr('appearance.oledLight'),
      dark: tr('appearance.dark'),
      system: tr('appearance.system'),
      light: tr('appearance.light'),
    }),
  )
  onMount(() => watchDarkShowing((now) => (dark = now)))
</script>

<div class="glim-eyebrow">{tr('settings.look')}</div>
<div class="appearance-settings">
  <FieldRow label={tr('appearance.language')}><LanguagePicker /></FieldRow>
  <FieldRow label={tr('appearance.theme')}>
    <Selector items={themes} value={look.theme} onChange={pickTheme} inline />
  </FieldRow>
  <FieldRow label={tr('appearance.oled')} hint={tr('appearance.oledHint')}>
    {#snippet drawn()}<span class:is-dimmed={!dark}>{tr('appearance.oled')}</span>{/snippet}
    <Toggle
      checked={oled}
      {...refused ? { refused } : {}}
      onChange={(on) => {
        oled = on
        applyOled(on)
      }}
    />
  </FieldRow>
  <FieldRow label={tr('appearance.shape')}>
    <Selector items={shapes} value={look.shape} onChange={pickShape} onPress={tapShape} inline />
  </FieldRow>
  <FieldRow label={tr('appearance.motion')} hint={tr('appearance.motionHint')}>
    <Selector items={motions} value={look.motion} onChange={pickMotion} onPress={tapMotion} inline />
  </FieldRow>
  <FieldRow label={tr('appearance.labels')} hint={tr('appearance.labelsHint')}>
    <Selector items={labels} value={look.labelMode} onChange={pickLabels} inline />
  </FieldRow>
</div>
