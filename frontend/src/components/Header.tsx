import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { History, BookOpen } from 'lucide-react';

type ViewMode = 'home' | 'history' | 'logbook';

interface HeaderProps {
  onNavigate: (view: ViewMode) => void;
  currentView: ViewMode;
  showNavigation: boolean;
}

export default function Header({ onNavigate, currentView, showNavigation }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="border-b-2 border-border bg-card shadow-vintage">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => showNavigation && onNavigate('home')}>
            <img src="/assets/generated/golden-era-logo.dim_200x200.png" alt="Golden Era" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight">THE GOLDEN ERA</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Physique Training</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showNavigation && (
              <>
                <Button
                  onClick={() => onNavigate('history')}
                  variant={currentView === 'history' ? 'default' : 'outline'}
                  size="default"
                  className="gap-2 font-mono uppercase text-xs tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
                <Button
                  onClick={() => onNavigate('logbook')}
                  variant={currentView === 'logbook' ? 'default' : 'outline'}
                  size="default"
                  className="gap-2 font-mono uppercase text-xs tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Logbook</span>
                </Button>
              </>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="default"
              className="font-mono uppercase text-xs tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
            >
              {text}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
