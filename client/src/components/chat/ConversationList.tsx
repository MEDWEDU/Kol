import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { resolveAssetUrl } from '../../utils/assetUrl';

export function ConversationList() {
  const { conversations, selectConversation, activeConversationId, onlineUsers, isLoadingConversations } = useChatStore();
  const user = useAuthStore(s => s.user);

  if (isLoadingConversations) {
     return <div className="p-4 text-center text-slate-500">Loading chats...</div>;
  }
  
  if (conversations.length === 0) {
     return <div className="p-4 text-center text-slate-500">No conversations yet. Start a new one!</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(conversation => {
        const participant = conversation.participants?.find(p => p.id !== user?.id);
        const isActive = conversation.id === activeConversationId;
        const isOnline = participant && onlineUsers.has(participant.id);
        
        const date = conversation.lastMessage?.createdAt ? new Date(conversation.lastMessage.createdAt) : new Date(conversation.updatedAt);
        const timeString = date.toLocaleDateString() === new Date().toLocaleDateString() 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString();

        return (
          <button
            key={conversation.id}
            onClick={() => selectConversation(conversation.id)}
            className={`w-full flex items-center gap-3 p-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
              isActive ? 'bg-slate-100 dark:bg-slate-800' : ''
            }`}
          >
            <div className="relative shrink-0">
               <img 
                  src={resolveAssetUrl(participant?.avatarUrl)} 
                  alt={participant?.name || 'User'} 
                  className="h-10 w-10 rounded-full object-cover"
               />
               {isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
               )}
            </div>
            <div className="min-w-0 flex-1">
               <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate">{participant?.name || 'Unknown User'}</span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">{timeString}</span>
               </div>
               <div className="flex justify-between items-center mt-1">
                  <span className={`text-sm truncate ${conversation.unreadCount ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                     {conversation.lastMessage?.senderId === user?.id ? 'You: ' : ''}{conversation.lastMessage?.text || 'No messages'}
                  </span>
                  {!!conversation.unreadCount && (
                     <span className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-medium text-white">
                        {conversation.unreadCount}
                     </span>
                  )}
               </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
