'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  technicalDetails?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'Something went wrong',
  message,
  technicalDetails,
  onRetry,
  className,
}: ErrorAlertProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/30 bg-destructive/10 p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="mt-1 text-sm text-foreground/80">{message}</p>

          {technicalDetails && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide technical details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show technical details
                  </>
                )}
              </button>
              {showDetails && (
                <pre className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground overflow-auto max-h-32">
                  {technicalDetails}
                </pre>
              )}
            </div>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Mapping common Firebase/API error codes to user-friendly messages
export function getErrorMessage(error: unknown): {
  title: string;
  message: string;
  technicalDetails?: string;
} {
  const errorCode = (error as { code?: string })?.code;
  const errorMessage = (error as { message?: string })?.message;

  // Firebase Auth errors
  const authErrors: Record<string, { title: string; message: string }> = {
    'auth/invalid-credential': {
      title: 'Invalid credentials',
      message: 'The email or password you entered is incorrect. Please try again.',
    },
    'auth/email-already-in-use': {
      title: 'Email already registered',
      message: 'This email is already associated with an account. Try signing in instead.',
    },
    'auth/weak-password': {
      title: 'Password too weak',
      message: 'Please choose a stronger password with at least 6 characters.',
    },
    'auth/user-not-found': {
      title: 'Account not found',
      message: "We couldn't find an account with this email. Please check and try again.",
    },
    'auth/wrong-password': {
      title: 'Incorrect password',
      message: 'The password you entered is incorrect. Please try again.',
    },
    'auth/too-many-requests': {
      title: 'Too many attempts',
      message: 'Access temporarily disabled due to many failed attempts. Please try again later.',
    },
    'auth/network-request-failed': {
      title: 'Connection error',
      message: 'Unable to connect. Please check your internet connection and try again.',
    },
    'auth/popup-closed-by-user': {
      title: 'Sign in cancelled',
      message: 'The sign in window was closed. Please try again when ready.',
    },
  };

  // Firestore errors
  const firestoreErrors: Record<string, { title: string; message: string }> = {
    'permission-denied': {
      title: 'Access denied',
      message: "You don't have permission to perform this action. Please sign in again.",
    },
    'unavailable': {
      title: 'Service unavailable',
      message: 'The service is temporarily unavailable. Please try again in a few moments.',
    },
    'failed-precondition': {
      title: 'Setup required',
      message: 'Additional setup is needed. This usually resolves automatically within a few minutes.',
    },
  };

  // Check for matching error code
  if (errorCode) {
    if (authErrors[errorCode]) {
      return {
        ...authErrors[errorCode],
        technicalDetails: errorMessage,
      };
    }
    if (firestoreErrors[errorCode]) {
      return {
        ...firestoreErrors[errorCode],
        technicalDetails: errorMessage,
      };
    }
  }

  // Check for index-related errors (common Firestore issue)
  if (errorMessage?.includes('index') || errorMessage?.includes('Index')) {
    return {
      title: 'Database setup in progress',
      message: 'The database is being configured. This usually takes a few minutes for new setups. Please refresh the page shortly.',
      technicalDetails: errorMessage,
    };
  }

  // Generic network errors
  if (errorMessage?.toLowerCase().includes('network') || errorMessage?.toLowerCase().includes('fetch')) {
    return {
      title: 'Connection error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      technicalDetails: errorMessage,
    };
  }

  // Default fallback
  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    technicalDetails: errorMessage || String(error),
  };
}
