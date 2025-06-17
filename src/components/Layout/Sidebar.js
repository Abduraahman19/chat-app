import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4 border-r">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/chat"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
            >
              Chat
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}