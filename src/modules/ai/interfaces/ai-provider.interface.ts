/**
 * Represents the standardized response structure from an AI provider.
 * This might be an object parsed from the AI's raw response.
 */
// export interface IAiProviderResponse { // We might not need a specific response interface if returning 'any'
//   [key: string]: any; // Or define a more specific structure if known
// }
// Remove IAiProviderResponse if generateContent returns Promise<any>

/**
 * Defines the contract for AI provider services.
 */
export interface IAiProvider {
  /**
   * Generates content based on the provided prompt.
   * @param prompt The input prompt for the AI.
   * @returns A Promise resolving to the parsed object from the AI provider's response. // Updated documentation
   * @throws {HttpException} If an error occurs during generation or parsing.
   */
  generate_content(prompt: string): Promise<any>; // Changed method name to snake_case
}

/**
 * Defines the types of supported AI providers.
 */
export type AiProviderType = 'gemini' | 'openai'; // Add other providers as needed
