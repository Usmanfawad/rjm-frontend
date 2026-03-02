'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  X,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Plus,
  Hash,
  Globe,
  MapPin,
  BarChart3,
  Settings2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui';
import { api } from '@/lib/api';
import type { CampaignView, PersonaCanonEntry } from '@/types/api';

interface EditablePersona {
  name: string;
  highlight?: string | null;
  locked: boolean;
}

interface CustomizeTabProps {
  campaign: CampaignView;
  scrollToEditing?: boolean;
}

export function CustomizeTab({ campaign, scrollToEditing }: CustomizeTabProps) {
  const pj = campaign.program_json;
  const editingSectionRef = useRef<HTMLDivElement>(null);

  const isLocked =
    campaign.lifecycle_state === 'live' ||
    campaign.lifecycle_state === 'archived';

  // Scroll to persona editing section when triggered from Framework tab pencil icon
  useEffect(() => {
    if (scrollToEditing && editingSectionRef.current) {
      editingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      editingSectionRef.current.classList.add('ring-2', 'ring-[var(--primary)]', 'rounded-lg');
      const timer = setTimeout(() => {
        editingSectionRef.current?.classList.remove('ring-2', 'ring-[var(--primary)]', 'rounded-lg');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scrollToEditing]);

  // Persona editing state
  const [editablePersonas, setEditablePersonas] = useState<EditablePersona[]>(() =>
    (pj?.personas || []).map((p) => ({
      name: p.name,
      highlight: p.highlight,
      locked: false,
    })),
  );
  const [addPersonaInput, setAddPersonaInput] = useState('');
  const [suggestions, setSuggestions] = useState<PersonaCanonEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refinement state
  const [personaCount, setPersonaCount] = useState<string>(
    pj?.personas?.length?.toString() || '15',
  );
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [constraints, setConstraints] = useState('');

  // Apply state
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const searchPersonas = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.searchPersonaCanon(
        query,
        pj?.advertising_category || undefined,
        20,
      );
      if (res.success && res.data?.personas) {
        const existingNames = new Set(editablePersonas.map((p) => p.name.toLowerCase()));
        setSuggestions(res.data.personas.filter((p) => !existingNames.has(p.name.toLowerCase())));
      }
    } catch {
      // Silently fail
    }
  }, [pj?.advertising_category, editablePersonas]);

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
    setEditablePersonas((prev) => [...prev, { name, highlight: null, locked: false }]);
    setAddPersonaInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Apply all persona changes via rebuild endpoint
  const applyChanges = async () => {
    setApplyError('');
    const currentNames = editablePersonas.map((p) => p.name);
    const originalNames = pj?.personas?.map((p) => p.name) || [];
    const added = currentNames.filter((n) => !originalNames.includes(n));
    const removed = originalNames.filter((n) => !currentNames.includes(n));
    const lockedNames = editablePersonas.filter((p) => p.locked).map((p) => p.name);

    // If only reorders (no additions or removals), apply directly via PATCH
    if (added.length === 0 && removed.length === 0) {
      setApplying(true);
      try {
        const updatedPersonas = editablePersonas.map((ep) => {
          const original = pj?.personas?.find((p) => p.name === ep.name);
          return original || { name: ep.name, highlight: ep.highlight };
        });
        const updatedJson = { ...pj, personas: updatedPersonas };
        const res = await api.updatePersonaGeneration(campaign.id, {
          program_json: updatedJson as import('@/types/api').ProgramJSON,
        });
        if (res.success) {
          window.location.reload();
        } else {
          setApplyError('Update failed. Please try again.');
        }
      } catch {
        setApplyError('Update failed. Please try again.');
      } finally {
        setApplying(false);
      }
      return;
    }

    // For additions/removals, use the rebuild endpoint
    setApplying(true);
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        requested_personas: added.length > 0 ? currentNames : undefined,
        locked_personas: lockedNames.length > 0 ? lockedNames : undefined,
        removed_personas: removed.length > 0 ? removed : undefined,
        persona_count: currentNames.length,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Rebuild failed. Please try again.');
      }
    } catch {
      setApplyError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleAdjustCount = async () => {
    const count = parseInt(personaCount, 10);
    if (!count || count < 1 || count > 20) {
      setApplyError('Persona count must be between 1 and 20.');
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        persona_count: count,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Rebuild failed. Please try again.');
      }
    } catch {
      setApplyError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleReplacePersona = async () => {
    if (!replaceFrom.trim()) return;
    setApplying(true);
    setApplyError('');
    try {
      const currentNames = editablePersonas.map((p) => p.name);
      const removed = [replaceFrom.trim()];
      const requested = replaceTo.trim()
        ? currentNames.filter((n) => n !== replaceFrom.trim()).concat(replaceTo.trim())
        : currentNames.filter((n) => n !== replaceFrom.trim());

      const res = await api.rebuildGeneration(campaign.id, {
        requested_personas: requested,
        removed_personas: removed,
        persona_count: requested.length,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Rebuild failed. Please try again.');
      }
    } catch {
      setApplyError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleMulticulturalOverlay = async () => {
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        apply_multicultural_overlay: true,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Overlay application failed. Please try again.');
      }
    } catch {
      setApplyError('Overlay application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleLocalOverlay = async () => {
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        apply_local_overlay: true,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Overlay application failed. Please try again.');
      }
    } catch {
      setApplyError('Overlay application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleGenerationalOverlay = async () => {
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        apply_generational_overlay: true,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Overlay application failed. Please try again.');
      }
    } catch {
      setApplyError('Overlay application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleRebuildWithConstraints = async () => {
    if (!constraints.trim()) return;
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        constraints: constraints.trim(),
      });
      if (res.success) {
        window.location.reload();
      } else {
        setApplyError('Rebuild failed. Please try again.');
      }
    } catch {
      setApplyError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLocked && (
        <div className="p-4 rounded-lg border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This campaign is {campaign.lifecycle_state} and cannot be customized.
          </p>
        </div>
      )}

      {applyError && (
        <div className="p-3 rounded-lg border border-red-400/30 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{applyError}</p>
        </div>
      )}

      {/* Persona Editing */}
      <div ref={editingSectionRef} className="transition-all duration-300">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--primary)]" />
            Persona Editing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {editablePersonas.map((p, index) => (
              <div
                key={`${p.name}-${index}`}
                className="flex items-center gap-2 p-3 rounded-lg bg-[var(--accent)]"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => movePersona(index, 'up')}
                    disabled={index === 0 || isLocked}
                    className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => movePersona(index, 'down')}
                    disabled={index === editablePersonas.length - 1 || isLocked}
                    className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  {p.highlight && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                      {p.highlight}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleLock(index)}
                  disabled={isLocked}
                  className="p-1.5 rounded hover:bg-[var(--border)] transition-colors disabled:opacity-50"
                  title={p.locked ? 'Unlock persona' : 'Lock persona'}
                >
                  {p.locked ? (
                    <Lock className="h-3.5 w-3.5 text-[var(--primary)]" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  )}
                </button>
                <button
                  onClick={() => removePersona(index)}
                  disabled={p.locked || isLocked}
                  className="p-1.5 rounded hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                  title="Remove persona"
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            ))}

            {/* Add persona input */}
            {!isLocked && (
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
                    placeholder="Search personas to add..."
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
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent)] transition-colors"
                      >
                        <span className="font-medium">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Apply Changes */}
            {!isLocked && (
              <div className="pt-2">
                <button
                  onClick={applyChanges}
                  disabled={applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </span>
                  ) : (
                    'Apply Changes'
                  )}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Overlay Controls */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Overlays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Adjust Persona Count */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Adjust Persona Count</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={personaCount}
                  onChange={(e) => setPersonaCount(e.target.value)}
                  className="w-24"
                  disabled={isLocked || applying}
                />
                <button
                  onClick={handleAdjustCount}
                  disabled={isLocked || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Replace Persona */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Replace Persona</p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Persona to remove..."
                  value={replaceFrom}
                  onChange={(e) => setReplaceFrom(e.target.value)}
                  disabled={isLocked || applying}
                />
                <Input
                  placeholder="Replace with (leave blank to just remove)..."
                  value={replaceTo}
                  onChange={(e) => setReplaceTo(e.target.value)}
                  disabled={isLocked || applying}
                />
                <button
                  onClick={handleReplacePersona}
                  disabled={isLocked || !replaceFrom.trim() || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Generational Overlay */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Generational Overlay</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Apply generational cohort segments based on campaign objectives.
              </p>
              <button
                onClick={handleGenerationalOverlay}
                disabled={isLocked || applying}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply Overlay'}
              </button>
            </div>

            {/* Multicultural Overlay */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Multicultural Overlay</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Detect and apply multicultural expressions based on the campaign brief.
              </p>
              <button
                onClick={handleMulticulturalOverlay}
                disabled={isLocked || applying}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply Overlay'}
              </button>
            </div>

            {/* Local Overlay */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Local Overlay</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Detect and apply local DMA culture segments based on the campaign brief.
              </p>
              <button
                onClick={handleLocalOverlay}
                disabled={isLocked || applying}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply Overlay'}
              </button>
            </div>

            {/* Rebuild With Constraints */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Rebuild With Constraints</p>
              </div>
              <div className="space-y-2">
                <textarea
                  placeholder="Describe constraints for rebuilding..."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  disabled={isLocked || applying}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 resize-none"
                />
                <button
                  onClick={handleRebuildWithConstraints}
                  disabled={isLocked || !constraints.trim() || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Rebuild'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
