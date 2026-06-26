import { useGetWorkoutHistory } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, Calendar, Dumbbell, Timer, CheckCircle2, Edit, ChevronDown } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState } from 'react';
import type { WorkoutSession } from '../backend';

interface WorkoutLogProps {
  onBack: () => void;
  onEditWorkout: (workout: WorkoutSession) => void;
}

export default function WorkoutLog({ onBack, onEditWorkout }: WorkoutLogProps) {
  const { data: workoutHistory, isLoading } = useGetWorkoutHistory();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<number>>(new Set());

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes >= 1) {
      return `${minutes.toFixed(1)} min`;
    }
    return `${Math.round(minutes * 60)} sec`;
  };

  const toggleWorkout = (index: number) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWorkouts(newExpanded);
  };

  const sortedHistory = workoutHistory ? [...workoutHistory].reverse() : [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-mono uppercase text-xs tracking-wider">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">Loading logbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-mono uppercase text-xs tracking-wider">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Badge variant="outline" className="text-base px-4 py-2 font-mono border-2 rounded-sm">
          <Dumbbell className="w-4 h-4 mr-2" />
          {sortedHistory.length} Total Sessions
        </Badge>
      </div>

      <div className="text-center space-y-3 py-6">
        <h1 className="text-5xl font-display font-bold tracking-tight">TRAINING LOGBOOK</h1>
        <p className="text-muted-foreground text-lg font-mono uppercase tracking-wide">
          Complete workout history & progress
        </p>
        <Separator className="max-w-md mx-auto" />
      </div>

      {sortedHistory.length === 0 ? (
        <Card className="border-2 rounded-sm shadow-vintage">
          <CardContent className="py-16 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-xl font-mono mb-2">No workouts logged yet</p>
            <p className="text-sm text-muted-foreground font-mono">Complete your first training session to begin your journey</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedHistory.map((workout, index) => {
            const isExpanded = expandedWorkouts.has(index);
            
            return (
              <Card key={index} className="border-2 border-border rounded-sm shadow-vintage overflow-hidden">
                <div 
                  className="px-6 py-5 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => toggleWorkout(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-sm bg-primary text-primary-foreground font-bold text-2xl font-mono border-2 border-primary-foreground/20 shadow-md">
                        {workout.sessionType}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-2xl font-display mb-1">Session {workout.sessionType}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
                          <Calendar className="w-4 h-4" />
                          {formatDate(workout.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono border-2 rounded-sm px-3 py-1">
                        {workout.exercises.length} exercises
                      </Badge>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="px-6 pb-6 pt-2 border-t-2 border-border bg-accent/10">
                    <div className="space-y-6">
                      {/* Edit Button */}
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorkout(workout);
                          }}
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
                          <h3 className="font-display text-2xl font-bold border-b-2 border-border pb-2 flex items-center gap-2">
                            <span className="text-primary">—</span> WARM-UP & STRETCH
                          </h3>
                          <div className="space-y-2 pl-4">
                            {workout.warmUpActivities.map((activity, actIndex) => (
                              <div key={actIndex} className="flex items-center justify-between p-3 border-2 border-border rounded-sm bg-card">
                                <div className="flex items-center gap-3">
                                  {activity.completed && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                  <span className="font-mono font-semibold text-base">{activity.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                                  <Timer className="w-4 h-4" />
                                  {formatMinutes(activity.durationMinutes)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exercises Section */}
                      <div className="space-y-4">
                        <h3 className="font-display text-2xl font-bold border-b-2 border-border pb-2 flex items-center gap-2">
                          <span className="text-primary">—</span> MAIN EXERCISES
                        </h3>
                        <div className="grid gap-4 pl-4">
                          {workout.exercises.map((exercise, exIndex) => (
                            <div key={exIndex} className="border-2 border-border rounded-sm p-5 shadow-vintage bg-card">
                              <div className="flex items-center gap-3 mb-4">
                                <img 
                                  src={`/assets/generated/${exercise.name.toLowerCase().includes('pull') || exercise.name.toLowerCase().includes('sit') || exercise.name.toLowerCase().includes('dip') ? 'dumbbell' : 'barbell'}-icon-transparent.dim_64x64.png`}
                                  alt=""
                                  className="w-8 h-8 opacity-70"
                                />
                                <h4 className="font-bold text-xl font-display">{exercise.name}</h4>
                              </div>
                              <div className="space-y-2">
                                {exercise.sets.map((set, setIndex) => (
                                  <div key={setIndex} className="flex items-center justify-between text-base font-mono p-2 rounded-sm bg-accent/20">
                                    <span className="text-muted-foreground font-bold">Set {setIndex + 1}</span>
                                    <span className="font-mono font-bold">
                                      {set.weight.toFixed(1)} kg × {Number(set.reps)} reps
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cool-Down Section */}
                      {workout.coolDownActivities && workout.coolDownActivities.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-display text-2xl font-bold border-b-2 border-border pb-2 flex items-center gap-2">
                            <span className="text-primary">—</span> COOL-DOWN & RECOVERY
                          </h3>
                          <div className="space-y-2 pl-4">
                            {workout.coolDownActivities.map((activity, actIndex) => (
                              <div key={actIndex} className="flex items-center justify-between p-3 border-2 border-border rounded-sm bg-card">
                                <div className="flex items-center gap-3">
                                  {activity.completed && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                  <span className="font-mono font-semibold text-base">{activity.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                                  <Timer className="w-4 h-4" />
                                  {formatMinutes(activity.durationMinutes)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
