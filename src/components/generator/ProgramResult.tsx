'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { GenerateProgramResponse } from '@/types/api';
import {
  Key,
  Users,
  BarChart3,
  Target,
  Compass,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  MapPin,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProgramResultProps {
  result: GenerateProgramResponse;
}

export function ProgramResult({ result }: ProgramResultProps) {
  const { program_json: program, program_text, generation_id } = result;
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personas']));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(program_text);
    setCopied(true);
    toast('Program copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterForGovernance = async () => {
    if (!generation_id) {
      toast('This program was not saved. Please sign in and build your program again.', 'warning');
      return;
    }

    setRegistering(true);
    try {
      const title = `${program.header} - ${new Date().toLocaleDateString()}`;
      const response = await api.registerObject({
        object_type: 'persona_program',
        reference_id: generation_id,
        reference_table: 'persona_generations',
        title,
        description: `Persona program for ${program.header}`,
      });

      if (response.success && response.data) {
        setRegistered(true);
        toast('Program registered for governance', 'success');
        const objId = response.data.id;
        if (objId) {
          setTimeout(() => {
            router.push(`/governance/${objId}`);
          }, 1500);
        }
      } else {
        toast(response.error || 'Failed to register for governance', 'error');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to register for governance', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: React.ElementType }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--primary)]" />
        <span className="font-semibold text-[var(--foreground)]">{title}</span>
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
      ) : (
        <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{program.header}</CardTitle>
              {program.advertising_category && (
                <Badge variant="info" className="mt-2">{program.advertising_category}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {generation_id && !registered && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRegisterForGovernance}
                  disabled={registering}
                  isLoading={registering}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Register for Governance
                </Button>
              )}
              {registered && (
                <Button variant="primary" size="sm" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Registered
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Identifiers */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="identifiers" title="Key Identifiers" icon={Key} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('identifiers') ? 'max-h-96 p-4' : 'max-h-0'
          )}>
            <div className="flex flex-wrap gap-2">
              {program.key_identifiers.map((id, index) => (
                <Badge key={index} variant="default" className="px-3 py-1.5 text-sm">
                  {id}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="personas" title={`Persona Portfolio (${program.personas.length})`} icon={Users} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('personas') ? 'max-h-[2000px] p-4' : 'max-h-0'
          )}>
            <div className="grid gap-3">
              {program.personas.map((persona, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">
                        {persona.name}
                      </h4>
                      {persona.highlight && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {persona.highlight}
                        </p>
                      )}
                    </div>
                    {(persona.category || persona.phylum) && (
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {persona.category && (
                          <Badge variant="info" className="text-xs">{persona.category}</Badge>
                        )}
                        {persona.phylum && (
                          <Badge variant="default" className="text-xs">{persona.phylum}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generational Segments */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="generations" title="Generational Segments" icon={BarChart3} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('generations') ? 'max-h-96 p-4' : 'max-h-0'
          )}>
            <div className="grid gap-3">
              {program.generational_segments.map((segment, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[var(--accent)]"
                >
                  <h4 className="font-medium text-[var(--foreground)]">
                    {segment.name}
                  </h4>
                  {segment.highlight && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {segment.highlight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="demos" title="Demographics" icon={Target} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('demos') ? 'max-h-96 p-4' : 'max-h-0'
          )}>
            <div className="grid gap-4 sm:grid-cols-3">
              {program.demos.core && (
                <div className="p-4 rounded-lg bg-[var(--info)]/10 border border-[var(--info)]/20">
                  <h4 className="font-medium text-[var(--info)] text-sm">Core</h4>
                  <p className="text-[var(--foreground)] mt-1">{program.demos.core}</p>
                </div>
              )}
              {program.demos.secondary && (
                <div className="p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  <h4 className="font-medium text-[var(--primary)] text-sm">Secondary</h4>
                  <p className="text-[var(--foreground)] mt-1">{program.demos.secondary}</p>
                </div>
              )}
              {program.demos.broad_demo && (
                <div className="p-4 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                  <h4 className="font-medium text-[var(--muted-foreground)] text-sm">Broad</h4>
                  <p className="text-[var(--foreground)] mt-1">{program.demos.broad_demo}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation Plan */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="activation" title="Activation Plan" icon={Compass} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('activation') ? 'max-h-96 p-4' : 'max-h-0'
          )}>
            <ul className="space-y-3">
              {program.activation_plan.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[var(--foreground)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {program.persona_insights.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="insights" title="Persona Insights" icon={BarChart3} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('insights') ? 'max-h-96 p-4' : 'max-h-0'
            )}>
              <ul className="space-y-2">
                {program.persona_insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[var(--primary)]">&bull;</span>
                    <span className="text-[var(--foreground)]">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Anchors */}
      {program.category_anchors && program.category_anchors.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="category_anchors" title="Category Anchors" icon={Target} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('category_anchors') ? 'max-h-96 p-4' : 'max-h-0'
            )}>
              <div className="flex flex-wrap gap-2">
                {program.category_anchors.map((anchor, index) => (
                  <Badge key={index} variant="info" className="px-3 py-1.5 text-sm">
                    {anchor}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multicultural Expressions */}
      {program.multicultural_expressions && program.multicultural_expressions.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="multicultural" title="Multicultural Expressions" icon={Users} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('multicultural') ? 'max-h-96 p-4' : 'max-h-0'
            )}>
              <div className="flex flex-wrap gap-2">
                {program.multicultural_expressions.map((expr, index) => (
                  <Badge key={index} variant="default" className="px-3 py-1.5 text-sm">
                    {expr}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Culture Segments */}
      {program.local_culture_segments && program.local_culture_segments.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="local_culture" title="Local Culture Segments" icon={Compass} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('local_culture') ? 'max-h-96 p-4' : 'max-h-0'
            )}>
              <div className="flex flex-wrap gap-2">
                {program.local_culture_segments.map((segment, index) => (
                  <Badge key={index} variant="default" className="px-3 py-1.5 text-sm">
                    {segment}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* M4: Local Strategy */}
      {program.strategy_layers?.local_strategy && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="local_strategy" title="Local Strategy" icon={MapPin} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('local_strategy') ? 'max-h-[800px] p-4' : 'max-h-0'
            )}>
              <div className="space-y-4">
                {program.strategy_layers.local_strategy.dmas && program.strategy_layers.local_strategy.dmas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Target DMAs</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.strategy_layers.local_strategy.dmas.map((dma, idx) => (
                        <Badge key={idx} variant="info" className="px-3 py-1.5 text-sm">{dma}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {program.strategy_layers.local_strategy.segments && program.strategy_layers.local_strategy.segments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Local Culture Segments</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.strategy_layers.local_strategy.segments.map((segment, idx) => (
                        <Badge key={idx} variant="default" className="px-3 py-1.5 text-sm">{segment}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {program.strategy_layers.local_strategy.insights && program.strategy_layers.local_strategy.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Local Insights</h4>
                    <ul className="space-y-2">
                      {program.strategy_layers.local_strategy.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--primary)]">&bull;</span>
                          <span className="text-[var(--foreground)]">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {program.strategy_layers.local_strategy.recommendations && program.strategy_layers.local_strategy.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {program.strategy_layers.local_strategy.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[var(--foreground)]">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* M4: Multicultural Strategy */}
      {program.strategy_layers?.multicultural_strategy && (
        <Card variant="elevated">
          <CardContent className="p-0">
            <SectionHeader id="multicultural_strategy" title="Multicultural Strategy" icon={Globe} />
            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has('multicultural_strategy') ? 'max-h-[800px] p-4' : 'max-h-0'
            )}>
              <div className="space-y-4">
                {program.strategy_layers.multicultural_strategy.lineages && program.strategy_layers.multicultural_strategy.lineages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Multicultural Lineages</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.strategy_layers.multicultural_strategy.lineages.map((lineage, idx) => (
                        <Badge key={idx} variant="info" className="px-3 py-1.5 text-sm">{lineage}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {program.strategy_layers.multicultural_strategy.expressions && program.strategy_layers.multicultural_strategy.expressions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Multicultural Expressions</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.strategy_layers.multicultural_strategy.expressions.map((expr, idx) => (
                        <Badge key={idx} variant="default" className="px-3 py-1.5 text-sm">{expr}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {program.strategy_layers.multicultural_strategy.insights && program.strategy_layers.multicultural_strategy.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Multicultural Insights</h4>
                    <ul className="space-y-2">
                      {program.strategy_layers.multicultural_strategy.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--primary)]">&bull;</span>
                          <span className="text-[var(--foreground)]">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {program.strategy_layers.multicultural_strategy.recommendations && program.strategy_layers.multicultural_strategy.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {program.strategy_layers.multicultural_strategy.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[var(--foreground)]">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
