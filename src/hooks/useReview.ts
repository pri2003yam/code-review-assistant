'use client';

import { useState, useCallback } from 'react';
import { Report, ReviewRequest, ReviewResponse } from '@/types';

interface UseReviewState {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
}

export function useReview() {
  const [state, setState] = useState<UseReviewState>({
    report: null,
    isLoading: false,
    error: null,
  });

  const submitReview = useCallback(async (request: ReviewRequest) => {
    setState({ report: null, isLoading: true, error: null });

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = (await response.json()) as ReviewResponse;

      if (!response.ok || !data.success) {
        setState({
          report: null,
          isLoading: false,
          error: data.error || 'Failed to analyze code',
        });
        return;
      }

      setState({
        report: data.report || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze code';
      setState({
        report: null,
        isLoading: false,
        error: message,
      });
    }
  }, []);

  const clearReview = useCallback(() => {
    setState({
      report: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    report: state.report,
    isLoading: state.isLoading,
    error: state.error,
    submitReview,
    clearReview,
  };
}
