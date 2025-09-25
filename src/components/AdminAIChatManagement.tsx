import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Bot, 
  Trash2, 
  Users,
  Clock,
  MessageSquare,
  Shield,
  AlertCircle
} from 'lucide-react';

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  language: string;
  status: 'active' | 'escalated' | 'closed';
  admin_id?: string;
  admin_joined_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
  };
  admin?: {
    username: string;
  };
  message_count?: number;
}

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id?: string;
  content: string;
  message_type: 'text' | 'system' | 'escalation';
  sender_type: 'user' | 'bot' | 'admin';
  created_at: string;
}

interface AdminAIChatManagementProps {
  onClose: () => void;
}

const AdminAIChatManagement: React.FC<AdminAIChatManagementProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'escalated' | 'closed'>('all');

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, filter]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chat_sessions')
        .select(`
          *,
          user:users!chat_sessions_user_id_fkey(username, email),
          admin:users!chat_sessions_admin_id_fkey(username)
        `)
        .order('updated_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get message counts for each session
      const sessionIds = data?.map(s => s.id) || [];
      if (sessionIds.length > 0) {
        const { data: messageCounts } = await supabase
          .from('chat_messages')
          .select('session_id')
          .in('session_id', sessionIds);

        const counts = messageCounts?.reduce((acc, msg) => {
          acc[msg.session_id] = (acc[msg.session_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const sessionsWithCounts = data?.map(session => ({
          ...session,
          status: session.status as 'active' | 'escalated' | 'closed',
          user: session.user as any || { username: 'Unknown', email: 'unknown@example.com' },
          admin: session.admin as any,
          message_count: counts[session.id] || 0
        }));

        setSessions(sessionsWithCounts || []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'system' | 'escalation',
        sender_type: msg.sender_type as 'user' | 'bot' | 'admin'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !user) return;

    try {
      // Take over the session if not already
      if (!selectedSession.admin_id) {
        await supabase
          .from('chat_sessions')
          .update({
            admin_id: user.id,
            admin_joined_at: new Date().toISOString(),
            status: 'escalated'
          })
          .eq('id', selectedSession.id);
      }

      // Send message
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: selectedSession.id,
          sender_id: user.id,
          content: newMessage,
          sender_type: 'admin',
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedSession.id);
      loadSessions(); // Refresh sessions

      toast({
        title: "Message sent",
        description: "Your message has been sent to the user"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }

      toast({
        title: "Session deleted",
        description: "Chat session has been deleted"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'active' | 'escalated' | 'closed') => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;

      loadSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status } : null);
      }

      toast({
        title: "Status updated",
        description: `Session status changed to ${status}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'secondary';
      case 'escalated': return 'destructive';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageCircle className="h-3 w-3" />;
      case 'escalated': return <AlertCircle className="h-3 w-3" />;
      case 'closed': return <X className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading chat sessions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Chat Management
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Sessions List */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Chat Sessions ({sessions.length})
              </h3>
              <Select value={filter} onValueChange={setFilter as any}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Card 
                    key={session.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSession?.id === session.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(session.status)}>
                              {getStatusIcon(session.status)}
                              {session.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {session.language?.toUpperCase()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm">{session.user?.username || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.message_count || 0} messages
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.updated_at).toLocaleDateString()}
                          </div>
                        </div>

                        {session.admin_id && (
                          <div className="text-xs text-green-600">
                            Admin: {session.admin?.username}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat View */}
          <div className="md:col-span-2 flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <div className="border-b p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedSession.user?.username}</h3>
                      <p className="text-sm text-muted-foreground">{selectedSession.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedSession.status} 
                        onValueChange={(value) => updateSessionStatus(selectedSession.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Language: {selectedSession.language?.toUpperCase()}</span>
                    <span>Created: {new Date(selectedSession.created_at).toLocaleDateString()}</span>
                    {selectedSession.admin_joined_at && (
                      <span>Admin joined: {new Date(selectedSession.admin_joined_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        {message.sender_type !== 'admin' && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender_type === 'bot' ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {message.sender_type === 'bot' ? (
                              <Bot className="h-4 w-4 text-white" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                        )}
                        <div className={`max-w-[80%] ${message.sender_type === 'admin' ? 'order-1' : ''}`}>
                          <div className={`p-3 rounded-lg text-sm ${
                            message.sender_type === 'admin'
                              ? 'bg-green-600 text-white ml-auto'
                              : message.sender_type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {message.content}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 px-1">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {message.sender_type === 'admin' && (
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message as admin..."
                      onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendAdminMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedSession.admin_id ? 'You are in control of this chat' : 'Click send to take over this chat'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a chat session to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAIChatManagement;