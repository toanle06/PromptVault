'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import {
  Sparkles,
  FileText,
  FolderOpen,
  Tags,
  Search,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ONBOARDING_DISMISSED_KEY = 'promptvault_onboarding_dismissed';

interface WelcomeStep {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const { prompts, isLoading } = usePrompts();
  const { setCreatePromptOpen } = useUIStore();
  const [isDismissed, setIsDismissed] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user has dismissed the banner
  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  // Don't show if loading, dismissed, or user has prompts
  if (isLoading || isDismissed || prompts.length > 0) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const steps: WelcomeStep[] = [
    {
      icon: FileText,
      title: 'Create your first prompt',
      description: 'Start building your AI prompt library by creating your first prompt.',
      action: () => setCreatePromptOpen(true),
      actionLabel: 'Create Prompt',
    },
    {
      icon: FolderOpen,
      title: 'Organize with categories',
      description: 'Group related prompts together using categories and subcategories.',
    },
    {
      icon: Tags,
      title: 'Add tags for quick access',
      description: 'Use tags to filter and find prompts quickly.',
    },
    {
      icon: Search,
      title: 'Search instantly',
      description: 'Find any prompt with our powerful full-text search.',
    },
  ];

  const userName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss welcome message"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col gap-6">
          {/* Welcome header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Welcome to PromptVault, {userName}!
              </h2>
              <p className="text-sm text-muted-foreground">
                Let&apos;s get you started with your prompt library
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-lg transition-colors',
                  'bg-background/50 hover:bg-background/80',
                  currentStep === index && 'ring-2 ring-primary/50'
                )}
                onMouseEnter={() => setCurrentStep(index)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.action && step.actionLabel && (
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={step.action}
                  >
                    {step.actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Quick action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Ready to start? Create your first prompt now!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Skip for now
              </Button>
              <Button size="sm" onClick={() => setCreatePromptOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Create First Prompt
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
