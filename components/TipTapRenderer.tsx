import type { TipTapDoc, TipTapMark, TipTapNode } from '@/app/lib/bookData'

type TTNode = TipTapNode

function renderMarks(text: string, marks: TipTapMark[] = []): React.ReactNode {
  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>
      case 'italic':
        return <em>{acc}</em>
      case 'code':
        return <code>{acc}</code>
      case 'highlight':
        return <mark>{acc}</mark>
      case 'link':
        return (
          <a href={String(mark.attrs?.href ?? '#')} target="_blank" rel="noreferrer">
            {acc}
          </a>
        )
      default:
        return acc
    }
  }, text as React.ReactNode)
}

function renderNode(node: TTNode, key: number): React.ReactNode {
  const children = () => node.content?.map((c, i) => renderNode(c, i))

  switch (node.type) {
    case 'doc':
      return <>{children()}</>
    case 'paragraph':
      return (
        <p key={key} style={{ textAlign: node.attrs?.textAlign as React.CSSProperties['textAlign'] }}>
          {children()}
        </p>
      )
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 4)
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
      return <Tag key={key}>{children()}</Tag>
    }
    case 'text':
      return <span key={key}>{renderMarks(node.text ?? '', node.marks)}</span>
    case 'bulletList':
      return <ul key={key}>{children()}</ul>
    case 'orderedList':
      return <ol key={key}>{children()}</ol>
    case 'listItem':
      return <li key={key}>{children()}</li>
    case 'blockquote':
      return <blockquote key={key}>{children()}</blockquote>
    case 'table':
      return (
        <table key={key}>
          <tbody>{children()}</tbody>
        </table>
      )
    case 'tableRow':
      return <tr key={key}>{children()}</tr>
    case 'tableCell':
      return <td key={key}>{children()}</td>
    case 'tableHeader':
      return <th key={key}>{children()}</th>
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element -- conteúdo dinâmico (URLs de upload), sem domínios conhecidos para next/image
      return <img key={key} src={String(node.attrs?.src ?? '')} alt={String(node.attrs?.alt ?? '')} style={{ maxWidth: '100%' }} />
    case 'hardBreak':
      return <br key={key} />
    default:
      return null
  }
}

export default function TipTapRenderer({ content }: { content: TipTapDoc | undefined }) {
  if (!content) return null

  return <div className="tiptap-content">{renderNode(content, 0)}</div>
}
