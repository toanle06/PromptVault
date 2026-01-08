'use client';

import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { useExpertRoles } from '@/hooks/use-expert-roles';
import { exportAllData } from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import type { ExportData } from '@/types';
import {
  Download,
  Upload,
  Database,
  Moon,
  Sun,
  User,
  LogOut,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// Sample data for developers
const SEED_CATEGORIES = [
  // Main Categories
  { name: 'Mobile Development', color: '#3B82F6', icon: '📱', order: 0, promptCount: 0 },
  { name: 'Web Development', color: '#10B981', icon: '🌐', order: 1, promptCount: 0 },
  { name: 'Backend Development', color: '#8B5CF6', icon: '⚙️', order: 2, promptCount: 0 },
  { name: 'AI & Machine Learning', color: '#F59E0B', icon: '🤖', order: 3, promptCount: 0 },
  { name: 'DevOps & Cloud', color: '#EF4444', icon: '☁️', order: 4, promptCount: 0 },
  { name: 'Database', color: '#06B6D4', icon: '🗄️', order: 5, promptCount: 0 },
  { name: 'Testing & QA', color: '#84CC16', icon: '🧪', order: 6, promptCount: 0 },
  { name: 'Image Generation', color: '#EC4899', icon: '🎨', order: 7, promptCount: 0 },
  { name: 'Video Generation', color: '#F97316', icon: '🎬', order: 8, promptCount: 0 },
  { name: 'Productivity', color: '#6366F1', icon: '⚡', order: 9, promptCount: 0 },
];

const SEED_TAGS = [
  // Mobile
  { name: 'Swift', color: '#F05138', usageCount: 0 },
  { name: 'SwiftUI', color: '#0071E3', usageCount: 0 },
  { name: 'iOS', color: '#000000', usageCount: 0 },
  { name: 'Kotlin', color: '#7F52FF', usageCount: 0 },
  { name: 'Android', color: '#3DDC84', usageCount: 0 },
  { name: 'React Native', color: '#61DAFB', usageCount: 0 },
  { name: 'Flutter', color: '#02569B', usageCount: 0 },
  { name: 'Expo', color: '#000020', usageCount: 0 },
  // Web Frontend
  { name: 'React', color: '#61DAFB', usageCount: 0 },
  { name: 'Next.js', color: '#000000', usageCount: 0 },
  { name: 'Vue', color: '#4FC08D', usageCount: 0 },
  { name: 'Angular', color: '#DD0031', usageCount: 0 },
  { name: 'TypeScript', color: '#3178C6', usageCount: 0 },
  { name: 'JavaScript', color: '#F7DF1E', usageCount: 0 },
  { name: 'HTML/CSS', color: '#E34F26', usageCount: 0 },
  { name: 'Tailwind', color: '#06B6D4', usageCount: 0 },
  // Backend
  { name: 'Node.js', color: '#339933', usageCount: 0 },
  { name: 'Python', color: '#3776AB', usageCount: 0 },
  { name: 'Go', color: '#00ADD8', usageCount: 0 },
  { name: 'Rust', color: '#000000', usageCount: 0 },
  { name: 'Java', color: '#007396', usageCount: 0 },
  { name: 'C#', color: '#512BD4', usageCount: 0 },
  { name: 'PHP', color: '#777BB4', usageCount: 0 },
  { name: 'Ruby', color: '#CC342D', usageCount: 0 },
  // Database
  { name: 'PostgreSQL', color: '#4169E1', usageCount: 0 },
  { name: 'MongoDB', color: '#47A248', usageCount: 0 },
  { name: 'MySQL', color: '#4479A1', usageCount: 0 },
  { name: 'Redis', color: '#DC382D', usageCount: 0 },
  { name: 'Firebase', color: '#FFCA28', usageCount: 0 },
  { name: 'Supabase', color: '#3ECF8E', usageCount: 0 },
  // DevOps
  { name: 'Docker', color: '#2496ED', usageCount: 0 },
  { name: 'Kubernetes', color: '#326CE5', usageCount: 0 },
  { name: 'AWS', color: '#FF9900', usageCount: 0 },
  { name: 'GCP', color: '#4285F4', usageCount: 0 },
  { name: 'Azure', color: '#0078D4', usageCount: 0 },
  { name: 'CI/CD', color: '#40BE46', usageCount: 0 },
  // AI/ML
  { name: 'LLM', color: '#10A37F', usageCount: 0 },
  { name: 'Prompt Engineering', color: '#8B5CF6', usageCount: 0 },
  { name: 'RAG', color: '#F59E0B', usageCount: 0 },
  { name: 'Fine-tuning', color: '#EF4444', usageCount: 0 },
  // Image/Video
  { name: 'Image Prompt', color: '#EC4899', usageCount: 0 },
  { name: 'Video Prompt', color: '#F97316', usageCount: 0 },
  { name: 'Style Transfer', color: '#A855F7', usageCount: 0 },
  // General
  { name: 'Code Review', color: '#6366F1', usageCount: 0 },
  { name: 'Debugging', color: '#EF4444', usageCount: 0 },
  { name: 'Refactoring', color: '#14B8A6', usageCount: 0 },
  { name: 'Documentation', color: '#64748B', usageCount: 0 },
  { name: 'API Design', color: '#8B5CF6', usageCount: 0 },
  { name: 'Architecture', color: '#0EA5E9', usageCount: 0 },
  { name: 'Performance', color: '#22C55E', usageCount: 0 },
  { name: 'Security', color: '#DC2626', usageCount: 0 },
];

export default function SettingsPage() {
  const { user, userData } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { prompts, importPrompts } = usePrompts();
  const { categories, importCategories } = useCategories();
  const { tags, importTags } = useTags();
  const { expertRoles, importExpertRoles } = useExpertRoles();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      const data = await exportAllData(user.uid);

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptvault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      // Validate data structure
      if (!data.prompts || !data.categories || !data.tags || !data.expertRoles) {
        throw new Error('Invalid backup file format');
      }

      // Import each collection
      let imported = 0;

      if (data.categories.length > 0) {
        await importCategories(data.categories);
        imported += data.categories.length;
      }

      if (data.tags.length > 0) {
        await importTags(data.tags);
        imported += data.tags.length;
      }

      if (data.expertRoles.length > 0) {
        await importExpertRoles(data.expertRoles);
        imported += data.expertRoles.length;
      }

      if (data.prompts.length > 0) {
        await importPrompts(data.prompts);
        imported += data.prompts.length;
      }

      toast.success(`Imported ${imported} items successfully`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSeedData = async () => {
    if (!user) return;

    // Check if data already exists
    if (categories.length > 0 || tags.length > 0) {
      const confirmed = window.confirm(
        'You already have categories/tags. This will add sample data without removing existing data. Continue?'
      );
      if (!confirmed) return;
    }

    setIsSeeding(true);
    try {
      // Import categories
      await importCategories(SEED_CATEGORIES);
      // Import tags
      await importTags(SEED_TAGS);

      toast.success(`Created ${SEED_CATEGORIES.length} categories and ${SEED_TAGS.length} tags`);
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to create sample data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {userData?.displayName?.[0] || user?.email?.[0] || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium">{userData?.displayName || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and import your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-2xl font-bold">{prompts.length}</p>
              <p className="text-xs text-muted-foreground">Prompts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{tags.length}</p>
              <p className="text-xs text-muted-foreground">Tags</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{expertRoles.length}</p>
              <p className="text-xs text-muted-foreground">Roles</p>
            </div>
          </div>

          <Separator />

          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your data as a JSON file
              </p>
            </div>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          </div>

          <Separator />

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Import Data</p>
              <p className="text-sm text-muted-foreground">
                Restore data from a backup file
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleImport}
              />
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import
              </Button>
            </div>
          </div>

          <Separator />

          {/* Seed Sample Data */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sample Data for Developers</p>
              <p className="text-sm text-muted-foreground">
                Create categories & tags for programming (Swift, React, Kotlin, etc.)
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleSeedData}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>Quick actions for power users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Open search</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">⌘ K</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New prompt</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">⌘ N</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toggle dark mode</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">⌘ D</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Close dialog</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">Esc</kbd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
