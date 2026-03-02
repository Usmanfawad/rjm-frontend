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
  if (!state) return 'proposal';
  switch (state) {
    case 'draft':
    case 'approved':
      return 'proposal';
    case 'requested_for_activation':
      return 'activation_requested';
    case 'in_progress':
    case 'live':
      return 'live';
    case 'archived':
      return 'archived';
    default:
      return 'proposal';
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
      : 'proposal',

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
  proposal: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-400' },
  activation_requested: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
  live: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  archived: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-400' },
};

/**
 * Human-readable label for lifecycle states.
 */
export const LIFECYCLE_LABELS: Record<CampaignLifecycleState, string> = {
  proposal: 'Proposal',
  activation_requested: 'Activation Requested',
  live: 'Live',
  archived: 'Archived',
};
