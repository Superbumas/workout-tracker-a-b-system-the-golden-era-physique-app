import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    icon: string;
    name: string;
    reps: bigint;
    sets: bigint;
    description: string;
    exerciseType: ExerciseType;
    videoUrl?: string;
}
export interface CoolDownActivity {
    name: string;
    completed: boolean;
    durationMinutes: number;
}
export interface SetSpecificWeight {
    weight: number;
    exerciseName: string;
    setIndex: bigint;
}
export type Time = bigint;
export interface WarmUpActivity {
    name: string;
    completed: boolean;
    durationMinutes: number;
}
export interface WorkoutSession {
    sessionType: string;
    date: Time;
    exercises: Array<ExerciseLog>;
    coolDownActivities: Array<CoolDownActivity>;
    warmUpActivities: Array<WarmUpActivity>;
}
export interface SetLog {
    weight: number;
    reps: bigint;
}
export interface ExerciseLog {
    name: string;
    sets: Array<SetLog>;
}
export interface UserProfile {
    experienceLevel: ExperienceLevel;
    unlockedSessions: Array<string>;
    startDate: Time;
}
export enum ExerciseType {
    bodyweight = "bodyweight",
    barbell = "barbell",
    dumbbell = "dumbbell"
}
export enum ExperienceLevel {
    intermediate = "intermediate",
    beginner = "beginner"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteWorkoutSession(date: Time, sessionType: string): Promise<void>;
    getAvailableSessions(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoolDownActivities(): Promise<Array<CoolDownActivity>>;
    getCurrentExperienceLevel(): Promise<ExperienceLevel>;
    getDefaultSetStructure(): Promise<{
        mainLifts: Array<SetLog>;
        supplementalLifts: Array<SetLog>;
    }>;
    getLastUsedWeightForSet(exerciseName: string, setIndex: bigint): Promise<number | null>;
    getLastUsedWeightsForExercise(exerciseName: string): Promise<Array<number>>;
    getSessionAExercises(): Promise<Array<Exercise>>;
    getSessionBExercises(): Promise<Array<Exercise>>;
    getSetSpecificWeights(): Promise<Array<SetSpecificWeight>>;
    getTechniqueCues(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWarmUpActivities(): Promise<Array<WarmUpActivity>>;
    getWorkoutHistory(): Promise<Array<WorkoutSession>>;
    getWorkoutProgress(): Promise<bigint>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveWorkoutSession(session: WorkoutSession): Promise<void>;
    /**
     * / Update or add an entire workout session for the current caller.
     */
    upsertWorkoutSession(session: WorkoutSession): Promise<void>;
}
