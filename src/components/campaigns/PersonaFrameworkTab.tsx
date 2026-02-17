'use client';

import { useState } from 'react';
import { Key, Users, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CampaignView } from '@/types/api';

interface PersonaFrameworkTabProps {
  campaign: CampaignView;
}

export function PersonaFrameworkTab({ campaign }: PersonaFrameworkTabProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['personas']));
  const pj = campaign.program_json;

  if (!pj) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No persona framework data available.
      </div>
    );
  }

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Key Identifiers */}
      {pj.key_identifiers?.length > 0 && (
        <Card variant="elevated">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => toggle('identifiers')}
          >
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[var(--primary)]" />
                Key Identifiers
              </span>
              {expanded.has('identifiers') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expanded.has('identifiers') && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pj.key_identifiers.map((ki) => (
                  <Badge key={ki} variant="info">
                    {ki}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Persona Portfolio */}
      <Card variant="elevated">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => toggle('personas')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--primary)]" />
              Persona Portfolio ({pj.personas?.length ?? 0})
            </span>
            {expanded.has('personas') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {expanded.has('personas') && (
          <CardContent>
            <div className="grid gap-3">
              {pj.personas?.map((p) => (
                <div
                  key={p.name}
                  className="flex items-start justify-between p-3 rounded-lg bg-[var(--accent)]"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    {p.highlight && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {p.highlight}
                      </p>
                    )}
                  </div>
                  {p.phylum && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      {p.phylum}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Generational Segments */}
      {pj.generational_segments?.length > 0 && (
        <Card variant="elevated">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => toggle('generations')}
          >
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                Generational Segments
              </span>
              {expanded.has('generations') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expanded.has('generations') && (
            <CardContent>
              <div className="grid gap-2">
                {pj.generational_segments.map((gs) => (
                  <div
                    key={gs.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--accent)]"
                  >
                    <span className="text-sm font-medium">{gs.name}</span>
                    {gs.highlight && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {gs.highlight}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Demographics */}
      {pj.demos && (pj.demos.core || pj.demos.secondary) && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--primary)]" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pj.demos.core && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Core</p>
                  <p className="text-sm font-medium">{pj.demos.core}</p>
                </div>
              )}
              {pj.demos.secondary && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Secondary</p>
                  <p className="text-sm font-medium">{pj.demos.secondary}</p>
                </div>
              )}
              {pj.demos.broad_demo && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Broad</p>
                  <p className="text-sm font-medium">{pj.demos.broad_demo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persona Insights */}
      {pj.persona_insights?.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Persona Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pj.persona_insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--muted-foreground)] pl-3 border-l-2 border-[var(--primary)]"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
