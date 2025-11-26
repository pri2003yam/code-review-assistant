'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signup, login, isLoading } = useUser();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      if (isSignup) {
        await signup(email);
        toast.success('Account created successfully!');
      } else {
        await login(email);
        toast.success('Logged in successfully!');
      }
      setEmail('');
      onClose?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignup ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-slate-400">
              {isSignup
                ? 'Sign up with your email to get started'
                : 'Sign in to access your code reviews'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? isSignup
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignup
                ? 'Create Account'
                : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setEmail('');
            }}
            disabled={isLoading}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {isSignup ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
