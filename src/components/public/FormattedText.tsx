import { Fragment, type ReactNode } from 'react'

// Syntaxe légère supportée dans les textes admin :
// **gras**, [color=#RRGGBB]texte coloré[/color], et retours à la ligne préservés.
const INLINE_REGEX = /\*\*(.+?)\*\*|\[color=(#[0-9a-fA-F]{6})\]([\s\S]+?)\[\/color\]/g

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let i = 0
  for (const match of text.matchAll(INLINE_REGEX)) {
    if (match.index === undefined) continue
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{parseInline(match[1], `${keyPrefix}-${i}`)}</strong>)
    } else {
      nodes.push(
        <span key={`${keyPrefix}-c-${i}`} style={{ color: match[2] }}>
          {parseInline(match[3], `${keyPrefix}-${i}`)}
        </span>
      )
    }
    lastIndex = match.index + match[0].length
    i++
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export default function FormattedText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const lines = text.split('\n')
  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap', ...style }}>
      {lines.map((line, idx) => (
        <Fragment key={idx}>
          {parseInline(line, `l${idx}`)}
          {idx < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  )
}
