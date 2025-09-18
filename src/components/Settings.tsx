import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Sun, User, Shield, Settings as SettingsIcon, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  currentUser: any;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, onThemeToggle, currentUser, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        </div>
        <Button variant="outline" onClick={onClose}>
          {t('settings.close')}
        </Button>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5" />
            {t('nav.language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="language-select" className="text-base font-medium text-foreground">
                {t('nav.language')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="lv">Latviešu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {t('settings.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme-toggle" className="text-base font-medium text-foreground">
                {t('settings.darkMode')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.darkMode.desc')}
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
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            {t('settings.account')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUser ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('auth.username')}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground flex-1">{currentUser.username}</p>
                    <Button variant="outline" size="sm">
                      {t('settings.changeUsername')}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('auth.email')}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground flex-1">{currentUser.email}</p>
                    <Button variant="outline" size="sm">
                      {t('settings.changeEmail')}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('settings.password')}</Label>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('settings.changePassword')}
                  </Button>
                </div>
              </div>
              
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
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">{t('settings.notLoggedIn')}</p>
              <Button variant="outline" className="mt-2">
                {t('auth.signIn')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Settings */}
      {currentUser?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              {t('settings.admin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.admin.desc')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">{t('admin.products')}</p>
                <p className="text-2xl font-bold text-primary">Full Access</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">{t('admin.users')}</p>
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
            <h3 className="font-semibold text-foreground">{t('header.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.version')}</p>
            <p className="text-xs text-muted-foreground">
              {t('settings.builtWith')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;