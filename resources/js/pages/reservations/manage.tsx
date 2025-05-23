import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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
import { format, parseISO } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Search, FileText, FileSpreadsheet, Download, Printer, Trash2, Eye, Minus, Edit, Calendar, Filter, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useBookingForm } from '@/hooks/useBookingForm';

interface Accommodation {
    id: number;
    code: string;
    name: string;
    type: string;
    description?: string;
    max_occupancy: number;
    base_price: number;
    extra_person_fee: number;
    is_active: boolean;
    amenities?: string[];
    location?: string;
    formatted_name?: string;
}

interface Reservation {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    check_in_date: string;
    check_out_date: string;
    accommodation_id: number;
    accommodation: Accommodation;
    number_of_guests: number;
    status: 'pending' | 'arrival' | 'departure' | 'cancelled' | 'completed';
    special_requests?: string;
    created_at: string;
}

interface Props {
    reservations: Reservation[];
}

interface ColumnVisibility {
    guestName: boolean;
    contact: boolean;
    room: boolean;
    checkIn: boolean;
    checkOut: boolean;
    status: boolean;
    actions: boolean;
}

interface FilterState {
    roomType: string;
    status: string;
}

export default function ManageReservations({ reservations: initialReservations }: Props) {
    const [recordsPerPage, setRecordsPerPage] = useState<string>("10");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        guestName: true,
        contact: true,
        room: true,
        checkIn: true,
        checkOut: true,
        status: true,
        actions: true,
    });
    const [filters, setFilters] = useState<FilterState>({
        roomType: 'All Room Types',
        status: 'All',
    });
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Add the useBookingForm hook
    const {
        data,
        setData,
        errors,
        setError,
        clearErrors,
        reset,
        isSubmitting,
        setIsSubmitting,
        validateField,
        handleInputChange: hookHandleInputChange,
        roomTypes,
        availableRoomNumbers,
        isLoadingRooms,
        getAccommodationId
    } = useBookingForm();
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        check_in_date: '',
        check_out_date: '',
        accommodation_id: '',
        number_of_guests: '',
        status: '',
        special_requests: '',
    });

    // Room types for filtering
    const roomFilters = ['All Room Types', 'Villa', 'Cottage', 'Cabin'];
    
    const statusOptions = ['All', 'Pending', 'Arrival', 'Departure', 'Cancelled', 'Completed'];

    // Helper function to get accommodation_id from room type string
    const getRoomIdFromType = (roomType: string): string => {
        // Extract the room type and number
        const parts = roomType.split(' ');
        if (parts.length !== 2) return '';
        
        const type = parts[0].toLowerCase(); // e.g., "cabin", "villa", "cottage"
        const number = parseInt(parts[1]);   // e.g., 1, 2, 3
        
        if (isNaN(number) || number <= 0) return '';
        
        // Map room type to accommodation_id based on convention
        if (type === 'villa') {
            return String(number); // Villa 1 = ID 1, Villa 2 = ID 2, etc.
        } else if (type === 'cottage') {
            return String(5 + number); // Cottage 1 = ID 6, Cottage 2 = ID 7, etc.
        } else if (type === 'cabin') {
            return String(14 + number); // Cabin 1 = ID 15, Cabin 2 = ID 16, etc.
        }
        
        return '';
    };

    // And a helper function to get room type from ID for display purposes
    const getRoomTypeFromId = (id: string): string => {
        const numId = parseInt(id);
        if (numId >= 1 && numId <= 5) return 'Villa';
        if (numId >= 6 && numId <= 14) return 'Cottage';
        if (numId >= 15 && numId <= 22) return 'Cabin';
        return '';
    };

    const getRoomNumberFromId = (id: string): string => {
        const numId = parseInt(id);
        if (numId >= 1 && numId <= 5) return String(numId); // Villa 1-5
        if (numId >= 6 && numId <= 14) return String(numId - 5); // Cottage 1-9
        if (numId >= 15 && numId <= 22) return String(numId - 14); // Cabin 1-8
        return '';
    };

    const getStatusColor = (status: Reservation['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500 text-white';
            case 'arrival':
                return 'bg-blue-500 text-white';
            case 'departure':
                return 'bg-green-500 text-white';
            case 'cancelled':
                return 'bg-red-500 text-white';
            case 'completed':
                return 'bg-gray-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const filteredReservations = reservations.filter(reservation => {
        const searchString = searchQuery.toLowerCase();
        return (
            reservation.first_name.toLowerCase().includes(searchString) ||
            reservation.last_name.toLowerCase().includes(searchString) ||
            reservation.email.toLowerCase().includes(searchString) ||
            reservation.phone.toLowerCase().includes(searchString) ||
            reservation.accommodation?.type.toLowerCase().includes(searchString)
        );
    });

    const totalPages = Math.ceil(filteredReservations.length / parseInt(recordsPerPage));

    const paginatedReservations = filteredReservations.slice(
        (currentPage - 1) * parseInt(recordsPerPage),
        currentPage * parseInt(recordsPerPage)
    );

    // Reset to first page when search query or records per page changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, recordsPerPage]);

    // Add more detailed debugging to check what's in the initial reservations data
    React.useEffect(() => {
        console.log('ALL Initial reservations:', initialReservations);
        
        // Check if we have any reservations
        if (initialReservations.length > 0) {
            const sampleReservation = initialReservations[0];
            
            // Log ALL properties of the first reservation to debug
            console.log('First reservation - ALL properties:', sampleReservation);
            
            // Specifically check the date fields with correct names
            console.log('Specific date checks:', {
                'check_in_date': sampleReservation.check_in_date,
                'check_out_date': sampleReservation.check_out_date,
                'check_in_date type': typeof sampleReservation.check_in_date,
                'check_out_date type': typeof sampleReservation.check_out_date
            });
        }
    }, [initialReservations]);

    // Add debugging to check what date values are received
    React.useEffect(() => {
        if (initialReservations.length > 0) {
            console.log('First reservation:', initialReservations[0]);
            console.log('Date fields:', {
                check_in_date: initialReservations[0].check_in_date,
                check_out_date: initialReservations[0].check_out_date,
            });
        }
    }, [initialReservations]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(paginatedReservations.map(r => r.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev => {
            if (prev.includes(id)) {
                return prev.filter(rowId => rowId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const isAllSelected = paginatedReservations.length > 0 && 
        paginatedReservations.every(reservation => selectedRows.includes(reservation.id));
    
    const isPartiallySelected = paginatedReservations.length > 0 && 
        paginatedReservations.some(reservation => selectedRows.includes(reservation.id)) && 
        !isAllSelected;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this reservation?')) {
            router.delete(`/reservations/${id}`, {
                onSuccess: () => {
                    toast.success('Reservation deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete reservation');
                },
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedRows.length} selected reservation(s)?`)) {
            router.delete('/reservations/bulk-delete', {
                data: { ids: selectedRows },
                preserveScroll: true,
                onSuccess: (page) => {
                    // Clear selected rows
                    setSelectedRows([]);
                    // Update local state to remove deleted items
                    setReservations(prev => prev.filter(r => !selectedRows.includes(r.id)));
                },
            });
        }
    };

    const getReservationsToExport = () => {
        return selectedRows.length > 0
            ? filteredReservations.filter(r => selectedRows.includes(r.id))
            : filteredReservations;
    };

    // Ensure the formatDate function properly handles any date format
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        
        console.log('Formatting date:', dateString, 'Type:', typeof dateString);
        
        try {
            // Try parsing as is
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                });
            }
            
            // Try converting any hyphens to slashes which helps in some browsers
            const dateWithSlashes = dateString.replace(/-/g, '/');
            const dateWithSlashesObj = new Date(dateWithSlashes);
            if (!isNaN(dateWithSlashesObj.getTime())) {
                return dateWithSlashesObj.toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                });
            }
            
            // If all parsing fails, just return the string
            return dateString;
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    };

    const formatReservationForExport = (reservation: Reservation) => ({
        'Guest Name': `${reservation.first_name} ${reservation.last_name}`,
        'Email': reservation.email,
        'Phone': reservation.phone,
        'Room Type': reservation.accommodation?.type || '',
        'Number of Guests': reservation.number_of_guests,
        'Check-in Date': formatDate(reservation.check_in_date),
        'Check-out Date': formatDate(reservation.check_out_date),
        'Status': reservation.status,
        'Special Requests': reservation.special_requests || '',
    });

    const exportToPDF = () => {
        const dataToExport = getReservationsToExport();
        const formattedData = dataToExport.map(formatReservationForExport);

        // Create a link to download the file
        const link = document.createElement('a');
        link.href = `/reservations/download/pdf?${new URLSearchParams({
            reservations: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `reservations-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded successfully');
    };

    const exportToExcel = () => {
        const dataToExport = getReservationsToExport();
        const formattedData = dataToExport.map(formatReservationForExport);

        // Create a link to download the file
        const link = document.createElement('a');
        link.href = `/reservations/download/excel?${new URLSearchParams({
            reservations: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `reservations-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Excel file downloaded successfully');
    };

    const exportToCSV = () => {
        const dataToExport = getReservationsToExport();
        const formattedData = dataToExport.map(formatReservationForExport);

        // Create a link to download the file
        const link = document.createElement('a');
        link.href = `/reservations/download/csv?${new URLSearchParams({
            reservations: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `reservations-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV file downloaded successfully');
    };

    const printReservations = () => {
        const dataToExport = getReservationsToExport();
        const formattedData = dataToExport.map(formatReservationForExport);

        // Open PDF in new tab
        const printWindow = window.open(
            `/reservations/view-pdf?${new URLSearchParams({
                reservations: JSON.stringify(formattedData)
            })}`,
            '_blank'
        );

        if (!printWindow) {
            toast.error('Please enable popups to print');
            return;
        }

        // Wait for the PDF to load then print
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        // Start with all reservations
        let filtered = initialReservations;

        // Room type filter
        if (filters.roomType && filters.roomType !== 'All Room Types') {
            filtered = filtered.filter(reservation => {
                // Check if accommodation exists and its type matches the filter (case-insensitive)
                if (!reservation.accommodation) return false;
                
                // Check if accommodation name or type matches the selected filter
                const accommodationType = reservation.accommodation.type || '';
                const accommodationName = reservation.accommodation.name || '';
                
                return accommodationType.toLowerCase() === filters.roomType.toLowerCase() || 
                       accommodationName.toLowerCase() === filters.roomType.toLowerCase();
            });
        }

        // Status filter - ensure case insensitive comparison and exact match
        if (filters.status && filters.status !== 'All') {
            filtered = filtered.filter(reservation => {
                // Convert both to lowercase for comparison
                return reservation.status.toLowerCase() === filters.status.toLowerCase();
            });
        }

        // Update the state with the filtered results
        setReservations(filtered);
        // Reset to first page when applying filters
        setCurrentPage(1);
    };

    const handleEdit = (reservation: Reservation) => {
        console.log('Editing reservation with dates:', {
            check_in_date: reservation.check_in_date,
            check_out_date: reservation.check_out_date,
            typeof_check_in: typeof reservation.check_in_date
        });
        
        // Format dates correctly for the date input fields (YYYY-MM-DD)
        let checkInFormatted = '';
        let checkOutFormatted = '';
        
        try {
            // Debug the raw date values
            console.log('Raw date values:', {
                check_in: reservation.check_in_date,
                check_out: reservation.check_out_date
            });
            
            // Handle different date formats that might come from the server
            if (reservation.check_in_date) {
                if (typeof reservation.check_in_date === 'string') {
                    // If it's already a string, try to parse it
                    try {
                        const checkInDate = parseISO(reservation.check_in_date);
                        checkInFormatted = format(checkInDate, 'yyyy-MM-dd');
                    } catch (e) {
                        console.error('Failed to parse check_in_date as ISO format:', e);
                        // If parsing fails, just use the string directly
                        checkInFormatted = reservation.check_in_date;
                    }
                } else {
                    // If it's a Date object
                    checkInFormatted = format(new Date(reservation.check_in_date), 'yyyy-MM-dd');
                }
            }
            
            if (reservation.check_out_date) {
                if (typeof reservation.check_out_date === 'string') {
                    // If it's already a string, try to parse it
                    try {
                        const checkOutDate = parseISO(reservation.check_out_date);
                        checkOutFormatted = format(checkOutDate, 'yyyy-MM-dd');
                    } catch (e) {
                        console.error('Failed to parse check_out_date as ISO format:', e);
                        // If parsing fails, just use the string directly
                        checkOutFormatted = reservation.check_out_date;
                    }
                } else {
                    // If it's a Date object
                    checkOutFormatted = format(new Date(reservation.check_out_date), 'yyyy-MM-dd');
                }
            }
            
            // Debug the formatted dates
            console.log('Formatted dates for input:', {
                check_in_formatted: checkInFormatted,
                check_out_formatted: checkOutFormatted
            });
        } catch (error) {
            console.error('Error formatting dates:', error);
        }
        
        // Initialize room type and room number data for the useBookingForm hook
        // We need to get room type based on accommodation_id
        const roomType = getRoomTypeFromId(String(reservation.accommodation_id));
        const roomNumber = getRoomNumberFromId(String(reservation.accommodation_id));
        
        // Reset the booking form hook with current reservation data
        reset();
        setData('first_name', reservation.first_name);
        setData('last_name', reservation.last_name);
        setData('email', reservation.email);
        setData('phone', reservation.phone);
        setData('check_in_date', checkInFormatted ? new Date(checkInFormatted) : null);
        setData('check_out_date', checkOutFormatted ? new Date(checkOutFormatted) : null);
        setData('room_type', roomType);
        setData('room_number', roomNumber);
        setData('number_of_guests', String(reservation.number_of_guests));
        setData('special_requests', reservation.special_requests || '');
        
        setEditingReservation(reservation);
        setFormData({
            first_name: reservation.first_name,
            last_name: reservation.last_name,
            email: reservation.email,
            phone: reservation.phone,
            check_in_date: checkInFormatted,
            check_out_date: checkOutFormatted,
            accommodation_id: String(reservation.accommodation_id),
            number_of_guests: String(reservation.number_of_guests),
            status: reservation.status,
            special_requests: reservation.special_requests || '',
        });
    };

    const handleSaveEdit = () => {
        if (editingReservation) {
            // Get the accommodation_id from the room type and room number
            const accommodation_id = getAccommodationId(data.room_type, data.room_number);
            
            if (accommodation_id === 0) {
                toast.error('Invalid room selection');
                return;
            }
            
            // Format dates for API submission
            const check_in_formatted = data.check_in_date ? format(new Date(data.check_in_date), 'yyyy-MM-dd') : '';
            const check_out_formatted = data.check_out_date ? format(new Date(data.check_out_date), 'yyyy-MM-dd') : '';
            
            // Add logging to see what values are being sent
            console.log('Submitting edit with form data:', {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                check_in: check_in_formatted,
                check_out: check_out_formatted,
                accommodation_id: accommodation_id,
                number_of_guests: data.number_of_guests,
                status: formData.status,
                special_requests: data.special_requests,
            });
            
            // Prepare data to submit
            const dataToSubmit = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                check_in: check_in_formatted,
                check_out: check_out_formatted,
                accommodation_id: accommodation_id,
                number_of_guests: parseInt(data.number_of_guests),
                status: formData.status,
                special_requests: data.special_requests,
            };
            
            router.put(`/reservations/${editingReservation.id}`, dataToSubmit, {
                onSuccess: () => {
                    setEditingReservation(null);
                    toast.success('Reservation updated successfully');
                    // Refresh the list to show the updated data
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                    toast.error('Failed to update reservation');
                }
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setReservationToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (reservationToDelete) {
            router.delete(`/reservations/${reservationToDelete}`, {
                onSuccess: () => {
                    toast.success('Reservation deleted successfully');
                    setReservations(prev => prev.filter(r => r.id !== reservationToDelete));
                },
                onError: () => {
                    toast.error('Failed to delete reservation');
                },
                preserveScroll: true
            });
        }
        setDeleteConfirmOpen(false);
        setReservationToDelete(null);
    };

    return (
        <>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
            />
            <AppLayout breadcrumbs={[{ title: 'Manage Reservations', href: '/reservations/manage' }]}>
                <Head title="Manage Reservations" />
                <div className="container mx-auto select-none">
                    <Card className="rounded-none border-none">
                        <CardHeader>
                            <CardDescription>View and manage all reservations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Records per page and other controls */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 whitespace-nowrap">Records per page:</span>
                                        <Select value={recordsPerPage} onValueChange={setRecordsPerPage}>
                                            <SelectTrigger className="w-[70px]">
                                                <SelectValue placeholder="10" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="relative">
                                        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <Filter className="h-4 w-4" />
                                                    <span>Filter</span>
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="absolute z-10 left-0 mt-2 w-[400px] bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 border">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-medium mb-2">Room Type</h3>
                                                        <Select 
                                                            value={filters.roomType} 
                                                            onValueChange={(value) => handleFilterChange('roomType', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="All Room Types" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {roomFilters.map(type => (
                                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    <div>
                                                        <h3 className="font-medium mb-2">Status</h3>
                                                        <Select 
                                                            value={filters.status} 
                                                            onValueChange={(value) => handleFilterChange('status', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="All" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusOptions.map(status => (
                                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    <div className="pt-2 flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setFilters({ roomType: 'All Room Types', status: 'All' });
                                                                applyFilters();
                                                            }}
                                                        >
                                                            Reset
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                applyFilters();
                                                                setIsFilterOpen(false);
                                                            }}
                                                        >
                                                            Apply Filters
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search reservations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="Export as PDF"
                                        onClick={exportToPDF}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="Export as Excel"
                                        onClick={exportToExcel}
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="Export as CSV"
                                        onClick={exportToCSV}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="Print"
                                        onClick={printReservations}
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="Delete Selected"
                                        disabled={selectedRows.length === 0}
                                        onClick={handleBulkDelete}
                                        className={selectedRows.length > 0 ? "text-red-500 hover:text-red-600 hover:border-red-600" : ""}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" title="Column Visibility">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.guestName}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, guestName: checked }))
                                                }
                                            >
                                                Guest Name
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.contact}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, contact: checked }))
                                                }
                                            >
                                                Contact
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.room}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, room: checked }))
                                                }
                                            >
                                                Room
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.checkIn}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, checkIn: checked }))
                                                }
                                            >
                                                Check-in
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.checkOut}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, checkOut: checked }))
                                                }
                                            >
                                                Check-out
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.status}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, status: checked }))
                                                }
                                            >
                                                Status
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.actions}
                                                onCheckedChange={(checked) => 
                                                    setColumnVisibility(prev => ({ ...prev, actions: checked }))
                                                }
                                            >
                                                Actions
                                            </DropdownMenuCheckboxItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px] px-2">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    data-state={isPartiallySelected ? "indeterminate" : isAllSelected ? "checked" : "unchecked"}
                                                    onCheckedChange={handleSelectAll}
                                                    className="h-5 w-5 border-2 border-gray-300 rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                />
                                            </TableHead>
                                            {columnVisibility.status && <TableHead>Status</TableHead>}
                                            {columnVisibility.guestName && <TableHead>Guest Name</TableHead>}
                                            {columnVisibility.room && <TableHead>Room</TableHead>}
                                            {columnVisibility.checkIn && <TableHead>Check-in</TableHead>}
                                            {columnVisibility.checkOut && <TableHead>Check-out</TableHead>}
                                            {columnVisibility.actions && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedReservations.map((reservation) => {
                                            // Debug log the current reservation with correct field names
                                            console.log(`Rendering reservation ${reservation.id}:`, {
                                                check_in_date: reservation.check_in_date,
                                                check_out_date: reservation.check_out_date
                                            });
                                            
                                            return (
                                                <TableRow key={reservation.id}>
                                                    <TableCell className="w-[50px] px-2">
                                                        <Checkbox
                                                            checked={selectedRows.includes(reservation.id)}
                                                            onCheckedChange={() => handleSelectRow(reservation.id)}
                                                            className="h-5 w-5 border-2 border-gray-300 rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                        />
                                                    </TableCell>
                                                    {columnVisibility.status && (
                                                        <TableCell>
                                                            <Badge className={`${getStatusColor(reservation.status)} rounded-none px-2 py-0.5 uppercase text-xs font-medium`}>
                                                                {reservation.status.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.guestName && (
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {reservation.first_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {reservation.number_of_guests} {reservation.number_of_guests === 1 ? 'Guest' : 'Guests'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.room && (
                                                        <TableCell>
                                                            <div className="font-medium capitalize">{reservation.accommodation?.formatted_name || reservation.accommodation?.type}</div>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.checkIn && (
                                                        <TableCell>
                                                            {formatDate(reservation.check_in_date)}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.checkOut && (
                                                        <TableCell>
                                                            {formatDate(reservation.check_out_date)}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.actions && (
                                                        <TableCell>
                                                            <div className="flex justify-start gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => handleEdit(reservation)}
                                                                    title="Edit reservation"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => handleDeleteClick(reservation.id)}
                                                                    title="Delete reservation"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {((currentPage - 1) * parseInt(recordsPerPage)) + 1} to {Math.min(currentPage * parseInt(recordsPerPage), filteredReservations.length)} of {filteredReservations.length} results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            {/* Edit Reservation Dialog */}
            <Dialog open={!!editingReservation} onOpenChange={(open) => !open && setEditingReservation(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Reservation</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => hookHandleInputChange('first_name', e.target.value)}
                                />
                                {errors.first_name && (
                                    <p className="text-sm text-red-500">{errors.first_name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => hookHandleInputChange('last_name', e.target.value)}
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-red-500">{errors.last_name}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => hookHandleInputChange('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => hookHandleInputChange('phone', e.target.value)}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="check_in_date">Check-in Date</Label>
                                    <Input
                                        id="check_in_date"
                                        type="date"
                                    value={data.check_in_date ? format(new Date(data.check_in_date), 'yyyy-MM-dd') : ''}
                                    onChange={(e) => {
                                        const dateValue = e.target.value ? new Date(e.target.value) : null;
                                        setData('check_in_date', dateValue);
                                    }}
                                />
                                {errors.check_in_date && (
                                    <p className="text-sm text-red-500">{errors.check_in_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="check_out_date">Check-out Date</Label>
                                    <Input
                                        id="check_out_date"
                                        type="date"
                                    value={data.check_out_date ? format(new Date(data.check_out_date), 'yyyy-MM-dd') : ''}
                                    onChange={(e) => {
                                        const dateValue = e.target.value ? new Date(e.target.value) : null;
                                        setData('check_out_date', dateValue);
                                    }}
                                />
                                {errors.check_out_date && (
                                    <p className="text-sm text-red-500">{errors.check_out_date}</p>
                                )}
                                </div>
                            </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                                <Label htmlFor="room_type">Room Type</Label>
                            <Select 
                                    value={data.room_type}
                                    onValueChange={(value) => hookHandleInputChange('room_type', value)}
                            >
                                    <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                                <SelectContent>
                                        {roomFilters.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                                {errors.room_type && (
                                    <p className="text-sm text-red-500">{errors.room_type}</p>
                                )}
                                {data.room_type && data.check_in_date && data.check_out_date && availableRoomNumbers.length === 0 && !isLoadingRooms && (
                                    <p className="text-sm text-amber-500">No {data.room_type}s available for the selected dates. Please try different dates or room type.</p>
                                )}
                        </div>
                            <div className="space-y-2">
                                <Label htmlFor="room_number">Room Number</Label>
                                <Select
                                    value={data.room_number}
                                    onValueChange={(value) => hookHandleInputChange('room_number', value)}
                                    disabled={!data.room_type || isLoadingRooms || availableRoomNumbers.length === 0}
                                >
                                    <SelectTrigger className={errors.room_number ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={
                                            !data.room_type ? "Select room type first" : 
                                            isLoadingRooms ? "Loading..." : 
                                            availableRoomNumbers.length === 0 ? "No rooms available" :
                                            "Select room number"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoomNumbers.map((number) => (
                                            <SelectItem key={number} value={number}>{number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.room_number && (
                                    <p className="text-sm text-red-500">{errors.room_number}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="number_of_guests">Number of Guests</Label>
                                <Input
                                    id="number_of_guests"
                                    type="number"
                                    min="1"
                                    value={data.number_of_guests}
                                    onChange={(e) => hookHandleInputChange('number_of_guests', e.target.value)}
                                />
                                {errors.number_of_guests && (
                                    <p className="text-sm text-red-500">{errors.number_of_guests}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="checked_in">Checked In</SelectItem>
                                        <SelectItem value="checked_out">Checked Out</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="special_requests">Special Requests</Label>
                            <Textarea
                                id="special_requests"
                                value={data.special_requests}
                                onChange={(e) => setData('special_requests', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReservation(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the reservation
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 