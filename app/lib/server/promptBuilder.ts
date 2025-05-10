import { db } from "../../../drizzle/db";
import { goals, habits, self_analysis, records } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export function buildPromptContent(
  recentRecords: { date: string; mood: string[]; diary: string }[],
  shortTermGoals?: string[],
  midTermGoals?: string[],
  longTermGoals?: string[],
  lifeGoals?: string[],
  coreValues?: string[],
  idealHabits?: string[],
  badHabits?: string[],
  newHabits?: string[],
  trackingHabits?: string[],
  userStrengths?: string[],
  userWeaknesses?: string[]
): string {
  let promptContent = recentRecords
    .map(
      (rec, i) =>
        `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
          Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
        }\n日記: ${rec.diary}`
    )
    .join("\n\n");
  if (shortTermGoals && shortTermGoals.length > 0) {
    promptContent += `\n\n【短期目標（〜1ヶ月）】\n${shortTermGoals.join(
      "・"
    )}`;
  }
  if (midTermGoals && midTermGoals.length > 0) {
    promptContent += `\n\n【中期目標（〜半年）】\n${midTermGoals.join("・")}`;
  }
  if (longTermGoals && longTermGoals.length > 0) {
    promptContent += `\n\n【長期目標（〜数年）】\n${longTermGoals.join("・")}`;
  }
  if (lifeGoals && lifeGoals.length > 0) {
    promptContent += `\n\n【人生目標】\n${lifeGoals.join("・")}`;
  }
  if (coreValues && coreValues.length > 0) {
    promptContent += `\n\n【価値観】\n${coreValues.join("・")}`;
  }
  if (idealHabits && idealHabits.length > 0) {
    promptContent += `\n\n【理想の習慣】\n${idealHabits.join("・")}`;
  }
  if (badHabits && badHabits.length > 0) {
    promptContent += `\n\n【改善したい習慣】\n${badHabits.join("・")}`;
  }
  if (newHabits && newHabits.length > 0) {
    promptContent += `\n\n【始めたい習慣】\n${newHabits.join("・")}`;
  }
  if (trackingHabits && trackingHabits.length > 0) {
    promptContent += `\n\n【継続している習慣】\n${trackingHabits.join("・")}`;
  }
  if (userStrengths && userStrengths.length > 0) {
    promptContent += `\n\n【自己分析: 強み】\n${userStrengths.join("・")}`;
  }
  if (userWeaknesses && userWeaknesses.length > 0) {
    promptContent += `\n\n【自己分析: 課題】\n${userWeaknesses.join("・")}`;
  }
  return promptContent;
}

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

export async function fetchUserPromptData(userId: number) {
  let shortTermGoals: string[] = [];
  let midTermGoals: string[] = [];
  let longTermGoals: string[] = [];
  let lifeGoals: string[] = [];
  let coreValues: string[] = [];
  let idealHabits: string[] = [];
  let badHabits: string[] = [];
  let newHabits: string[] = [];
  let trackingHabits: string[] = [];
  let userStrengths: string[] = [];
  let userWeaknesses: string[] = [];
  let recentRecords: { date: string; mood: string[]; diary: string }[] = [];
  try {
    // goals
    const goalRows = await db
      .select()
      .from(goals)
      .where(eq(goals.user_id, userId))
      .limit(1);
    const goalRow = goalRows[0];
    if (goalRow) {
      shortTermGoals = Array.isArray(goalRow.short_term_goals)
        ? goalRow.short_term_goals
        : [];
      midTermGoals = Array.isArray(goalRow.mid_term_goals)
        ? goalRow.mid_term_goals
        : [];
      longTermGoals = Array.isArray(goalRow.long_term_goals)
        ? goalRow.long_term_goals
        : [];
      lifeGoals = Array.isArray(goalRow.life_goals) ? goalRow.life_goals : [];
      coreValues = Array.isArray(goalRow.core_values)
        ? goalRow.core_values
        : [];
    }
    // habits
    let habitRow = null;
    try {
      const habitRows = await db
        .select()
        .from(habits)
        .where(eq(habits.user_id, userId))
        .limit(1);
      habitRow = habitRows[0];
    } catch {}
    if (habitRow) {
      idealHabits = Array.isArray(habitRow.ideal_habits)
        ? habitRow.ideal_habits
        : [];
      badHabits = Array.isArray(habitRow.bad_habits) ? habitRow.bad_habits : [];
      newHabits = Array.isArray(habitRow.new_habits) ? habitRow.new_habits : [];
      trackingHabits = Array.isArray(habitRow.tracking_habits)
        ? habitRow.tracking_habits
        : [];
    }
    // self_analysis
    let selfAnalysisRow = null;
    try {
      const selfAnalysisRows = await db
        .select()
        .from(self_analysis)
        .where(eq(self_analysis.user_id, userId))
        .limit(1);
      selfAnalysisRow = selfAnalysisRows[0];
    } catch {}
    if (selfAnalysisRow) {
      userStrengths = Array.isArray(selfAnalysisRow.strengths)
        ? selfAnalysisRow.strengths
        : [];
      userWeaknesses = Array.isArray(selfAnalysisRow.weaknesses)
        ? selfAnalysisRow.weaknesses
        : [];
    }
    // records
    const recordRows = await db
      .select()
      .from(records)
      .where(eq(records.user_id, userId));
    const sorted = recordRows
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((rec) => ({
        date: rec.date,
        mood: Array.isArray(rec.mood) ? rec.mood : rec.mood ? [rec.mood] : [],
        diary: rec.diary,
      }));
    recentRecords = sorted;
  } catch (e) {
    // ログだけ出す
    console.error("[fetchUserPromptData] データ取得エラー", e);
  }
  return {
    shortTermGoals,
    midTermGoals,
    longTermGoals,
    lifeGoals,
    coreValues,
    idealHabits,
    badHabits,
    newHabits,
    trackingHabits,
    userStrengths,
    userWeaknesses,
    recentRecords,
  };
}
