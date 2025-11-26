import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '90');

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const filter = { createdAt: { $gte: startDate } };

    // Get all reports matching the filter
    const allReports = await ReportModel.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    // Analyze patterns for recommendations
    const recommendations: Array<{
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
    }> = [];

    // 1. Find most common critical issues
    const criticalIssues = new Map<string, { count: number; reviewCount: number; examples: string[] }>();
    const reviewsWithCritical = new Set<string>();

    allReports.forEach((report: any) => {
      report.review.issues?.forEach((issue: any) => {
        if (issue.severity === 'critical') {
          const key = issue.description.substring(0, 50);
          if (!criticalIssues.has(key)) {
            criticalIssues.set(key, { count: 0, reviewCount: 0, examples: [] });
          }
          const stats = criticalIssues.get(key)!;
          stats.count += 1;
          stats.examples.push(issue.description);
          reviewsWithCritical.add(report._id?.toString());
        }
      });
    });

    // Top critical issues -> high impact recommendations
    Array.from(criticalIssues.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([issue, stats], index) => {
        recommendations.push({
          id: `crit-${index}`,
          title: `Fix Critical: ${issue.substring(0, 40)}...`,
          description: issue,
          impact: 'high',
          difficulty: 'medium',
          affectedReviews: reviewsWithCritical.size,
          issueCount: stats.count,
          category: 'critical',
          suggestion: `This critical issue appears in ${stats.count} places. Focus on understanding the root cause and implementing a systematic fix across all occurrences.`,
          potentialScoreIncrease: Math.min(2 + (stats.count * 0.1), 3),
        });
      });

    // 2. Find category patterns
    const categoryIssueCount = new Map<string, number>();
    const categoryReviewCount = new Map<string, Set<string>>();

    allReports.forEach((report: any) => {
      report.review.issues?.forEach((issue: any) => {
        const category = issue.category || 'best-practice';
        categoryIssueCount.set(category, (categoryIssueCount.get(category) || 0) + 1);

        if (!categoryReviewCount.has(category)) {
          categoryReviewCount.set(category, new Set());
        }
        categoryReviewCount.get(category)!.add(report._id?.toString());
      });
    });

    // Top category issues -> medium impact recommendations
    Array.from(categoryIssueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([category, count], index) => {
        const reviewCount = categoryReviewCount.get(category)?.size || 0;
        recommendations.push({
          id: `cat-${index}`,
          title: `Improve ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          description: `${category.toUpperCase()} issues found in ${reviewCount} reviews (${count} total issues)`,
          impact: 'high',
          difficulty: 'medium',
          affectedReviews: reviewCount,
          issueCount: count,
          category,
          suggestion: `Establish team guidelines and code review checklist for ${category} best practices. Consider automated linting rules.`,
          potentialScoreIncrease: Math.min(1 + (count * 0.05), 2),
        });
      });

    // 3. Find low-hanging fruit (warnings that appear frequently)
    const warningIssues = new Map<string, number>();
    allReports.forEach((report: any) => {
      report.review.issues?.forEach((issue: any) => {
        if (issue.severity === 'warning') {
          const key = issue.description.substring(0, 50);
          warningIssues.set(key, (warningIssues.get(key) || 0) + 1);
        }
      });
    });

    Array.from(warningIssues.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([issue, count], index) => {
        recommendations.push({
          id: `warn-${index}`,
          title: `Quick Win: ${issue.substring(0, 35)}...`,
          description: `This warning appears ${count} times - easy to fix!`,
          impact: 'medium',
          difficulty: 'easy',
          affectedReviews: count,
          issueCount: count,
          category: 'warning',
          suggestion: `Quick fix that appears ${count} times. Prioritize this - it's a quick win that will boost overall code quality score.`,
          potentialScoreIncrease: 0.5 + (count * 0.05),
        });
      });

    // 4. Code complexity recommendations
    const complexReviews = allReports.filter((r: any) => r.metadata.linesOfCode > 500);
    if (complexReviews.length > 0) {
      const avgComplexity = complexReviews.reduce((sum: number, r: any) => sum + (r.metadata.linesOfCode || 0), 0) / complexReviews.length;
      recommendations.push({
        id: 'refactor-complex',
        title: 'Refactor Complex Code',
        description: `${complexReviews.length} reviews have >500 lines (avg: ${Math.round(avgComplexity)} lines)`,
        impact: 'medium',
        difficulty: 'hard',
        affectedReviews: complexReviews.length,
        issueCount: complexReviews.reduce((sum: number, r: any) => sum + (r.review.issues?.length || 0), 0),
        category: 'modularity',
        suggestion: 'Break large files into smaller, focused modules. This will improve readability, testability, and maintainability.',
        potentialScoreIncrease: 1.5,
      });
    }

    // Sort by impact and difficulty
    recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const difficultyOrder = { easy: 3, medium: 2, hard: 1 };
      
      const scoreA = (impactOrder[a.impact] * 2) + difficultyOrder[a.difficulty];
      const scoreB = (impactOrder[b.impact] * 2) + difficultyOrder[b.difficulty];
      
      return scoreB - scoreA;
    });

    const avgScore = allReports.length > 0
      ? Math.round((allReports.reduce((sum: number, r: any) => sum + (r.review.overallScore || 0), 0) / allReports.length) * 10) / 10
      : 0;

    const potentialScore = Math.min(
      10,
      avgScore + recommendations.reduce((sum, r) => sum + r.potentialScoreIncrease, 0)
    );

    return NextResponse.json({
      success: true,
      recommendations: recommendations.slice(0, 8), // Return top 8
      currentAvgScore: avgScore,
      potentialScore,
      scoreImprovement: Math.round((potentialScore - avgScore) * 10) / 10,
      totalRecommendations: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
