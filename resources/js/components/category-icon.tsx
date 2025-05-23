import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
    icon: LucideIcon;
    category: string;
    className?: string;
}

const categoryColors: Record<string, string> = {
    'Dashboard': 'bg-blue-100 text-blue-600',
    'Reservations': 'bg-green-100 text-green-600',
    'Guests': 'bg-purple-100 text-purple-600',
    'User Management': 'bg-amber-100 text-amber-600',
    'default': 'bg-gray-100 text-gray-600'
};

export function CategoryIcon({ icon: Icon, category, className }: CategoryIconProps) {
    const colorClass = categoryColors[category] || categoryColors.default;
    
    return (
        <div className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            colorClass,
            className
        )}>
            <Icon className="h-4 w-4" />
        </div>
    );
}

export default CategoryIcon; 