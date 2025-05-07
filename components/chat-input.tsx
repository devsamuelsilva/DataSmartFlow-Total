"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface ChatInputProps {
  onSubmit: (input: string, file?: File) => Promise<void>
  loading: boolean
}

export function ChatInput({ onSubmit, loading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
      "application/pdf", // pdf
      "image/jpeg", // jpg
      "image/png", // png
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Unsupported file",
        description: "Please upload .xlsx, .pdf, .jpg or .png files",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    toast({
      title: "File selected",
      description: selectedFile.name,
    })
  }

  const handleSubmit = async () => {
    if (!input.trim() && !file) {
      toast({
        title: "Empty input",
        description: "Please type a product or upload a file",
        variant: "destructive",
      })
      return
    }

    await onSubmit(input, file || undefined)
    setInput("")
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative">
      <Textarea
        placeholder="Type product names separated by commas or line breaks..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[120px] pr-24"
        disabled={loading}
      />
      <div className="absolute bottom-3 right-3 flex space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx,.pdf,.jpg,.jpeg,.png"
          disabled={loading}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Upload file"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button onClick={handleSubmit} disabled={loading} title="Send">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {loading ? "Processing..." : "Send"}
        </Button>
      </div>
      {file && (
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <span className="font-medium">File:</span>
          <span className="ml-2">{file.name}</span>
          <Button variant="ghost" size="sm" className="ml-2 h-6 px-2" onClick={removeFile} disabled={loading}>
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}
