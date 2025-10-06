import { getUsernameFromEmail } from '../../utils/helpers';
import ProfilePicture from '../ProfilePicture';

export default function UserList({ users }) {
  return (
    <div className="w-64 bg-gray-100 p-4 overflow-y-auto border-r">
      <h2 className="font-bold text-black text-lg mb-4">Online Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="flex items-center mb-3 space-x-3">
            <ProfilePicture 
              user={user} 
              size="sm" 
              showOnlineStatus={true}
              isOnline={true}
            />
            <span className="font-medium text-gray-700">
              {user.displayName || getUsernameFromEmail(user.email)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}