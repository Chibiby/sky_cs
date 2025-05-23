import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Search, FileText, FileSpreadsheet, Download, Printer, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';

interface Guest {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    guests: Guest[];
}

interface ColumnVisibility {
    name: boolean;
    email: boolean;
    phone: boolean;
    address: boolean;
    actions: boolean;
}

export default function ManageGuests({ guests }: Props) {
    const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [recordsPerPage, setRecordsPerPage] = useState('10');
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        name: true,
        email: true,
        phone: true,
        address: true,
        actions: true,
    });
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
    });

    const filteredGuests = guests.filter(guest => 
        guest.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone_number.includes(searchQuery)
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedGuests(filteredGuests.map(guest => guest.id));
        } else {
            setSelectedGuests([]);
        }
    };

    const handleSelectGuest = (guestId: number) => {
        if (selectedGuests.includes(guestId)) {
            setSelectedGuests(selectedGuests.filter(id => id !== guestId));
        } else {
            setSelectedGuests([...selectedGuests, guestId]);
        }
    };

    const getGuestsToExport = () => {
        return selectedGuests.length > 0
            ? filteredGuests.filter(r => selectedGuests.includes(r.id))
            : filteredGuests;
    };

    const formatGuestForExport = (guest: Guest) => ({
        'Name': `${guest.first_name} ${guest.last_name}`,
        'Email': guest.email,
        'Phone': guest.phone_number,
        'Address': guest.address,
        'Created At': new Date(guest.created_at).toLocaleDateString(),
    });

    const exportToPDF = () => {
        const dataToExport = getGuestsToExport();
        const formattedData = dataToExport.map(formatGuestForExport);

        const link = document.createElement('a');
        link.href = `/guests/download/pdf?${new URLSearchParams({
            guests: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `guests-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded successfully');
    };

    const exportToExcel = () => {
        const dataToExport = getGuestsToExport();
        const formattedData = dataToExport.map(formatGuestForExport);

        const link = document.createElement('a');
        link.href = `/guests/download/excel?${new URLSearchParams({
            guests: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `guests-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Excel file downloaded successfully');
    };

    const exportToCSV = () => {
        const dataToExport = getGuestsToExport();
        const formattedData = dataToExport.map(formatGuestForExport);

        const link = document.createElement('a');
        link.href = `/guests/download/csv?${new URLSearchParams({
            guests: JSON.stringify(formattedData)
        })}`;
        link.setAttribute('download', `guests-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV file downloaded successfully');
    };

    const printGuests = () => {
        const dataToExport = getGuestsToExport();
        const formattedData = dataToExport.map(formatGuestForExport);

        const printWindow = window.open(
            `/guests/view-pdf?${new URLSearchParams({
                guests: JSON.stringify(formattedData)
            })}`,
            '_blank'
        );

        if (!printWindow) {
            toast.error('Please enable popups to print');
            return;
        }

        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const handleEdit = (guest: Guest) => {
        setEditingGuest(guest);
        setFormData({
            first_name: guest.first_name,
            last_name: guest.last_name,
            email: guest.email,
            phone_number: guest.phone_number,
            address: guest.address,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (editingGuest) {
            router.put(`/guests/${editingGuest.id}`, formData, {
                onSuccess: () => {
                    setEditingGuest(null);
                    toast.success('Guest information updated successfully');
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update guest information');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manage Guests', href: '/guests/manage' }]}>
            <Head title="Manage Guests" />
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
            <div className="container mx-auto select-none">
                <Card className="rounded-none border-none">
                    <CardHeader>
                        <CardDescription>View and manage all guests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
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
                            <div className="flex items-center gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search guests..."
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
                                    onClick={printGuests}
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" title="Column Visibility">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuCheckboxItem
                                            checked={columnVisibility.name}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => 
                                                setColumnVisibility(prev => ({ ...prev, name: checked }))
                                            }
                                        >
                                            Name
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={columnVisibility.email}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => 
                                                setColumnVisibility(prev => ({ ...prev, email: checked }))
                                            }
                                        >
                                            Email
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={columnVisibility.phone}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => 
                                                setColumnVisibility(prev => ({ ...prev, phone: checked }))
                                            }
                                        >
                                            Phone
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={columnVisibility.address}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => 
                                                setColumnVisibility(prev => ({ ...prev, address: checked }))
                                            }
                                        >
                                            Address
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={columnVisibility.actions}
                                            onSelect={(e) => e.preventDefault()}
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
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        {columnVisibility.name && <TableHead>Name</TableHead>}
                                        {columnVisibility.email && <TableHead>Email</TableHead>}
                                        {columnVisibility.phone && <TableHead>Phone</TableHead>}
                                        {columnVisibility.address && <TableHead>Address</TableHead>}
                                        {columnVisibility.actions && <TableHead className="w-[100px]">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGuests.slice(0, parseInt(recordsPerPage)).map((guest) => (
                                        <TableRow key={guest.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedGuests.includes(guest.id)}
                                                    onCheckedChange={() => handleSelectGuest(guest.id)}
                                                />
                                            </TableCell>
                                            {columnVisibility.name && (
                                                <TableCell>{guest.first_name} {guest.last_name}</TableCell>
                                            )}
                                            {columnVisibility.email && <TableCell>{guest.email}</TableCell>}
                                            {columnVisibility.phone && <TableCell>{guest.phone_number}</TableCell>}
                                            {columnVisibility.address && <TableCell>{guest.address}</TableCell>}
                                            {columnVisibility.actions && (
                                                <TableCell>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleEdit(guest)}
                                                        title="Edit guest"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Guest Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingGuest(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 