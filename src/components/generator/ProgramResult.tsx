'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
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
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgramResultProps {
  result: GenerateProgramResponse;
}

export function ProgramResult({ result }: ProgramResultProps) {
  const { program_json: program, program_text } = result;
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personas']));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(program_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500" />
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
              <Badge variant="info" className="mt-2">{program.advertising_category}</Badge>
            </div>
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
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {persona.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {persona.highlight}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="info" className="text-xs">{persona.category}</Badge>
                      <Badge variant="default" className="text-xs">{persona.phylum}</Badge>
                    </div>
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
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {segment.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {segment.highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card variant="elevated">
        <CardContent className="p-0">
          <SectionHeader id="demos" title="Target Demographics" icon={Target} />
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expandedSections.has('demos') ? 'max-h-96 p-4' : 'max-h-0'
          )}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Core</h4>
                <p className="text-blue-700 dark:text-blue-400 mt-1">{program.demos.core}</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <h4 className="font-medium text-indigo-900 dark:text-indigo-300 text-sm">Secondary</h4>
                <p className="text-indigo-700 dark:text-indigo-400 mt-1">{program.demos.secondary}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 text-sm">Broad</h4>
                <p className="text-purple-700 dark:text-purple-400 mt-1">{program.demos.broad}</p>
              </div>
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
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
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
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
