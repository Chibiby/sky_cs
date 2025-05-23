import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Trash2, UserCog, Plus, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Inertia } from '@inertiajs/inertia';
import debounce from 'lodash/debounce';
import Pagination from '@/components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: any;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function ManageUsers({ users, flash }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = debounce((query: string) => {
        Inertia.get(
            route('users.manage'),
            { search: query, role: roleFilter },
            { preserveState: true }
        );
    }, 300);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleRoleFilter = (role: string) => {
        setRoleFilter(role);
        Inertia.get(
            route('users.manage'),
            { search: searchQuery, role },
            { preserveState: true }
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(users.data.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUsers(current => {
            if (current.includes(userId)) {
                return current.filter(id => id !== userId);
            } else {
                return [...current, userId];
            }
        });
    };

    const handleBulkDelete = async () => {
        if (!selectedUsers.length) return;

        if (!confirm('Are you sure you want to delete the selected users?')) return;

        setIsLoading(true);
        try {
            const response = await fetch(route('users.bulk-destroy'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ ids: selectedUsers }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setSelectedUsers([]);
                Inertia.reload();
            } else {
                toast.error(data.error || 'Error deleting users');
            }
        } catch (error) {
            toast.error('Error deleting users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await Inertia.delete(route('users.destroy', userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Error deleting user');
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manage Users', href: '/users/manage' }]}>
            <Head title="Manage Users" />
            <ToastContainer position="top-right" />

            <div className="container mx-auto p-6 select-none">
                <div className="flex flex-col space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
                            </div>

                    {/* Search and Actions Section */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={handleRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleBulkDelete} disabled={selectedUsers.length === 0 || isLoading}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected ({selectedUsers.length})
                            </Button>
                            <Button asChild className="bg-black text-white hover:bg-black/90">
                                <Link href="/users/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </Link>
                            </Button>
                        </div>
                            </div>

                    {/* Users Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox 
                                                checked={selectedUsers.length === users.data.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="w-12 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={() => handleSelectUser(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        title="Edit user"
                                                        asChild
                                                    >
                                                        <Link href={route('users.edit', user.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(user.id)}
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="border-t px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {users.from} to {users.to} of {users.total} results
                                    </p>
                                    <div className="flex items-center">
                                        <Pagination 
                                            links={users.links} 
                                            from={users.from}
                                            to={users.to}
                                            total={users.total}
                                        />
                                    </div>
                                </div>
                            </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
} 