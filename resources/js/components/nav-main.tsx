import { type NavItem } from '@/types';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavMainProps {
    items: NavItem[];
}

interface SubNavItem {
    title: string;
    href: string;
}

const subNavItems: Record<string, { title: string; href: string }[]> = {
    'Reservations': [
        { title: 'New Booking', href: '/reservations/create' },
        { title: 'Manage Bookings', href: '/reservations/manage' },
        { title: 'Room Availability', href: '/reservations/availability' },
        { title: 'Booking Calendar', href: '/reservations/calendar' },
    ],
    'Guests': [
        { title: 'Guest Records', href: '/guests' },
        { title: 'Checked-in Guests', href: '/guests/checked-in' },
        { title: 'Past Stays', href: '/guests/history' },
        { title: 'VIP Guests', href: '/guests/vip' },
    ],
    'Payments & Invoices': [
        { title: 'All Payments', href: '/payments' },
        { title: 'All Invoices', href: '/invoices' },
    ],
    'Reports & Analytics': [
        { title: 'Revenue Reports', href: '/reports/revenue' },
        { title: 'Guest Analytics', href: '/reports/guests' },
    ],
};

export function NavMain({ items }: NavMainProps) {
    const { url } = usePage();
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const handleItemClick = (title: string, href: string) => {
        if (title === 'Dashboard') {
            // For Dashboard, use Link component to navigate
            return;
        }
        // For other items, toggle submenu if not collapsed or in mobile view
        if (state !== 'collapsed' || isMobile) {
            setExpandedItem(expandedItem === title ? null : title);
        }
    };

    return (
        <SidebarMenu>
            {items.map((item) => (
                <div key={item.title}>
                    {item.title === 'Dashboard' ? (
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                asChild
                                tooltip={state === 'collapsed' ? item.title : undefined}
                            >
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 ${
                                        url === item.href ? 'text-primary' : 'text-foreground'
                                    }`}
                                >
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleItemClick(item.title, item.href)}
                                    className="w-full"
                                    tooltip={state === 'collapsed' ? item.title : undefined}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                        </div>
                                        {(state !== 'collapsed' || isMobile) && (
                                            <ChevronRight
                                                className={`h-4 w-4 transition-transform ${
                                                    expandedItem === item.title ? 'rotate-90' : ''
                                                }`}
                                            />
                                        )}
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {expandedItem === item.title && (state !== 'collapsed' || isMobile) && subNavItems[item.title] && (
                                <SidebarMenuSub>
                                    {subNavItems[item.title].map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                                <Link
                                                    href={subItem.href}
                                                    className={`${
                                                        url === subItem.href ? 'text-primary' : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {subItem.title}
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            )}
                        </>
                    )}
                </div>
            ))}
        </SidebarMenu>
    );
}
