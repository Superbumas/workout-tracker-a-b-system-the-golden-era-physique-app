import { useGetCallerUserProfile, useGetWorkoutProgress } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lock, Dumbbell } from 'lucide-react';

interface SessionSelectorProps {
  onSelectSession: (session: 'A' | 'B') => void;
}

export default function SessionSelector({ onSelectSession }: SessionSelectorProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: workoutProgress } = useGetWorkoutProgress();

  const unlockedSessions = userProfile?.unlockedSessions || ['A'];
  const isSessionBUnlocked = unlockedSessions.includes('B');
  const totalWorkouts = Number(workoutProgress || BigInt(0));

  const sessionAExercises = [
    'Squat',
    'Bench Press',
    'Wide Pull Up',
    'Behind The Neck Press',
    'Pendlay Row',
    'Sit Up'
  ];

  const sessionBExercises = [
    'Deadlift',
    'Incline Bench',
    'Wide Pull Up',
    'Dips',
    'Pendlay Row',
    'Sit Up'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-display font-bold tracking-tight">SELECT YOUR SESSION</h1>
        <p className="text-muted-foreground text-lg font-mono uppercase tracking-wide">
          Choose today's training session
        </p>
        {totalWorkouts > 0 && (
          <Badge variant="outline" className="text-base px-4 py-2 font-mono border-2 rounded-sm">
            <Dumbbell className="w-4 h-4 mr-2" />
            {totalWorkouts} Total Workouts Completed
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Session A */}
        <Card className="hover:border-primary transition-all cursor-pointer border-2 rounded-sm shadow-vintage hover:shadow-vintage-lg" onClick={() => onSelectSession('A')}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-3xl font-display">SESSION A</CardTitle>
              <Badge variant="default" className="font-mono uppercase text-xs tracking-wider border-2 rounded-sm">Available</Badge>
            </div>
            <CardDescription className="text-base font-mono">
              Foundation building session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {sessionAExercises.map((exercise, index) => (
                <div key={exercise} className="flex items-center gap-3 text-sm font-mono">
                  <span className="text-muted-foreground font-bold">{index + 1}.</span>
                  <span className={index < 2 ? 'font-bold' : ''}>{exercise}</span>
                  {index < 2 && (
                    <Badge variant="secondary" className="ml-auto text-xs font-mono border rounded-sm">5×6</Badge>
                  )}
                  {index >= 2 && index < 5 && (
                    <Badge variant="outline" className="ml-auto text-xs font-mono border rounded-sm">3×6</Badge>
                  )}
                  {index === 5 && (
                    <Badge variant="outline" className="ml-auto text-xs font-mono border rounded-sm">3×10</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button className="w-full font-mono uppercase tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all" size="lg">
              Start Session A
            </Button>
          </CardContent>
        </Card>

        {/* Session B */}
        <Card 
          className={`transition-all border-2 rounded-sm shadow-vintage ${isSessionBUnlocked ? 'hover:border-primary cursor-pointer hover:shadow-vintage-lg' : 'opacity-60'}`}
          onClick={() => isSessionBUnlocked && onSelectSession('B')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-3xl font-display">SESSION B</CardTitle>
              {isSessionBUnlocked ? (
                <Badge variant="default" className="font-mono uppercase text-xs tracking-wider border-2 rounded-sm">Available</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 font-mono uppercase text-xs tracking-wider border-2 rounded-sm">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}
            </div>
            <CardDescription className="text-base font-mono">
              {isSessionBUnlocked ? 'Advanced training session' : 'Unlocks after 6 months'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {sessionBExercises.map((exercise, index) => (
                <div key={exercise} className="flex items-center gap-3 text-sm font-mono">
                  <span className="text-muted-foreground font-bold">{index + 1}.</span>
                  <span className={index < 2 ? 'font-bold' : ''}>{exercise}</span>
                  {index < 2 && (
                    <Badge variant="secondary" className="ml-auto text-xs font-mono border rounded-sm">5×6</Badge>
                  )}
                  {index >= 2 && index < 5 && (
                    <Badge variant="outline" className="ml-auto text-xs font-mono border rounded-sm">3×6</Badge>
                  )}
                  {index === 5 && (
                    <Badge variant="outline" className="ml-auto text-xs font-mono border rounded-sm">3×10</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button 
              className="w-full font-mono uppercase tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all" 
              size="lg"
              disabled={!isSessionBUnlocked}
            >
              {isSessionBUnlocked ? 'Start Session B' : 'Locked'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Technique Reminders */}
      <Card className="bg-accent/50 border-2 rounded-sm shadow-vintage">
        <CardHeader>
          <CardTitle className="text-xl font-display">Training Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-bold font-mono">Do Not Lock Out</p>
                <p className="text-sm text-muted-foreground font-mono">Keep constant tension on muscles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-bold font-mono">Time Under Tension</p>
                <p className="text-sm text-muted-foreground font-mono">Control the eccentric and concentric</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

