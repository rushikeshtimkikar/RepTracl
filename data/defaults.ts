import { Exercise, UserProfile, WorkoutTemplate } from '@/models/fitness';

export const defaultProfile: UserProfile = {
  name: 'Alex',
  bodyWeightKg: 86,
  heightCm: 178,
  calorieTarget: 2350,
  proteinTargetGrams: 160,
  unitSystem: 'metric',
};

export const exercises: Exercise[] = [
  { id: 'bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable' },
  { id: 'squat', name: 'Back Squat', muscleGroup: 'legs', equipment: 'barbell' },
  { id: 'shoulder-press', name: 'Seated Shoulder Press', muscleGroup: 'shoulders', equipment: 'dumbbell' },
];

export const weeklySchedule: WorkoutTemplate[] = [
  { id: 'monday', name: 'Chest + Triceps', day: 'Monday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'tuesday', name: 'Back + Biceps', day: 'Tuesday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'wednesday', name: 'Legs', day: 'Wednesday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'thursday', name: 'Shoulders + Abs', day: 'Thursday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'friday', name: 'Rest', day: 'Friday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'saturday', name: 'Intense Cardio', day: 'Saturday', exercises: [], updatedAt: '2026-01-01' },
  { id: 'sunday', name: 'Chest + Back', day: 'Sunday', exercises: [], updatedAt: '2026-01-01' },
];
