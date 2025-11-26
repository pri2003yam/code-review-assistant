import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language');
    const days = parseInt(searchParams.get('days') || '90');

    // Build filter
    const filter: Record<string, any> = {};
    
    if (language && language !== 'all') {
      filter.language = language;
    }

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    filter.createdAt = { $gte: startDate };

    // Get all reports matching the filter
    const allReports = await ReportModel.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    // Build trends data (score, analysis time, LOC over time)
    const trendsData = allReports.map((report) => ({
      date: report.createdAt || new Date(),
      score: report.review.overallScore,
      fileName: report.fileName,
      analysisTime: report.metadata.analysisTime,
      linesOfCode: report.metadata.linesOfCode,
    }));

    // Build issue patterns (count by description)
    const allIssues = allReports.flatMap((r) =>
      r.review.issues.map((issue: any) => ({
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
      }))
    );

    // Count issue descriptions
    const issueCountMap = new Map<string, number>();
    allIssues.forEach((issue) => {
      const key = issue.description.substring(0, 50); // Use first 50 chars as key
      issueCountMap.set(key, (issueCountMap.get(key) || 0) + 1);
    });

    // Get top 5 recurring issues
    const topIssues = Array.from(issueCountMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([description, count]) => ({
        description,
        count,
      }));

    // Count by category
    const categoryCountMap = new Map<string, number>();
    allIssues.forEach((issue) => {
      categoryCountMap.set(issue.category, (categoryCountMap.get(issue.category) || 0) + 1);
    });

    const topCategories = Array.from(categoryCountMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
      }));

    // Count by severity
    const severityCountMap = new Map<string, number>();
    allIssues.forEach((issue) => {
      severityCountMap.set(issue.severity, (severityCountMap.get(issue.severity) || 0) + 1);
    });

    const severityDistribution = {
      critical: severityCountMap.get('critical') || 0,
      warning: severityCountMap.get('warning') || 0,
      suggestion: severityCountMap.get('suggestion') || 0,
      total: allIssues.length,
    };

    // Calculate complexity metrics
    const complexityMetrics = {
      avgAnalysisTime: allReports.length > 0 
        ? allReports.reduce((sum, r) => sum + (r.metadata.analysisTime || 0), 0) / allReports.length 
        : 0,
      minAnalysisTime: allReports.length > 0 
        ? Math.min(...allReports.map(r => r.metadata.analysisTime || 0)) 
        : 0,
      maxAnalysisTime: allReports.length > 0 
        ? Math.max(...allReports.map(r => r.metadata.analysisTime || 0)) 
        : 0,
      avgLinesOfCode: allReports.length > 0 
        ? allReports.reduce((sum, r) => sum + (r.metadata.linesOfCode || 0), 0) / allReports.length 
        : 0,
      minLinesOfCode: allReports.length > 0 
        ? Math.min(...allReports.map(r => r.metadata.linesOfCode || 0)) 
        : 0,
      maxLinesOfCode: allReports.length > 0 
        ? Math.max(...allReports.map(r => r.metadata.linesOfCode || 0)) 
        : 0,
    };

    return NextResponse.json({
      success: true,
      trends: trendsData,
      topIssues,
      topCategories,
      severityDistribution,
      complexityMetrics,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
