import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CalendarCheck, Users, LayoutGrid, SquareUser, UserPlus, Activity, Shield, PlusCircle, Calendar, Building2, ListChecks, ClipboardList, Clock, Crown, Home, Hotel, Bed, BookOpenCheck, UserCog, Settings, UserCheck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Reservations',
        href: '/reservations',
        icon: CalendarCheck,
        items: [
            {
                title: 'New Booking',
                href: '/reservations/create',
                icon: PlusCircle,
            },
            {
                title: 'Manage Bookings',
                href: '/reservations/manage',
                icon: ListChecks,
            },
            {
                title: 'Accommodation',
                href: '/reservations/accommodation',
                icon: Building2,
            },
            {
                title: 'Booking Calendar',
                href: '/reservations/booking-calendar',
                icon: Calendar,
            },
        ],
    },
    {
        title: 'Guests',
        href: '/guests',
        icon: SquareUser,
        items: [
            {
                title: 'Manage Guest',
                href: '/guests/manage',
                icon: UserCog,
            },
            {
                title: 'Guest History',
                href: '/guests/history',
                icon: Clock,
            },
        ],
    },
    {
        title: 'User',
        href: '/users/manage',
        icon: Users,
        items: [
            {
                title: 'Add User',
                href: '/users/create',
                icon: UserPlus,
            },
            {
                title: 'Manage Users',
                href: '/users/manage',
                icon: UserCheck,
            }
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="sidebar">
            <SidebarHeader className="mb-4 px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
