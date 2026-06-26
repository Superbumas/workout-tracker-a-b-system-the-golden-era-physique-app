import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import SessionSelector from './components/SessionSelector';
import WorkoutTracker from './components/WorkoutTracker';
import WorkoutHistory from './components/WorkoutHistory';
import WorkoutLog from './components/WorkoutLog';
import { Toaster } from './components/ui/sonner';
import type { WorkoutSession } from './backend';

type ViewMode = 'home' | 'history' | 'logbook';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [activeSession, setActiveSession] = useState<'A' | 'B' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Reset active session when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveSession(null);
      setViewMode('home');
      setEditingWorkout(null);
    }
  }, [isAuthenticated]);

  const handleEditWorkout = (workout: WorkoutSession) => {
    setEditingWorkout(workout);
    setViewMode('home');
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setViewMode('logbook');
  };

  const handleCompleteEdit = () => {
    setEditingWorkout(null);
    setViewMode('logbook');
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen flex items-center justify-center bg-background paper-texture">
          <div className="text-center space-y-4">
            <img src="/assets/generated/golden-era-logo.dim_200x200.png" alt="Golden Era" className="w-32 h-32 mx-auto opacity-50 animate-pulse" />
            <p className="text-muted-foreground text-lg font-mono">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen flex flex-col bg-background paper-texture">
        <Header 
          onNavigate={setViewMode}
          currentView={viewMode}
          showNavigation={isAuthenticated && !showProfileSetup}
        />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {!isAuthenticated ? (
            <div className="max-w-2xl mx-auto text-center space-y-8 py-16">
              <img src="/assets/generated/golden-era-logo.dim_200x200.png" alt="Golden Era" className="w-48 h-48 mx-auto" />
              <div className="space-y-4">
                <h1 className="text-5xl font-display font-bold tracking-tight">THE GOLDEN ERA</h1>
                <p className="text-xl text-muted-foreground font-mono uppercase tracking-wider">Physique Training System</p>
              </div>
              <div className="space-y-4 text-left bg-card border-2 border-border p-8 rounded-sm shadow-vintage">
                <h2 className="text-2xl font-display font-bold">Training Philosophy</h2>
                <ul className="space-y-2 text-muted-foreground font-mono text-sm">
                  <li>• Progressive overload on compound movements</li>
                  <li>• Time under tension for muscle development</li>
                  <li>• Structured A/B split for balanced physique</li>
                  <li>• No lockouts - constant muscle engagement</li>
                </ul>
              </div>
              <p className="text-muted-foreground font-mono uppercase tracking-wide text-sm">Login to begin your journey</p>
            </div>
          ) : showProfileSetup ? (
            <ProfileSetupModal />
          ) : editingWorkout ? (
            <WorkoutTracker 
              session={editingWorkout.sessionType as 'A' | 'B'}
              onComplete={handleCompleteEdit}
              onCancel={handleCancelEdit}
              editMode={true}
              existingWorkout={editingWorkout}
            />
          ) : viewMode === 'history' ? (
            <WorkoutHistory onBack={() => setViewMode('home')} onEditWorkout={handleEditWorkout} />
          ) : viewMode === 'logbook' ? (
            <WorkoutLog onBack={() => setViewMode('home')} onEditWorkout={handleEditWorkout} />
          ) : activeSession ? (
            <WorkoutTracker 
              session={activeSession} 
              onComplete={() => setActiveSession(null)}
              onCancel={() => setActiveSession(null)}
            />
          ) : (
            <SessionSelector onSelectSession={setActiveSession} />
          )}
        </main>

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
