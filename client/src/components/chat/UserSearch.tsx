import { useState, useEffect } from 'react';
import { searchUsers, startConversation } from '../../api/chat';
import { User } from '../../types';
import { useChatStore } from '../../stores/chatStore';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';

interface Props {
  onSelect: () => void;
}

export function UserSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!query.trim()) {
        setResults([]);
        return;
    }
    
    const handler = setTimeout(async () => {
        setIsLoading(true);
        try {
            const users = await searchUsers(query);
            setResults(users);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [query]);
  
  const handleSelect = async (userId: string) => {
      try {
          const conversation = await startConversation(userId);
          // Check if conversation already exists in store
          const exists = useChatStore.getState().conversations.some(c => c.id === conversation.id);
          if (!exists) {
              useChatStore.getState().addNewConversation(conversation);
          }
          useChatStore.getState().selectConversation(conversation.id);
          onSelect();
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3">
           <Input 
              placeholder="Search users..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              autoFocus
           />
        </div>
        
        <div className="flex-1 overflow-y-auto">
           {isLoading ? (
               <div className="flex justify-center p-4"><Spinner /></div>
           ) : (
               results.map(user => (
                   <button 
                      key={user.id}
                      onClick={() => handleSelect(user.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                   >
                      <img 
                         src={resolveAssetUrl(user.avatarUrl)} 
                         alt={user.name} 
                         className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                         <div className="font-medium">{user.name}</div>
                         <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                   </button>
               ))
           )}
           {query && !isLoading && results.length === 0 && (
               <div className="p-4 text-center text-slate-500">No users found.</div>
           )}
        </div>
    </div>
  );
}
