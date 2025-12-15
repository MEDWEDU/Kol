import { useEffect } from 'react';
import { Sidebar } from '../components/chat/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export function ChatPage() {
  const { connectSocket, disconnectSocket, fetchConversations, activeConversationId } = useChatStore();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
        connectSocket(user.id);
        fetchConversations();
    }
    return () => {
      disconnectSocket();
    }
  }, [connectSocket, disconnectSocket, fetchConversations, user?.id]);

  return (
    <div className="flex h-full w-full overflow-hidden">
       <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900`}>
         <Sidebar />
       </div>
       <div className={`${!activeConversationId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50 dark:bg-slate-950`}>
         {activeConversationId ? <ChatWindow /> : (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
              Select a conversation to start chatting
            </div>
         )}
       </div>
    </div>
  );
}
