import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { ConversationList } from './ConversationList';
import { UserSearch } from './UserSearch';
import { Button } from '../../ui/Button';

export function Sidebar() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowSearch(!showSearch)}>
          {showSearch ? 'Cancel' : 'New Chat'}
        </Button>
      </div>
      
      {showSearch ? (
        <UserSearch onSelect={() => setShowSearch(false)} />
      ) : (
        <ConversationList />
      )}
    </div>
  );
}
