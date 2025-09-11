import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, User, Shield, Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  currentUser: any;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, onThemeToggle, currentUser, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme-toggle" className="text-base font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={isDarkMode}
              onCheckedChange={onThemeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Username</Label>
              <p className="font-medium">{currentUser?.username || 'Guest'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{currentUser?.email || 'Not logged in'}</p>
            </div>
          </div>
          {currentUser && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <>
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Administrator</span>
                  </>
                )}
                {currentUser.role === 'user' && (
                  <>
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Regular User</span>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Admin Settings */}
      {currentUser?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have administrator privileges. You can manage all products, users, and orders.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Products</p>
                <p className="text-2xl font-bold text-primary">Full Access</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Users</p>
                <p className="text-2xl font-bold text-primary">Full Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Professional Marketplace</h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">
              Built with React, TypeScript, and Supabase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;