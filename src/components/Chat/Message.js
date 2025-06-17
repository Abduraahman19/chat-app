import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function Message({ message }) {
  const { user } = useAuth();
  const isCurrentUser = message.userId === user?.uid;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="text-sm font-semibold">
          {!isCurrentUser && <span>{message.displayName}</span>}
        </div>
        <p className="text-sm">{message.text}</p>
        <div className="text-xs text-right mt-1 opacity-70">
          {formatDate(message.createdAt)}
        </div>
      </div>
    </div>
  );
}