import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  User,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
  };
  messages?: Message[];
}

interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
  last_message_at: string;
  product?: {
    name: string;
    image_url: string;
  };
  buyer?: {
    username: string;
  };
  seller?: {
    username: string;
  };
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    username: string;
  };
}

interface AdminChatManagementProps {
  onClose: () => void;
}

const AdminChatManagement: React.FC<AdminChatManagementProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSupportTickets();
      loadConversations();
    }
  }, [user]);

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users(username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets((data || []) as SupportTicket[]);
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          product:products(name, image_url),
          buyer:users!conversations_buyer_id_fkey(username),
          seller:users!conversations_seller_id_fkey(username)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(username)
        `)
        .eq('support_ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: data || []
      } : null);
    } catch (error) {
      console.error('Error loading ticket messages:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: data || []
      } : null);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const sendTicketMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          support_ticket_id: selectedTicket.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      loadTicketMessages(selectedTicket.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      loadSupportTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: status as any } : null);
      }

      toast({
        title: "Success",
        description: "Ticket status updated"
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          {t('admin.chatManagement')}
        </h1>
        <Button variant="outline" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>

      <Tabs defaultValue="support" className="space-y-4">
        <TabsList>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('admin.supportTickets')} ({supportTickets.length})
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('admin.conversations')} ({conversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Support Tickets List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.supportTickets')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(70vh-5rem)]">
                    {supportTickets.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t('admin.noTickets')}</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        {supportTickets.map((ticket) => (
                          <Card
                            key={ticket.id}
                            className={`cursor-pointer transition-colors hover:bg-accent ${
                              selectedTicket?.id === ticket.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => {
                              setSelectedTicket(ticket);
                              loadTicketMessages(ticket.id);
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant={getStatusColor(ticket.status) as any}>
                                    {getStatusIcon(ticket.status)}
                                    <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                                  </Badge>
                                  <Badge variant={getPriorityColor(ticket.priority) as any} className="text-xs">
                                    {ticket.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                <h3 className="font-medium text-sm truncate">{ticket.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {ticket.user?.username} ({ticket.user?.email})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                          disabled={selectedTicket.status === 'in_progress'}
                        >
                          {t('admin.markInProgress')}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                          disabled={selectedTicket.status === 'resolved'}
                        >
                          {t('admin.markResolved')}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>User: {selectedTicket.user?.username}</span>
                      <span>Created: {new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {selectedTicket.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.sender_id !== user?.id && (
                              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3" />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] p-3 rounded-lg text-sm ${
                                message.sender_id === user?.id
                                  ? 'bg-primary text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {message.sender?.username} • {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            {message.sender_id === user?.id && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t('admin.replyToTicket')}
                          onKeyPress={(e) => e.key === 'Enter' && sendTicketMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendTicketMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.selectTicket')}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.conversations')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(70vh-5rem)]">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t('admin.noConversations')}</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        {conversations.map((conversation) => (
                          <Card
                            key={conversation.id}
                            className={`cursor-pointer transition-colors hover:bg-accent ${
                              selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              loadConversationMessages(conversation.id);
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  {conversation.product?.image_url ? (
                                    <img
                                      src={conversation.product.image_url}
                                      alt={conversation.product.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="font-medium text-sm truncate">
                                    {conversation.product?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Buyer: {conversation.buyer?.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Seller: {conversation.seller?.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(conversation.last_message_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Conversation Details */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {t('admin.viewingConversation')}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Product: {selectedConversation.product?.name}</span>
                      <span>Buyer: {selectedConversation.buyer?.username}</span>
                      <span>Seller: {selectedConversation.seller?.username}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-3">
                        {selectedConversation.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${
                              message.sender_id === selectedConversation.buyer_id ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            {message.sender_id === selectedConversation.buyer_id && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] p-3 rounded-lg text-sm ${
                                message.sender_id === selectedConversation.buyer_id
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-green-100 text-green-900'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {message.sender?.username} • {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            {message.sender_id === selectedConversation.seller_id && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.selectConversation')}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminChatManagement;