'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Key,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  X,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { CampaignView, PersonaCanonEntry } from '@/types/api';

interface EditablePersona {
  name: string;
  highlight?: string | null;
  phylum?: string | null;
  locked: boolean;
}

interface PersonaFrameworkTabProps {
  campaign: CampaignView;
}

export function PersonaFrameworkTab({ campaign }: PersonaFrameworkTabProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['personas']));
  const [editMode, setEditMode] = useState(false);
  const [editablePersonas, setEditablePersonas] = useState<EditablePersona[]>([]);
  const [addPersonaInput, setAddPersonaInput] = useState('');
  const [suggestions, setSuggestions] = useState<PersonaCanonEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pj = campaign.program_json;

  const searchPersonas = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.searchPersonaCanon(
        query,
        campaign.program_json?.advertising_category || undefined,
        20,
      );
      if (res.success && res.data?.personas) {
        // Filter out personas already in the list
        const existingNames = new Set(editablePersonas.map((p) => p.name.toLowerCase()));
        setSuggestions(res.data.personas.filter((p) => !existingNames.has(p.name.toLowerCase())));
      }
    } catch {
      // Silently fail
    }
  }, [campaign.program_json?.advertising_category, editablePersonas]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (addPersonaInput.trim()) {
        searchPersonas(addPersonaInput.trim());
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [addPersonaInput, searchPersonas]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLocked =
    campaign.lifecycle_state === 'activated' ||
    campaign.lifecycle_state === 'archived';

  const enterEditMode = () => {
    if (!pj?.personas) return;
    setEditablePersonas(
      pj.personas.map((p) => ({
        name: p.name,
        highlight: p.highlight,
        phylum: p.phylum,
        locked: false,
      })),
    );
    setEditMode(true);
  };

  const removePersona = (index: number) => {
    setEditablePersonas((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleLock = (index: number) => {
    setEditablePersonas((prev) =>
      prev.map((p, i) => (i === index ? { ...p, locked: !p.locked } : p)),
    );
  };

  const movePersona = (index: number, direction: 'up' | 'down') => {
    setEditablePersonas((prev) => {
      const arr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= arr.length) return arr;
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      return arr;
    });
  };

  const addPersona = (personaName?: string) => {
    const name = (personaName || addPersonaInput).trim();
    if (!name) return;
    if (editablePersonas.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    setEditablePersonas((prev) => [...prev, { name, highlight: null, phylum: null, locked: false }]);
    setAddPersonaInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const applyChanges = () => {
    const lockedNames = editablePersonas.filter((p) => p.locked).map((p) => p.name);
    const currentNames = editablePersonas.map((p) => p.name);
    const originalNames = pj?.personas?.map((p) => p.name) || [];

    const added = currentNames.filter((n) => !originalNames.includes(n));
    const removed = originalNames.filter((n) => !currentNames.includes(n));

    let instruction = `Rebuild this campaign with the following persona changes:`;
    if (removed.length > 0) instruction += ` Remove: ${removed.join(', ')}.`;
    if (added.length > 0) instruction += ` Add: ${added.join(', ')}.`;
    if (lockedNames.length > 0) instruction += ` Keep locked (must remain): ${lockedNames.join(', ')}.`;
    instruction += ` Final portfolio should have ${currentNames.length} personas in this order: ${currentNames.join(', ')}.`;
    instruction += ` Recalculate portfolio, insights, activation plan, and cultural overlays.`;

    const encoded = encodeURIComponent(instruction);
    router.push(`/chat?campaign_id=${campaign.id}&prefill=${encoded}`);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditablePersonas([]);
    setAddPersonaInput('');
  };

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

  const hasMulticultural =
    (pj.multicultural_expressions?.length ?? 0) > 0 ||
    (pj.multicultural_lineages?.length ?? 0) > 0;
  const hasLocal = (pj.local_culture_segments?.length ?? 0) > 0;

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
              Persona Portfolio ({editMode ? editablePersonas.length : (pj.personas?.length ?? 0)})
            </span>
            <span className="flex items-center gap-2">
              {!editMode && !isLocked && pj.personas?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    enterEditMode();
                  }}
                  className="p-1 rounded hover:bg-[var(--border)] transition-colors"
                  title="Edit personas"
                >
                  <Pencil className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              )}
              {expanded.has('personas') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </CardTitle>
        </CardHeader>
        {expanded.has('personas') && (
          <CardContent>
            {editMode ? (
              /* Editable Persona Panel */
              <div className="space-y-3">
                {editablePersonas.map((p, index) => (
                  <div
                    key={`${p.name}-${index}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[var(--accent)]"
                  >
                    {/* Re-rank controls */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => movePersona(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => movePersona(index, 'down')}
                        disabled={index === editablePersonas.length - 1}
                        className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Persona info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      {p.highlight && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                          {p.highlight}
                        </p>
                      )}
                    </div>

                    {/* Lock toggle */}
                    <button
                      onClick={() => toggleLock(index)}
                      className="p-1.5 rounded hover:bg-[var(--border)] transition-colors"
                      title={p.locked ? 'Unlock persona' : 'Lock persona'}
                    >
                      {p.locked ? (
                        <Lock className="h-3.5 w-3.5 text-[var(--primary)]" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      )}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removePersona(index)}
                      disabled={p.locked}
                      className="p-1.5 rounded hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                      title="Remove persona"
                    >
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                ))}

                {/* Add persona input with autocomplete */}
                <div className="relative pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={addPersonaInput}
                      onChange={(e) => {
                        setAddPersonaInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === 'Enter' && addPersona()}
                      placeholder="Search persona canon..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <button
                      onClick={() => addPersona()}
                      disabled={!addPersonaInput.trim()}
                      className="p-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 right-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg z-10"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={`${s.name}-${s.category}`}
                          onClick={() => addPersona(s.name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent)] transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={applyChanges}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Read-only persona display */
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
            )}
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

      {/* Cultural Modifiers (merged from Cultural tab) */}
      {(hasMulticultural || hasLocal) && (
        <Card variant="elevated">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => toggle('cultural')}
          >
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[var(--primary)]" />
                Cultural Modifiers
              </span>
              {expanded.has('cultural') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expanded.has('cultural') && (
            <CardContent className="space-y-4">
              {/* Multicultural Expressions */}
              {pj.multicultural_expressions && pj.multicultural_expressions.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    Multicultural Expressions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pj.multicultural_expressions.map((expr) => (
                      <Badge key={expr} variant="info">
                        {expr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Culture */}
              {hasLocal && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    Local Culture
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pj.local_culture_segments.map((seg) => (
                      <Badge key={seg} variant="success">
                        <MapPin className="h-3 w-3 mr-1" />
                        {seg}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
