import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

const SIDEBAR_STATE_KEY = 'sidebar_state';
const USER_ID_KEY = 'current_user_id';

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const { auth } = usePage<SharedData>().props;
    
    // Initialize sidebar state from localStorage
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
        return stored ? stored === 'true' : true;
    });

    // Sync state changes to localStorage
    const updateSidebarState = (newState: boolean) => {
        setSidebarOpen(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STATE_KEY, String(newState));
        }
    };

    // Reset sidebar state on user change (new login)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const storedUserId = localStorage.getItem(USER_ID_KEY);
        const currentUserId = String(auth?.user?.id);
        
        if (storedUserId !== currentUserId) {
            updateSidebarState(true); // Reset to open on user change
            localStorage.setItem(USER_ID_KEY, currentUserId);
        }
    }, [auth?.user?.id]);

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider 
            defaultOpen={sidebarOpen} 
            open={sidebarOpen}
            onOpenChange={updateSidebarState}
        >
            {children}
        </SidebarProvider>
    );
}
