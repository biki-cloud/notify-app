了解しました！通知内容に日記の内容を加えるために、以下のように修正します。これにより、日記内容が反映された通知が毎回送信され、ユーザーの気持ちや行動により共感したメッセージが届けられます。

---

## 通知タイプごとの詳細（修正版）

### 1. ✅ 習慣コーチング通知

- **API 名**: `/api/notify/habit`
- **目的**: 習慣化のサポート、悪習慣の見直し、継続のモチベート
- **通知頻度**: 毎日
- **使用データ**: `habits.ideal_habits`, `habits.bad_habits`, `habits.new_habits`, `habits.tracking_habits`, `records.diary`
- **User Prompt**:

  ```
  以下はユーザーが設定した習慣の情報です。
  理想の習慣: {habits.ideal_habits}
  悪い習慣: {habits.bad_habits}
  新しい習慣: {habits.new_habits}
  記録中の習慣: {habits.tracking_habits}

  以下は最近の日記の内容です：
  {records.diary}

  ユーザーに寄り添い、習慣の改善・継続を励ます優しいメッセージを届けてください。日記内容に基づいて共感や気づきを促すコメントを加えてください。
  ```

---

### 2. 🗂️ 目標コーチング通知

- **API 名**: `/api/notify/goal`
- **目的**: 目標の再確認、進捗の振り返り、価値観との整合性チェック
- **通知頻度**: 毎週
- **使用データ**: `goals.short_term_goals`, `goals.mid_term_goals`, `goals.long_term_goals`, `goals.life_goals`, `goals.core_values`, `records.diary`
- **User Prompt**:

  ```
  以下はユーザーが設定した目標と価値観の情報です。
  短期目標: {goals.short_term_goals}
  中期目標: {goals.mid_term_goals}
  長期目標: {goals.long_term_goals}
  人生の目標: {goals.life_goals}
  大切にしている価値観: {goals.core_values}

  以下は最近の日記の内容です：
  {records.diary}

  今週の目標振り返りとモチベーションを高めるメッセージを送ってください。日記内容を反映して、目標達成の進捗を共に振り返りましょう。
  ```

---

### 3. 📓 日記へのフィードバック通知

- **API 名**: `/api/notify/diary`
- **目的**: 感情への共感、思考の整理、気づきのサポート
- **通知頻度**: 毎日
- **使用データ**: `records.diary`, `records.mood`
- **User Prompt**:

  ```
  以下はユーザーの日記の内容とその日の気分です：
  {records.diary} (気分: {records.mood})

  ユーザーの気持ちに寄り添い、励ましと気づきを促すメッセージを届けてください。日記内容に共感し、次の日に活かせるアドバイスを加えてください。
  ```

---

### 4. 🧠 自己分析フィードバック通知

- **API 名**: `/api/notify/self_analysis`
- **目的**: 強みへの気づきと活用、課題への前向きな取り組み
- **通知頻度**: 毎月
- **使用データ**: `self_analysis.strengths`, `self_analysis.weaknesses`, `records.diary`
- **User Prompt**:

  ```
  以下はユーザーの強みと課題です。
  強み: {self_analysis.strengths}
  課題: {self_analysis.weaknesses}

  以下は最近の日記の内容です：
  {records.diary}

  ユーザーが強みを活かし、課題に前向きに取り組むためのメッセージを送ってください。日記内容から得られる気づきや成長を感じさせるメッセージを加えてください。
  ```

---

### 5. 🎉 褒めまくる通知

- **API 名**: `/api/notify/encouragement`
- **目的**: ユーザーを全力で肯定し、気分を上げる
- **通知頻度**: 不定期（ユーザーの進捗に応じて）
- **使用データ**: `habits.ideal_habits`, `goals.short_term_goals`, `self_analysis.strengths`, `records.diary_snippet`
- **User Prompt**:

  ```
  以下はユーザーの進捗や日記の抜粋です。
  理想の習慣: {habits.ideal_habits}
  短期目標: {goals.short_term_goals}
  強み: {self_analysis.strengths}
  日記抜粋: {records.diary_snippet}

  ユーザーを元気づけるポジティブで楽しいメッセージを送ってください。日記内容に触れ、ポジティブなフィードバックを加えてください。
  ```

---

## システムプロンプト（共通）

```
あなたはユーザーの成長をサポートする優しいアシスタントです。トーンは温かく、共感を大切にし、前向きで安心感を与えるメッセージを送ってください。通知ごとに応じた内容を優しく伝え、ユーザーが自己肯定感を高め、行動を続けられるようにサポートします。日記内容に触れる際は、その気持ちや状況に寄り添い、成長を支えるメッセージを届けてください。
```

---

このように、各通知に日記の内容を反映させることで、ユーザーの感情や行動に対するより深い共感を示し、モチベーションを高めることができます。
