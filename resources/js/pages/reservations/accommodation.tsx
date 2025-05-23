import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BedDouble, Search, Filter, ChevronDown, Plus, Calendar, Users, Clock, Sparkles, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Reservation {
  check_in: string;
  check_out: string;
  guest_name: string;
  number_of_guests: number;
  status: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  description: string;
  max_occupancy: number;
  base_price: number;
  extra_person_fee: number;
  amenities: string[];
  location: string;
  is_active: boolean;
  is_occupied: boolean;
  housekeeping_status: string;
  current_guests: number;
  check_in: {
    date: string;
    time: string;
  };
  check_out: {
    date: string;
    time: string;
  };
  current_reservation: Reservation | null;
  next_reservation: Reservation | null;
  all_reservations: Reservation[];
}

interface AccommodationPageProps {
  accommodations: Accommodation[];
  flash: any;
}

interface EditDialogProps {
  room: Accommodation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Accommodation>) => void;
}

function EditDialog({ room, isOpen, onClose, onSave }: EditDialogProps) {
  const [editData, setEditData] = useState({
    name: room.name,
    type: room.type,
    description: room.description,
    max_occupancy: room.max_occupancy,
    base_price: room.base_price,
    extra_person_fee: room.extra_person_fee,
    location: room.location,
    is_active: room.is_active,
    is_occupied: room.is_occupied,
    housekeeping_status: room.housekeeping_status
  });

  const handleSave = () => {
    onSave(room.id, editData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {room.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Room Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Room Type</Label>
              <Select
                value={editData.type}
                onValueChange={(value) => setEditData({...editData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="cottage">Cottage</SelectItem>
                  <SelectItem value="cabin">Cabin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-max-occupancy">Max Occupancy</Label>
              <Input
                id="edit-max-occupancy"
                type="number"
                min="1"
                value={editData.max_occupancy}
                onChange={(e) => setEditData({...editData, max_occupancy: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select
                value={editData.location}
                onValueChange={(value) => setEditData({...editData, location: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="South Pool Side">South Pool Side</SelectItem>
                  <SelectItem value="North Pool Side">North Pool Side</SelectItem>
                  <SelectItem value="East Pool Side">East Pool Side</SelectItem>
                  <SelectItem value="West Pool Side">West Pool Side</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-base-price">Base Price (₱)</Label>
              <Input
                id="edit-base-price"
                type="number"
                min="0"
                step="100"
                value={editData.base_price}
                onChange={(e) => setEditData({...editData, base_price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-extra-person-fee">Extra Person Fee (₱)</Label>
              <Input
                id="edit-extra-person-fee"
                type="number"
                min="0"
                step="10"
                value={editData.extra_person_fee}
                onChange={(e) => setEditData({...editData, extra_person_fee: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-is-active">Active Status</Label>
              <Select
                value={editData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => setEditData({...editData, is_active: value === 'active'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-is-occupied">Occupied Status</Label>
              <Select
                value={editData.is_occupied ? 'yes' : 'no'}
                onValueChange={(value) => setEditData({...editData, is_occupied: value === 'yes'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-housekeeping-status">Housekeeping Status</Label>
              <Select
                value={editData.housekeeping_status}
                onValueChange={(value) => setEditData({...editData, housekeeping_status: value})}
              >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="dirty">Dirty</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Accommodation({ accommodations, flash }: AccommodationPageProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [occupiedStatusFilter, setOccupiedStatusFilter] = useState('all');
  const [housekeepingStatusFilter, setHousekeepingStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Accommodation | null>(null);
  // Track expanded booking sections for each room
  const [expandedBookings, setExpandedBookings] = useState<{[key: string]: boolean}>({});

  // Add state for the add room dialog
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    type: 'villa',
    description: '',
    max_occupancy: 4,
    base_price: 1000.00,
    extra_person_fee: 100.00,
    location: 'South Pool Side',
    amenities: [] as string[],
    is_active: true,
    is_occupied: false,
    housekeeping_status: 'clean'
  });

  // Show success message if present
  React.useEffect(() => {
    if (flash?.success) {
      toast({
        description: flash.success,
      });
    }
  }, [flash?.success]);

  // Get the highest room number for a specific room type
  const getNextRoomNumber = (type: string): number => {
    if (!accommodations || accommodations.length === 0) return 1;
    
    const roomsOfType = accommodations.filter(room => room.type === type);
    if (roomsOfType.length === 0) return 1;
    
    // Extract room numbers from names (assuming format is "Type X" where X is a number)
    const roomNumbers = roomsOfType.map(room => {
      const match = room.name.match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    });
    
    return Math.max(...roomNumbers) + 1;
  };

  // Function to check if room name already exists
  const isRoomNameUnique = (name: string): boolean => {
    if (!accommodations) return true;
    return !accommodations.some(room => room.name.toLowerCase() === name.toLowerCase());
  };

  // Handle room type change - update room name with next number
  const handleRoomTypeChange = (type: string) => {
    const nextNumber = getNextRoomNumber(type);
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const suggestedName = `${capitalizedType} ${nextNumber}`;
    
    setNewRoomData({
      ...newRoomData,
      type,
      name: suggestedName
    });
  };

  const filteredAccommodations = accommodations?.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type.toLowerCase() === typeFilter;
    const matchesActiveStatus = activeStatusFilter === 'all' || 
      (activeStatusFilter === 'active' && room.is_active) || 
      (activeStatusFilter === 'inactive' && !room.is_active);
    const matchesOccupiedStatus = occupiedStatusFilter === 'all' || 
      (occupiedStatusFilter === 'yes' && room.is_occupied) || 
      (occupiedStatusFilter === 'no' && !room.is_occupied);
    const matchesHousekeepingStatus = housekeepingStatusFilter === 'all' || 
      room.housekeeping_status === housekeepingStatusFilter;
    
    return matchesSearch && matchesType && matchesActiveStatus && matchesOccupiedStatus && matchesHousekeepingStatus;
  });

  const activeFilters = [
    typeFilter !== 'all' && `Type: ${typeFilter}`,
    activeStatusFilter !== 'all' && `Status: ${activeStatusFilter}`,
    occupiedStatusFilter !== 'all' && `Occupied: ${occupiedStatusFilter}`,
    housekeepingStatusFilter !== 'all' && `Housekeeping: ${housekeepingStatusFilter}`,
  ].filter(Boolean);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRoomClick = (room: Accommodation) => {
    setSelectedRoom(room);
  };

  const handleCloseDialog = () => {
    setSelectedRoom(null);
  };

  const handleSaveChanges = (id: string, data: Partial<Accommodation>) => {
    // Create a data object with only the fields we want to update
    const updateData = {
      name: data.name,
      type: data.type,
      description: data.description,
      max_occupancy: data.max_occupancy,
      base_price: data.base_price,
      extra_person_fee: data.extra_person_fee,
      location: data.location,
      is_active: data.is_active,
      is_occupied: data.is_occupied,
      housekeeping_status: data.housekeeping_status
    };
    
    router.put(`/accommodations/${id}`, updateData, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedRoom(null);
        toast({
          description: "Room updated successfully",
        });
      },
      onError: (errors) => {
        console.error(errors);
        toast({
          description: "Failed to update room",
          variant: "destructive",
        });
      }
    });
  };

  // Add handler for deleting a room
  const handleDeleteRoom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the card click from triggering
    
    if (confirm('Are you sure you want to delete this room?')) {
      router.delete(`/accommodations/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast({
            description: "Room deleted successfully",
          });
        },
        onError: () => {
          toast({
            description: "Failed to delete room",
            variant: "destructive",
          });
        }
      });
    }
  };

  // Add handler for creating a new room
  const handleAddRoom = () => {
    // Check if room name already exists
    if (!isRoomNameUnique(newRoomData.name)) {
      toast({
        description: "A room with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }
    
    // Log the form data before submission
    console.log('Submitting new room data:', newRoomData);
    
    router.post('/accommodations', newRoomData, {
      preserveScroll: true,
      onSuccess: () => {
        setIsAddRoomOpen(false);
        toast({
          description: "Room added successfully",
        });
        // Reset form data
        setNewRoomData({
          name: '',
          type: 'villa',
          description: '',
          max_occupancy: 4,
          base_price: 1000.00,
          extra_person_fee: 100.00,
          location: 'South Pool Side',
          amenities: [],
          is_active: true,
          is_occupied: false,
          housekeeping_status: 'clean'
        });
      },
      onError: (errors) => {
        console.error(errors);
        toast({
          description: "Failed to add room",
          variant: "destructive",
        });
      }
    });
  };

  // Toggle booking section visibility for a specific room
  const toggleBookings = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation(); // Prevent the card click from triggering
    setExpandedBookings(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Accommodation', href: '/reservations/accommodation' }]}>
      <Head title="Accommodation" />
      <div className="container mx-auto p-6 select-none">
        <div className="flex flex-col space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Accommodation</h1>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Monitor and manage room and cottage availability status
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search accommodations..."
                  className="md:w-[300px] pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsAddRoomOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Room</span>
              </Button>
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                <span>Filter</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute z-10 right-6 mt-2 w-[280px] bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 border">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Room Type</h3>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="cottage">Cottage</SelectItem>
                          <SelectItem value="cabin">Cabin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Active Status</h3>
                      <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Occupied Status</h3>
                      <Select value={occupiedStatusFilter} onValueChange={setOccupiedStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupancy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Occupied</SelectItem>
                          <SelectItem value="no">Not Occupied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Housekeeping Status</h3>
                      <Select value={housekeepingStatusFilter} onValueChange={setHousekeepingStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select housekeeping status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="clean">Clean</SelectItem>
                          <SelectItem value="dirty">Dirty</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {activeFilters.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex flex-wrap gap-2">
                          {activeFilters.map((filter, index) => (
                            <Badge key={index} variant="secondary" className="rounded-full">
                              {filter}
                            </Badge>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-auto p-1"
                            onClick={() => {
                              setTypeFilter('all');
                              setActiveStatusFilter('all');
                              setOccupiedStatusFilter('all');
                              setHousekeepingStatusFilter('all');
                            }}
                          >
                            Clear all
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccommodations.map((room) => (
                <Card 
                  key={room.id} 
                  className="hover:bg-accent/50 transition-colors cursor-pointer relative" 
                >
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full"
                      onClick={() => handleRoomClick(room)}
                      title="Edit Room"
                    >
                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-white/80 hover:bg-white hover:text-red-600 dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full"
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      title="Delete Room"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground capitalize">{room.type}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{room.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Room status information */}
                      <div className="space-y-1 text-sm border-l-2 border-blue-500 pl-3 mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">Status: </span>
                            <Badge variant="outline" className={room.is_active ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}>
                              {room.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Occupied: </span>
                            <Badge variant="outline" className={room.is_occupied ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}>
                              {room.is_occupied ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Housekeeping: </span>
                        <Badge 
                          variant="outline" 
                          className={
                            room.housekeeping_status === 'clean' ? 'border-green-500 text-green-600' :
                            room.housekeeping_status === 'dirty' ? 'border-red-500 text-red-600' :
                            room.housekeeping_status === 'cleaning' ? 'border-blue-500 text-blue-600' :
                            'border-yellow-500 text-yellow-600'
                          }
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {room.housekeeping_status.charAt(0).toUpperCase() + room.housekeeping_status.slice(1)}
                        </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Occupancy: </span>
                            <span className="text-foreground">{room.max_occupancy} {room.max_occupancy > 1 ? 'Guests' : 'Guest'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price information */}
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Base Price: <span className="text-foreground">₱{room.base_price}</span></div>
                          <div className="text-muted-foreground">Extra Person: <span className="text-foreground">₱{room.extra_person_fee}</span></div>
                        </div>
                        
                        {/* Show expand/collapse button only if there are reservations */}
                        {room.all_reservations && room.all_reservations.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => toggleBookings(e, room.id)} 
                            className="ml-auto"
                          >
                            {expandedBookings[room.id] ? 
                              <div className="flex items-center"><ChevronDown className="h-4 w-4 mr-1" />Hide Bookings</div> : 
                              <div className="flex items-center">
                                <ChevronDown className="h-4 w-4 mr-1 transform -rotate-90" />
                                Show Bookings {room.all_reservations.length > 0 ? `(${room.all_reservations.length})` : ''}
                              </div>
                            }
                          </Button>
                        )}
                      </div>
                      
                      {/* Display all reservations sorted by check-in date if expanded */}
                      {room.all_reservations && room.all_reservations.length > 0 && expandedBookings[room.id] && (
                        <div className="space-y-3">
                          {room.all_reservations.map((reservation, index) => (
                            <div 
                              key={index} 
                              className={`space-y-1 text-sm border-l-2 pl-3 ${
                                // Current reservation (matching the check-in/check-out dates)
                                room.current_reservation && 
                                room.current_reservation.check_in === reservation.check_in && 
                                room.current_reservation.check_out === reservation.check_out
                                  ? 'border-red-500'
                                  : 'border-yellow-500'
                              }`}
                            >
                          <div className="flex items-center justify-between">
                                <p className={`font-medium ${
                                  // Current reservation text color
                                  room.current_reservation && 
                                  room.current_reservation.check_in === reservation.check_in && 
                                  room.current_reservation.check_out === reservation.check_out
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}>
                                  {/* Label as Current or Upcoming based on dates */}
                                  {room.current_reservation && 
                                   room.current_reservation.check_in === reservation.check_in && 
                                   room.current_reservation.check_out === reservation.check_out
                                    ? 'Current Booking'
                                    : 'Upcoming Booking'}
                                </p>
                            <Badge 
                              variant="outline" 
                              className={
                                    reservation.status === 'confirmed' ? 'border-green-500 text-green-600' :
                                    reservation.status === 'arrival' ? 'border-blue-500 text-blue-600' :
                                'border-yellow-500 text-yellow-600'
                              }
                            >
                                  {reservation.status === 'confirmed' ? 'Confirmed' :
                                   reservation.status === 'arrival' ? 'Arriving' :
                               'Pending'}
                            </Badge>
                          </div>
                              <p>Guest: {reservation.guest_name}</p>
                              
                              {/* Show detailed check-in/out for current reservation, simplified for others */}
                              {room.current_reservation && 
                               room.current_reservation.check_in === reservation.check_in && 
                               room.current_reservation.check_out === reservation.check_out ? (
                          <div className="grid grid-cols-2 gap-4 mt-1">
                            <div className="border rounded-md p-2">
                              <div className="font-medium mb-1">Check-in</div>
                              <div className="flex flex-col text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                        <span>{formatDate(reservation.check_in)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(room.check_in.time)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="border rounded-md p-2">
                              <div className="font-medium mb-1">Check-out</div>
                              <div className="flex flex-col text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                        <span>{formatDate(reservation.check_out)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(room.check_out.time)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}</span>
                        </div>
                      )}

                              <div className="mt-1">
                                <span className="text-sm text-muted-foreground">Number of Guests: {reservation.number_of_guests}</span>
                          </div>
                          </div>
                          ))}
                        </div>
                      )}

                      {/* If there are bookings but they're collapsed, show a summary */}
                      {room.all_reservations && room.all_reservations.length > 0 && !expandedBookings[room.id] && (
                        <div className="text-sm text-muted-foreground italic">
                          {room.all_reservations.length} booking{room.all_reservations.length > 1 ? 's' : ''} {room.is_occupied ? '(Currently occupied)' : ''}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
          </div>
        </div>

        {selectedRoom && (
          <EditDialog
            room={selectedRoom}
            isOpen={true}
            onClose={handleCloseDialog}
            onSave={handleSaveChanges}
          />
        )}

        {/* Add Room Dialog */}
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Select
                    value={newRoomData.type}
                    onValueChange={(value) => handleRoomTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="cottage">Cottage</SelectItem>
                      <SelectItem value="cabin">Cabin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                    placeholder="e.g., Villa 6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRoomData.description}
                  onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                  placeholder="Room description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_occupancy">Max Occupancy</Label>
                  <Input
                    id="max_occupancy"
                    type="number"
                    min="1"
                    value={newRoomData.max_occupancy}
                    onChange={(e) => setNewRoomData({...newRoomData, max_occupancy: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={newRoomData.location}
                    onValueChange={(value) => setNewRoomData({...newRoomData, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="South Pool Side">South Pool Side</SelectItem>
                      <SelectItem value="North Pool Side">North Pool Side</SelectItem>
                      <SelectItem value="East Pool Side">East Pool Side</SelectItem>
                      <SelectItem value="West Pool Side">West Pool Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (₱)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    min="0"
                    step="100"
                    value={newRoomData.base_price}
                    onChange={(e) => setNewRoomData({...newRoomData, base_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extra_person_fee">Extra Person Fee (₱)</Label>
                  <Input
                    id="extra_person_fee"
                    type="number"
                    min="0"
                    step="10"
                    value={newRoomData.extra_person_fee}
                    onChange={(e) => setNewRoomData({...newRoomData, extra_person_fee: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Status Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Select
                    value={newRoomData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => setNewRoomData({...newRoomData, is_active: value === 'active'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_occupied">Occupied Status</Label>
                  <Select
                    value={newRoomData.is_occupied ? 'yes' : 'no'}
                    onValueChange={(value) => setNewRoomData({...newRoomData, is_occupied: value === 'yes'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupancy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="housekeeping_status">Housekeeping Status</Label>
                  <Select
                    value={newRoomData.housekeeping_status}
                    onValueChange={(value) => setNewRoomData({...newRoomData, housekeeping_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">Clean</SelectItem>
                      <SelectItem value="dirty">Dirty</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRoom}>Add Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
} 