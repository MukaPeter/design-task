import type { DtcgType } from './types'
import type { NumberIntent } from './sections/values-number'
import { ColorSwatch } from './sections/color-swatch'
import { ValuesColor } from './sections/values-color'
import { ValuesDimension } from './sections/values-dimension'
import { ValuesDuration } from './sections/values-duration'
import { ValuesNumber } from './sections/values-number'
import { CodeSyntax } from './sections/code-syntax'
import { Aliases } from './sections/aliases'

interface SectionProps {
  modeValues: Record<string, string>
  numberIntent: NumberIntent
  onNumberIntentChange: (intent: NumberIntent) => void
}

export interface TokenConfig {
  description: string
  sections: (props: SectionProps) => React.ReactNode[]
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

export const TOKEN_CONFIGS: Partial<Record<DtcgType, TokenConfig>> = {
  color: {
    description: 'Defines a color value. Use for backgrounds, text, borders, and other visual elements that require a color.',
    sections: ({ modeValues }) => [
      <ColorSwatch key="swatch" modeValues={modeValues} />,
      <ValuesColor key="values" modeValues={modeValues} />,
      <CodeSyntax key="syntax" defaultEntries={COLOR_SYNTAX} />,
      <Aliases key="aliases" aliases={COLOR_ALIASES} />,
    ],
  },
  duration: {
    description: 'Defines a time duration. Use for animation and transition timing to control how long a motion takes.',
    sections: ({ modeValues }) => [
      <ValuesDuration key="values" modeValues={modeValues} />,
      <CodeSyntax key="syntax" defaultEntries={DURATION_SYNTAX} />,
      <Aliases key="aliases" aliases={DURATION_ALIASES} />,
    ],
  },
  dimension: {
    description: 'Defines a size or spacing value. Use for widths, heights, padding, margin, border radius, and similar layout properties.',
    sections: ({ modeValues }) => [
      <ValuesDimension key="values" modeValues={modeValues} />,
      <CodeSyntax key="syntax" />,
      <Aliases key="aliases" aliases={[]} />,
    ],
  },
  number: {
    description: 'Defines a unitless number. Interpretation depends on intent — opacity, line-height multiplier, scale factor, z-index, or count.',
    sections: ({ modeValues, numberIntent, onNumberIntentChange }) => [
      <ValuesNumber key="values" modeValues={modeValues} intent={numberIntent} onIntentChange={onNumberIntentChange} />,
      <CodeSyntax key="syntax" />,
      <Aliases key="aliases" aliases={[]} />,
    ],
  },
}

export const DEFAULT_CONFIG: TokenConfig = {
  description: 'No description available.',
  sections: () => [
    <CodeSyntax key="syntax" />,
    <Aliases key="aliases" aliases={[]} />,
  ],
}
