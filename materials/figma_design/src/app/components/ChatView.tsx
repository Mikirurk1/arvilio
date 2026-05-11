import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'teacher';
  text: string;
  time: string;
  avatar?: string;
}

const conversations = [
  { id: '1', name: 'Sarah Mitchell', role: 'Teacher', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 0, avatar: 'SM' },
  { id: '2', name: 'John Smith', role: 'Teacher', lastMessage: 'Great progress on your homework', time: 'Yesterday', unread: 2, avatar: 'JS' },
  { id: '3', name: 'Study Group', role: 'Group', lastMessage: 'Anyone up for practice?', time: 'Monday', unread: 5, avatar: 'SG' }
];

const messages: Message[] = [
  { id: '1', sender: 'teacher', text: 'Hi Mykola! How are you preparing for tomorrow\'s lesson?', time: '9:15 AM', avatar: 'SM' },
  { id: '2', sender: 'me', text: 'Hi Sarah! I\'ve been reviewing the conditional forms. I have a few questions about the third conditional.', time: '9:18 AM' },
  { id: '3', sender: 'teacher', text: 'That\'s great! Feel free to ask during our lesson tomorrow. We\'ll cover all types in detail.', time: '9:20 AM', avatar: 'SM' },
  { id: '4', sender: 'me', text: 'Perfect! Also, I completed the exercises you sent.', time: '9:22 AM' },
  { id: '5', sender: 'teacher', text: 'Wonderful! I\'ll review them before our session. See you tomorrow at 2 PM!', time: '10:30 AM', avatar: 'SM' }
];

export function ChatView() {
  const [selectedChat, setSelectedChat] = useState('1');
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle message send
      setMessageInput('');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 bg-white flex flex-col" style={{ borderRight: '1px solid rgba(26, 26, 46, 0.08)' }}>
        {/* Sidebar Header */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.08)' }}>
          <h2 className="text-lg font-medium mb-3" style={{ color: '#1a1a2e' }}>Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7a7a9a' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: '#f7f6f3',
                border: '1px solid rgba(26, 26, 46, 0.08)',
                color: '#1a1a2e'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#16a97a';
                e.currentTarget.style.boxShadow = '0 0 0 3px #e8f7f2';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className="w-full px-5 py-4 flex items-center gap-3 transition-all text-left"
              style={{
                backgroundColor: selectedChat === conv.id ? '#f7f6f3' : 'transparent',
                borderLeft: selectedChat === conv.id ? '3px solid #16a97a' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedChat !== conv.id) e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              onMouseLeave={(e) => {
                if (selectedChat !== conv.id) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: '#7c6ee6' }}>
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#e05c7a' }}>
                    {conv.unread}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate" style={{ color: '#1a1a2e' }}>{conv.name}</h4>
                  <span className="text-xs" style={{ color: '#7a7a9a' }}>{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm truncate" style={{ color: '#7a7a9a' }}>{conv.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: '#7c6ee6' }}>
              SM
            </div>
            <div>
              <h3 className="font-medium" style={{ color: '#1a1a2e' }}>Sarah Mitchell</h3>
              <p className="text-xs" style={{ color: '#7a7a9a' }}>Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#7a7a9a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#7a7a9a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Video className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#7a7a9a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#f7f6f3' }}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}
              >
                {message.sender === 'teacher' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0" style={{ backgroundColor: '#7c6ee6' }}>
                    {message.avatar}
                  </div>
                )}

                <div className={`max-w-md ${message.sender === 'me' ? 'items-end' : ''}`}>
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      backgroundColor: message.sender === 'me' ? '#16a97a' : '#ffffff',
                      color: message.sender === 'me' ? '#ffffff' : '#1a1a2e',
                      borderBottomRightRadius: message.sender === 'me' ? '4px' : '16px',
                      borderBottomLeftRadius: message.sender === 'teacher' ? '4px' : '16px',
                      lineHeight: '1.5'
                    }}
                  >
                    {message.text}
                  </div>
                  <span className="text-xs mt-1 block px-2" style={{ color: '#7a7a9a' }}>
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 bg-white" style={{ borderTop: '1px solid rgba(26, 26, 46, 0.08)' }}>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#7a7a9a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#f7f6f3',
                  border: '1px solid rgba(26, 26, 46, 0.08)',
                  color: '#1a1a2e'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#16a97a';
                  e.currentTarget.style.boxShadow = '0 0 0 3px #e8f7f2';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#7a7a9a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              onClick={handleSendMessage}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white transition-all"
              style={{ backgroundColor: '#16a97a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0c6e52'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a97a'}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
