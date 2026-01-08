'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { usePromptStore } from '@/store/prompt-store';
import {
  Home,
  FileText,
  FolderOpen,
  Tags,
  Star,
  Settings,
  ChevronRight,
  ChevronDown,
  Trash2,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_CATEGORIES_SHOWN = 5;
const INITIAL_TAGS_SHOWN = 8;

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'All Prompts', url: '/prompts', icon: FileText },
  { title: 'Pinned', url: '/prompts?pinned=true', icon: Pin },
  { title: 'Favorites', url: '/prompts?favorites=true', icon: Star },
  { title: 'Trash', url: '/trash', icon: Trash2 },
];

const manageNavItems = [
  { title: 'Categories', url: '/categories', icon: FolderOpen },
  { title: 'Tags', url: '/tags', icon: Tags },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { categoriesTree, isLoading: isLoadingCategories } = useCategories();
  const { tags, isLoading: isLoadingTags } = useTags();
  const { prompts, setFilters, filters } = usePromptStore();

  // Collapsible states
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const handleCategoryFilter = (categoryId: string | undefined) => {
    setFilters({ categoryId, subcategoryId: undefined });
    router.push('/prompts');
  };

  const handleTagFilter = (tagId: string) => {
    setFilters({ tags: [tagId] });
    router.push('/prompts');
  };

  const getPromptCountForCategory = (categoryId: string) => {
    return prompts.filter(
      (p) => p.categoryId === categoryId || p.subcategoryId === categoryId
    ).length;
  };

  const getPromptCountForTag = (tagId: string) => {
    return prompts.filter((p) => p.tags.includes(tagId)).length;
  };

  // Limit displayed items
  const displayedCategories = showAllCategories
    ? categoriesTree.main
    : categoriesTree.main.slice(0, INITIAL_CATEGORIES_SHOWN);
  const hasMoreCategories = categoriesTree.main.length > INITIAL_CATEGORIES_SHOWN;

  const displayedTags = showAllTags
    ? tags
    : tags.slice(0, INITIAL_TAGS_SHOWN);
  const hasMoreTags = tags.length > INITIAL_TAGS_SHOWN;

  return (
    <Sidebar aria-label="Main navigation sidebar">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PromptVault Logo"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-lg font-bold">PromptVault</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url.split('?')[0]}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Categories */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel
                  className="cursor-pointer hover:bg-accent/50 rounded-md transition-colors flex items-center justify-between pr-2"
                  aria-expanded={categoriesOpen}
                  aria-controls="categories-content"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      categoriesOpen ? "" : "-rotate-90"
                    )}
                    aria-hidden="true"
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent id="categories-content">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => handleCategoryFilter(undefined)}
                        isActive={!filters.categoryId && pathname === '/prompts'}
                      >
                        <FolderOpen className="h-4 w-4" aria-hidden="true" />
                        <span>All Categories</span>
                        <Badge variant="secondary" className="ml-auto">
                          <span className="sr-only">{prompts.filter(p => !p.isDeleted).length} prompts</span>
                          <span aria-hidden="true">{prompts.filter(p => !p.isDeleted).length}</span>
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {!isLoadingCategories &&
                      displayedCategories.map((category) => (
                        <SidebarMenuItem key={category.id}>
                          <SidebarMenuButton
                            onClick={() => handleCategoryFilter(category.id)}
                            isActive={filters.categoryId === category.id}
                          >
                            <div
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color || '#6366f1' }}
                            />
                            <span className="truncate">{category.name}</span>
                            <Badge variant="secondary" className="ml-auto flex-shrink-0">
                              {getPromptCountForCategory(category.id)}
                            </Badge>
                          </SidebarMenuButton>

                          {/* Subcategories */}
                          {categoriesTree.subs[category.id]?.length > 0 && (
                            <SidebarMenuSub>
                              {categoriesTree.subs[category.id].map((sub) => (
                                <SidebarMenuSubItem key={sub.id}>
                                  <SidebarMenuSubButton
                                    onClick={() => handleCategoryFilter(sub.id)}
                                    isActive={filters.categoryId === sub.id}
                                  >
                                    <span className="truncate">{sub.name}</span>
                                    <Badge variant="outline" className="ml-auto text-xs flex-shrink-0">
                                      {getPromptCountForCategory(sub.id)}
                                    </Badge>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      ))}

                    {/* Show more/less button */}
                    {hasMoreCategories && (
                      <SidebarMenuItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => setShowAllCategories(!showAllCategories)}
                        >
                          <ChevronRight className={cn(
                            "h-4 w-4 mr-2 transition-transform",
                            showAllCategories && "rotate-90"
                          )} />
                          {showAllCategories
                            ? 'Show less'
                            : `Show ${categoriesTree.main.length - INITIAL_CATEGORIES_SHOWN} more`}
                        </Button>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* Tags */}
          <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel
                  className="cursor-pointer hover:bg-accent/50 rounded-md transition-colors flex items-center justify-between pr-2"
                  aria-expanded={tagsOpen}
                  aria-controls="tags-content"
                >
                  <span>Popular Tags</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      tagsOpen ? "" : "-rotate-90"
                    )}
                    aria-hidden="true"
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent id="tags-content">
                <SidebarGroupContent>
                  <div className="flex flex-wrap gap-1.5 px-2 py-1">
                    {!isLoadingTags &&
                      displayedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent transition-colors"
                          style={{
                            borderColor: tag.color || undefined,
                            color: tag.color || undefined,
                          }}
                          onClick={() => handleTagFilter(tag.id)}
                        >
                          {tag.name}
                          <span className="ml-1 text-muted-foreground">
                            ({getPromptCountForTag(tag.id)})
                          </span>
                        </Badge>
                      ))}
                  </div>
                  {/* Show more/less button for tags */}
                  {hasMoreTags && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => setShowAllTags(!showAllTags)}
                    >
                      <ChevronRight className={cn(
                        "h-4 w-4 mr-2 transition-transform",
                        showAllTags && "rotate-90"
                      )} />
                      {showAllTags
                        ? 'Show less'
                        : `Show ${tags.length - INITIAL_TAGS_SHOWN} more`}
                    </Button>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* Management */}
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {manageNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="text-xs text-muted-foreground text-center">
          PromptVault v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
