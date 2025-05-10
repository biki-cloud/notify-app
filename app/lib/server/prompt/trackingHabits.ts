import { fetchPromptDataWrapper } from "../promptBase";

export async function getTrackingHabitsDataPrompt(userId: number): Promise<{
  trackingHabits: string[];
  idealHabits: string[];
  badHabits: string[];
  newHabits: string[];
}> {
  return await fetchPromptDataWrapper(userId, {
    goals: {
      shortTerm: false,
      midTerm: false,
      longTerm: false,
      life: false,
      coreValues: false,
    },
    habits: {
      ideal: true,
      bad: true,
      new: true,
      tracking: true,
    },
    selfAnalysis: {
      strengths: false,
      weaknesses: false,
    },
    recordsLimit: 0,
  });
}

// tracking_habits専用プロンプト生成関数
export async function buildTrackingHabitsPromptContent(
  userId: number
): Promise<string> {
  const userData = await getTrackingHabitsDataPrompt(userId);
  // trackingHabitsがなければデフォルト文
  if (!userData.trackingHabits || userData.trackingHabits.length === 0) {
    return `あなたは優秀なコーチです。ユーザーが継続している習慣はまだありません。30文字以内で前向きなリマインドを日本語でください。`;
  }
  const habitsList = [
    userData.trackingHabits.length > 0
      ? `【継続中】${userData.trackingHabits.join("・")}`
      : null,
    userData.idealHabits.length > 0
      ? `【理想】${userData.idealHabits.join("・")}`
      : null,
    userData.badHabits.length > 0
      ? `【改善】${userData.badHabits.join("・")}`
      : null,
    userData.newHabits.length > 0
      ? `【新規】${userData.newHabits.join("・")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  return `あなたは優秀なコーチです。ユーザーの習慣データは以下です。\n${habitsList}\nこれらを続けるための30文字以内のリマインドコーチングを日本語でください。`;
}
