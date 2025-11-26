'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Lightbulb, BookOpen } from 'lucide-react';

interface CategoryData {
  category: string;
  totalIssues: number;
  affectedReviews: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  avgPerReview: number;
  topIssues: Array<{ description: string; count: number }>;
  tips: string[];
}

interface CategoryDeepDiveProps {
  days?: number;
  sessionId?: string;
}

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  readability: { bg: 'bg-blue-900/30', border: 'border-blue-700/50', icon: '📖' },
  modularity: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', icon: '🧩' },
  bug: { bg: 'bg-red-900/30', border: 'border-red-700/50', icon: '🐛' },
  performance: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', icon: '⚡' },
  security: { bg: 'bg-orange-900/30', border: 'border-orange-700/50', icon: '🔐' },
  'best-practice': { bg: 'bg-green-900/30', border: 'border-green-700/50', icon: '✅' },
};

export function CategoryDeepDive({ days = 90, sessionId }: CategoryDeepDiveProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.set('days', String(days));
        if (sessionId) {
          params.set('sessionId', sessionId);
        }
        const response = await fetch(`/api/analytics/category-analysis?${params.toString()}`);
        const result = await response.json();

        if (result.categories && result.categories.length > 0) {
          setCategories(result.categories);
          setActiveCategory(result.categories[0].category);
        }
      } catch (error) {
        console.error('Failed to fetch category analysis:', error);
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
          <CardTitle>Issue Category Deep Dive</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue Category Deep Dive</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-900 rounded">
            <div className="text-slate-400">No category data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCategory = categories.find(c => c.category === activeCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Issue Category Deep Dive
        </CardTitle>
        <CardDescription>Detailed analysis of issues by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat.category} value={cat.category} className="text-xs capitalize">
                {cat.category.split('-')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.category} value={category.category} className="space-y-4">
              {/* Stats Grid */}
              <div className={`rounded-lg border p-4 ${categoryColors[category.category as keyof typeof categoryColors]?.bg} ${categoryColors[category.category as keyof typeof categoryColors]?.border}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Issues</p>
                    <p className="text-2xl font-bold text-slate-100">{category.totalIssues}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Affected Reviews</p>
                    <p className="text-2xl font-bold text-slate-100">{category.affectedReviews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Avg per Review</p>
                    <p className="text-2xl font-bold text-slate-100">{category.avgPerReview}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Severity Mix</p>
                    <p className="text-xs text-slate-300 mt-1">
                      {category.criticalCount > 0 && <span className="text-red-400">{category.criticalCount}🔴 </span>}
                      {category.warningCount > 0 && <span className="text-yellow-400">{category.warningCount}🟡 </span>}
                      {category.suggestionCount > 0 && <span className="text-blue-400">{category.suggestionCount}🔵</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Severity Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Severity Breakdown</h4>
                <div className="space-y-2">
                  {category.criticalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded h-2">
                        <div
                          className="bg-red-500 h-full rounded"
                          style={{ width: `${(category.criticalCount / category.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-red-400 w-20">{category.criticalCount} Critical</span>
                    </div>
                  )}
                  {category.warningCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded h-2">
                        <div
                          className="bg-yellow-500 h-full rounded"
                          style={{ width: `${(category.warningCount / category.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-yellow-400 w-20">{category.warningCount} Warning</span>
                    </div>
                  )}
                  {category.suggestionCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded h-2">
                        <div
                          className="bg-blue-500 h-full rounded"
                          style={{ width: `${(category.suggestionCount / category.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-blue-400 w-20">{category.suggestionCount} Suggestion</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Issues */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Top Issues in this Category</h4>
                <div className="space-y-2">
                  {category.topIssues.map((issue, idx) => (
                    <div key={idx} className="bg-slate-900 rounded p-3 border border-slate-800 flex items-start gap-3">
                      <div className="text-xl">{idx + 1}️⃣</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 wrap-break-word">{issue.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{issue.count} occurrences</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices & Tips */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Best Practices & Tips
                </h4>
                <div className="space-y-2">
                  {category.tips.map((tip, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded p-3 border border-slate-800 flex gap-3">
                      <div className="text-sm text-cyan-400 font-bold shrink-0">💡</div>
                      <p className="text-sm text-slate-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
