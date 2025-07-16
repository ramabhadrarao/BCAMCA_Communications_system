import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { messagesAPI, groupsAPI } from '../../services/api';
import { Message, Group } from '../../types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMessages();
      
      if (socket) {
        socket.emit('join-group', groupId);
        
        socket.on('new-message', (message: Message) => {
          setMessages(prev => [...prev, message]);
        });

        return () => {
          socket.emit('leave-group', groupId);
          socket.off('new-message');
        };
      }
    }
  }, [groupId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroup = async () => {
    try {
      const response = await groupsAPI.getGroup(groupId!);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(groupId!);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, file?: File, type?: string) => {
    if (!content.trim() && !file) return;

    const formData = new FormData();
    formData.append('groupId', groupId!);
    formData.append('content', content);
    formData.append('type', type || 'text');
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await messagesAPI.sendMessage(formData);
      const newMessage = response.data;
      setMessages(prev => [...prev, newMessage]);
      
      if (socket) {
        socket.emit('send-message', { groupId, message: newMessage });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Group not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
            <p className="text-sm text-gray-500">
              {group.subject} • {group.batch} • Semester {group.semester}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {group.members.length} members
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwnMessage={message.sender._id === user?._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatWindow;