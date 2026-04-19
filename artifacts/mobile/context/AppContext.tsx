import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AgeGroup = "Teen" | "Young Adult" | "Elder" | "";
export type PrayFrequency = "Not much" | "Often enough" | "It's been a while" | "Daily" | "";
export type GratitudeTime = "Today" | "This week" | "A while back" | "Over a month ago" | "";
export type BeliefLevel = "Yes" | "Maybe" | "Sometimes" | "";

export interface Reflection {
  id: string;
  text: string;
  date: string;
  categories: string[];
}

interface AppState {
  hasOnboarded: boolean;
  name: string;
  age: AgeGroup;
  prayFrequency: PrayFrequency;
  gratitudeTime: GratitudeTime;
  beliefLevel: BeliefLevel;
  streak: number;
  lastPrayedDate: string;
  reflections: Reflection[];
  totalPrayers: number;
}

interface AppContextValue extends AppState {
  setName: (name: string) => void;
  setAge: (age: AgeGroup) => void;
  setPrayFrequency: (f: PrayFrequency) => void;
  setGratitudeTime: (g: GratitudeTime) => void;
  setBeliefLevel: (b: BeliefLevel) => void;
  completeOnboarding: () => void;
  recordPrayer: () => void;
  addReflection: (text: string, categories: string[]) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "god_first_state";

const defaultState: AppState = {
  hasOnboarded: false,
  name: "",
  age: "",
  prayFrequency: "",
  gratitudeTime: "",
  beliefLevel: "",
  streak: 0,
  lastPrayedDate: "",
  reflections: [],
  totalPrayers: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState({ ...defaultState, ...JSON.parse(raw) });
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const save = useCallback((next: AppState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setName = (name: string) => save({ ...state, name });
  const setAge = (age: AgeGroup) => save({ ...state, age });
  const setPrayFrequency = (prayFrequency: PrayFrequency) =>
    save({ ...state, prayFrequency });
  const setGratitudeTime = (gratitudeTime: GratitudeTime) =>
    save({ ...state, gratitudeTime });
  const setBeliefLevel = (beliefLevel: BeliefLevel) =>
    save({ ...state, beliefLevel });

  const completeOnboarding = () => save({ ...state, hasOnboarded: true });

  const recordPrayer = useCallback(() => {
    const today = new Date().toDateString();
    const lastDate = state.lastPrayedDate;
    let newStreak = state.streak;

    if (lastDate === today) {
      // already prayed today, just count the prayer
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        newStreak = state.streak + 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }
    }

    save({
      ...state,
      streak: newStreak,
      lastPrayedDate: today,
      totalPrayers: state.totalPrayers + 1,
    });
  }, [state, save]);

  const addReflection = useCallback(
    (text: string, categories: string[]) => {
      const reflection: Reflection = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text,
        date: new Date().toISOString(),
        categories,
      };
      save({ ...state, reflections: [reflection, ...state.reflections] });
    },
    [state, save]
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        setName,
        setAge,
        setPrayFrequency,
        setGratitudeTime,
        setBeliefLevel,
        completeOnboarding,
        recordPrayer,
        addReflection,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
