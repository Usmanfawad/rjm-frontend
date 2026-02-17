/**
 * Campaign lifecycle utilities.
 *
 * Maps PersonaGeneration + optional GovernedObjectResponse into a unified
 * CampaignView for the Campaigns surface.
 */

import type {
  CampaignLifecycleState,
  CampaignView,
  GovernedObjectResponse,
  OperationalState,
  PersonaGeneration,
} from '@/types/api';

/**
 * Map governance OperationalState → CampaignLifecycleState.
 */
export function mapOperationalToLifecycle(
  state?: OperationalState | null,
): CampaignLifecycleState {
  if (!state) return 'ideation';
  switch (state) {
    case 'draft':
      return 'draft';
    case 'approved':
      return 'review';
    case 'requested_for_activation':
      return 'finalized';
    case 'in_progress':
    case 'live':
      return 'activated';
    case 'archived':
      return 'archived';
    default:
      return 'ideation';
  }
}

/**
 * Merge a PersonaGeneration with its optional governed object into a CampaignView.
 */
export function toCampaignView(
  gen: PersonaGeneration,
  governed?: GovernedObjectResponse | null,
): CampaignView {
  return {
    id: gen.id,
    brand_name: gen.brand_name,
    brief: gen.brief,
    program_text: gen.program_text,
    program_json: gen.program_json,
    advertising_category: gen.advertising_category,
    source: gen.source,
    created_at: gen.created_at,

    lifecycle_state: governed
      ? mapOperationalToLifecycle(governed.current_state)
      : 'ideation',

    governance_id: governed?.id,
    governance_version: governed?.version,
    governance_title: governed?.title ?? undefined,
    approved_at: governed?.approved_at ?? undefined,
    activated_at: governed?.activated_at ?? undefined,
    archived_at: governed?.archived_at ?? undefined,
  };
}

/**
 * Lifecycle badge color mapping.
 */
export const LIFECYCLE_COLORS: Record<
  CampaignLifecycleState,
  { bg: string; text: string; dot: string }
> = {
  ideation: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400' },
  draft: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-400' },
  review: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
  finalized: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-400' },
  activated: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  archived: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-400' },
};

/**
 * Human-readable label for lifecycle states.
 */
export const LIFECYCLE_LABELS: Record<CampaignLifecycleState, string> = {
  ideation: 'Ideation',
  draft: 'Draft',
  review: 'In Review',
  finalized: 'Finalized',
  activated: 'Activated',
  archived: 'Archived',
};
