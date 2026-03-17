import type { ThemeSlug } from '@/types'

// Fallback word lists used when Supabase is not yet configured
// The app fetches live words from Supabase; these are the offline fallbacks.

export const THEME_META: Record<ThemeSlug, { name: string; icon: string; color: string }> = {
  corporate:  { name: 'Corporate',   icon: '💼', color: '#3b82f6' },
  daily_life: { name: 'Daily Life',  icon: '🏠', color: '#10b981' },
  tech:       { name: 'Technology',  icon: '💻', color: '#8b5cf6' },
}

export const FALLBACK_WORDS: Record<ThemeSlug, string[]> = {
  corporate: [
    'Leverage', 'Synergy', 'Stakeholder', 'Deliverable', 'Bandwidth',
    'Escalate', 'Agile', 'Paradigm', 'Actionable', 'ROI',
    'Proactive', 'Alignment', 'Disruptive', 'Scalable', 'Onboarding',
    'Pipeline', 'Benchmark', 'Incentivise', 'Vertical', 'Pivot',
    'KPI', 'Headcount', 'Runway', 'Traction', 'Velocity',
    'Cadence', 'Bottleneck', 'Offsite', 'Greenfield', 'Low-hanging fruit',
  ],
  daily_life: [
    'Errand', 'Groceries', 'Commute', 'Chores', 'Budget',
    'Routine', 'Appointment', 'Neighbourhood', 'Landlord', 'Utilities',
    'Pantry', 'Subscription', 'Invoice', 'Warranty', 'Receipt',
    'Mortgage', 'Lease', 'Negotiation', 'Refund', 'Deposit',
    'Insurance', 'Prescription', 'Ingredient', 'Recipe', 'Appliance',
    'Housemate', 'Carpool', 'Takeaway', 'Leftovers', 'Detergent',
  ],
  tech: [
    'Algorithm', 'API', 'Repository', 'Deployment', 'Latency',
    'Cache', 'Microservices', 'Containerisation', 'Refactor', 'Abstraction',
    'Polymorphism', 'Recursion', 'Webhook', 'Authentication', 'Authorisation',
    'Encryption', 'Throttling', 'Scalability', 'Middleware', 'IDE',
    'Version control', 'CI/CD', 'Debugging', 'Regression', 'Payload',
    'Endpoint', 'Asynchronous', 'Serverless', 'Token', 'Framework',
  ],
}

export function wpmToIntervalMs(wpm: number): number {
  return Math.round(60_000 / wpm)
}
