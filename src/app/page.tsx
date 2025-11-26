'use client';

import { useState, useEffect } from 'react';
import { FileUploader } from '@/components/upload/FileUploader';
import { CodePreview } from '@/components/upload/CodePreview';
import { LanguageSelector } from '@/components/upload/LanguageSelector';
import { ReviewCard } from '@/components/review/ReviewCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFileContext } from '@/context/FileContext';
import { useReview } from '@/hooks/useReview';
import { ProgrammingLanguage } from '@/types';
import { Zap, Home, Sparkles, Code2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const sampleCode = `// Sample: Poorly written code for testing
function processData(d) {
  var result = [];
  for (var i = 0; i < d.length; i++) {
    if (d[i].active == true) {
      var item = {};
      item.name = d[i].name;
      item.value = d[i].value;
      result.push(item);
    }
  }
  return result;
}

function fetchUser(id) {
  fetch('/api/user/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      document.getElementById('user').innerHTML = data.name;
    });
}`;

export default function HomePage() {
  const { file, clearFile } = useFileContext();
  const { report, isLoading, error, submitReview, clearReview } = useReview();
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(
    ProgrammingLanguage.JAVASCRIPT
  );

  // Debug: log when file changes
  console.log('HomePage - file state:', file);

  // Update selected language when file changes
  useEffect(() => {
    if (file?.language) {
      console.log('Setting language from file:', file.language);
      setSelectedLanguage(file.language);
    }
  }, [file]);

  const handleAnalyze = async () => {
    console.log('=== ANALYZE BUTTON CLICKED ===');
    console.log('File exists:', !!file);
    console.log('File:', file);
    console.log('IsLoading:', isLoading);
    console.log('Selected Language:', selectedLanguage);
    
    if (!file) {
      console.error('ERROR: No file uploaded');
      toast.error('Please upload a file first');
      return;
    }

    console.log('Starting code review with:', {
      fileName: file.name,
      language: selectedLanguage,
      codeLength: file.content.length,
    });
    
    try {
      await submitReview({
        code: file.content,
        language: selectedLanguage,
        fileName: file.name,
      });
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('ERROR submitting review:', error);
      throw error;
    }
  };

  const handleNewReview = () => {
    clearFile();
    clearReview();
  };

  if (report) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                Code Review Results
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="gap-2 w-full sm:w-auto bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-100">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={handleNewReview}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                <Zap className="w-4 h-4" />
                New Review
              </button>
            </div>
          </div>
          <ReviewCard report={report} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-slate-900 font-bold" />
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
              CodeReview AI
            </span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-300 hover:text-slate-100 hover:bg-slate-700">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-slate-700/50 border border-blue-400/20 text-blue-300 text-sm font-semibold">
              ✨ Powered by Gemini 2.5 Pro
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 mb-4">
            AI Code Review
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Get instant, intelligent code reviews powered by cutting-edge AI. Identify issues, improve code quality, and follow best practices.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Upload & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Upload */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                <h2 className="text-2xl font-bold text-slate-100">Upload Code</h2>
              </div>
              <p className="text-slate-400 mb-6">Select a code file to analyze</p>
              <FileUploader />
            </div>

            {/* Step 2: Language & Analyze */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                <h2 className="text-2xl font-bold text-slate-100">Language & Analyze</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Programming Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as ProgrammingLanguage)}
                    disabled={!file || isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="jsx">JSX</option>
                    <option value="tsx">TSX</option>
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!file || isLoading}
                  type="button"
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    !file || isLoading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-linear-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-r-transparent rounded-full"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Code
                    </>
                  )}
                </button>
                
                {!file && <p className="text-sm text-slate-400">📁 Upload a file to get started</p>}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          {file && (
            <div className="lg:col-span-3 bg-linear-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-slate-100">Preview</h3>
              </div>
              <CodePreview
                code={file.content}
                language={file.language}
                fileName={file.name}
              />
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-linear-to-r from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <p className="font-semibold text-red-300">Review Failed</p>
                <p className="text-red-200/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-linear-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-r-transparent rounded-full"></div>
              <h3 className="text-lg font-bold text-blue-300">Analyzing your code...</h3>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full bg-slate-700/30" />
              <Skeleton className="h-12 w-3/4 bg-slate-700/30" />
              <Skeleton className="h-12 w-5/6 bg-slate-700/30" />
            </div>
          </div>
        )}

        {/* Sample Code */}
        <div className="border-t border-slate-700 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Try Sample Code</h2>
            <p className="text-slate-400">Don't have code? Test with this example</p>
          </div>
          <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600/50 backdrop-blur">
            <pre className="text-sm overflow-x-auto text-slate-300 font-mono">
              <code>{sampleCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
