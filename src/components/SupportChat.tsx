import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Send, X, User, Bot, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  needsEscalation?: boolean;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'guest' | 'user' | 'admin';
}

const SupportChat: React.FC<SupportChatProps> = ({ isOpen, onClose, userRole = 'guest' }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('support.welcome'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);

  const getBotResponse = (userMessage: string): { content: string; needsEscalation?: boolean } => {
    const message = userMessage.toLowerCase();
    
    // Common FAQ responses
    if (message.includes('payment') || message.includes('pay')) {
      return { content: t('support.faq.payment') };
    }
    
    if (message.includes('shipping') || message.includes('delivery')) {
      return { content: t('support.faq.shipping') };
    }
    
    if (message.includes('return') || message.includes('refund')) {
      return { content: t('support.faq.returns') };
    }
    
    if (message.includes('account') || message.includes('profile')) {
      return { content: t('support.faq.account') };
    }
    
    if (message.includes('product') && message.includes('add')) {
      return { content: t('support.faq.addProduct') };
    }
    
    if (message.includes('admin') || message.includes('moderator') || message.includes('help')) {
      return { 
        content: t('support.escalation'), 
        needsEscalation: true 
      };
    }
    
    // Default response
    return { content: t('support.default') };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Get bot response
    const { content, needsEscalation } = getBotResponse(inputMessage);
    
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content,
        sender: 'bot',
        timestamp: new Date(),
        needsEscalation
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (needsEscalation) {
        setIsEscalated(true);
      }
    }, 1000);

    setInputMessage('');
  };

  const handleEscalate = () => {
    const escalationMessage: Message = {
      id: (Date.now() + 2).toString(),
      content: t('support.escalated'),
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, escalationMessage]);
    setIsEscalated(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 flex flex-col shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('support.title')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t(`support.userType.${userRole}`)}</Badge>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {t('support.online')}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'bot' && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted'
                  }`}>
                    {message.content}
                    {message.needsEscalation && !isEscalated && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEscalate}
                          className="text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t('support.requestHuman')}
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('support.typePlaceholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportChat;