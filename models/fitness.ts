export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'none';
export type SetType = 'warmup' | 'working' | 'dropset';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  instructions?: string;
}

export interface WorkoutSet {
  id: string;
  type: SetType;
  reps?: number;
  weightKg?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  day: string;
  exercises: WorkoutExercise[];
  updatedAt: string;
}

export interface ActiveWorkout {
  id: string;
  templateId?: string;
  name: string;
  startedAt: string;
  elapsedSeconds?: number;
  pausedAt?: string;
  exercises: WorkoutExercise[];
}

export interface CompletedWorkout {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
}

export interface BodyWeightEntry {
  id: string;
  weightKg: number;
  recordedAt: string;
}

export interface UserProfile {
  name: string;
  bodyWeightKg: number;
  heightCm: number;
  calorieTarget: number;
  proteinTargetGrams: number;
  unitSystem: 'metric' | 'imperial';
}
