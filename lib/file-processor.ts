import * as XLSX from "xlsx"

export async function processFile(file: File): Promise<string[]> {
  const fileType = file.type

  // Process based on file type
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
    return processExcelFile(file)
  } else if (fileType.includes("pdf")) {
    return processPdfFile(file)
  } else if (fileType.includes("image")) {
    return processImageFile(file)
  }

  throw new Error("Unsupported file type")
}

async function processExcelFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Extract product names from the first column
        const productNames: string[] = []

        jsonData.forEach((row: any) => {
          // Get the first value from each row (regardless of column name)
          const firstValue = Object.values(row)[0]
          if (firstValue && typeof firstValue === "string") {
            productNames.push(firstValue.trim())
          }
        })

        resolve(productNames)
      } catch (error) {
        console.error("Error processing Excel file:", error)
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

async function processPdfFile(file: File): Promise<string[]> {
  // For now, return an empty array as PDF processing would require additional libraries
  console.log("PDF processing would require additional setup")
  return []
}

async function processImageFile(file: File): Promise<string[]> {
  // For now, return an empty array as image processing would require additional setup
  console.log("Image processing would require additional setup")
  return []
}
