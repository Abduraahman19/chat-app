import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUsernameFromEmail } from '../../utils/helpers';

export default function Header() {
  const { user, logOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-8xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          ChatApp
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">
                Hi, {user.displayName || getUsernameFromEmail(user.email)}
              </span>
              <button
                onClick={logOut}
                className="text-sm text-white bg-red-600 font-semibold px-3 py-1 rounded-full hover:bg-red-700 cursor-pointer"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}