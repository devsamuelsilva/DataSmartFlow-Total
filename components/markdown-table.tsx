"use client"

interface MarkdownTableProps {
  markdown: string
}

export function MarkdownTable({ markdown }: MarkdownTableProps) {
  // Função para converter Markdown em HTML
  const parseMarkdownTable = (markdown: string): { headers: string[]; rows: string[][] } => {
    const lines = markdown.trim().split("\n")

    if (lines.length < 3) {
      return { headers: [], rows: [] }
    }

    // Extrair cabeçalhos
    const headerLine = lines[0]
    const headers = headerLine
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)

    // Ignorar a linha de separação (linha 1)

    // Extrair linhas de dados
    const rows = lines.slice(2).map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0),
    )

    return { headers, rows }
  }

  const { headers, rows } = parseMarkdownTable(markdown)

  if (headers.length === 0) {
    return <div className="text-gray-500">Tabela vazia ou formato inválido</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
