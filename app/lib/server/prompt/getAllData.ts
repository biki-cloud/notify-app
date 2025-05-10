import { fetchPromptDataWrapper } from "../promptBase";

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

export async function getAllDataPrompt(userId: number) {
  return await fetchPromptDataWrapper(userId, {
    goals: {
      shortTerm: true,
      midTerm: true,
      longTerm: true,
      life: true,
      coreValues: true,
    },
    habits: {
      ideal: true,
      bad: true,
      new: true,
      tracking: true,
    },
    selfAnalysis: {
      strengths: true,
      weaknesses: true,
    },
    recordsLimit: 3,
  });
}
