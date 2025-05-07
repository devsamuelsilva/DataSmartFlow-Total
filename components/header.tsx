import { Beaker } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Beaker className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">Data Smart Flow</span>
          </Link>
          <div className="text-sm text-gray-500">Smart Product Quotation System</div>
        </div>
      </div>
    </header>
  )
}
