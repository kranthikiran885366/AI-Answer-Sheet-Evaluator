import { AdvancedUploadSection } from "@/app/components/advanced-upload-section"

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Answer Sheets</h1>
      <AdvancedUploadSection userRole="teacher" />
    </div>
  )
}
