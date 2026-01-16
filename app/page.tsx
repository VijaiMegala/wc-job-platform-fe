import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Job Application Platform
        </h1>
        <p className="text-lg text-gray-600">
          Multi-organization job application platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/org/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Organization Login
          </Link>
          <Link
            href="/careers"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
