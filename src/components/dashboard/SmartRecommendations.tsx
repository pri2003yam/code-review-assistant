'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Zap, CheckCircle2, Clock } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  affectedReviews: number;
  issueCount: number;
  category: string;
  suggestion: string;
  potentialScoreIncrease: number;
}

interface SmartRecommendationsProps {
  days?: number;
}

const impactColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

const difficultyColors = {
  easy: 'bg-green-900/30 border-green-700/50',
  medium: 'bg-yellow-900/30 border-yellow-700/50',
  hard: 'bg-red-900/30 border-red-700/50',
};

const difficultyIcons = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

export function SmartRecommendations({ days = 90 }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [potentialScore, setPotentialScore] = useState<number>(0);
  const [improvement, setImprovement] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/recommendations?days=${days}`);
        const result = await response.json();

        if (result.recommendations) {
          setRecommendations(result.recommendations);
          setCurrentScore(result.currentAvgScore);
          setPotentialScore(result.potentialScore);
          setImprovement(result.scoreImprovement);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
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
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>Personalized improvement suggestions prioritized by impact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Score Improvement Preview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4">
              <p className="text-xs text-slate-500 mb-1">Current Average</p>
              <p className="text-3xl font-bold text-cyan-400">{currentScore}</p>
              <p className="text-xs text-slate-500 mt-1">/10</p>
            </div>
            <div className="bg-linear-to-br from-green-900/20 to-green-800/20 rounded-lg border border-green-700/50 p-4">
              <p className="text-xs text-slate-500 mb-1">Potential Score</p>
              <p className="text-3xl font-bold text-green-400">{potentialScore}</p>
              <p className="text-xs text-slate-500 mt-1">/10</p>
            </div>
            <div className="bg-linear-to-br from-yellow-900/20 to-yellow-800/20 rounded-lg border border-yellow-700/50 p-4">
              <p className="text-xs text-slate-500 mb-1">Possible Improvement</p>
              <p className="text-3xl font-bold text-yellow-400">+{improvement}</p>
              <p className="text-xs text-slate-500 mt-1">points</p>
            </div>
          </div>

          {/* Recommendations List */}
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-4 ${difficultyColors[rec.difficulty as keyof typeof difficultyColors]}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Priority Number */}
                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <span className="text-sm font-bold text-slate-300">{idx + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title and Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-slate-100 wrap-break-word">{rec.title}</h4>
                        <div className="flex gap-1 shrink-0">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              rec.impact === 'high'
                                ? 'bg-red-900/40 text-red-300'
                                : rec.impact === 'medium'
                                ? 'bg-yellow-900/40 text-yellow-300'
                                : 'bg-blue-900/40 text-blue-300'
                            }`}
                          >
                            {rec.impact} impact
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                            {rec.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-400 mb-2">{rec.description}</p>

                      {/* Key Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Affected Reviews</p>
                          <p className="text-slate-200 font-semibold">{rec.affectedReviews}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Issue Count</p>
                          <p className="text-slate-200 font-semibold">{rec.issueCount}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Category</p>
                          <p className="text-slate-200 font-semibold capitalize">{rec.category}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Score Gain</p>
                          <p className="text-green-400 font-semibold">+{rec.potentialScoreIncrease}</p>
                        </div>
                      </div>

                      {/* Suggestion */}
                      <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                        <p className="text-xs text-slate-300 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                          <span>{rec.suggestion}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-slate-900 rounded">
              <div className="text-slate-400">No recommendations available</div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
            <p className="text-xs text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>
                By implementing these {recommendations.length} recommendations, your team can improve code quality from{' '}
                <strong className="text-cyan-400">{currentScore}</strong> to{' '}
                <strong className="text-green-400">{potentialScore}</strong> (potential improvement: <strong>+{improvement}</strong>)
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
