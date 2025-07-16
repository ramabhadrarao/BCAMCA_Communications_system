import React from 'react';
import { format } from 'date-fns';
import { Download, Play, ExternalLink, FileText } from 'lucide-react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
            {getFileIcon(message.fileName!)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {(message.fileSize! / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <a
              href={`http://localhost:3001${message.fileUrl}`}
              download
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={`http://localhost:3001${message.fileUrl}`}
              alt="Image"
              className="max-w-xs rounded-lg"
            />
            {message.content && (
              <p className="text-sm text-gray-800">{message.content}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
            <Play className="w-5 h-5 text-blue-500" />
            <audio controls className="flex-1">
              <source src={`http://localhost:3001${message.fileUrl}`} />
            </audio>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <video controls className="max-w-xs rounded-lg">
              <source src={`http://localhost:3001${message.fileUrl}`} />
            </video>
            {message.content && (
              <p className="text-sm text-gray-800">{message.content}</p>
            )}
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <ExternalLink className="w-4 h-4" />
              <a
                href={message.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                YouTube Video
              </a>
            </div>
            {message.content && (
              <p className="text-sm text-gray-800">{message.content}</p>
            )}
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">📊 Poll Created</p>
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">📝 Assignment Created</p>
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        );

      default:
        return <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md space-y-1`}>
        {!isOwnMessage && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {message.sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500">{message.sender.name}</span>
          </div>
        )}
        
        <div
          className={`p-3 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;