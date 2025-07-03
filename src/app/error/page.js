'use client'

export default function ErrorPage({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error?.name || 'Error'}
        </h2>
        <p className="text-gray-700 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}