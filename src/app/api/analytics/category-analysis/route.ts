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
    const allReports = await ReportModel.find(filter).lean();

    // Define category tips
    const categoryTips: Record<string, string[]> = {
      readability: [
        'Use clear variable names that describe their purpose',
        'Break long functions into smaller, focused units',
        'Add comments for complex logic',
        'Keep lines under 80 characters when possible',
        'Maintain consistent indentation and formatting',
      ],
      modularity: [
        'Each function should have a single responsibility',
        'Reduce coupling between modules',
        'Create reusable utility functions',
        'Organize related functionality into modules',
        'Avoid circular dependencies',
      ],
      bug: [
        'Add null/undefined checks for all inputs',
        'Handle edge cases explicitly',
        'Use consistent error handling',
        'Test boundary conditions',
        'Avoid type coercion issues',
      ],
      performance: [
        'Use algorithms with better time complexity',
        'Cache frequently used calculations',
        'Avoid unnecessary loops and iterations',
        'Optimize database queries',
        'Profile code before optimizing',
      ],
      security: [
        'Validate all user inputs',
        'Use parameterized queries to prevent SQL injection',
        'Keep dependencies updated',
        'Never hardcode secrets in code',
        'Use HTTPS and proper authentication',
      ],
      'best-practice': [
        'Follow language conventions and style guides',
        'Write unit tests for critical paths',
        'Document public APIs and functions',
        'Use version control effectively',
        'Keep code DRY (Don\'t Repeat Yourself)',
      ],
    };

    // Group issues by category
    const categoryStats = new Map<string, any>();

    allReports.forEach((report: any) => {
      report.review.issues?.forEach((issue: any) => {
        const category = issue.category || 'best-practice';

        if (!categoryStats.has(category)) {
          categoryStats.set(category, {
            category,
            count: 0,
            issues: [],
            criticalCount: 0,
            warningCount: 0,
            suggestionCount: 0,
            reviews: 0,
          });
        }

        const stats = categoryStats.get(category);
        stats.count += 1;
        stats.issues.push({
          description: issue.description,
          severity: issue.severity,
          line: issue.line,
        });

        if (issue.severity === 'critical') stats.criticalCount += 1;
        else if (issue.severity === 'warning') stats.warningCount += 1;
        else if (issue.severity === 'suggestion') stats.suggestionCount += 1;
      });

      // Count reviews with each category
      report.review.issues?.forEach((issue: any) => {
        const category = issue.category || 'best-practice';
        if (categoryStats.has(category)) {
          // Mark this review as having this category (avoid double counting)
          if (!categoryStats.get(category).reviewIds) {
            categoryStats.get(category).reviewIds = new Set();
          }
          categoryStats.get(category).reviewIds.add(report._id?.toString());
        }
      });
    });

    // Get top 5 issues per category and prepare response
    const categories = Array.from(categoryStats.values())
      .map((stats: any) => {
        // Get top 5 issues by frequency
        const issueFreq = new Map<string, number>();
        stats.issues.forEach((issue: any) => {
          const key = issue.description.substring(0, 50);
          issueFreq.set(key, (issueFreq.get(key) || 0) + 1);
        });

        const topIssues = Array.from(issueFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([description, count]) => ({ description, count }));

        return {
          category: stats.category,
          totalIssues: stats.count,
          affectedReviews: stats.reviewIds?.size || 0,
          criticalCount: stats.criticalCount,
          warningCount: stats.warningCount,
          suggestionCount: stats.suggestionCount,
          avgPerReview: stats.reviewIds?.size ? Math.round((stats.count / stats.reviewIds.size) * 10) / 10 : 0,
          topIssues,
          tips: categoryTips[stats.category as keyof typeof categoryTips] || [],
        };
      })
      .sort((a: any, b: any) => b.totalIssues - a.totalIssues);

    return NextResponse.json({
      success: true,
      categories,
      totalCategories: categories.length,
      mostCommonCategory: categories[0]?.category || 'N/A',
      mostCommonCount: categories[0]?.totalIssues || 0,
    });
  } catch (error) {
    console.error('Category analysis fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category analysis' },
      { status: 500 }
    );
  }
}
