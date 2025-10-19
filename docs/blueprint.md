# **App Name**: SoloStrategist OS

## Core Features:

- User Authentication: Secure user authentication via Firebase, supporting Email/Password and Google Sign-In.
- Business Profile Onboarding: Multi-step wizard for collecting user's initial business profile data, securely stored in Firestore.
- Dashboard Metrics Display: Card-based dashboard displaying key metrics from Firestore (Lead Count, Engagement Rate, Conversion Rate).
- Tech Stack Recommendation Engine Trigger: Callable cloud function placeholder (triggerAnalysis()) to trigger the external Tech Stack Recommendation engine and store outputs in Firestore.
- Workflow Deployment Trigger: Callable cloud function placeholder (deployWorkflow()) to trigger the One-Click Blueprint Deployer.
- Personalized AI Business Coach: Callable cloud function placeholder (getAICoachAdvice()) that orchestrates the request to get advice from the AI coach, acting as a tool for recommending concrete business actions.
- Kanban Task Board: Internal Kanban board to manage tasks from the /Tasks collection, supports manual and AI-generated tasks.
- Financial Audit Trigger: Callable cloud function placeholder (runFinancialAudit()) to trigger the Genkit flow that checks ToolUsageLogs for unused paid subscriptions (Money Leak Detector) and performs the predictive Funnel Future-Caster calculations, updating the user's dashboard with savings/projections.
- Data Persistence for AI Loop: The Genkit orchestration layer consistently writes aggregated MetricsData and logs CoachingHistory (with completion status) back to Firestore before any AI function reads it.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and strategic thinking.
- Background color: Light gray (#ECEFF1), a desaturated version of the primary hue, for a clean, modern look.
- Accent color: Purple (#9C27B0), analogous to the primary color, to highlight key interactive elements and sections of the app.
- Headline font: 'Belleza' (sans-serif) for headlines and major KPI labels, creating a fashionable, artistic style.
- Body font: 'Alegreya' (serif) for body text and descriptive content, providing an elegant, intellectual feel.
- Use a consistent set of icons to visually represent different sections and functionalities of the OS, ensuring clarity and usability.
- Card-based layout for the Dashboard View, ensuring a clean, responsive, and easily navigable interface.