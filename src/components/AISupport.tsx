import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, Send, X, User, Bot, AlertTriangle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'bot' | 'admin';
  message_type: 'text' | 'system' | 'escalation';
  timestamp: Date;
  needsEscalation?: boolean;
}

interface AISupportProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISupport: React.FC<AISupportProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && user) {
      initializeSession();
    }
  }, [isOpen, user]);

  const initializeSession = async () => {
    if (!user) return;

    try {
      // Create new chat session
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: t('support.newSession'),
          language,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(session.id);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: t('support.welcome'),
        sender_type: 'bot',
        message_type: 'system',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Error",
        description: "Failed to start chat session",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender_type: 'user',
      message_type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          sessionId,
          language
        }
      });

      if (response.error) throw response.error;

      const { response: aiResponse, needsEscalation } = response.data;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender_type: 'bot',
        message_type: needsEscalation ? 'escalation' : 'text',
        timestamp: new Date(),
        needsEscalation
      };

      setMessages(prev => [...prev, botMessage]);

      if (needsEscalation) {
        setIsEscalated(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: t('support.error'),
        sender_type: 'bot',
        message_type: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!user || !sessionId) {
      toast({
        title: "Error",
        description: "Please sign in to contact support",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create support ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: 'Chat Support Request',
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Update session status
      await supabase
        .from('chat_sessions')
        .update({ status: 'escalated' })
        .eq('id', sessionId);

      const escalationMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: t('support.escalated'),
        sender_type: 'bot',
        message_type: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, escalationMessage]);
      setIsEscalated(false);

      toast({
        title: "Success",
        description: "Your request has been escalated to our support team",
      });
    } catch (error) {
      console.error('Error escalating support:', error);
      toast({
        title: "Error",
        description: "Failed to escalate request",
        variant: "destructive"
      });
    }
  };

  const getUserRole = () => {
    if (!user) return 'guest';
    return profile?.role === 'admin' ? 'admin' : 'user';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[500px] flex flex-col shadow-xl border">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {t('support.title')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t(`support.userType.${getUserRole()}`)}</Badge>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {t('support.online')}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender_type !== 'user' && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      {message.sender_type === 'admin' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.sender_type === 'user' ? 'order-1' : ''}`}>
                    <div className={`p-3 rounded-lg text-sm ${
                      message.sender_type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.needsEscalation && !isEscalated && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEscalate}
                          className="text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t('support.escalateButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.sender_type === 'user' && (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="p-3 rounded-lg text-sm bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('support.loading')}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
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
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm" 
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISupport;