import { LocationService } from './location';

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
  mapSuggestions?: MapSuggestion[];
  confidence: number;
}

interface MapSuggestion {
  text: string;
  searchQuery: string;
  type: 'recycling_center' | 'store' | 'facility';
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  // Helper function to capitalize item names properly
  private capitalizeItemName(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to extract map suggestions from AI response
  private extractMapSuggestions(suggestions: string[], userLocation: string): MapSuggestion[] {
    const mapSuggestions: MapSuggestion[] = [];
    
    suggestions.forEach(suggestion => {
      const lowerSuggestion = suggestion.toLowerCase();
      
      // Look for recycling centers
      if (lowerSuggestion.includes('recycling center') || lowerSuggestion.includes('recycling facility')) {
        const match = suggestion.match(/take.*?to.*?([\w\s]+recycling\s+(?:center|facility))/i);
        if (match) {
          const facilityName = match[1].trim();
          mapSuggestions.push({
            text: suggestion,
            searchQuery: `${facilityName} ${userLocation}`,
            type: 'recycling_center'
          });
        } else {
          // Generic recycling center search
          mapSuggestions.push({
            text: suggestion,
            searchQuery: `recycling center ${userLocation}`,
            type: 'recycling_center'
          });
        }
      }
      
      // Look for specific stores
      else if (lowerSuggestion.includes('target') || lowerSuggestion.includes('walmart') || 
               lowerSuggestion.includes('home depot') || lowerSuggestion.includes('best buy')) {
        const storeMatch = suggestion.match(/(target|walmart|home depot|best buy)/i);
        if (storeMatch) {
          const storeName = storeMatch[1];
          mapSuggestions.push({
            text: suggestion,
            searchQuery: `${storeName} ${userLocation}`,
            type: 'store'
          });
        }
      }
      
      // Look for waste management facilities
      else if (lowerSuggestion.includes('waste management') || lowerSuggestion.includes('transfer station') ||
               lowerSuggestion.includes('disposal facility')) {
        mapSuggestions.push({
          text: suggestion,
          searchQuery: `waste management facility ${userLocation}`,
          type: 'facility'
        });
      }
    });
    
    return mapSuggestions;
  }

  async analyzeWasteImage(imageUri: string): Promise<WasteAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    try {
      // Get user's location for personalized recommendations
      const userLocation = await LocationService.getLocationForAnalysis();
      console.log('📍 [OpenAIService] Using location for analysis:', userLocation);

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert waste analysis AI. Analyze the image and provide detailed information about the waste item(s) shown. 

CRITICAL: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. Do not wrap your response in \`\`\`json or any other formatting.

The user is located in: ${userLocation}

When providing suggestions, be specific to their location. Instead of saying "check local recycling programs", provide specific guidance based on their city/region. For example:
- Mention specific recycling centers or programs in their area if you know them
- Reference local waste management companies or municipal services
- Provide location-specific disposal guidelines
- Suggest local stores or programs that accept specific materials
- When mentioning specific places, use the format "Take this to [Facility Name] recycling center" or "Many [Store Name] stores accept this"

Return your response as a JSON object with this exact structure:
{
  "itemName": "string - name of the primary waste item (use proper capitalization like 'Plastic Water Bottle' not 'plastic water bottle')",
  "quantity": "number - estimated number of items",
  "weight": "number - estimated weight in grams",
  "material": "string - primary material type",
  "environmentScore": "number - environmental impact score from 1-10 (10 being best)",
  "recyclable": "boolean - whether the item is recyclable",
  "compostable": "boolean - whether the item is compostable",
  "carbonFootprint": "number - estimated carbon footprint in kg CO2",
  "suggestions": "array of strings - 3-4 actionable suggestions for disposal/recycling specific to ${userLocation}",
  "confidence": "number - confidence level from 0-1"
}

IMPORTANT: For the itemName field, use proper noun capitalization (e.g., "Plastic Water Bottle", "Apple Core", "Coffee Cup", "Pizza Box") to make it look professional and readable.

Make your suggestions as location-specific as possible. If you don't have specific knowledge about ${userLocation}, provide general guidance but frame it in the context of their location.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this waste item and provide detailed environmental information with location-specific recommendations for ${userLocation}. Return only valid JSON with no formatting. Make sure to capitalize the item name properly like a proper noun.`
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
        const errorBody = await response.text();
        console.error('OpenAI API Error Response:', errorBody);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('OpenAI API Response:', JSON.stringify(data, null, 2));
        throw new Error('No response content from OpenAI');
      }

      // Clean the content by removing any potential markdown formatting
      const cleanedContent = this.cleanMarkdownCodeBlocks(content);

      // Parse the JSON response with enhanced error handling
      let analysisResult;
      try {
        analysisResult = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('JSON Parse Error - Raw content:', content);
        console.error('Cleaned content:', cleanedContent);
        console.error('Parse error details:', parseError);
        
        // Try to extract JSON from the content if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysisResult = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            throw new Error(`AI model returned malformed JSON. Raw response: ${content.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`AI model returned malformed JSON. Raw response: ${content.substring(0, 200)}...`);
        }
      }
      
      // Validate the response structure
      this.validateAnalysisResult(analysisResult);
      
      // Ensure proper capitalization of item name
      if (analysisResult.itemName) {
        analysisResult.itemName = this.capitalizeItemName(analysisResult.itemName);
      }
      
      // Extract map suggestions from the AI response
      if (analysisResult.suggestions && Array.isArray(analysisResult.suggestions)) {
        analysisResult.mapSuggestions = this.extractMapSuggestions(analysisResult.suggestions, userLocation);
      }
      
      console.log('✅ [OpenAIService] Analysis completed with location-specific suggestions for:', userLocation);
      console.log('🗺️ [OpenAIService] Extracted map suggestions:', analysisResult.mapSuggestions?.length || 0);
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing waste image:', error);
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('API error: 401')) {
          throw new Error('Invalid OpenAI API key. Please check your EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
        } else if (error.message.includes('API error: 429')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('API error: 403')) {
          throw new Error('OpenAI API access forbidden. Please check your API key permissions.');
        } else if (error.message.includes('malformed JSON')) {
          throw error; // Re-throw the specific JSON parsing error
        } else if (error.message.includes('Failed to convert image')) {
          throw new Error('Failed to process the image. Please try with a different image.');
        } else if (error.message.includes('API key not configured')) {
          throw error; // Re-throw API key configuration error
        } else {
          throw new Error('Failed to analyze waste image. Please check your internet connection and try again.');
        }
      } else {
        throw new Error('An unexpected error occurred while analyzing the image.');
      }
    }
  }

  async fixAnalysisWithFeedback(
    originalAnalysis: WasteAnalysisResult,
    userFeedback: string,
    imageUri: string
  ): Promise<WasteAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    try {
      // Get user's location for personalized recommendations
      const userLocation = await LocationService.getLocationForAnalysis();
      console.log('📍 [OpenAIService] Using location for feedback correction:', userLocation);

      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert waste analysis AI. The user has provided feedback about a previous analysis. Use their feedback to provide a corrected analysis. 

CRITICAL: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. Do not wrap your response in \`\`\`json or any other formatting.

The user is located in: ${userLocation}

When providing suggestions, be specific to their location. Provide location-specific disposal guidelines and recommendations.

IMPORTANT: For the itemName field, use proper noun capitalization (e.g., "Plastic Water Bottle", "Apple Core", "Coffee Cup", "Pizza Box") to make it look professional and readable.

Return your response as a JSON object with the same structure as before.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Here was my original analysis: ${JSON.stringify(originalAnalysis)}
                  
                  The user provided this feedback: "${userFeedback}"
                  
                  Please provide a corrected analysis based on this feedback and re-examine the image. Make sure to provide location-specific recommendations for ${userLocation}. Return only valid JSON with no formatting. Make sure to capitalize the item name properly like a proper noun.`
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
        const errorBody = await response.text();
        console.error('OpenAI API Error Response:', errorBody);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('OpenAI API Response:', JSON.stringify(data, null, 2));
        throw new Error('No response content from OpenAI');
      }

      // Clean the content by removing any potential markdown formatting
      const cleanedContent = this.cleanMarkdownCodeBlocks(content);

      // Parse the JSON response with enhanced error handling
      let correctedAnalysis;
      try {
        correctedAnalysis = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('JSON Parse Error - Raw content:', content);
        console.error('Cleaned content:', cleanedContent);
        console.error('Parse error details:', parseError);
        
        // Try to extract JSON from the content if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            correctedAnalysis = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            throw new Error(`AI model returned malformed JSON. Raw response: ${content.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`AI model returned malformed JSON. Raw response: ${content.substring(0, 200)}...`);
        }
      }
      
      this.validateAnalysisResult(correctedAnalysis);
      
      // Ensure proper capitalization of item name
      if (correctedAnalysis.itemName) {
        correctedAnalysis.itemName = this.capitalizeItemName(correctedAnalysis.itemName);
      }
      
      // Extract map suggestions from the corrected AI response
      if (correctedAnalysis.suggestions && Array.isArray(correctedAnalysis.suggestions)) {
        correctedAnalysis.mapSuggestions = this.extractMapSuggestions(correctedAnalysis.suggestions, userLocation);
      }
      
      console.log('✅ [OpenAIService] Feedback correction completed with location-specific suggestions for:', userLocation);
      console.log('🗺️ [OpenAIService] Extracted map suggestions:', correctedAnalysis.mapSuggestions?.length || 0);
      return correctedAnalysis;
    } catch (error) {
      console.error('Error fixing analysis:', error);
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('API error: 401')) {
          throw new Error('Invalid OpenAI API key. Please check your EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
        } else if (error.message.includes('API error: 429')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('API error: 403')) {
          throw new Error('OpenAI API access forbidden. Please check your API key permissions.');
        } else if (error.message.includes('malformed JSON')) {
          throw error; // Re-throw the specific JSON parsing error
        } else if (error.message.includes('Failed to convert image')) {
          throw new Error('Failed to process the image. Please try with a different image.');
        } else if (error.message.includes('API key not configured')) {
          throw error; // Re-throw API key configuration error
        } else {
          throw new Error('Failed to update analysis. Please check your internet connection and try again.');
        }
      } else {
        throw new Error('An unexpected error occurred while updating the analysis.');
      }
    }
  }

  private cleanMarkdownCodeBlocks(content: string): string {
    // Remove markdown code block delimiters and any surrounding text
    let cleaned = content.trim();
    
    // Remove various forms of markdown code blocks
    cleaned = cleaned.replace(/^```json\s*/i, ''); // Remove opening ```json
    cleaned = cleaned.replace(/^```\s*/m, ''); // Remove opening ``` (alternative format)
    cleaned = cleaned.replace(/\s*```\s*$/m, ''); // Remove closing ```
    
    // Remove any leading/trailing text that might not be JSON
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleaned.trim();
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image conversion error:', error);
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

    // Ensure numeric fields are actually numbers
    if (typeof result.quantity !== 'number' || result.quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    if (typeof result.weight !== 'number' || result.weight <= 0) {
      throw new Error('Invalid weight');
    }

    if (typeof result.carbonFootprint !== 'number' || result.carbonFootprint < 0) {
      throw new Error('Invalid carbon footprint');
    }

    // Ensure boolean fields are actually booleans
    if (typeof result.recyclable !== 'boolean') {
      throw new Error('Recyclable must be a boolean');
    }

    if (typeof result.compostable !== 'boolean') {
      throw new Error('Compostable must be a boolean');
    }

    // Ensure string fields are not empty
    if (typeof result.itemName !== 'string' || result.itemName.trim() === '') {
      throw new Error('Item name must be a non-empty string');
    }

    if (typeof result.material !== 'string' || result.material.trim() === '') {
      throw new Error('Material must be a non-empty string');
    }
  }
}

export const openAIService = new OpenAIService();