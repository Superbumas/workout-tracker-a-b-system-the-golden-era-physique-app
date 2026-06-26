import { useGetWorkoutHistory } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, Calendar, Dumbbell, Timer, CheckCircle2, Edit } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Separator } from './ui/separator';
import type { WorkoutSession } from '../backend';

interface WorkoutHistoryProps {
  onBack: () => void;
  onEditWorkout: (workout: WorkoutSession) => void;
}

export default function WorkoutHistory({ onBack, onEditWorkout }: WorkoutHistoryProps) {
  const { data: workoutHistory, isLoading } = useGetWorkoutHistory();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes >= 1) {
      return `${minutes.toFixed(1)} min`;
    }
    return `${Math.round(minutes * 60)} sec`;
  };

  const sortedHistory = workoutHistory ? [...workoutHistory].reverse() : [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-mono uppercase text-xs tracking-wider">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-mono uppercase text-xs tracking-wider">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Badge variant="outline" className="text-base px-4 py-2 font-mono border-2 rounded-sm">
          <Dumbbell className="w-4 h-4 mr-2" />
          {sortedHistory.length} Total Workouts
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display font-bold tracking-tight">WORKOUT HISTORY</h1>
        <p className="text-muted-foreground text-lg font-mono uppercase tracking-wide">
          Your training journey
        </p>
      </div>

      {sortedHistory.length === 0 ? (
        <Card className="border-2 rounded-sm shadow-vintage">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg font-mono">No workouts recorded yet</p>
            <p className="text-sm text-muted-foreground mt-2 font-mono">Complete your first session to see it here</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {sortedHistory.map((workout, index) => (
            <AccordionItem key={index} value={`workout-${index}`} className="border-2 border-border rounded-sm overflow-hidden shadow-vintage">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-primary text-primary-foreground font-bold font-mono border-2 border-primary-foreground/20">
                      {workout.sessionType}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg font-display">Session {workout.sessionType}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
                        <Calendar className="w-3 h-3" />
                        {formatDate(workout.date)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono border rounded-sm">
                    {workout.exercises.length} exercises
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-6 pt-2">
                  {/* Edit Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => onEditWorkout(workout)}
                      variant="outline"
                      className="gap-2 font-mono uppercase text-xs tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Workout
                    </Button>
                  </div>

                  {/* Warm-Up Section */}
                  {workout.warmUpActivities && workout.warmUpActivities.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-display text-xl font-bold border-b-2 border-border pb-2">
                        WARM-UP & STRETCH
                      </h3>
                      <div className="space-y-2">
                        {workout.warmUpActivities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-center justify-between p-3 border border-border rounded-sm bg-accent/20">
                            <div className="flex items-center gap-3">
                              {activity.completed && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              <span className="font-mono font-semibold">{activity.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatMinutes(activity.durationMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  )}

                  {/* Exercises Section */}
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold border-b-2 border-border pb-2">
                      MAIN EXERCISES
                    </h3>
                    {workout.exercises.map((exercise, exIndex) => (
                      <div key={exIndex} className="border-2 border-border rounded-sm p-4 shadow-vintage">
                        <h4 className="font-bold text-lg mb-3 font-display">{exercise.name}</h4>
                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex items-center justify-between text-sm font-mono">
                              <span className="text-muted-foreground font-bold">Set {setIndex + 1}</span>
                              <span className="font-mono">
                                {set.weight.toFixed(1)} kg × {Number(set.reps)} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cool-Down Section */}
                  {workout.coolDownActivities && workout.coolDownActivities.length > 0 && (
                    <div className="space-y-3">
                      <Separator className="my-4" />
                      <h3 className="font-display text-xl font-bold border-b-2 border-border pb-2">
                        COOL-DOWN & RECOVERY
                      </h3>
                      <div className="space-y-2">
                        {workout.coolDownActivities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-center justify-between p-3 border border-border rounded-sm bg-accent/20">
                            <div className="flex items-center gap-3">
                              {activity.completed && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              <span className="font-mono font-semibold">{activity.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatMinutes(activity.durationMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
