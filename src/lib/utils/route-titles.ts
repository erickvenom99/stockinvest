// lib/utils/route-titles.ts
import { SideBarEntry, sideBarEntries } from '@/components/ui/sidebar-data';

const flattenRoutes = (entries: SideBarEntry[]): Array<{ path: string; title: string }> => {
  return entries.flatMap(entry => {
    if (entry.type === 'link') {
      // Handle link entries
      return [{ path: entry.url, title: entry.title }];
    } else {
      // Handle group entries and their children
      return entry.children.flatMap(child => ({
        path: child.url,
        title: `${entry.title} ${child.title}` // Combine group and child titles
      }));
    }
  });
};

const routeTitles = flattenRoutes(sideBarEntries);

export const getPageTitle = (pathname: string): string => {
  // Exact match for full path
  const exactMatch = routeTitles.find(route => route.path === pathname);
  if (exactMatch) return exactMatch.title;

  // Partial match for nested routes (e.g., /portfolio/123/analytics)
  const baseMatch = routeTitles.find(route => 
    pathname.startsWith(route.path + '/') || route.path === pathname
  );

  return baseMatch?.title || formatPathnameFallback(pathname);
};

const formatPathnameFallback = (pathname: string): string => {
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.replace(/-/g, ' '))
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' → ');
};