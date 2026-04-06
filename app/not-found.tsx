import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-slate-600 mb-6">The page you are looking for doesn’t exist or has moved.</p>
      <Link href="/" className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Go to Home</Link>
    </div>
  )
}
