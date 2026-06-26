import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ExperienceLevel } from '../backend';

export default function ProfileSetupModal() {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(ExperienceLevel.beginner);
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = () => {
    const startDate = BigInt(Date.now() * 1000000); // Convert to nanoseconds
    const unlockedSessions = experienceLevel === ExperienceLevel.intermediate ? ['A', 'B'] : ['A'];
    
    saveProfile({
      experienceLevel,
      startDate,
      unlockedSessions,
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full border-2 rounded-sm shadow-vintage-lg">
        <CardHeader className="text-center space-y-2">
          <img src="/assets/generated/golden-era-logo.dim_200x200.png" alt="Golden Era" className="w-24 h-24 mx-auto" />
          <CardTitle className="text-3xl font-display">Welcome to The Golden Era</CardTitle>
          <CardDescription className="text-base font-mono">
            Select your training experience level to begin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <button
              onClick={() => setExperienceLevel(ExperienceLevel.beginner)}
              className={`p-6 border-2 rounded-sm text-left transition-all shadow-vintage hover:shadow-none ${
                experienceLevel === ExperienceLevel.beginner
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="flex items-start gap-4">
                <img src="/assets/generated/dumbbell-icon-transparent.dim_64x64.png" alt="" className="w-12 h-12 opacity-70" />
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold mb-2">Beginner (Less than 6 months)</h3>
                  <p className="text-sm text-muted-foreground mb-3 font-mono">
                    Start with Session A to build a solid foundation with fundamental compound movements.
                  </p>
                  <div className="text-sm font-mono">
                    <p className="font-semibold mb-1">Available:</p>
                    <p className="text-muted-foreground">Session A only</p>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExperienceLevel(ExperienceLevel.intermediate)}
              className={`p-6 border-2 rounded-sm text-left transition-all shadow-vintage hover:shadow-none ${
                experienceLevel === ExperienceLevel.intermediate
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="flex items-start gap-4">
                <img src="/assets/generated/barbell-icon-transparent.dim_64x64.png" alt="" className="w-12 h-12 opacity-70" />
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold mb-2">Intermediate (6+ months)</h3>
                  <p className="text-sm text-muted-foreground mb-3 font-mono">
                    Access both sessions for a complete training split with advanced movements.
                  </p>
                  <div className="text-sm font-mono">
                    <p className="font-semibold mb-1">Available:</p>
                    <p className="text-muted-foreground">Session A & Session B</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full text-lg py-6 font-mono uppercase tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
            size="lg"
          >
            {isPending ? 'Setting up...' : 'Begin Training'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

