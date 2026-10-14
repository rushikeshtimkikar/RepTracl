import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  profile: '@reptrack/profile',
  workoutTemplates: '@reptrack/workout-templates',
  activeWorkout: '@reptrack/active-workout',
  completedWorkouts: '@reptrack/completed-workouts',
  bodyWeight: '@reptrack/body-weight',
} as const;

export async function loadStored<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStored<T>(key: string, value: T): Promise<void> {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}
