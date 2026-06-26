import { useState, useEffect } from 'react';
import { useUpsertWorkoutSession, useGetTechniqueCues, useGetLastUsedWeightsForExercise, useGetSessionAExercises, useGetSessionBExercises } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Plus, Play, Pause, X, Timer, ExternalLink, ChevronDown, ChevronUp, Save, List, Home } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import type { WorkoutSession, ExerciseLog, SetLog, WarmUpActivity, CoolDownActivity } from '../backend';

interface WorkoutTrackerProps {
  session: 'A' | 'B';
  onComplete: () => void;
  onCancel: () => void;
  editMode?: boolean;
  existingWorkout?: WorkoutSession;
}

type WorkoutPhase = 'warmup' | 'exercises' | 'cooldown';

export default function WorkoutTracker({ session, onComplete, onCancel, editMode = false, existingWorkout }: WorkoutTrackerProps) {
  const { mutate: upsertWorkout, isPending } = useUpsertWorkoutSession();
  const { data: techniqueCues } = useGetTechniqueCues();
  const { data: sessionAExercises, isLoading: loadingSessionA } = useGetSessionAExercises();
  const { data: sessionBExercises, isLoading: loadingSessionB } = useGetSessionBExercises();

  const exercises = session === 'A' ? sessionAExercises : sessionBExercises;
  const isLoadingExercises = session === 'A' ? loadingSessionA : loadingSessionB;

  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase>(editMode ? 'warmup' : 'warmup');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentSets, setCurrentSets] = useState<SetLog[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exerciseListOpen, setExerciseListOpen] = useState(false);

  // Warm-up state (durations in minutes)
  const [warmUpActivities, setWarmUpActivities] = useState<WarmUpActivity[]>([]);
  const [newWarmUpName, setNewWarmUpName] = useState('');
  const [newWarmUpDuration, setNewWarmUpDuration] = useState('');
  const [activeWarmUpTimer, setActiveWarmUpTimer] = useState<number | null>(null);
  const [warmUpTimeRemaining, setWarmUpTimeRemaining] = useState<{ [key: number]: number }>({});

  // Cool-down state (durations in minutes)
  const [coolDownActivities, setCoolDownActivities] = useState<CoolDownActivity[]>([]);
  const [newCoolDownName, setNewCoolDownName] = useState('');
  const [newCoolDownDuration, setNewCoolDownDuration] = useState('');

  const currentExercise = exercises && exercises[currentExerciseIndex];
  const progress = currentPhase === 'warmup' ? 0 : currentPhase === 'cooldown' ? 100 : exercises ? ((currentExerciseIndex) / exercises.length) * 100 : 0;

  // Get last used weights for current exercise (array of weights per set)
  const { data: lastUsedWeights } = useGetLastUsedWeightsForExercise(currentExercise?.name || '');

  // Initialize from existing workout if in edit mode
  useEffect(() => {
    if (editMode && existingWorkout) {
      setWarmUpActivities(existingWorkout.warmUpActivities || []);
      setExerciseLogs(existingWorkout.exercises || []);
      setCoolDownActivities(existingWorkout.coolDownActivities || []);
      
      // Initialize time remaining for warm-up activities
      const timeRemaining: { [key: number]: number } = {};
      existingWorkout.warmUpActivities?.forEach((activity, index) => {
        timeRemaining[index] = Math.round(activity.durationMinutes * 60);
      });
      setWarmUpTimeRemaining(timeRemaining);
    }
  }, [editMode, existingWorkout]);

  // Initialize sets for current exercise with last used weights or existing data
  useEffect(() => {
    if (currentPhase === 'exercises' && currentExercise) {
      // Check if we have existing data for this exercise in edit mode or from navigation
      const existingExerciseLog = exerciseLogs.find(log => log.name === currentExercise.name);
      
      if (existingExerciseLog) {
        setCurrentSets(existingExerciseLog.sets);
      } else {
        const sets: SetLog[] = Array.from({ length: Number(currentExercise.sets) }, (_, index) => {
          const lastWeight = lastUsedWeights && lastUsedWeights[index] ? lastUsedWeights[index] : 0;
          return {
            weight: lastWeight,
            reps: currentExercise.reps,
          };
        });
        setCurrentSets(sets);
      }
      setExpandedExercise(true);
    }
  }, [currentExerciseIndex, currentExercise, lastUsedWeights, currentPhase, exerciseLogs]);

  // Timer effect for warm-up activities (countdown in seconds, but duration stored in minutes)
  useEffect(() => {
    if (activeWarmUpTimer !== null) {
      const interval = setInterval(() => {
        setWarmUpTimeRemaining(prev => {
          const remaining = prev[activeWarmUpTimer] || 0;
          if (remaining <= 1) {
            setActiveWarmUpTimer(null);
            // Mark as completed
            setWarmUpActivities(activities => 
              activities.map((act, idx) => 
                idx === activeWarmUpTimer ? { ...act, completed: true } : act
              )
            );
            return { ...prev, [activeWarmUpTimer]: 0 };
          }
          return { ...prev, [activeWarmUpTimer]: remaining - 1 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeWarmUpTimer]);

  const addWarmUpActivity = () => {
    if (newWarmUpName.trim() && newWarmUpDuration) {
      const durationMinutes = parseFloat(newWarmUpDuration);
      if (durationMinutes > 0) {
        const newActivity: WarmUpActivity = {
          name: newWarmUpName.trim(),
          durationMinutes: durationMinutes,
          completed: false,
        };
        setWarmUpActivities([...warmUpActivities, newActivity]);
        // Store time remaining in seconds for countdown
        setWarmUpTimeRemaining({ ...warmUpTimeRemaining, [warmUpActivities.length]: Math.round(durationMinutes * 60) });
        setNewWarmUpName('');
        setNewWarmUpDuration('');
      }
    }
  };

  const removeWarmUpActivity = (index: number) => {
    setWarmUpActivities(warmUpActivities.filter((_, i) => i !== index));
    if (activeWarmUpTimer === index) {
      setActiveWarmUpTimer(null);
    }
  };

  const toggleWarmUpTimer = (index: number) => {
    if (activeWarmUpTimer === index) {
      setActiveWarmUpTimer(null);
    } else {
      setActiveWarmUpTimer(index);
    }
  };

  const addCoolDownActivity = () => {
    if (newCoolDownName.trim() && newCoolDownDuration) {
      const durationMinutes = parseFloat(newCoolDownDuration);
      if (durationMinutes > 0) {
        const newActivity: CoolDownActivity = {
          name: newCoolDownName.trim(),
          durationMinutes: durationMinutes,
          completed: false,
        };
        setCoolDownActivities([...coolDownActivities, newActivity]);
        setNewCoolDownName('');
        setNewCoolDownDuration('');
      }
    }
  };

  const removeCoolDownActivity = (index: number) => {
    setCoolDownActivities(coolDownActivities.filter((_, i) => i !== index));
  };

  const toggleCoolDownComplete = (index: number) => {
    setCoolDownActivities(activities =>
      activities.map((act, idx) =>
        idx === index ? { ...act, completed: !act.completed } : act
      )
    );
  };

  const updateSet = (setIndex: number, field: 'weight' | 'reps', value: string) => {
    const newSets = [...currentSets];
    if (field === 'weight') {
      newSets[setIndex] = { ...newSets[setIndex], weight: parseFloat(value) || 0 };
    } else {
      newSets[setIndex] = { ...newSets[setIndex], reps: BigInt(parseInt(value) || 0) };
    }
    setCurrentSets(newSets);
  };

  // Save current exercise data before navigating
  const saveCurrentExercise = () => {
    if (!currentExercise) return;
    
    const exerciseLog: ExerciseLog = {
      name: currentExercise.name,
      sets: currentSets,
    };
    
    // Update or add to exercise logs
    const existingIndex = exerciseLogs.findIndex(log => log.name === currentExercise.name);
    let updatedLogs: ExerciseLog[];
    
    if (existingIndex >= 0) {
      updatedLogs = [...exerciseLogs];
      updatedLogs[existingIndex] = exerciseLog;
    } else {
      updatedLogs = [...exerciseLogs, exerciseLog];
    }
    
    setExerciseLogs(updatedLogs);
  };

  const handleNextExercise = () => {
    saveCurrentExercise();

    if (exercises && currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Move to cool-down phase
      setCurrentPhase('cooldown');
    }
  };

  const handlePreviousExercise = () => {
    saveCurrentExercise();

    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleGoToWarmUp = () => {
    saveCurrentExercise();
    setCurrentPhase('warmup');
  };

  const handleJumpToExercise = (index: number) => {
    saveCurrentExercise();
    setCurrentExerciseIndex(index);
    setExerciseListOpen(false);
  };

  const handleSaveWorkout = () => {
    if (editMode) {
      setShowConfirmDialog(true);
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = () => {
    const workoutSession: WorkoutSession = {
      date: editMode && existingWorkout ? existingWorkout.date : BigInt(Date.now() * 1000000),
      sessionType: session,
      exercises: exerciseLogs,
      warmUpActivities,
      coolDownActivities,
    };

    upsertWorkout(workoutSession, {
      onSuccess: () => {
        setShowConfirmDialog(false);
        onComplete();
      },
    });
  };

  const getExerciseCue = (exerciseName: string): string | null => {
    if (!techniqueCues) return null;
    const cue = techniqueCues.find(c => c.toLowerCase().includes(exerciseName.toLowerCase()));
    return cue || null;
  };

  const exerciseCue = currentExercise ? getExerciseCue(currentExercise.name) : null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes >= 1) {
      return `${minutes.toFixed(1)} min`;
    }
    return `${Math.round(minutes * 60)} sec`;
  };

  const getIconPath = (iconName: string): string => {
    return `/assets/generated/${iconName}`;
  };

  const isMainLift = (index: number): boolean => {
    return index < 2;
  };

  const isExerciseCompleted = (exerciseName: string): boolean => {
    return exerciseLogs.some(log => log.name === exerciseName);
  };

  if (isLoadingExercises) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12 text-muted-foreground font-mono">
          Loading workout data...
        </div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12 text-muted-foreground font-mono">
          No exercises found for this session
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="gap-2 font-mono uppercase text-xs tracking-wider">
          <ChevronLeft className="w-4 h-4" />
          {editMode ? 'Cancel Edit' : 'Cancel'}
        </Button>
        <div className="flex items-center gap-3">
          {editMode && (
            <Badge variant="outline" className="text-sm px-3 py-1 font-mono border-2 rounded-sm bg-primary/10">
              Editing Mode
            </Badge>
          )}
          <Badge variant="outline" className="text-base px-4 py-2 font-mono border-2 rounded-sm">
            Session {session}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-mono">
          <span className="text-muted-foreground uppercase tracking-wide">
            {currentPhase === 'warmup' ? 'Warm-Up Phase' : currentPhase === 'cooldown' ? 'Cool-Down Phase' : `Exercise ${currentExerciseIndex + 1} of ${exercises.length}`}
          </span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 sketch-progress border border-border rounded-sm" />
      </div>

      {/* Warm-Up Phase */}
      {currentPhase === 'warmup' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 rounded-sm shadow-vintage-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-display border-b-2 border-border pb-4">
                WARM-UP & STRETCH
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new warm-up activity */}
              <div className="space-y-3">
                <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-muted-foreground">Add Activity</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Activity name (e.g., Dynamic stretching)"
                    value={newWarmUpName}
                    onChange={(e) => setNewWarmUpName(e.target.value)}
                    className="flex-1 border-2 rounded-sm font-mono"
                  />
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Minutes"
                    value={newWarmUpDuration}
                    onChange={(e) => setNewWarmUpDuration(e.target.value)}
                    className="w-28 border-2 rounded-sm font-mono"
                  />
                  <Button
                    onClick={addWarmUpActivity}
                    className="border-2 rounded-sm font-mono uppercase tracking-wider"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Warm-up activities list */}
              {warmUpActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono">
                  No warm-up activities added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {warmUpActivities.map((activity, index) => {
                    const timeRemaining = warmUpTimeRemaining[index] || Math.round(activity.durationMinutes * 60);
                    const isActive = activeWarmUpTimer === index;
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 border-2 rounded-sm shadow-vintage transition-all duration-300 ${
                          activity.completed ? 'bg-accent/30' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`font-bold font-display ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {activity.name}
                          </p>
                          <p className="text-sm font-mono text-muted-foreground">
                            {formatTime(timeRemaining)} {activity.completed && '(Completed)'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleWarmUpTimer(index)}
                            disabled={activity.completed}
                            variant={isActive ? 'default' : 'outline'}
                            size="icon"
                            className="border-2 rounded-sm"
                          >
                            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => removeWarmUpActivity(index)}
                            variant="ghost"
                            size="icon"
                            className="border-2 rounded-sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={() => setCurrentPhase('exercises')}
                className="w-full text-lg py-6 font-mono uppercase tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
                size="lg"
              >
                {editMode ? 'Continue to Exercises' : 'Start Main Workout'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise Phase */}
      {currentPhase === 'exercises' && currentExercise && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Technique Reminders */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Alert className="border-2 rounded-sm shadow-vintage">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold font-mono text-xs uppercase tracking-wide">
                Do Not Lock Out
              </AlertDescription>
            </Alert>
            <Alert className="border-2 rounded-sm shadow-vintage">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold font-mono text-xs uppercase tracking-wide">
                Maintain Time Under Tension
              </AlertDescription>
            </Alert>
          </div>

          {/* Exercise Navigation Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                className="flex-1 border-2 rounded-sm font-mono uppercase tracking-wider shadow-vintage hover:shadow-none transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {/* Exercise List Sheet */}
              <Sheet open={exerciseListOpen} onOpenChange={setExerciseListOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-2 rounded-sm font-mono uppercase tracking-wider shadow-vintage hover:shadow-none transition-all"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Exercises
                  </Button>
                </SheetTrigger>
                <SheetContent className="border-l-2 rounded-none bg-background">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-display">Exercise Log</SheetTitle>
                    <SheetDescription className="font-mono text-sm">
                      Jump to any exercise to review or edit
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {exercises.map((exercise, index) => {
                      const isCompleted = isExerciseCompleted(exercise.name);
                      const isCurrent = index === currentExerciseIndex;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleJumpToExercise(index)}
                          className={`w-full text-left p-4 border-2 rounded-sm transition-all duration-200 ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground border-primary shadow-vintage'
                              : isCompleted
                              ? 'bg-accent/30 border-border hover:bg-accent/50'
                              : 'border-border hover:bg-accent/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold font-mono border-2 ${
                                isCurrent
                                  ? 'bg-primary-foreground text-primary border-primary-foreground/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className={`font-display font-bold ${isCurrent ? 'text-primary-foreground' : ''}`}>
                                  {exercise.name}
                                </p>
                                <p className={`text-xs font-mono ${isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  {Number(exercise.sets)} sets × {Number(exercise.reps)} reps
                                </p>
                              </div>
                            </div>
                            {isCompleted && !isCurrent && (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                onClick={handleNextExercise}
                variant="outline"
                className="flex-1 border-2 rounded-sm font-mono uppercase tracking-wider shadow-vintage hover:shadow-none transition-all"
              >
                {currentExerciseIndex < exercises.length - 1 ? 'Next' : 'Cool-Down'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Go to Warm-Up Button */}
            <Button
              onClick={handleGoToWarmUp}
              variant="outline"
              className="w-full border-2 rounded-sm font-mono uppercase tracking-wider shadow-vintage hover:shadow-none transition-all bg-primary/5 hover:bg-primary/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Warm-Up
            </Button>
          </div>

          {/* Current Exercise - Expandable Card */}
          <Card className="border-2 rounded-sm shadow-vintage-lg overflow-hidden">
            <Collapsible open={expandedExercise} onOpenChange={setExpandedExercise}>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  {/* Exercise Icon */}
                  <div className="flex-shrink-0">
                    <img 
                      src={getIconPath(currentExercise.icon)} 
                      alt={currentExercise.name}
                      className="w-16 h-16 object-contain opacity-90"
                      style={{ filter: 'brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1015%) hue-rotate(359deg) brightness(92%) contrast(85%)' }}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-3xl font-display">{currentExercise.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {isMainLift(currentExerciseIndex) && (
                          <Badge variant="default" className="text-sm font-mono uppercase tracking-wider border-2 rounded-sm">Main Lift</Badge>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="border-2 rounded-sm">
                            {expandedExercise ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    {/* Technique Focus - Always visible like handwritten notes */}
                    {exerciseCue && (
                      <div className="border-l-4 border-primary pl-4 py-2 bg-accent/10 rounded-sm">
                        <p className="text-sm font-mono italic text-muted-foreground">
                          <span className="font-bold text-primary">Technique Focus:</span> {exerciseCue.split(':')[1]?.trim() || exerciseCue}
                        </p>
                      </div>
                    )}
                    
                    <CollapsibleContent className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                      {/* Exercise Description */}
                      <p className="text-base font-mono text-muted-foreground/80 leading-relaxed">
                        {currentExercise.description}
                      </p>
                      
                      {/* Video Link with gold accent */}
                      {currentExercise.videoUrl && (
                        <a 
                          href={currentExercise.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-primary/80 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <ExternalLink className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold">Watch demonstration video</span>
                        </a>
                      )}
                    </CollapsibleContent>
                  </div>
                </div>
                
                {isMainLift(currentExerciseIndex) && (
                  <Alert className="mt-4 bg-accent/50 border-2 rounded-sm">
                    <AlertDescription className="font-mono text-sm">
                      Progressive weight: Increase weight each set
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              
              <Separator className="my-0" />
              
              <CardContent className="space-y-4 pt-6">
                {currentSets.map((set, index) => {
                  const lastWeight = !editMode && lastUsedWeights && lastUsedWeights[index] !== undefined ? lastUsedWeights[index] : null;
                  
                  return (
                    <div key={index} className="space-y-2">
                      {/* Last used weight display (only in non-edit mode) */}
                      {!editMode && lastWeight !== null && lastWeight > 0 && (
                        <div className="text-sm text-muted-foreground font-mono font-semibold pl-16">
                          Last: {lastWeight.toFixed(1)} kg
                        </div>
                      )}
                      {!editMode && lastWeight === null && (
                        <div className="text-sm text-muted-foreground font-mono font-semibold pl-16">
                          Last: —
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 p-4 border-2 border-border rounded-sm shadow-vintage hover:shadow-vintage-lg transition-all duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-primary text-primary-foreground font-bold text-lg font-mono border-2 border-primary-foreground/20">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground font-mono uppercase tracking-wide">
                              Weight (kg)
                            </label>
                            <Input
                              type="number"
                              step="0.5"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(index, 'weight', e.target.value)}
                              className="text-lg h-12 font-mono border-2 rounded-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground font-mono uppercase tracking-wide">
                              Reps
                            </label>
                            <Input
                              type="number"
                              value={Number(set.reps) || ''}
                              onChange={(e) => updateSet(index, 'reps', e.target.value)}
                              className="text-lg h-12 font-mono border-2 rounded-sm"
                              placeholder={Number(currentExercise.reps).toString()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Collapsible>
          </Card>
        </div>
      )}

      {/* Cool-Down Phase */}
      {currentPhase === 'cooldown' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="border-2 rounded-sm shadow-vintage-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-display border-b-2 border-border pb-4">
                COOL-DOWN & RECOVERY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new cool-down activity */}
              <div className="space-y-3">
                <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-muted-foreground">Add Activity</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Activity name (e.g., Static stretching)"
                    value={newCoolDownName}
                    onChange={(e) => setNewCoolDownName(e.target.value)}
                    className="flex-1 border-2 rounded-sm font-mono"
                  />
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Minutes"
                    value={newCoolDownDuration}
                    onChange={(e) => setNewCoolDownDuration(e.target.value)}
                    className="w-28 border-2 rounded-sm font-mono"
                  />
                  <Button
                    onClick={addCoolDownActivity}
                    className="border-2 rounded-sm font-mono uppercase tracking-wider"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Cool-down activities list */}
              {coolDownActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono">
                  No cool-down activities added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {coolDownActivities.map((activity, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 border-2 rounded-sm shadow-vintage transition-all duration-300 ${
                        activity.completed ? 'bg-accent/30' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-bold font-display ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {activity.name}
                        </p>
                        <p className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                          <Timer className="w-3 h-3" />
                          {formatMinutes(activity.durationMinutes)} {activity.completed && '(Completed)'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => toggleCoolDownComplete(index)}
                          variant={activity.completed ? 'default' : 'outline'}
                          size="icon"
                          className="border-2 rounded-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeCoolDownActivity(index)}
                          variant="ghost"
                          size="icon"
                          className="border-2 rounded-sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSaveWorkout}
                disabled={isPending}
                className="w-full text-lg py-6 font-mono uppercase tracking-wider border-2 rounded-sm shadow-vintage hover:shadow-none transition-all"
                size="lg"
              >
                {isPending ? (
                  'Saving...'
                ) : editMode ? (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Workout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Edit Mode */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="border-2 rounded-sm shadow-vintage-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-display">Confirm Workout Changes</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-base">
              Are you sure you want to save these changes? This will update your workout history with the modified data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 rounded-sm font-mono uppercase tracking-wider">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={completeWorkout}
              disabled={isPending}
              className="border-2 rounded-sm font-mono uppercase tracking-wider"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
