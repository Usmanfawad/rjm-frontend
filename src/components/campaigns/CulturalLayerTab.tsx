'use client';

import { Globe, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CampaignView } from '@/types/api';

interface CulturalLayerTabProps {
  campaign: CampaignView;
}

export function CulturalLayerTab({ campaign }: CulturalLayerTabProps) {
  const pj = campaign.program_json;

  if (!pj) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No cultural layer data available.
      </div>
    );
  }

  const hasMulticultural =
    (pj.multicultural_expressions?.length ?? 0) > 0 ||
    (pj.multicultural_lineages?.length ?? 0) > 0;
  const hasLocal = (pj.local_culture_segments?.length ?? 0) > 0;
  const hasStrategyLayers = pj.strategy_layers != null;

  if (!hasMulticultural && !hasLocal && !hasStrategyLayers) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No cultural activations applied to this campaign.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multicultural Expressions */}
      {hasMulticultural && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--primary)]" />
              Multicultural Expressions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pj.multicultural_expressions?.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Expressions</p>
                <div className="flex flex-wrap gap-2">
                  {pj.multicultural_expressions.map((expr) => (
                    <Badge key={expr} variant="info">
                      {expr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {pj.multicultural_lineages && pj.multicultural_lineages.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Lineages</p>
                <div className="flex flex-wrap gap-2">
                  {pj.multicultural_lineages.map((lin) => (
                    <Badge key={lin} variant="default">
                      {lin}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Local Culture Segments */}
      {hasLocal && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--primary)]" />
              Local Culture Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pj.local_culture_segments.map((seg) => (
                <Badge key={seg} variant="success">
                  {seg}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Layers */}
      {hasStrategyLayers && (
        <>
          {pj.strategy_layers?.multicultural_strategy && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Multicultural Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pj.strategy_layers.multicultural_strategy.insights?.map((insight, i) => (
                  <p
                    key={i}
                    className="text-sm text-[var(--muted-foreground)] pl-3 border-l-2 border-[var(--primary)]"
                  >
                    {insight}
                  </p>
                ))}
                {pj.strategy_layers.multicultural_strategy.recommendations?.map((rec, i) => (
                  <p
                    key={i}
                    className="text-sm text-[var(--muted-foreground)] pl-3 border-l-2 border-green-400"
                  >
                    {rec}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {pj.strategy_layers?.local_strategy && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Local Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pj.strategy_layers.local_strategy.insights?.map((insight, i) => (
                  <p
                    key={i}
                    className="text-sm text-[var(--muted-foreground)] pl-3 border-l-2 border-[var(--primary)]"
                  >
                    {insight}
                  </p>
                ))}
                {pj.strategy_layers.local_strategy.recommendations?.map((rec, i) => (
                  <p
                    key={i}
                    className="text-sm text-[var(--muted-foreground)] pl-3 border-l-2 border-green-400"
                  >
                    {rec}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Cultural Activation Summary */}
      {pj.cultural_activation_summary && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Cultural Activation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              {pj.cultural_activation_summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
