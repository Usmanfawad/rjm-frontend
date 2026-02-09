'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea } from '@/components/ui';
import { useAuthGuard } from '@/hooks';
import { api } from '@/lib/api';
import { Globe, MapPin, Users, BarChart3, Search, ChevronDown, ChevronUp, Settings, Save } from 'lucide-react';

interface LineageInfo {
  name: string;
  description?: string;
  expressions?: string[];
}

interface DmaInfo {
  name: string;
  region?: string;
}

export default function CulturalActivationPage() {
  const { isReady } = useAuthGuard();

  // Data state
  const [lineages, setLineages] = useState<LineageInfo[]>([]);
  const [dmas, setDmas] = useState<DmaInfo[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Analysis state
  const [analysisBrand, setAnalysisBrand] = useState('');
  const [analysisBrief, setAnalysisBrief] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Config state
  const [config, setConfig] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configLineages, setConfigLineages] = useState('');
  const [configDmas, setConfigDmas] = useState('');

  // Expanded sections
  const [showLineages, setShowLineages] = useState(true);
  const [showDmas, setShowDmas] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lineagesRes, dmasRes, statsRes, configRes] = await Promise.all([
        api.getLineages(),
        api.getDmas(),
        api.getCulturalStats(),
        api.getCulturalConfig(),
      ]);

      if (lineagesRes.success && lineagesRes.data) {
        const data = lineagesRes.data;
        setLineages(Array.isArray(data) ? data : data.lineages || []);
      }
      if (dmasRes.success && dmasRes.data) {
        const data = dmasRes.data;
        setDmas(Array.isArray(data) ? data : data.dmas || []);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
        setConfigLineages((configRes.data.default_multicultural_lineages || []).join(', '));
        setConfigDmas((configRes.data.default_dmas || []).join(', '));
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [isReady, fetchData]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisBrand.trim() || !analysisBrief.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await api.analyzeBrief({
        brand_name: analysisBrand.trim(),
        brief: analysisBrief.trim(),
      });
      if (response.success && response.data) {
        setAnalysisResult(response.data);
      }
    } catch {
      // Handle error
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const lineagesList = configLineages.split(',').map(s => s.trim()).filter(Boolean);
      const dmasList = configDmas.split(',').map(s => s.trim()).filter(Boolean);
      const response = await api.updateCulturalConfig({
        default_multicultural_lineages: lineagesList.length > 0 ? lineagesList : [],
        default_dmas: dmasList.length > 0 ? dmasList : [],
      });
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch {
      // Handle error
    } finally {
      setSavingConfig(false);
    }
  };

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading cultural activation data..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <PageHeader
          title="Cultural Activation"
          description="Explore multicultural lineages, local DMAs, and analyze briefs for cultural signals"
        />

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total_lineages ?? lineages.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Lineages</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total_dmas ?? dmas.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">DMAs</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total_expressions ?? '—'}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Expressions</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total_activations ?? '—'}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Activations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configuration */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Activation Configuration
              </CardTitle>
              {showConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CardHeader>
          {showConfig && config && (
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Multicultural Mode</p>
                  <p className="text-sm capitalize">{(config.multicultural_mode || 'auto').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Local Culture Mode</p>
                  <p className="text-sm capitalize">{(config.local_culture_mode || 'auto').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Multicultural Confidence</p>
                  <p className="text-sm">{config.multicultural_confidence_threshold ?? 0.5}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Local Confidence</p>
                  <p className="text-sm">{config.local_confidence_threshold ?? 0.5}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Input
                  label="Default Multicultural Lineages"
                  placeholder="e.g. African American, Hispanic (comma-separated)"
                  value={configLineages}
                  onChange={(e) => setConfigLineages(e.target.value)}
                />
                <Input
                  label="Default Local DMAs"
                  placeholder="e.g. New York, Los Angeles (comma-separated)"
                  value={configDmas}
                  onChange={(e) => setConfigDmas(e.target.value)}
                />
                <Button onClick={handleSaveConfig} isLoading={savingConfig} disabled={savingConfig} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Brief Analysis */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Analyze Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Input
                  label="Brand Name"
                  placeholder="Enter brand name"
                  value={analysisBrand}
                  onChange={(e) => setAnalysisBrand(e.target.value)}
                />
                <Textarea
                  label="Brief"
                  placeholder="Paste your campaign brief to detect cultural signals..."
                  value={analysisBrief}
                  onChange={(e) => setAnalysisBrief(e.target.value)}
                  rows={4}
                />
                <Button type="submit" className="w-full" isLoading={analyzing} disabled={analyzing || !analysisBrand.trim() || !analysisBrief.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Cultural Signals
                </Button>
              </form>

              {analysisResult && (
                <div className="mt-4 p-4 rounded-lg bg-[var(--accent)] space-y-3">
                  <p className="text-sm font-medium">Analysis Results</p>
                  {analysisResult.detected_lineages && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Detected Lineages</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(analysisResult.detected_lineages) ? analysisResult.detected_lineages : []).map((l: string) => (
                          <span key={l} className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysisResult.detected_dmas && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Detected DMAs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(analysisResult.detected_dmas) ? analysisResult.detected_dmas : []).map((d: string) => (
                          <span key={d} className="px-2 py-0.5 text-xs rounded-full bg-[var(--info)]/10 text-[var(--info)]">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysisResult.campaign_type && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Recommended Campaign Type</p>
                      <p className="text-sm font-medium mt-1 capitalize">{analysisResult.campaign_type.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {analysisResult.cultural_signals && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Cultural Signals</p>
                      <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                        {typeof analysisResult.cultural_signals === 'string'
                          ? analysisResult.cultural_signals
                          : JSON.stringify(analysisResult.cultural_signals, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lineages & DMAs Reference */}
          <div className="space-y-6">
            {/* Lineages */}
            <Card variant="elevated">
              <CardHeader>
                <button
                  onClick={() => setShowLineages(!showLineages)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Multicultural Lineages ({lineages.length})
                  </CardTitle>
                  {showLineages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CardHeader>
              {showLineages && (
                <CardContent>
                  {lineages.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">No lineages available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {lineages.map((lineage) => (
                        <span
                          key={typeof lineage === 'string' ? lineage : lineage.name}
                          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                        >
                          {typeof lineage === 'string' ? lineage : lineage.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* DMAs */}
            <Card variant="elevated">
              <CardHeader>
                <button
                  onClick={() => setShowDmas(!showDmas)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Local DMAs ({dmas.length})
                  </CardTitle>
                  {showDmas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CardHeader>
              {showDmas && (
                <CardContent>
                  {dmas.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">No DMAs available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dmas.map((dma) => (
                        <span
                          key={typeof dma === 'string' ? dma : dma.name}
                          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent)] border border-[var(--border)] hover:border-[var(--info)] transition-colors"
                        >
                          {typeof dma === 'string' ? dma : dma.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
