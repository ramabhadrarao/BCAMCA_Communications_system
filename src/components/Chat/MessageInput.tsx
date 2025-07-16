import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, FileText, Link, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File, type?: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (file: File, type: string) => {
    onSendMessage('', file, type);
    setShowAttachments(false);
  };

  const handleYouTubeLink = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      onSendMessage(url, undefined, 'youtube');
    }
    setShowAttachments(false);
  };

  const canCreatePoll = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';

  return (
    <div className="bg-white border-t p-4">
      {showAttachments && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>File</span>
          </button>
          
          <button
            onClick={handleYouTubeLink}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Link className="w-4 h-4" />
            <span>YouTube</span>
          </button>
          
          {canCreatePoll && (
            <button className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <BarChart className="w-4 h-4" />
              <span>Poll</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-end space-x-2">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, 'file');
          }
        }}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, 'image');
          }
        }}
      />
    </div>
  );
};

export default MessageInput;