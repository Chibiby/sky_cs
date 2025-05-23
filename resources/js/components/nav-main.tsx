import { type NavItem } from '@/types';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
    const { url } = usePage();
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const isCollapsed = state === 'collapsed' && !isMobile;
    
    // Change to array to track multiple expanded items
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        if (typeof window === 'undefined') return items.map(item => item.title);
        const stored = localStorage.getItem('nav_expanded_items');
        return stored ? JSON.parse(stored) : items.map(item => item.title);
    });

    // Update localStorage when expanded items change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('nav_expanded_items', JSON.stringify(expandedItems));
        }
    }, [expandedItems]);

    const handleItemClick = (title: string, href: string) => {
        if (!items.find(item => item.title === title)?.items) {
            return;
        }
        
        // Toggle current item without affecting others
        setExpandedItems(current => 
            current.includes(title) 
                ? current.filter(item => item !== title)
                : [...current, title]
        );
    };
    
    // Function to get the display label for categories
    const getCategoryLabel = (title: string) => {
        if (title === 'Dashboard') return 'Overview';
        return title;
    };
    
    // Check if an item is active based on the current URL
    const isActive = (href: string) => {
        if (href === '/dashboard' && url === '/dashboard') return true;
        return url.startsWith(href) && href !== '/dashboard';
    };

    return (
        <SidebarMenu className="px-2">
            {items.map((item) => (
                <div key={item.title} className="mb-6 last:mb-0">
                    {/* Category Title without Icon */}
                    <div className="mb-1">
                        <div className="px-1">
                            {!isCollapsed && (
                                <span className={cn(
                                    "text-muted-foreground text-xs font-semibold tracking-wide"
                                )}>
                                    {getCategoryLabel(item.title)}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Display subitems as direct buttons instead of dropdown */}
                    {item.items ? (
                        isCollapsed ? (
                            // When collapsed, render just the icons for submenu items
                            <div className="space-y-1 pl-1">
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton 
                                            asChild
                                            tooltip={subItem.title}
                                            className={cn(
                                                "px-3 pr-4 transition-colors text-xs",
                                                isActive(subItem.href) && "bg-primary/10 hover:bg-primary/15 rounded-md"
                                            )}
                                        >
                                            <Link
                                                href={subItem.href}
                                                className={`flex items-center justify-center ${
                                                    isActive(subItem.href) ? 'text-primary font-medium' : 'text-foreground hover:text-primary/90'
                                                }`}
                                            >
                                                {subItem.icon && <subItem.icon className={cn(
                                                    "h-4 w-4",
                                                    isActive(subItem.href) && "text-primary"
                                                )} />}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        ) : (
                            // When expanded, show full submenu
                            <div className="space-y-1 pl-1">
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton 
                                            asChild
                                            className={cn(
                                                "px-3 pr-4 transition-colors text-xs",
                                                isActive(subItem.href) && "bg-primary/10 hover:bg-primary/15 rounded-md"
                                            )}
                                        >
                                            <Link
                                                href={subItem.href}
                                                className={`flex items-center gap-3 select-none ${
                                                    isActive(subItem.href) ? 'text-primary font-medium' : 'text-foreground hover:text-primary/90'
                                                }`}
                                            >
                                                {subItem.icon && <subItem.icon className={cn(
                                                    "h-4 w-4",
                                                    isActive(subItem.href) && "text-primary"
                                                )} />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        )
                    ) : (
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                asChild
                                tooltip={isCollapsed ? item.title : undefined}
                                className={cn(
                                    "px-3 pr-4 transition-colors text-xs",
                                    isActive(item.href) && "bg-primary/10 hover:bg-primary/15 rounded-md"
                                )}
                            >
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 select-none ${
                                        isActive(item.href) ? 'text-primary font-medium' : 'text-foreground hover:text-primary/90'
                                    }`}
                                >
                                    {item.icon && <item.icon className={cn(
                                        "h-4 w-4",
                                        isActive(item.href) && "text-primary"
                                    )} />}
                                    <span className={isCollapsed ? "hidden" : ""}>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </div>
            ))}
        </SidebarMenu>
    );
}
