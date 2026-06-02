'use client'

import type { Token, DtcgType } from './types'
import { ColorSwatch } from './sections/color-swatch'
import { ValuesColor } from './sections/values-color'
import { ValuesDuration } from './sections/values-duration'
import { ValuesDimension } from './sections/values-dimension'
import { ValuesNumber, type NumberIntent } from './sections/values-number'
import { CodeSyntax } from './sections/code-syntax'
import { Aliases } from './sections/aliases'
import { Description } from './sections/description'

interface Props {
  token: Token
  modeValues: Record<string, string>
  numberIntent: NumberIntent
  onNumberIntentChange: (intent: NumberIntent) => void
}

const DESCRIPTIONS: Partial<Record<DtcgType, string>> = {
  color:     'Defines a color value. Use for backgrounds, text, borders, and other visual elements that require a color.',
  duration:  'Defines a time duration. Use for animation and transition timing to control how long a motion takes.',
  dimension: 'Defines a size or spacing value. Use for widths, heights, padding, margin, border radius, and similar layout properties.',
  number:    'Defines a unitless number. Interpretation depends on intent — opacity, line-height multiplier, scale factor, z-index, or count.',
}

const COLOR_SYNTAX = [
  { id: '1', name: 'Web',     value: '--color-brand-primary' },
  { id: '2', name: 'iOS',     value: 'Color.Brand.Primary' },
  { id: '3', name: 'Android', value: 'color_brand_primary' },
  { id: '4', name: 'AG Grid', value: '--ag-primary-color' },
]

const COLOR_ALIASES = [
  { collection: 'semantic', group: 'brand',  token: 'primary' },
  { collection: 'semantic', group: 'action', token: 'default' },
  { collection: 'semantic', group: 'link',   token: 'default' },
]

const DURATION_SYNTAX = [
  { id: '1', name: 'Web',     value: '--duration-base' },
  { id: '2', name: 'iOS',     value: 'Animation.Duration.Base' },
  { id: '3', name: 'Android', value: 'duration_base' },
]

const DURATION_ALIASES = [
  { collection: 'semantic', group: 'animation', token: 'enter' },
  { collection: 'semantic', group: 'animation', token: 'exit' },
]

export function TokenTypeContent({ token, modeValues, numberIntent, onNumberIntentChange }: Props) {
  switch (token.type) {
    case 'color':
      return (
        <>
          <Description text={DESCRIPTIONS.color!} />
          <ColorSwatch modeValues={modeValues} />
          <ValuesColor modeValues={modeValues} />
          <CodeSyntax defaultEntries={COLOR_SYNTAX} />
          <Aliases aliases={COLOR_ALIASES} />
        </>
      )
    case 'duration':
      return (
        <>
          <Description text={DESCRIPTIONS.duration!} />
          <ValuesDuration modeValues={modeValues} />
          <CodeSyntax defaultEntries={DURATION_SYNTAX} />
          <Aliases aliases={DURATION_ALIASES} />
        </>
      )
    case 'dimension':
      return (
        <>
          <Description text={DESCRIPTIONS.dimension!} />
          <ValuesDimension modeValues={modeValues} />
          <CodeSyntax />
          <Aliases aliases={[]} />
        </>
      )
    case 'number':
      return (
        <>
          <Description text={DESCRIPTIONS.number!} />
          <ValuesNumber modeValues={modeValues} intent={numberIntent} onIntentChange={onNumberIntentChange} />
          <CodeSyntax />
          <Aliases aliases={[]} />
        </>
      )
    default:
      return (
        <>
          <Description text="No description available." />
          <CodeSyntax />
          <Aliases aliases={[]} />
        </>
      )
  }
}
