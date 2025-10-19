// src/ai/flows/generate-initial-tech-stack-recommendations.ts
'use server';

/**
 * @fileOverview Generates initial tech stack recommendations for a new business.
 *
 * This file defines a Genkit flow that takes a business description as input and returns a list of recommended technologies.
 *
 * @exports {
 *   generateInitialTechStackRecommendations,
 *   GenerateInitialTechStackRecommendationsInput,
 *   GenerateInitialTechStackRecommendationsOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialTechStackRecommendationsInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A detailed description of the business, its goals, and target audience.'),
});
export type GenerateInitialTechStackRecommendationsInput = z.infer<
  typeof GenerateInitialTechStackRecommendationsInputSchema
>;

const GenerateInitialTechStackRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended technologies for the business.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the tech stack recommendations.'),
});
export type GenerateInitialTechStackRecommendationsOutput = z.infer<
  typeof GenerateInitialTechStackRecommendationsOutputSchema
>;

export async function generateInitialTechStackRecommendations(
  input: GenerateInitialTechStackRecommendationsInput
): Promise<GenerateInitialTechStackRecommendationsOutput> {
  return generateInitialTechStackRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialTechStackRecommendationsPrompt',
  input: {schema: GenerateInitialTechStackRecommendationsInputSchema},
  output: {schema: GenerateInitialTechStackRecommendationsOutputSchema},
  prompt: `You are an expert technology consultant. Given the following business description, recommend a suitable tech stack. Explain the reasoning behind your recommendations.

Business Description: {{{businessDescription}}}

Format your response as follows:

Recommendations:
- [Technology 1]
- [Technology 2]
...

Reasoning: [Explanation of why these technologies are recommended]`,
});

const generateInitialTechStackRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateInitialTechStackRecommendationsFlow',
    inputSchema: GenerateInitialTechStackRecommendationsInputSchema,
    outputSchema: GenerateInitialTechStackRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
