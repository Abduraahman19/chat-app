import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-52 bg-neutral-200 border-gray-300 p-4 border-r">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/chat"
              className="block px-4 py-2 text-gray-700 bg-neutral-300 hover:bg-neutral-400 rounded-full transition-colors duration-300"
            >
              Chat
            </Link>

          </li>
          <h1 className='border-b mb-4 mt-5 border-gray-400'></h1>
          <li>
            <Link
              href="/profile"
              className="text-sky-700 font-medium border border-gray-300 bg-white hover:bg-sky-50 py-2 px-4 rounded-full transition-colors duration-300 shadow-sm"
            >
              Profile
            </Link>

          </li>
        </ul>
      </nav>
    </div>
  );
}