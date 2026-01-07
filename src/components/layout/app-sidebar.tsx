'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Sparkles,
  ChevronRight,
  Trash2,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
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
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Categories */}
          <SidebarGroup>
            <SidebarGroupLabel>Categories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleCategoryFilter(undefined)}
                    isActive={!filters.categoryId && pathname === '/prompts'}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>All Categories</span>
                    <Badge variant="secondary" className="ml-auto">
                      {prompts.length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {!isLoadingCategories &&
                  categoriesTree.main.map((category) => (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        onClick={() => handleCategoryFilter(category.id)}
                        isActive={filters.categoryId === category.id}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        />
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-auto">
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
                                <span>{sub.name}</span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {getPromptCountForCategory(sub.id)}
                                </Badge>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tags */}
          <SidebarGroup>
            <SidebarGroupLabel>Popular Tags</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-wrap gap-1 px-2">
                {!isLoadingTags &&
                  tags.slice(0, 10).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
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
            </SidebarGroupContent>
          </SidebarGroup>

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
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
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
