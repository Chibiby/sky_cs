import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import React, { Suspense } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Set axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Add CSRF token to all requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Implement code splitting for admin/dashboard pages
const resolveComponent = async (name: string) => {
    const pages = import.meta.glob('./pages/**/*.tsx');
    const page = pages[`./pages/${name}.tsx`];
    
    if (!page) {
        throw new Error(`Page not found: ${name}`);
    }

    if (name.startsWith('Welcome') || name.startsWith('auth/')) {
        return page();
    }

    // Wrap the lazy-loaded component in a dynamic import
    return React.lazy(() => page() as Promise<{ default: React.ComponentType<any> }>);
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: resolveComponent,
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#47859e]"></div>
                </div>
            }>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <App {...props} />
                </LocalizationProvider>
            </Suspense>
        );
    },
    progress: {
        color: '#47859e',
    },
});

// This will set light / dark mode on load...
initializeTheme();
