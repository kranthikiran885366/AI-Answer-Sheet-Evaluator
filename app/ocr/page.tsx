import { OCRProcessingEngine } from "@/app/components/ocr-processing-engine"

export default function OCRPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">OCR Processing</h1>
      <OCRProcessingEngine />
    </div>
  )
}
