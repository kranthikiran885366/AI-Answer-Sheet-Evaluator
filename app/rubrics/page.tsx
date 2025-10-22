import { RubricManagement } from "@/app/components/rubric-management"

export default function RubricsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Rubric Management</h1>
      <RubricManagement userRole="teacher" />
    </div>
  )
}
