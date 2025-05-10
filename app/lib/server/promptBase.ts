import { db } from "../../../drizzle/db";
import { goals, habits, self_analysis, records } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export function getSystemPrompt(): string {
  return (
    "あなたは『アイシールド21』の蛭間陽一のような口調で、ユーザーを悪魔的コーチングで励ます役です。\n\n" +
    "以下はユーザーの直近3件の気分と日記、そして現在の目標と習慣です。日記の内容を中心に励ましつつ、目標や習慣の達成に向けたアドバイスや進捗確認も一言添えてください。特に習慣については、継続できているか、改善点や続けるコツなどもレビュー・アドバイスしてください。蛭間陽一は「クソ(名詞)」と「〜しやがれ」と「テメー」と「〜っきゃねえ」と「〜ぜ」という口調が特徴です。制限文字は300文字です。\n\n"
  );
}

export const OPENAI_DEFAULT_PARAMS = {
  model: "gpt-4-turbo",
  max_tokens: 300,
  temperature: 0.9,
};

// 目標データ取得
export async function fetchUserGoalsData(
  userId: number,
  options: {
    shortTerm?: boolean;
    midTerm?: boolean;
    longTerm?: boolean;
    life?: boolean;
    coreValues?: boolean;
  } = {}
) {
  let shortTermGoals: string[] = [];
  let midTermGoals: string[] = [];
  let longTermGoals: string[] = [];
  let lifeGoals: string[] = [];
  let coreValues: string[] = [];
  try {
    const goalRows = await db
      .select()
      .from(goals)
      .where(eq(goals.user_id, userId))
      .limit(1);
    const goalRow = goalRows[0];
    if (goalRow) {
      if (options.shortTerm) {
        shortTermGoals = Array.isArray(goalRow.short_term_goals)
          ? goalRow.short_term_goals
          : [];
      }
      if (options.midTerm) {
        midTermGoals = Array.isArray(goalRow.mid_term_goals)
          ? goalRow.mid_term_goals
          : [];
      }
      if (options.longTerm) {
        longTermGoals = Array.isArray(goalRow.long_term_goals)
          ? goalRow.long_term_goals
          : [];
      }
      if (options.life) {
        lifeGoals = Array.isArray(goalRow.life_goals) ? goalRow.life_goals : [];
      }
      if (options.coreValues) {
        coreValues = Array.isArray(goalRow.core_values)
          ? goalRow.core_values
          : [];
      }
    }
  } catch (e) {
    console.error("[fetchUserGoalsData] データ取得エラー", e);
  }
  return {
    shortTermGoals,
    midTermGoals,
    longTermGoals,
    lifeGoals,
    coreValues,
  };
}

// 習慣データ取得
export async function fetchUserHabitsData(
  userId: number,
  options: {
    ideal?: boolean;
    bad?: boolean;
    new?: boolean;
    tracking?: boolean;
  } = {}
) {
  let idealHabits: string[] = [];
  let badHabits: string[] = [];
  let newHabits: string[] = [];
  let trackingHabits: string[] = [];
  try {
    const habitRows = await db
      .select()
      .from(habits)
      .where(eq(habits.user_id, userId))
      .limit(1);
    const habitRow = habitRows[0];
    if (habitRow) {
      if (options.ideal) {
        idealHabits = Array.isArray(habitRow.ideal_habits)
          ? habitRow.ideal_habits
          : [];
      }
      if (options.bad) {
        badHabits = Array.isArray(habitRow.bad_habits)
          ? habitRow.bad_habits
          : [];
      }
      if (options.new) {
        newHabits = Array.isArray(habitRow.new_habits)
          ? habitRow.new_habits
          : [];
      }
      if (options.tracking) {
        trackingHabits = Array.isArray(habitRow.tracking_habits)
          ? habitRow.tracking_habits
          : [];
      }
    }
  } catch (e) {
    console.error("[fetchUserHabitsData] データ取得エラー", e);
  }
  return {
    idealHabits,
    badHabits,
    newHabits,
    trackingHabits,
  };
}

// 自己分析データ取得
export async function fetchUserSelfAnalysisData(
  userId: number,
  options: {
    strengths?: boolean;
    weaknesses?: boolean;
  } = {}
) {
  let userStrengths: string[] = [];
  let userWeaknesses: string[] = [];
  try {
    const selfAnalysisRows = await db
      .select()
      .from(self_analysis)
      .where(eq(self_analysis.user_id, userId))
      .limit(1);
    const selfAnalysisRow = selfAnalysisRows[0];
    if (selfAnalysisRow) {
      if (options.strengths) {
        userStrengths = Array.isArray(selfAnalysisRow.strengths)
          ? selfAnalysisRow.strengths
          : [];
      }
      if (options.weaknesses) {
        userWeaknesses = Array.isArray(selfAnalysisRow.weaknesses)
          ? selfAnalysisRow.weaknesses
          : [];
      }
    }
  } catch (e) {
    console.error("[fetchUserSelfAnalysisData] データ取得エラー", e);
  }
  return {
    userStrengths,
    userWeaknesses,
  };
}

// 直近日記データ取得
export async function fetchUserRecentRecords(
  userId: number,
  limit: number = 3
) {
  let recentRecords: { date: string; mood: string[]; diary: string }[] = [];
  try {
    const recordRows = await db
      .select()
      .from(records)
      .where(eq(records.user_id, userId));
    const sorted = recordRows
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
      .map((rec) => ({
        date: rec.date,
        mood: Array.isArray(rec.mood) ? rec.mood : rec.mood ? [rec.mood] : [],
        diary: rec.diary,
      }));
    recentRecords = sorted;
  } catch (e) {
    console.error("[fetchUserRecentRecords] データ取得エラー", e);
  }
  return recentRecords;
}

// まとめて取得するラッパー
export async function fetchPromptDataWrapper(
  userId: number,
  options: {
    goals?: {
      shortTerm?: boolean;
      midTerm?: boolean;
      longTerm?: boolean;
      life?: boolean;
      coreValues?: boolean;
    };
    habits?: {
      ideal?: boolean;
      bad?: boolean;
      new?: boolean;
      tracking?: boolean;
    };
    selfAnalysis?: {
      strengths?: boolean;
      weaknesses?: boolean;
    };
    recordsLimit?: number;
  } = {}
) {
  const [goals, habits, selfAnalysis, recentRecords] = await Promise.all([
    fetchUserGoalsData(userId, options.goals || {}),
    fetchUserHabitsData(userId, options.habits || {}),
    fetchUserSelfAnalysisData(userId, options.selfAnalysis || {}),
    fetchUserRecentRecords(userId, options.recordsLimit || 3),
  ]);
  return {
    ...goals,
    ...habits,
    ...selfAnalysis,
    recentRecords,
  };
}
