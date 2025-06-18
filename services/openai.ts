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
  private requestTimeout = 30000; // 30 seconds

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ [OpenAIService] OpenAI API key not found in environment variables');
    }
  }

  // Helper function to create timeout promise
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  // Helper function to capitalize item names properly
  private capitalizeItemName(name: string): string {
    try {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } catch (error) {
      console.error('❌ [OpenAIService] Error capitalizing item name:', error);
      return name || 'Unknown Item';
    }
  }

  // Helper function to extract map suggestions from AI response
  private extractMapSuggestions(suggestions: string[], userLocation: string): MapSuggestion[] {
    try {
      const mapSuggestions: MapSuggestion[] = [];
      
      if (!Array.isArray(suggestions)) {
        console.warn('⚠️ [OpenAIService] Suggestions is not an array');
        return mapSuggestions;
      }
      
      suggestions.forEach(suggestion => {
        try {
          if (typeof suggestion !== 'string') return;
          
          const lowerSuggestion = suggestion.toLowerCase();
          
          // Look for recycling centers (only for special items that can't go in regular bins)
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
        } catch (error) {
          console.error('❌ [OpenAIService] Error processing suggestion:', error);
        }
      });
      
      return mapSuggestions;
    } catch (error) {
      console.error('❌ [OpenAIService] Error extracting map suggestions:', error);
      return [];
    }
  }

  async analyzeWasteImage(imageUri: string): Promise<WasteAnalysisResult> {
    // Validate inputs
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    if (!this.apiKey) {
      console.error('❌ [OpenAIService] API key not configured');
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    try {
      console.log('🔄 [OpenAIService] Starting waste image analysis...');

      // Get user's location for personalized recommendations with timeout
      let userLocation = 'your local area';
      try {
        const locationPromise = LocationService.getLocationForAnalysis();
        const timeoutPromise = this.createTimeoutPromise(5000); // 5 second timeout for location
        userLocation = await Promise.race([locationPromise, timeoutPromise]);
        console.log('📍 [OpenAIService] Using location for analysis:', userLocation);
      } catch (locationError) {
        console.warn('⚠️ [OpenAIService] Failed to get location, using fallback:', locationError);
        userLocation = 'your local area';
      }

      // Convert image to base64 with timeout
      let base64Image: string;
      try {
        const imagePromise = this.convertImageToBase64(imageUri);
        const timeoutPromise = this.createTimeoutPromise(10000); // 10 second timeout for image conversion
        base64Image = await Promise.race([imagePromise, timeoutPromise]);
      } catch (imageError) {
        console.error('❌ [OpenAIService] Failed to convert image:', imageError);
        throw new Error('Failed to process the image. Please try with a different image.');
      }

      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert waste analysis AI. Analyze the image and provide detailed information about the waste item(s) shown. 

CRITICAL: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. Do not wrap your response in \`\`\`json or any other formatting.

The user is located in: ${userLocation}

IMPORTANT DISPOSAL GUIDANCE:
- For common recyclable items (plastic bottles, cans, paper, cardboard, glass bottles), tell users to put them in their regular recycling bin
- Only suggest special drop-off locations for items that CANNOT go in regular recycling bins (electronics, batteries, hazardous materials, etc.)
- Be practical - if it can go in the recycling bin, that's the easiest option for the user
- Give direct, actionable instructions with specific steps
- NEVER use words like "check", "verify", "confirm", "ensure", "make sure", or "guidelines"
- NEVER suggest educational activities like "learn about recycling" or "research local programs"
- NEVER say "contact your local" anything

FORBIDDEN PHRASES - NEVER use these:
- "Check with local guidelines"
- "Check local recycling guidelines" 
- "Verify with your local"
- "Confirm with local authorities"
- "Make sure to check"
- "Ensure proper disposal"
- "Contact your local waste management"
- "Learn about recycling"
- "Research local programs"
- "Follow local guidelines"

APPROVED LANGUAGE - Use direct commands like:
- "Rinse and place in your recycling bin"
- "Put in your recycling bin"
- "Take this to Best Buy for electronics recycling"
- "Drop off at Home Depot battery recycling station"
- "Place in your compost bin"
- "Put in your general waste bin"

When providing suggestions, be specific and practical. Examples:
- For plastic bottles: "Rinse and place in your recycling bin"
- For aluminum cans: "Place in your recycling bin"
- For electronics: "Take this to Best Buy for electronics recycling"
- For batteries: "Drop off at Home Depot battery recycling station"

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
  "suggestions": "array of strings - 3-4 actionable suggestions for disposal specific to ${userLocation}",
  "confidence": "number - confidence level from 0-1"
}

IMPORTANT: For the itemName field, use proper noun capitalization (e.g., "Plastic Water Bottle", "Apple Core", "Coffee Cup", "Pizza Box") to make it look professional and readable.

Make your suggestions practical and direct. Prioritize regular recycling bins for standard recyclables, and only mention special facilities for items that truly need them. Give specific disposal instructions without using any forbidden phrases.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this waste item and provide detailed environmental information with practical disposal recommendations for ${userLocation}. Return only valid JSON with no formatting. Make sure to capitalize the item name properly like a proper noun. If this item can go in a regular recycling bin, tell me to put it there instead of suggesting special facilities. Give me direct instructions without using words like "check", "verify", or "guidelines".`
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
      };

      // Make API request with timeout
      let response: Response;
      try {
        const fetchPromise = fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        const timeoutPromise = this.createTimeoutPromise(this.requestTimeout);
        response = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (fetchError) {
        console.error('❌ [OpenAIService] Network error:', fetchError);
        if (fetchError instanceof Error && fetchError.message === 'Request timeout') {
          throw new Error('Request timed out. Please try again.');
        }
        throw new Error('Network error. Please try again.');
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        console.error('❌ [OpenAIService] API Error Response:', response.status, errorBody);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please verify your EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('OpenAI API access forbidden. Please verify your API key permissions.');
        } else {
          throw new Error(`OpenAI API error: ${response.status}. Please try again later.`);
        }
      }

      const data = await response.json().catch((parseError) => {
        console.error('❌ [OpenAIService] Failed to parse response JSON:', parseError);
        throw new Error('Invalid response from OpenAI API. Please try again.');
      });

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('❌ [OpenAIService] No content in API response:', JSON.stringify(data, null, 2));
        throw new Error('No response content from OpenAI. Please try again.');
      }

      // Clean the content by removing any potential markdown formatting
      const cleanedContent = this.cleanMarkdownCodeBlocks(content);

      // Parse the JSON response with enhanced error handling
      let analysisResult: WasteAnalysisResult;
      try {
        analysisResult = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ [OpenAIService] JSON Parse Error - Raw content:', content);
        console.error('❌ [OpenAIService] Cleaned content:', cleanedContent);
        console.error('❌ [OpenAIService] Parse error details:', parseError);
        
        // Try to extract JSON from the content if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysisResult = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('❌ [OpenAIService] Second parse attempt failed:', secondParseError);
            throw new Error('AI model returned invalid response format. Please try again.');
          }
        } else {
          throw new Error('AI model returned invalid response format. Please try again.');
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
      
      console.log('✅ [OpenAIService] Analysis completed successfully');
      return analysisResult;
    } catch (error) {
      console.error('❌ [OpenAIService] Analysis failed:', error);
      
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle unknown errors
      throw new Error('An unexpected error occurred while analyzing the image. Please try again.');
    }
  }

  async fixAnalysisWithFeedback(
    originalAnalysis: WasteAnalysisResult,
    userFeedback: string,
    imageUri: string
  ): Promise<WasteAnalysisResult> {
    // Validate inputs
    if (!originalAnalysis || !userFeedback || !imageUri) {
      throw new Error('Missing required parameters for feedback correction');
    }

    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    try {
      console.log('🔄 [OpenAIService] Starting feedback correction...');

      // Get user's location for personalized recommendations with timeout
      let userLocation = 'your local area';
      try {
        const locationPromise = LocationService.getLocationForAnalysis();
        const timeoutPromise = this.createTimeoutPromise(5000);
        userLocation = await Promise.race([locationPromise, timeoutPromise]);
        console.log('📍 [OpenAIService] Using location for feedback correction:', userLocation);
      } catch (locationError) {
        console.warn('⚠️ [OpenAIService] Failed to get location for feedback, using fallback:', locationError);
        userLocation = 'your local area';
      }

      // Convert image to base64 with timeout
      let base64Image: string;
      try {
        const imagePromise = this.convertImageToBase64(imageUri);
        const timeoutPromise = this.createTimeoutPromise(10000);
        base64Image = await Promise.race([imagePromise, timeoutPromise]);
      } catch (imageError) {
        console.error('❌ [OpenAIService] Failed to convert image for feedback:', imageError);
        throw new Error('Failed to process the image. Please try with a different image.');
      }

      // Make API request with timeout
      let response: Response;
      try {
        const fetchPromise = fetch(`${this.baseUrl}/chat/completions`, {
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

IMPORTANT DISPOSAL GUIDANCE:
- For common recyclable items (plastic bottles, cans, paper, cardboard, glass bottles), tell users to put them in their regular recycling bin
- Only suggest special drop-off locations for items that CANNOT go in regular recycling bins (electronics, batteries, hazardous materials, etc.)
- Be practical - if it can go in the recycling bin, that's the easiest option for the user
- Give direct, actionable instructions with specific steps
- NEVER use words like "check", "verify", "confirm", "ensure", "make sure", or "guidelines"
- NEVER suggest educational activities like "learn about recycling" or "research local programs"
- NEVER say "contact your local" anything

FORBIDDEN PHRASES - NEVER use these:
- "Check with local guidelines"
- "Check local recycling guidelines" 
- "Verify with your local"
- "Confirm with local authorities"
- "Make sure to check"
- "Ensure proper disposal"
- "Contact your local waste management"
- "Learn about recycling"
- "Research local programs"
- "Follow local guidelines"

APPROVED LANGUAGE - Use direct commands like:
- "Rinse and place in your recycling bin"
- "Put in your recycling bin"
- "Take this to Best Buy for electronics recycling"
- "Drop off at Home Depot battery recycling station"
- "Place in your compost bin"
- "Put in your general waste bin"

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
                    
                    Please provide a corrected analysis based on this feedback and re-examine the image. Make sure to provide practical disposal recommendations for ${userLocation}. Return only valid JSON with no formatting. Make sure to capitalize the item name properly like a proper noun. If this item can go in a regular recycling bin, tell me to put it there instead of suggesting special facilities. Give me direct instructions without using words like "check", "verify", or "guidelines".`
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
        
        const timeoutPromise = this.createTimeoutPromise(this.requestTimeout);
        response = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (fetchError) {
        console.error('❌ [OpenAIService] Network error during feedback:', fetchError);
        if (fetchError instanceof Error && fetchError.message === 'Request timeout') {
          throw new Error('Request timed out. Please try again.');
        }
        throw new Error('Network error. Please try again.');
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        console.error('❌ [OpenAIService] Feedback API Error:', response.status, errorBody);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please verify your EXPO_PUBLIC_OPENAI_API_KEY environment variable.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('OpenAI API access forbidden. Please verify your API key permissions.');
        } else {
          throw new Error(`OpenAI API error: ${response.status}. Please try again later.`);
        }
      }

      const data = await response.json().catch((parseError) => {
        console.error('❌ [OpenAIService] Failed to parse feedback response JSON:', parseError);
        throw new Error('Invalid response from OpenAI API. Please try again.');
      });

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('❌ [OpenAIService] No content in feedback response:', JSON.stringify(data, null, 2));
        throw new Error('No response content from OpenAI. Please try again.');
      }

      // Clean the content by removing any potential markdown formatting
      const cleanedContent = this.cleanMarkdownCodeBlocks(content);

      // Parse the JSON response with enhanced error handling
      let correctedAnalysis: WasteAnalysisResult;
      try {
        correctedAnalysis = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ [OpenAIService] Feedback JSON Parse Error - Raw content:', content);
        console.error('❌ [OpenAIService] Cleaned content:', cleanedContent);
        console.error('❌ [OpenAIService] Parse error details:', parseError);
        
        // Try to extract JSON from the content if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            correctedAnalysis = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('❌ [OpenAIService] Second feedback parse attempt failed:', secondParseError);
            throw new Error('AI model returned invalid response format. Please try again.');
          }
        } else {
          throw new Error('AI model returned invalid response format. Please try again.');
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
      
      console.log('✅ [OpenAIService] Feedback correction completed successfully');
      return correctedAnalysis;
    } catch (error) {
      console.error('❌ [OpenAIService] Feedback correction failed:', error);
      
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle unknown errors
      throw new Error('An unexpected error occurred while updating the analysis. Please try again.');
    }
  }

  private cleanMarkdownCodeBlocks(content: string): string {
    try {
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
    } catch (error) {
      console.error('❌ [OpenAIService] Error cleaning markdown:', error);
      return content; // Return original content if cleaning fails
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      console.log('🔄 [OpenAIService] Converting image to base64...');
      
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = reader.result as string;
            if (!result || typeof result !== 'string') {
              reject(new Error('Failed to read image file - invalid result'));
              return;
            }
            
            const base64 = result.split(',')[1];
            if (!base64) {
              reject(new Error('Failed to extract base64 data from image'));
              return;
            }
            
            console.log('✅ [OpenAIService] Image converted to base64 successfully');
            resolve(base64);
          } catch (error) {
            reject(new Error('Failed to process image data'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ [OpenAIService] Image conversion error:', error);
      throw new Error('Failed to convert image to base64. Please try with a different image.');
    }
  }

  private validateAnalysisResult(result: any): void {
    try {
      if (!result || typeof result !== 'object') {
        throw new Error('Analysis result must be an object');
      }

      const requiredFields = [
        'itemName', 'quantity', 'weight', 'material', 'environmentScore',
        'recyclable', 'compostable', 'carbonFootprint', 'suggestions', 'confidence'
      ];

      for (const field of requiredFields) {
        if (!(field in result)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate data types and ranges with safe fallbacks
      if (typeof result.environmentScore !== 'number' || isNaN(result.environmentScore)) {
        result.environmentScore = 5; // Default fallback
      } else if (result.environmentScore < 1 || result.environmentScore > 10) {
        result.environmentScore = Math.max(1, Math.min(10, result.environmentScore));
      }

      if (typeof result.confidence !== 'number' || isNaN(result.confidence)) {
        result.confidence = 0.5; // Default fallback
      } else if (result.confidence < 0 || result.confidence > 1) {
        result.confidence = Math.max(0, Math.min(1, result.confidence));
      }

      if (!Array.isArray(result.suggestions)) {
        result.suggestions = ['Place in your recycling bin if recyclable', 'Consider reusable alternatives'];
      }

      // Ensure numeric fields are valid numbers with fallbacks
      if (typeof result.quantity !== 'number' || isNaN(result.quantity) || result.quantity <= 0) {
        result.quantity = 1;
      }

      if (typeof result.weight !== 'number' || isNaN(result.weight) || result.weight <= 0) {
        result.weight = 50; // Default 50g
      }

      if (typeof result.carbonFootprint !== 'number' || isNaN(result.carbonFootprint) || result.carbonFootprint < 0) {
        result.carbonFootprint = 0.1;
      }

      // Ensure boolean fields are actually booleans
      if (typeof result.recyclable !== 'boolean') {
        result.recyclable = false;
      }

      if (typeof result.compostable !== 'boolean') {
        result.compostable = false;
      }

      // Ensure string fields are not empty with fallbacks
      if (typeof result.itemName !== 'string' || result.itemName.trim() === '') {
        result.itemName = 'Unknown Item';
      }

      if (typeof result.material !== 'string' || result.material.trim() === '') {
        result.material = 'Mixed Material';
      }

      console.log('✅ [OpenAIService] Analysis result validated successfully');
    } catch (error) {
      console.error('❌ [OpenAIService] Validation error:', error);
      throw new Error(`Invalid analysis result: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }
}

export const openAIService = new OpenAIService();