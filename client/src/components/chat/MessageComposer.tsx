import React, { useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  conversationId: string;
}

export function MessageComposer({ conversationId }: Props) {
  const [text, setText] = useState('');
  const { sendMessage, setTyping, conversations } = useChatStore();
  const user = useAuthStore(s => s.user);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const conversation = conversations.find(c => c.id === conversationId);
  const recipient = conversation?.participants?.find(p => p.id !== user?.id);

  const handleSend = () => {
      if (!text.trim() || !recipient) return;
      sendMessage(conversationId, recipient.id, text.trim());
      setText('');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTyping(conversationId, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      
      setTyping(conversationId, true);
      
      if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
          setTyping(conversationId, false);
      }, 2000);
  };

  return (
    <div className="flex items-end gap-2">
       <div className="flex-1">
          <Textarea 
             placeholder="Type a message..." 
             value={text} 
             onChange={handleChange}
             onKeyDown={handleKeyDown}
             rows={1}
             className="min-h-[2.5rem] max-h-32 resize-none"
          />
       </div>
       <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="px-3" title="Attach file (placeholder)">
               📎
            </Button>
            <Button onClick={handleSend} disabled={!text.trim()}>
               Send
            </Button>
       </div>
    </div>
  );
}
