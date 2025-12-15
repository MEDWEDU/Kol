import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../ui/Button';
import { ProfileDrawer } from './ProfileDrawer';
import { useState } from 'react';

export function ChatWindow() {
  const { activeConversationId, conversations, deselectConversation, typingUsers, onlineUsers } = useChatStore();
  const user = useAuthStore(s => s.user);
  const [showProfile, setShowProfile] = useState(false);
  
  const conversation = conversations.find(c => c.id === activeConversationId);
  const participant = conversation?.participants?.find(p => p.id !== user?.id);
  
  if (!activeConversationId) return null;

  const isTyping = participant && typingUsers[activeConversationId]?.has(participant.id);

  return (
    <div className="flex h-full flex-col relative">
       <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <Button variant="secondary" size="sm" className="md:hidden" onClick={deselectConversation}>
             Back
          </Button>
          
          {participant && (
             <button 
                className="flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition" 
                onClick={() => setShowProfile(true)}
             >
                <div className="relative">
                   <img 
                      src={resolveAssetUrl(participant.avatarUrl)} 
                      alt={participant.name} 
                      className="h-10 w-10 rounded-full object-cover" 
                   />
                   {onlineUsers.has(participant.id) && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                   )}
                </div>
                <div>
                   <div className="font-medium">{participant.name}</div>
                   <div className="text-xs text-slate-500">
                      {isTyping ? 'Typing...' : (onlineUsers.has(participant.id) ? 'Online' : 'Offline')}
                   </div>
                </div>
             </button>
          )}
       </div>
       
       <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList conversationId={activeConversationId} />
       </div>
       
       <div className="p-3 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <MessageComposer conversationId={activeConversationId} />
       </div>

       {participant && (
         <ProfileDrawer 
            isOpen={showProfile} 
            onClose={() => setShowProfile(false)} 
            user={participant} 
         />
       )}
    </div>
  );
}
