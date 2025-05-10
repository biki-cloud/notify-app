import { fetchPromptDataWrapper } from "../promptBase";

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

export async function buildAllDataPromptContent(
  userId: number
): Promise<string> {
  const userData = await getAllDataPrompt(userId);
  let promptContent = userData.recentRecords
    .map(
      (rec: { date: string; mood: string[]; diary: string }, i: number) =>
        `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
          Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
        }\n日記: ${rec.diary}`
    )
    .join("\n\n");
  if (userData.shortTermGoals && userData.shortTermGoals.length > 0) {
    promptContent += `\n\n【短期目標（〜1ヶ月）】\n${userData.shortTermGoals.join(
      "・"
    )}`;
  }
  if (userData.midTermGoals && userData.midTermGoals.length > 0) {
    promptContent += `\n\n【中期目標（〜半年）】\n${userData.midTermGoals.join(
      "・"
    )}`;
  }
  if (userData.longTermGoals && userData.longTermGoals.length > 0) {
    promptContent += `\n\n【長期目標（〜数年）】\n${userData.longTermGoals.join(
      "・"
    )}`;
  }
  if (userData.lifeGoals && userData.lifeGoals.length > 0) {
    promptContent += `\n\n【人生目標】\n${userData.lifeGoals.join("・")}`;
  }
  if (userData.coreValues && userData.coreValues.length > 0) {
    promptContent += `\n\n【価値観】\n${userData.coreValues.join("・")}`;
  }
  if (userData.idealHabits && userData.idealHabits.length > 0) {
    promptContent += `\n\n【理想の習慣】\n${userData.idealHabits.join("・")}`;
  }
  if (userData.badHabits && userData.badHabits.length > 0) {
    promptContent += `\n\n【改善したい習慣】\n${userData.badHabits.join("・")}`;
  }
  if (userData.newHabits && userData.newHabits.length > 0) {
    promptContent += `\n\n【始めたい習慣】\n${userData.newHabits.join("・")}`;
  }
  if (userData.trackingHabits && userData.trackingHabits.length > 0) {
    promptContent += `\n\n【継続している習慣】\n${userData.trackingHabits.join(
      "・"
    )}`;
  }
  if (userData.userStrengths && userData.userStrengths.length > 0) {
    promptContent += `\n\n【自己分析: 強み】\n${userData.userStrengths.join(
      "・"
    )}`;
  }
  if (userData.userWeaknesses && userData.userWeaknesses.length > 0) {
    promptContent += `\n\n【自己分析: 課題】\n${userData.userWeaknesses.join(
      "・"
    )}`;
  }
  return promptContent;
}
