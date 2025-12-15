import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { Spinner } from '../../ui/Spinner';

interface Props {
  conversationId: string;
}

export function MessageList({ conversationId }: Props) {
  const { messages, isLoadingMessages } = useChatStore();
  const user = useAuthStore(s => s.user);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationMessages.length, conversationId]);

  if (isLoadingMessages && conversationMessages.length === 0) {
      return (
          <div className="flex h-full items-center justify-center">
              <Spinner />
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
       {conversationMessages.map((message, index) => {
           const isMe = message.senderId === user?.id;
           const showDate = index === 0 || 
               new Date(message.createdAt).toDateString() !== new Date(conversationMessages[index - 1].createdAt).toDateString();
           
           return (
               <div key={message.id}>
                   {showDate && (
                       <div className="flex justify-center my-4">
                           <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                               {new Date(message.createdAt).toLocaleDateString()}
                           </span>
                       </div>
                   )}
                   
                   <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                           isMe 
                           ? 'bg-indigo-600 text-white rounded-br-none' 
                           : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                       }`}>
                           <p className="whitespace-pre-wrap break-words">{message.text}</p>
                           <div className={`text-[10px] mt-1 flex justify-end gap-1 ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                               <span>
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               {isMe && (
                                   <span>
                                       {message.isRead ? '• Read' : '• Sent'}
                                   </span>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
           );
       })}
    </div>
  );
}
