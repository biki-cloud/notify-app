const OPENAI_MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  // 必要に応じて他モデルも追加
};

export function calcOpenAICost({
  model = "gpt-4-turbo",
  prompt_tokens = 0,
  completion_tokens = 0,
  usdToJpy = 150,
}: {
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  usdToJpy?: number;
}) {
  const cost = OPENAI_MODEL_COSTS[model] || OPENAI_MODEL_COSTS["gpt-4-turbo"];
  const inputRate = cost.input;
  const outputRate = cost.output;
  const inputCost = (prompt_tokens / 1000) * inputRate;
  const outputCost = (completion_tokens / 1000) * outputRate;
  const totalCostUSD = inputCost + outputCost;
  const totalCostJPY = Math.round(totalCostUSD * usdToJpy * 100) / 100;
  return {
    inputCost,
    outputCost,
    totalCostUSD,
    totalCostJPY,
    costString: `${totalCostJPY}円 ($${totalCostUSD.toFixed(4)})`,
  };
}
