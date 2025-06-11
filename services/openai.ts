interface WasteAnalysisResult {
  itemName: string;
  quantity: number;
  weight: number;
  material: string;
  environmentScore: number;
  recyclable: boolean;
  compostable: boolean;
  carbonFootprint: number;
  suggestions: string[];
  confidence: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  async analyzeWasteImage(imageUri: string): Promise<WasteAnalysisResult> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert waste analysis AI. Analyze the image and provide detailed information about the waste item(s) shown. Return your response as a JSON object with the following structure:
              {
                "itemName": "string - name of the primary waste item",
                "quantity": "number - estimated number of items",
                "weight": "number - estimated weight in grams",
                "material": "string - primary material type",
                "environmentScore": "number - environmental impact score from 1-10 (10 being best)",
                "recyclable": "boolean - whether the item is recyclable",
                "compostable": "boolean - whether the item is compostable",
                "carbonFootprint": "number - estimated carbon footprint in kg CO2",
                "suggestions": "array of strings - 3-4 actionable suggestions for disposal/recycling",
                "confidence": "number - confidence level from 0-1"
              }
              
              Consider factors like material type, recyclability, environmental impact, and provide practical disposal advice.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this waste item and provide detailed environmental information.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse the JSON response
      const analysisResult = JSON.parse(content);
      
      // Validate the response structure
      this.validateAnalysisResult(analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing waste image:', error);
      throw new Error('Failed to analyze waste image. Please try again.');
    }
  }

  async fixAnalysisWithFeedback(
    originalAnalysis: WasteAnalysisResult,
    userFeedback: string,
    imageUri: string
  ): Promise<WasteAnalysisResult> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert waste analysis AI. The user has provided feedback about a previous analysis. Use their feedback to provide a corrected analysis. Return your response as a JSON object with the same structure as before.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Here was my original analysis: ${JSON.stringify(originalAnalysis)}
                  
                  The user provided this feedback: "${userFeedback}"
                  
                  Please provide a corrected analysis based on this feedback and re-examine the image.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      const correctedAnalysis = JSON.parse(content);
      this.validateAnalysisResult(correctedAnalysis);
      
      return correctedAnalysis;
    } catch (error) {
      console.error('Error fixing analysis:', error);
      throw new Error('Failed to update analysis. Please try again.');
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  }

  private validateAnalysisResult(result: any): void {
    const requiredFields = [
      'itemName', 'quantity', 'weight', 'material', 'environmentScore',
      'recyclable', 'compostable', 'carbonFootprint', 'suggestions', 'confidence'
    ];

    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate data types and ranges
    if (typeof result.environmentScore !== 'number' || result.environmentScore < 1 || result.environmentScore > 10) {
      throw new Error('Invalid environment score');
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      throw new Error('Invalid confidence level');
    }

    if (!Array.isArray(result.suggestions)) {
      throw new Error('Suggestions must be an array');
    }
  }
}

export const openAIService = new OpenAIService();