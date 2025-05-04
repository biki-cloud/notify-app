// 絵文字リストを共通化
export const EMOJI_LIST = {
  positive: [
    { label: "嬉しい", emoji: "😊" },
    { label: "楽しい", emoji: "😆" },
    { label: "ワクワク", emoji: "🤩" },
    { label: "満足", emoji: "😋" },
    { label: "感謝", emoji: "🙏" },
    { label: "感動", emoji: "😭" },
    { label: "やる気", emoji: "🔥" },
    { label: "充実", emoji: "💪" },
    { label: "希望", emoji: "🌈" },
    { label: "誇り", emoji: "😤" },
    { label: "幸福", emoji: "🥰" },
    { label: "絶好調", emoji: "💯" },
    { label: "安心", emoji: "😌" },
    { label: "リラックス", emoji: "🛀" },
    { label: "納得", emoji: "👌" },
    { label: "感心", emoji: "👏" },
    { label: "感激", emoji: "🥹" },
    { label: "感無量", emoji: "🥲" },
    { label: "愛情", emoji: "❤️" },
  ],
  negative: [
    { label: "悲しい", emoji: "😢" },
    { label: "怒り", emoji: "😡" },
    { label: "不安", emoji: "😰" },
    { label: "疲れた", emoji: "😩" },
    { label: "イライラ", emoji: "😠" },
    { label: "寂しい", emoji: "😔" },
    { label: "退屈", emoji: "😑" },
    { label: "焦り", emoji: "😣" },
    { label: "後悔", emoji: "😞" },
    { label: "無気力", emoji: "😶" },
    { label: "混乱", emoji: "😵‍💫" },
    { label: "孤独", emoji: "🥲" },
    { label: "絶望", emoji: "😱" },
    { label: "恥ずかしい", emoji: "😳" },
    { label: "恐怖", emoji: "👻" },
    { label: "驚き", emoji: "😲" },
    { label: "嫉妬", emoji: "😒" },
    { label: "羨ましい", emoji: "🤤" },
    { label: "罪悪感", emoji: "😓" },
    { label: "緊張", emoji: "😬" },
    { label: "困惑", emoji: "🤔" },
    { label: "疑問", emoji: "❓" },
    { label: "最悪", emoji: "💀" },
    { label: "悪い", emoji: "🙁" },
  ],
  neutral: [
    { label: "普通", emoji: "😐" },
    { label: "平和", emoji: "🕊️" },
    { label: "良い", emoji: "🙂" },
    { label: "お腹減った", emoji: "🍙" },
  ],
};

// labelからemojiを返す関数
export function moodEmoji(label: string): string {
  for (const category of Object.values(EMOJI_LIST)) {
    const found = category.find((item) => item.label === label);
    if (found) return found.emoji;
  }
  return "";
}
