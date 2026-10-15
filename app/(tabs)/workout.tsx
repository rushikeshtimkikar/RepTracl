import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card, PrimaryButton, Screen, SectionTitle } from '@/components/Ui';
import { colors, radii, spacing } from '@/constants/Colors';
import { exercises, weeklySchedule } from '@/data/defaults';
import {
  ActiveWorkout,
  CompletedWorkout,
  Exercise,
  SetType,
  WorkoutExercise,
  WorkoutSet,
} from '@/models/fitness';
import { loadStored, saveStored, storageKeys } from '@/services/storage';
import { usePreferences } from '@/contexts/PreferencesContext';

const defaultRestSeconds = 90;
const legExerciseIds = ['squat'];

function createSet(type: SetType = 'working'): WorkoutSet {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    reps: type === 'warmup' ? 10 : 8,
    weightKg: type === 'warmup' ? 20 : 60,
    completed: false,
  };
}

function createWorkoutExercise(exerciseId: string): WorkoutExercise {
  return { exerciseId, sets: [createSet(), createSet(), createSet()] };
}

function createLegsWorkout(): ActiveWorkout {
  return {
    id: `${Date.now()}`,
    templateId: 'wednesday',
    name: 'Legs',
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0,
    exercises: legExerciseIds.map(createWorkoutExercise),
  };
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDuration(totalSeconds: number): number {
  return Math.max(1, Math.round(totalSeconds / 60));
}

export default function WorkoutScreen() {
  const { theme } = usePreferences();
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    async function restoreWorkout() {
      try {
        const [storedActive, storedCompleted] = await Promise.all([
          loadStored<ActiveWorkout | null>(storageKeys.activeWorkout, null),
          loadStored<CompletedWorkout[]>(storageKeys.completedWorkouts, []),
        ]);
        setActiveWorkout(storedActive);
        setElapsedSeconds(storedActive?.elapsedSeconds ?? 0);
        setCompletedWorkouts(storedCompleted);
      } catch {
        Alert.alert('Could not load workouts', 'Your saved workout data could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    void restoreWorkout();
  }, []);

  useEffect(() => {
    if (!activeWorkout || isPaused) return undefined;

    const timer = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [activeWorkout, isPaused]);

  useEffect(() => {
    if (restSeconds <= 0) return undefined;

    const timer = setInterval(() => setRestSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [restSeconds]);

  useEffect(() => {
    if (!activeWorkout || isLoading) return;

    const timeout = setTimeout(() => {
      void saveActiveWorkout({ ...activeWorkout, elapsedSeconds }).catch(() => {
        Alert.alert('Could not save workout', 'Your latest workout change was not saved.');
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [activeWorkout, elapsedSeconds, isLoading]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((exercise) =>
      `${exercise.name} ${exercise.muscleGroup} ${exercise.equipment}`.toLowerCase().includes(query),
    );
  }, [search]);

  async function saveActiveWorkout(workout: ActiveWorkout | null) {
    if (workout) {
      await saveStored(storageKeys.activeWorkout, workout);
    } else {
      await saveStored(storageKeys.activeWorkout, null);
    }
  }

  function startWorkout() {
    const workout = createLegsWorkout();
    setActiveWorkout(workout);
    setElapsedSeconds(0);
    setIsPaused(false);
  }

  function updateWorkout(update: (workout: ActiveWorkout) => ActiveWorkout) {
    setActiveWorkout((current) => (current ? update(current) : current));
  }

  function toggleSet(exerciseId: string, setId: string) {
    const currentSet = activeWorkout?.exercises
      .find((exercise) => exercise.exerciseId === exerciseId)
      ?.sets.find((set) => set.id === setId);
    const completingSet = currentSet ? !currentSet.completed : false;

    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, completed: !set.completed }
                  : set,
              ),
            }
          : exercise,
      ),
    }));
    if (completingSet) setRestSeconds(defaultRestSeconds);
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weightKg',
    value: string,
  ) {
    const numericValue = Number(value.replace(',', '.'));
    if (value !== '' && (!Number.isFinite(numericValue) || numericValue < 0)) return;

    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, [field]: value === '' ? undefined : numericValue }
                  : set,
              ),
            }
          : exercise,
      ),
    }));
  }

  function addSet(exerciseId: string) {
    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSet()] }
          : exercise,
      ),
    }));
  }

  function addExercise(exercise: Exercise) {
    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.some((item) => item.exerciseId === exercise.id)
        ? workout.exercises
        : [...workout.exercises, createWorkoutExercise(exercise.id)],
    }));
    setShowExercisePicker(false);
    setSearch('');
  }

  function removeExercise(exerciseId: string) {
    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.filter((exercise) => exercise.exerciseId !== exerciseId),
    }));
  }

  function finishWorkout() {
    if (!activeWorkout || isFinishing) return;
    const completedSetCount = activeWorkout.exercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
      0,
    );
    if (completedSetCount === 0) {
      Alert.alert('Complete a set first', 'Mark at least one set as done before finishing this workout.');
      return;
    }

    setIsFinishing(true);
    const completed: CompletedWorkout = {
      id: activeWorkout.id,
      name: activeWorkout.name,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date().toISOString(),
      durationMinutes: formatDuration(elapsedSeconds),
      exercises: activeWorkout.exercises,
    };
    const nextHistory = [completed, ...completedWorkouts];
    void Promise.all([
      saveStored(storageKeys.completedWorkouts, nextHistory),
      saveActiveWorkout(null),
    ]).then(() => {
      setCompletedWorkouts(nextHistory);
      setActiveWorkout(null);
      setElapsedSeconds(0);
      setRestSeconds(0);
      Alert.alert('Workout complete', `${completed.name} saved to your workout history.`);
    }).catch(() => {
      Alert.alert('Could not finish workout', 'The completed session was not saved. Please try again.');
    }).finally(() => {
      setIsFinishing(false);
    });
  }

  function cancelWorkout() {
    Alert.alert('Cancel workout?', 'This active session will be discarded and will not count toward your history.', [
      { text: 'Keep training', style: 'cancel' },
      {
        text: 'Cancel workout',
        style: 'destructive',
        onPress: () => {
          void saveActiveWorkout(null).then(() => {
            setActiveWorkout(null);
            setElapsedSeconds(0);
            setRestSeconds(0);
          }).catch(() => Alert.alert('Could not cancel workout', 'The active session is still saved.'));
        },
      },
    ]);
  }

  if (isLoading) {
    return <Screen><View style={styles.center}><Text style={[styles.subtitle, { color: theme.textMuted }]}>Loading your workout...</Text></View></Screen>;
  }

  if (!activeWorkout) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>TRAINING</Text>
          <Text style={[styles.title, { color: theme.text }]}>Your workouts</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Build momentum, one session at a time.</Text>
          <Card style={[styles.startCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardKicker, { color: theme.accent }]}>UP NEXT</Text>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Legs</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Back Squat · 3 working sets</Text>
            <PrimaryButton label="Start session" onPress={startWorkout} />
          </Card>
          <SectionTitle title="Recent sessions" action={`${completedWorkouts.length} saved`} />
          {completedWorkouts.length === 0 ? (
            <Card><Text style={[styles.libraryHint, { color: theme.textMuted }]}>Finished workouts will appear here. Cancelled sessions are never counted.</Text></Card>
          ) : (
            completedWorkouts.slice(0, 5).map((workout) => (
              <Card key={workout.id} style={styles.historyRow}>
                <View><Text style={[styles.templateName, { color: theme.text }]}>{workout.name}</Text><Text style={[styles.historyMeta, { color: theme.textMuted }]}>{new Date(workout.completedAt).toLocaleDateString()} · {workout.durationMinutes} min</Text></View>
                <Text style={[styles.historyCount, { color: theme.accent }]}>{workout.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0)} sets</Text>
              </Card>
            ))
          )}
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sessionHeader}>
          <View><Text style={[styles.eyebrow, { color: theme.accent }]}>ACTIVE SESSION</Text><Text style={[styles.title, { color: theme.text }]}>{activeWorkout.name}</Text></View>
          <Pressable onPress={cancelWorkout}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>
        <Card style={styles.timerCard}>
          <View><Text style={[styles.cardKicker, { color: theme.accent }]}>{isPaused ? 'PAUSED' : 'SESSION TIME'}</Text><Text style={[styles.timer, { color: theme.text }]}>{formatTime(elapsedSeconds)}</Text></View>
          <Pressable style={[styles.pauseButton, { borderColor: theme.background }]} onPress={() => setIsPaused((paused) => !paused)}><Text style={[styles.pauseText, { color: theme.text }]}>{isPaused ? 'Resume' : 'Pause'}</Text></Pressable>
        </Card>
        {restSeconds > 0 ? (
          <Card style={[styles.restCard, { backgroundColor: theme.surface }]}>
            <View><Text style={[styles.cardKicker, { color: theme.accent }]}>REST TIMER</Text><Text style={[styles.restTimer, { color: theme.accent }]}>{formatTime(restSeconds)}</Text></View>
            <Pressable onPress={() => setRestSeconds(0)}><Text style={[styles.skipText, { color: theme.accent }]}>Skip</Text></Pressable>
          </Card>
        ) : null}
        <SectionTitle title="Exercises" action={`${activeWorkout.exercises.length} total`} />
        {activeWorkout.exercises.map((workoutExercise) => {
          const exercise = exercises.find((item) => item.id === workoutExercise.exerciseId);
          if (!exercise) return null;
          const completedSets = workoutExercise.sets.filter((set) => set.completed).length;
          return (
            <Card key={workoutExercise.exerciseId} style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>
              <View style={styles.exerciseHeader}>
                <View><Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text><Text style={[styles.exerciseMeta, { color: theme.textMuted }]}>{exercise.muscleGroup} · {completedSets}/{workoutExercise.sets.length} complete</Text></View>
                <Pressable onPress={() => removeExercise(exercise.id)}><Text style={styles.removeText}>Remove</Text></Pressable>
              </View>
              <View style={styles.tableHeader}><Text style={styles.setColumn}>SET</Text><Text style={styles.inputColumn}>KG</Text><Text style={styles.inputColumn}>REPS</Text><Text style={styles.doneColumn}>DONE</Text></View>
              {workoutExercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setNumber, { color: theme.textMuted }]}>{index + 1}</Text>
                  <TextInput keyboardType="decimal-pad" selectTextOnFocus value={set.weightKg?.toString() ?? ''} onChangeText={(value) => updateSet(exercise.id, set.id, 'weightKg', value)} style={[styles.input, { backgroundColor: theme.background, borderColor: theme.background, color: theme.text }]} placeholder="0" placeholderTextColor={theme.textMuted} />
                  <TextInput keyboardType="number-pad" selectTextOnFocus value={set.reps?.toString() ?? ''} onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)} style={[styles.input, { backgroundColor: theme.background, borderColor: theme.background, color: theme.text }]} placeholder="0" placeholderTextColor={theme.textMuted} />
                  <Pressable onPress={() => toggleSet(exercise.id, set.id)} style={[styles.checkButton, { borderColor: theme.background }, set.completed && { backgroundColor: theme.accent, borderColor: theme.accent }]}><Text style={[styles.checkMark, { color: theme.textMuted }, set.completed && { color: theme.background }]}>✓</Text></Pressable>
                </View>
              ))}
              <Pressable onPress={() => addSet(exercise.id)} style={styles.addSetButton}><Text style={styles.addSetText}>+ Add set</Text></Pressable>
            </Card>
          );
        })}
        <Pressable onPress={() => setShowExercisePicker(true)} style={styles.addExerciseButton}><Text style={styles.addExerciseText}>+ Add exercise</Text></Pressable>
        <PrimaryButton
          disabled={isFinishing}
          label={isFinishing ? 'Saving workout...' : 'Finish workout'}
          onPress={finishWorkout}
        />
      </ScrollView>
      <Modal visible={showExercisePicker} animationType="slide" onRequestClose={() => setShowExercisePicker(false)}>
        <Screen>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add exercise</Text><Pressable onPress={() => setShowExercisePicker(false)}><Text style={styles.cancelText}>Close</Text></Pressable></View>
            <TextInput autoFocus value={search} onChangeText={setSearch} placeholder="Search exercise, muscle, or equipment" placeholderTextColor={colors.textFaint} style={styles.searchInput} />
            <ScrollView keyboardShouldPersistTaps="handled">
              {filteredExercises.map((exercise) => {
                const alreadyAdded = activeWorkout.exercises.some((item) => item.exerciseId === exercise.id);
                return (
                  <Pressable key={exercise.id} disabled={alreadyAdded} onPress={() => addExercise(exercise)} style={[styles.exerciseOption, alreadyAdded && styles.disabledOption]}>
                    <View><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.muscleGroup} · {exercise.equipment}</Text></View>
                    <Text style={alreadyAdded ? styles.addedText : styles.addText}>{alreadyAdded ? 'Added' : 'Add'}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 40 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  startCard: { backgroundColor: colors.surfaceRaised, marginVertical: spacing.lg, padding: spacing.lg },
  cardKicker: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  historyRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  templateName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  historyMeta: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
  historyCount: { color: colors.lime, fontSize: 12, fontWeight: '700' },
  libraryHint: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  sessionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  cancelText: { color: colors.danger, fontSize: 13, fontWeight: '700', padding: spacing.sm },
  timerCard: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  timer: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 5 },
  pauseButton: { borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  pauseText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  restCard: { alignItems: 'center', backgroundColor: '#26351C', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  restTimer: { color: colors.lime, fontSize: 24, fontWeight: '800', marginTop: 4 },
  skipText: { color: colors.lime, fontSize: 13, fontWeight: '700' },
  exerciseCard: { marginBottom: spacing.md },
  exerciseHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  exerciseName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  exerciseMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  removeText: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  tableHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.xs },
  setColumn: { color: colors.textFaint, flex: 1, fontSize: 10, fontWeight: '800' },
  inputColumn: { color: colors.textFaint, fontSize: 10, fontWeight: '800', textAlign: 'center', width: 66 },
  doneColumn: { color: colors.textFaint, fontSize: 10, fontWeight: '800', textAlign: 'center', width: 46 },
  setRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm },
  setNumber: { color: colors.textMuted, flex: 1, fontSize: 13, fontWeight: '700' },
  warmupText: { color: colors.limeMuted },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, color: colors.text, fontSize: 14, height: 40, marginHorizontal: 3, paddingHorizontal: 8, textAlign: 'center', width: 60 },
  checkButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, height: 40, justifyContent: 'center', marginLeft: 5, width: 40 },
  checkedButton: { backgroundColor: colors.lime, borderColor: colors.lime },
  checkMark: { color: colors.textFaint, fontSize: 18, fontWeight: '800' },
  checkedMark: { color: colors.background },
  addSetButton: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.xs, paddingTop: spacing.sm },
  addSetText: { color: colors.lime, fontSize: 12, fontWeight: '700' },
  addExerciseButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.sm, borderStyle: 'dashed', borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  addExerciseText: { color: colors.lime, fontSize: 14, fontWeight: '700' },
  modalContent: { flex: 1, padding: spacing.md, paddingTop: spacing.xl },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  modalTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  searchInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, color: colors.text, fontSize: 14, marginBottom: spacing.md, padding: spacing.md },
  exerciseOption: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  disabledOption: { opacity: 0.45 },
  addText: { color: colors.lime, fontSize: 13, fontWeight: '700' },
  addedText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
});
