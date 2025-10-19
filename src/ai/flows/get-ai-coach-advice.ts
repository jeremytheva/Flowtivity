'use server';

/**
 * @fileOverview This file defines a Genkit flow for receiving personalized AI-driven coaching advice.
 *
 * It takes business data as input and returns actionable insights and recommendations for improving business strategies.
 * @param {GetAICoachAdviceInput} input - The input data for the AI coach, including business metrics and context.
 * @returns {Promise<GetAICoachAdviceOutput>} - A promise that resolves to the AI coaching advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAICoachAdviceInputSchema = z.object({
  leadCount: z.number().describe('The number of leads generated.'),
  engagementRate: z.number().describe('The engagement rate of the business.'),
  conversionRate: z.number().describe('The conversion rate of the business.'),
  businessDescription: z.string().describe('A description of the business and its goals.'),
  recentActions: z.string().describe('A summary of recent actions taken by the business.'),
});
export type GetAICoachAdviceInput = z.infer<typeof GetAICoachAdviceInputSchema>;

const GetAICoachAdviceOutputSchema = z.object({
  advice: z.string().describe('The AI-driven coaching advice for the business.'),
  recommendedActions: z.string().describe('A list of recommended actions to improve business strategies.'),
});
export type GetAICoachAdviceOutput = z.infer<typeof GetAICoachAdviceOutputSchema>;

/**
 * Receives personalized AI coaching advice based on business data.
 * @param input - The input data for the AI coach.
 * @returns A promise that resolves to the AI coaching advice.
 */
export async function getAICoachAdvice(input: GetAICoachAdviceInput): Promise<GetAICoachAdviceOutput> {
  return getAICoachAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAICoachAdvicePrompt',
  input: {schema: GetAICoachAdviceInputSchema},
  output: {schema: GetAICoachAdviceOutputSchema},
  prompt: `You are an AI business coach providing actionable advice to businesses.

  Based on the following business data and context, provide personalized coaching advice and recommend specific actions:

  Business Description: {{{businessDescription}}}
  Lead Count: {{{leadCount}}}
  Engagement Rate: {{{engagementRate}}}
  Conversion Rate: {{{conversionRate}}}
  Recent Actions: {{{recentActions}}}

  Provide specific and actionable advice, and list recommended actions that the business can take to improve its strategies.  Format the recommended actions as a numbered list.
`,
});

const getAICoachAdviceFlow = ai.defineFlow(
  {
    name: 'getAICoachAdviceFlow',
    inputSchema: GetAICoachAdviceInputSchema,
    outputSchema: GetAICoachAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
