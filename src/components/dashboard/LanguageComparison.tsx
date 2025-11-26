'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface LanguageStats {
  language: string;
  count: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  totalIssues: number;
  avgIssuesPerReview: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  trend: number;
}

interface LanguageComparisonProps {
  days?: number;
}

export function LanguageComparison({ days = 90 }: LanguageComparisonProps) {
  const [languages, setLanguages] = useState<LanguageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestLanguage, setBestLanguage] = useState<string>('');
  const [bestScore, setBestScore] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/language-comparison?days=${days}`);
        const result = await response.json();

        if (result.languages) {
          setLanguages(result.languages);
          setBestLanguage(result.bestLanguage);
          setBestScore(result.bestScore);
        }
      } catch (error) {
        console.error('Failed to fetch language comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days || 90]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Language Performance Comparison</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Language Performance Comparison</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-900 rounded">
            <div className="text-slate-400">No language data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find max score for scaling
  const maxScore = Math.max(...languages.map(l => l.avgScore), 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Language Performance Comparison
        </CardTitle>
        <CardDescription>Average code quality scores across languages (last {days} days)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Best Language Badge */}
          {bestLanguage && (
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-300">🏆 Best Performing Language</h4>
                  <p className="text-2xl font-bold text-green-400 mt-1">{bestLanguage.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{bestScore}</div>
                  <p className="text-xs text-slate-500">/10</p>
                </div>
              </div>
            </div>
          )}

          {/* Language Bars */}
          <div className="space-y-4">
            {languages.map((lang, index) => {
              const scorePercent = (lang.avgScore / maxScore) * 100;
              const trendColor = lang.trend > 0 ? 'text-green-400' : lang.trend < 0 ? 'text-red-400' : 'text-slate-500';
              const trendIcon = lang.trend > 0 ? <TrendingUp className="w-4 h-4" /> : lang.trend < 0 ? <TrendingDown className="w-4 h-4" /> : null;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 capitalize">{lang.language}</h4>
                      <p className="text-xs text-slate-500">{lang.count} reviews</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">{lang.avgScore}</div>
                        <p className="text-xs text-slate-500">avg score</p>
                      </div>
                      {trendIcon && <span className={`${trendColor}`}>{trendIcon}</span>}
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        lang.avgScore >= 7
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : lang.avgScore >= 5
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    ></div>
                  </div>

                  {/* Issue Stats */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900 rounded p-2 border border-slate-800">
                      <p className="text-red-400 font-semibold">{lang.criticalCount}</p>
                      <p className="text-slate-500">Critical</p>
                    </div>
                    <div className="bg-slate-900 rounded p-2 border border-slate-800">
                      <p className="text-yellow-400 font-semibold">{lang.warningCount}</p>
                      <p className="text-slate-500">Warning</p>
                    </div>
                    <div className="bg-slate-900 rounded p-2 border border-slate-800">
                      <p className="text-blue-400 font-semibold">{lang.suggestionCount}</p>
                      <p className="text-slate-500">Suggestion</p>
                    </div>
                    <div className="bg-slate-900 rounded p-2 border border-slate-800">
                      <p className="text-cyan-400 font-semibold">{lang.avgIssuesPerReview}</p>
                      <p className="text-slate-500">Avg/Review</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Comparing {languages.length} languages across {languages.reduce((sum, l) => sum + l.count, 0)} total reviews
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
