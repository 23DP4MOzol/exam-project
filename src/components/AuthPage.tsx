import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthPageProps {
  onClose: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const { signIn, signUp, loading } = useAuth();
  const { t } = useLanguage();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return;
    
    const result = await signIn(loginForm.email, loginForm.password);
    if (!result.error) {
      setLoginForm({ email: '', password: '' });
      onClose();
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) return;
    
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    
    const result = await signUp(registerForm.email, registerForm.password, registerForm.username);
    if (!result.error) {
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      onClose();
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const adminLogin = async () => {
    await signIn('admin@marketplace.com', 'admin123');
    onClose();
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">
              Welcome to Marketplace
            </CardTitle>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loading || !loginForm.email || !loginForm.password}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Demo Accounts
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={adminLogin}
                        className="w-full"
                        disabled={loading}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login as Admin
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => signIn('demo@marketplace.com', 'demo123').then(() => { onClose(); setTimeout(() => window.location.reload(), 100); })}
                        className="w-full"
                        disabled={loading}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login as Demo User
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm mt-3">
                      <p className="font-medium text-primary mb-2">Demo Credentials:</p>
                      <div className="space-y-1 text-left">
                        <p className="text-muted-foreground"><strong>Admin:</strong> admin@marketplace.com / admin123</p>
                        <p className="text-muted-foreground"><strong>User:</strong> demo@marketplace.com / demo123</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loading || !registerForm.username || !registerForm.email || !registerForm.password || registerForm.password !== registerForm.confirmPassword}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>
                    By creating an account, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;