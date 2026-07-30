import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Image, File, X, User } from 'lucide-react';

interface LiveChatProps {
  complaintId: string;
  onClose: () => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({ complaintId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch historical messages
    api.get(`/complaints/${complaintId}/messages`).then(res => {
      setMessages(res.data.data);
      scrollToBottom();
    }).catch(console.error);

    // Socket Setup
    const socket = getSocket();
    socket.emit('join_complaint', complaintId);

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [complaintId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await api.post(`/complaints/${complaintId}/messages`, { content: input });
      setInput('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const chatContent = (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl flex flex-col z-[9999] border-l border-gray-100">
      <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Live Case Chat</h3>
          <p className="text-xs text-gray-400">Complaint #{complaintId.substring(0, 8)}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-md transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                {!isMe && <span className="text-[10px] text-gray-400">{msg.sender.fullName} ({msg.sender.roleName || msg.sender.role})</span>}
              </div>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
            <File className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 py-2 px-4 bg-gray-100 border-transparent rounded-full outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button onClick={sendMessage} className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-md">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(chatContent, document.body);
};
