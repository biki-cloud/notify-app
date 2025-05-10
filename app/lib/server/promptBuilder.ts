export function buildPromptContent(
  recentRecords: { date: string; mood: string[]; diary: string }[],
  userGoal?: string,
  userHabit?: string
): string {
  let promptContent = recentRecords
    .map(
      (rec, i) =>
        `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
          Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
        }\n日記: ${rec.diary}`
    )
    .join("\n\n");
  if (userGoal) {
    promptContent += `\n\n【現在の目標】\n${userGoal}`;
  }
  if (userHabit) {
    promptContent += `\n\n【現在の習慣】\n${userHabit}`;
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
