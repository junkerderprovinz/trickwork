<script lang="ts">
  import { PaypalDialog, Selector, usePaypalButtons, type PaypalSelectorProps } from '@glimstone/svelte'
  import { parseAmount, type GiveFrequency } from '@glimstone/core/paypal'
  import { PAYPAL_GIVING } from './donate'
  import { tr } from './live.svelte'
  import { stackOnMount } from './windows.svelte'

  // The PayPal window: how often and how much in the house's own selectors,
  // then PayPal's two buttons. The About card opens it only where the window
  // can show PayPal's login popup.
  let { onClose }: { onClose: () => void } = $props()
  let ref: HTMLDivElement | null = $state(null)
  // svelte-ignore state_referenced_locally
  stackOnMount(() => ref, onClose)

  const AMOUNTS = ['10', '25', '50']
  /** What the donor's PayPal history calls the payment. */
  const DESCRIPTION = 'TrickWork'

  let frequency = $state<GiveFrequency>('once')
  let preset = $state('25')
  let typed = $state('')
  let status = $state<'idle' | 'done' | 'failed'>('idle')

  // A valid typed amount wins over the presets, so the window never shows two
  // amounts at once. A half-typed one charges nothing until it parses.
  const typedValid = $derived(typed.trim() !== '' && parseAmount(typed) !== null)
  const amount = $derived(typed.trim() === '' ? preset : parseAmount(typed))

  const buttonsRef = usePaypalButtons(() => ({
    config: PAYPAL_GIVING,
    frequency,
    amount,
    description: DESCRIPTION,
    onDone: () => (status = 'done'),
    onError: () => (status = 'failed'),
  }))

  function choose(value: string): void {
    preset = value
    typed = ''
  }
</script>

{#snippet strip(s: PaypalSelectorProps)}
  <Selector
    items={s.options.map((o) => ({ id: o.value, label: o.label }))}
    label={s.options[0]?.value === 'once' ? tr('about.paypalFrequency') : tr('about.paypalAmount')}
    value={s.value}
    onChange={s.onChange}
  />
{/snippet}

<PaypalDialog
  bind:ref
  text={{
    title: 'PayPal',
    appeal: tr('about.donateAppeal'),
    intro: tr('about.paypalIntro'),
    frequencyLabel: tr('about.paypalFrequency'),
    frequencies: { once: tr('about.paypalOnce'), month: tr('about.paypalMonthly'), year: tr('about.paypalYearly') },
    amountLabel: tr('about.paypalAmount'),
    otherAmount: tr('about.paypalOtherAmount'),
    loading: tr('about.paypalLoading'),
    thanks: tr('about.paypalThanks'),
    failed: tr('about.paypalFailed'),
    closeLabel: tr('common.close'),
  }}
  {frequency}
  onFrequency={(next) => (frequency = next)}
  amounts={AMOUNTS}
  currencySymbol="€"
  preset={typedValid ? null : preset}
  onPreset={choose}
  {typed}
  {typedValid}
  onTyped={(text) => (typed = text)}
  renderSelector={strip}
  {buttonsRef}
  {status}
  {onClose}
/>
