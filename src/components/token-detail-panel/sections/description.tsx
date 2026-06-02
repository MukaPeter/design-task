'use client'

interface Props {
  text: string
}

export function Description({ text }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">Description</span>
      <span className="leading-relaxed text-foreground">{text}</span>
    </div>
  )
}
