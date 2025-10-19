'use server';

/**
 * @fileOverview Implements the RunPredictiveFinancialForecast flow to project future financial outcomes.
 *
 * - runPredictiveFinancialForecast - A function that triggers the predictive financial forecast process.
 * - PredictiveFinancialForecastOutput - The return type for the runPredictiveFinancialForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the predictive financial forecast flow
const PredictiveFinancialForecastInputSchema = z.object({
  leadCount: z.number().describe('The number of leads generated.'),
  engagementRate: z.number().describe('The engagement rate of the business (e.g., website visits, content interactions).'),
  conversionRate: z.number().describe('The conversion rate of the business (leads to customers).'),
  averageSaleValue: z.number().describe('The average value of a sale or transaction.'),
  customerAcquisitionCost: z.number().describe('The cost to acquire a new customer.'),
  periodLength: z.number().describe('Number of months in the period to predict over.'),
});
export type PredictiveFinancialForecastInput = z.infer<typeof PredictiveFinancialForecastInputSchema>;

// Define the output schema for the predictive financial forecast flow
const PredictiveFinancialForecastOutputSchema = z.object({
  projectedRevenue: z
    .number()
    .describe('Projected revenue based on current data and trends.'),
  projectedProfit: z
    .number()
    .describe('Projected profit based on current data and trends, taking into account acquisition costs.'),
  projectedLeadCount: z
    .number()
    .describe('Projected lead count for the period.'),
  insights: z
    .string()
    .describe('Insights and recommendations based on the projections.'),
});
export type PredictiveFinancialForecastOutput = z.infer<typeof PredictiveFinancialForecastOutputSchema>;

const prompt = ai.definePrompt({
  name: 'predictiveFinancialForecastPrompt',
  input: {schema: PredictiveFinancialForecastInputSchema},
  output: {schema: PredictiveFinancialForecastOutputSchema},
  prompt: `You are a financial forecasting expert. Given the following business data, project future revenue, profit, and lead count. Also, provide insights and recommendations.

Business Data:
Lead Count: {{{leadCount}}}
Engagement Rate: {{{engagementRate}}}
Conversion Rate: {{{conversionRate}}}
Average Sale Value: {{{averageSaleValue}}}
Customer Acquisition Cost: {{{customerAcquisitionCost}}}
Period Length: {{{periodLength}}} months

Instructions:
1. Project revenue by multiplying leadCount * engagementRate * conversionRate * averageSaleValue.
2. Project profit by subtracting (projectedLeadCount * customerAcquisitionCost) from projectedRevenue.
3. Provide insights and recommendations based on these projections, focusing on potential areas for improvement or growth.
4.  Project the future lead count for the period, using current trends.

Format your response as follows:

Projected Revenue: [Projected Revenue]
Projected Profit: [Projected Profit]
Projected Lead Count: [Projected Lead Count]
Insights: [Insights and Recommendations]`,
});

// Define the flow to run the predictive financial forecast
const runPredictiveFinancialForecastFlow = ai.defineFlow(
  {
    name: 'runPredictiveFinancialForecastFlow',
    inputSchema: PredictiveFinancialForecastInputSchema,
    outputSchema: PredictiveFinancialForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

/**
 * Triggers the predictive financial forecast process and returns the results.
 * @param {PredictiveFinancialForecastInput} input - The input data for the financial forecast.
 * @returns {Promise<PredictiveFinancialForecastOutput>} The results of the predictive financial forecast.
 */
export async function runPredictiveFinancialForecast(
  input: PredictiveFinancialForecastInput
): Promise<PredictiveFinancialForecastOutput> {
  return runPredictiveFinancialForecastFlow(input);
}
