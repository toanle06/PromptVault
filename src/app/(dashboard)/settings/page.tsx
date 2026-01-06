'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { useExpertRoles } from '@/hooks/use-expert-roles';
import { exportAllData, seedSampleData } from '@/lib/firebase/firestore';
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
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, userData } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { prompts, importPrompts } = usePrompts();
  const { categories, importCategories } = useCategories();
  const { tags, importTags } = useTags();
  const { expertRoles, importExpertRoles } = useExpertRoles();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedDialog, setShowSeedDialog] = useState(false);

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

    setIsSeeding(true);
    try {
      await seedSampleData(user.uid);
      toast.success('Sample data created successfully');
      // Refresh the page to load new data
      window.location.reload();
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to create sample data');
    } finally {
      setIsSeeding(false);
      setShowSeedDialog(false);
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
            Export, import, or seed your data
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

          {/* Seed Data */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sample Data</p>
              <p className="text-sm text-muted-foreground">
                Create sample categories, tags, and prompts
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowSeedDialog(true)}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
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

      {/* Seed Data Dialog */}
      <AlertDialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Generate Sample Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will create sample categories, tags, expert roles, and prompts.
              Existing data will NOT be affected.
              <br /><br />
              Sample data includes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>5 categories with subcategories</li>
                <li>10+ tags for organizing prompts</li>
                <li>5 expert roles</li>
                <li>10+ sample prompts</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSeeding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedData} disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
