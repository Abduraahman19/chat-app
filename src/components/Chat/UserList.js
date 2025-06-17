import { getUsernameFromEmail } from '../../utils/helpers';

export default function UserList({ users }) {
  return (
    <div className="w-64 bg-gray-100 p-4 overflow-y-auto border-r">
      <h2 className="font-bold text-lg mb-4">Online Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="flex items-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>{getUsernameFromEmail(user.email)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}