import { Palette, Ruler, Clock, Type, Hash, ToggleLeft, PaintRoller, SquareDashedTopSolid, Minus, LineStyle, CodeXml, Bold, Blend, Spline, BookType } from 'lucide-react'
import React from 'react'

export type DtcgType =
  | 'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight'
  | 'number' | 'string' | 'boolean' | 'gradient' | 'typography'
  | 'border' | 'shadow' | 'transition' | 'cubicBezier' | 'strokeStyle'

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch' | 'lab' | 'lch'
export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'lab', 'lch']

export interface Token {
  id: string
  name: string
  type: DtcgType
}

export const TOKEN_TYPE_ICONS: Record<DtcgType, React.ReactNode> = {
  color:       React.createElement(Palette,              { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  dimension:   React.createElement(Ruler,                { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  duration:    React.createElement(Clock,                { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  fontFamily:  React.createElement(BookType,             { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  fontWeight:  React.createElement(Bold,                 { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  number:      React.createElement(Hash,                 { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  string:      React.createElement(CodeXml,              { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  boolean:     React.createElement(ToggleLeft,           { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  gradient:    React.createElement(PaintRoller,          { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  typography:  React.createElement(Type,                 { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  border:      React.createElement(SquareDashedTopSolid, { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  shadow:      React.createElement(Minus,                { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  transition:  React.createElement(Blend,                { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  cubicBezier: React.createElement(Spline,               { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
  strokeStyle: React.createElement(LineStyle,            { size: 16, className: 'shrink-0 text-muted-foreground', strokeWidth: 2.5 }),
}

export function toDisplayName(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').toLowerCase()
}
