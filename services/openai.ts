// This file is kept for compatibility but all functionality is now inline in analysis.tsx
// The OpenAI service is simplified and embedded directly in the analysis screen
export const openAIService = {
  analyzeWasteImage: () => {
    throw new Error('OpenAI service moved to analysis.tsx');
  }
};