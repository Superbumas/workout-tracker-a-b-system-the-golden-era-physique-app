import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, WorkoutSession, ExperienceLevel, SetSpecificWeight, Exercise } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetAvailableSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['availableSessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSessionAExercises() {
  const { actor, isFetching } = useActor();

  return useQuery<Exercise[]>({
    queryKey: ['sessionAExercises'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionAExercises();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSessionBExercises() {
  const { actor, isFetching } = useActor();

  return useQuery<Exercise[]>({
    queryKey: ['sessionBExercises'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionBExercises();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTechniqueCues() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['techniqueCues'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTechniqueCues();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDefaultSetStructure() {
  const { actor, isFetching } = useActor();

  return useQuery<{ mainLifts: Array<{ weight: number; reps: bigint }>; supplementalLifts: Array<{ weight: number; reps: bigint }> }>({
    queryKey: ['defaultSetStructure'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDefaultSetStructure();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveWorkoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveWorkoutSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
      queryClient.invalidateQueries({ queryKey: ['workoutProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['setSpecificWeights'] });
      queryClient.invalidateQueries({ queryKey: ['lastUsedWeightsForExercise'] });
      toast.success('Workout saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save workout: ${error.message}`);
    },
  });
}

export function useUpsertWorkoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.upsertWorkoutSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
      queryClient.invalidateQueries({ queryKey: ['workoutProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['setSpecificWeights'] });
      queryClient.invalidateQueries({ queryKey: ['lastUsedWeightsForExercise'] });
      toast.success('Workout updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workout: ${error.message}`);
    },
  });
}

export function useGetWorkoutHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkoutSession[]>({
    queryKey: ['workoutHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWorkoutProgress() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['workoutProgress'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWorkoutProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCurrentExperienceLevel() {
  const { actor, isFetching } = useActor();

  return useQuery<ExperienceLevel>({
    queryKey: ['currentExperienceLevel'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCurrentExperienceLevel();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSetSpecificWeights() {
  const { actor, isFetching } = useActor();

  return useQuery<SetSpecificWeight[]>({
    queryKey: ['setSpecificWeights'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSetSpecificWeights();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLastUsedWeightsForExercise(exerciseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number[]>({
    queryKey: ['lastUsedWeightsForExercise', exerciseName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLastUsedWeightsForExercise(exerciseName);
    },
    enabled: !!actor && !isFetching && !!exerciseName,
  });
}

export function useGetLastUsedWeightForSet(exerciseName: string, setIndex: number) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['lastUsedWeightForSet', exerciseName, setIndex],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLastUsedWeightForSet(exerciseName, BigInt(setIndex));
    },
    enabled: !!actor && !isFetching && !!exerciseName && setIndex >= 0,
  });
}
