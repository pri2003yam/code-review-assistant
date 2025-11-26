'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IssueItem } from './IssueItem';
import { Report, ReviewIssue, IssueSeverity } from '@/types';
import { Download, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReviewCardProps {
  report: Report;
}

export function ReviewCard({ report }: ReviewCardProps) {
  const { review, fileName, originalCode, metadata } = report;

  // Safely handle missing data
  const issues = review?.issues || [];
  const criticalCount = issues.filter(
    (i: any) => i.severity === 'critical'
  ).length;
  const warningCount = issues.filter(
    (i: any) => i.severity === 'warning'
  ).length;
  const suggestionCount = issues.filter(
    (i: any) => i.severity === 'suggestion'
  ).length;

  const issuesByCategory = issues.reduce(
    (acc: any, issue: any) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    },
    {} as Record<string, ReviewIssue[]>
  );

  const issuesBySeverity = {
    critical: issues.filter((i: any) => i.severity === 'critical'),
    warning: issues.filter((i: any) => i.severity === 'warning'),
    suggestion: issues.filter((i: any) => i.severity === 'suggestion'),
  };

  const exportAsMarkdown = () => {
    let markdown = `# Code Review Report\n\n`;
    markdown += `**File:** ${fileName}\n`;
    markdown += `**Date:** ${formatDate(report.createdAt || new Date())}\n`;
    markdown += `**Score:** ${review.overallScore}/10\n\n`;
    markdown += `## Summary\n\n${review.summary}\n\n`;

    if (review.issues.length > 0) {
      markdown += `## Issues Found\n\n`;
      markdown += `- **Critical:** ${criticalCount}\n`;
      markdown += `- **Warning:** ${warningCount}\n`;
      markdown += `- **Suggestion:** ${suggestionCount}\n\n`;

      review.issues.forEach((issue, index) => {
        markdown += `### ${index + 1}. ${issue.description}\n\n`;
        markdown += `**Severity:** ${issue.severity}\n`;
        markdown += `**Category:** ${issue.category}\n`;
        markdown += `**Suggestion:** ${issue.suggestion}\n\n`;
      });
    }

    if (review.improvements.length > 0) {
      markdown += `## Recommended Improvements\n\n`;
      review.improvements.forEach((imp) => {
        markdown += `- ${imp}\n`;
      });
      markdown += '\n';
    }

    if (review.positives.length > 0) {
      markdown += `## What's Going Well\n\n`;
      review.positives.forEach((pos) => {
        markdown += `- ${pos}\n`;
      });
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(markdown)}`);
    element.setAttribute('download', `${fileName}-review.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.text('Code Review Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`File: ${fileName}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Date: ${formatDate(report.createdAt || new Date())}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Score: ${review.overallScore}/10`, 20, yPosition);
    yPosition += 12;

    doc.setFontSize(12);
    doc.text('Summary', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(review.summary, 170);
    doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 8;

    if (review.issues.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text('Issues Found', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Critical: ${criticalCount} | Warning: ${warningCount} | Suggestion: ${suggestionCount}`, 20, yPosition);
      yPosition += 10;

      review.issues.slice(0, 10).forEach((issue) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setTextColor(50, 50, 50);
        const descLines = doc.splitTextToSize(`• ${issue.description}`, 160);
        doc.text(descLines, 25, yPosition);
        yPosition += descLines.length * 4 + 2;
      });
    }

    doc.save(`${fileName}-review.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
        <p className="text-slate-300 mb-4">{review.summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">
            {metadata.linesOfCode} lines
          </Badge>
          <Badge className="bg-blue-900/50 text-blue-200 hover:bg-blue-900/70">
            {metadata.model}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-linear-to-br from-red-900/30 to-red-900/10 border border-red-800/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-red-400 text-2xl font-bold">{criticalCount}</div>
          <div className="text-xs text-slate-400 mt-1">Critical</div>
        </div>
        <div className="bg-linear-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-800/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-yellow-400 text-2xl font-bold">{warningCount}</div>
          <div className="text-xs text-slate-400 mt-1">Warnings</div>
        </div>
        <div className="bg-linear-to-br from-blue-900/30 to-blue-900/10 border border-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-blue-400 text-2xl font-bold">{suggestionCount}</div>
          <div className="text-xs text-slate-400 mt-1">Suggestions</div>
        </div>
      </div>

      {/* Tabs for Issues, Improvements, etc */}
      <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg backdrop-blur-sm overflow-hidden">
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-slate-700 bg-transparent p-0">
            <TabsTrigger 
              value="issues" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-slate-400 data-[state=active]:text-white"
            >
              Issues ({review.issues.length})
            </TabsTrigger>
            <TabsTrigger 
              value="improvements" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-slate-400 data-[state=active]:text-white"
            >
              Improvements ({review.improvements.length})
            </TabsTrigger>
            <TabsTrigger 
              value="positives" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-slate-400 data-[state=active]:text-white"
            >
              Positives ({review.positives.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="p-6">
            {review.issues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No issues found! Great code quality.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issuesBySeverity.critical.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-400 mb-3">
                      Critical ({criticalCount})
                    </h3>
                    <div className="space-y-2">
                      {issuesBySeverity.critical.map((issue, idx) => (
                        <IssueItem key={`critical-${idx}`} issue={issue} />
                      ))}
                    </div>
                  </div>
                )}

                {issuesBySeverity.warning.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-yellow-400 mb-3 mt-6">
                      Warnings ({warningCount})
                    </h3>
                    <div className="space-y-2">
                      {issuesBySeverity.warning.map((issue, idx) => (
                        <IssueItem key={`warning-${idx}`} issue={issue} />
                      ))}
                    </div>
                  </div>
                )}

                {issuesBySeverity.suggestion.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-3 mt-6">
                      Suggestions ({suggestionCount})
                    </h3>
                    <div className="space-y-2">
                      {issuesBySeverity.suggestion.map((issue, idx) => (
                        <IssueItem key={`suggestion-${idx}`} issue={issue} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="improvements" className="p-6">
            {review.improvements.length === 0 ? (
              <p className="text-slate-400 text-center py-12">
                No improvements suggested at this time.
              </p>
            ) : (
              <ul className="space-y-3">
                {review.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex gap-3 p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <span className="text-green-400 font-bold shrink-0">•</span>
                    <span className="text-slate-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="positives" className="p-6">
            {review.positives.length === 0 ? (
              <p className="text-slate-400 text-center py-12">
                Keep working on the code!
              </p>
            ) : (
              <ul className="space-y-3">
                {review.positives.map((positive, idx) => (
                  <li key={idx} className="flex gap-3 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                    <span className="text-blue-400 font-bold shrink-0">✓</span>
                    <span className="text-slate-300">{positive}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={exportAsMarkdown} 
          variant="outline" 
          className="gap-2 flex-1 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
        >
          <Download className="w-4 h-4" />
          Markdown
        </Button>
        <Button 
          onClick={exportAsPDF} 
          variant="outline" 
          className="gap-2 flex-1 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
        >
          <Download className="w-4 h-4" />
          PDF
        </Button>
      </div>
    </div>
  );
}
