import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';

interface Reservation {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    check_in_date: string;
    check_out_date: string;
    room_type: string;
    number_of_guests: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
    special_requests?: string;
    created_at: string;
}

interface Props {
    reservations: Reservation[];
}

export default function ManageReservations({ reservations }: Props) {
    const getStatusColor = (status: Reservation['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'confirmed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            case 'checked_in':
                return 'bg-blue-500';
            case 'checked_out':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manage Bookings', href: '/reservations/manage' }]}>
            <Head title="Manage Bookings" />
            <div className="container mx-auto">
                <Card className="rounded-none border-none">
                    <CardHeader>
                        <CardDescription>View and manage all reservations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guest Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Check-in</TableHead>
                                        <TableHead>Check-out</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservations.map((reservation) => (
                                        <TableRow key={reservation.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {reservation.first_name} {reservation.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {reservation.number_of_guests} {reservation.number_of_guests === 1 ? 'Guest' : 'Guests'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{reservation.email}</div>
                                                    <div className="text-sm text-gray-500">{reservation.phone}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium capitalize">{reservation.room_type}</div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(reservation.check_in_date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(reservation.check_out_date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(reservation.status)}>
                                                    {reservation.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.location.href = `/reservations/${reservation.id}/edit`}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.location.href = `/reservations/${reservation.id}`}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 