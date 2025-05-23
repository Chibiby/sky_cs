import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { addDays, subDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import axios from 'axios';

interface Reservation {
  id: number;
  guest_name: string;
  room_name: string;
  check_in: string | Date;
  check_out: string | Date;
  status: 'pending' | 'arrival' | 'cancelled' | 'completed' | string;
  guest_id?: number;
  accommodation_id?: number;
}

interface BookingCalendarProps {
  reservations: Reservation[];
}

export default function BookingCalendar({ reservations: initialReservations }: BookingCalendarProps) {
  const [selectedRoom, setSelectedRoom] = React.useState('all');
  const [selectedView, setSelectedView] = React.useState('weekly');
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const today = new Date();
    const diff = today.getDay();
    return subDays(today, diff);
  });
  const [roomCounts, setRoomCounts] = useState({ villas: 0, cottages: 0, cabins: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch room counts from the database
  useEffect(() => {
    const fetchRoomCounts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/rooms/count');
        console.log('Room counts from API:', response.data);
        setRoomCounts(response.data);
      } catch (error) {
        console.error('Error fetching room counts:', error);
        // Fallback to default counts if API fails
        setRoomCounts({ villas: 5, cottages: 9, cabins: 9 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomCounts();
  }, []);

  // Function to fetch reservations data
  const fetchReservations = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Add cache-busting query parameter to avoid browser caching
      const response = await axios.get(`/api/reservations/current?t=${new Date().getTime()}`);
      console.log('Fetched reservations:', response.data);
      
      // Reset reservations state to ensure we only show current reservations
      setReservations(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching reservations:', error);
      // If the API call fails, use the initial reservations (if any)
      if (initialReservations && initialReservations.length > 0) {
        setReservations(initialReservations);
      } else if (reservations.length === 0) {
        // Only use test data if no data has been loaded yet
        setReservations(updatedTestReservations);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [initialReservations]);

  // Fetch reservations on initial load
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Set up polling to refresh data more frequently (every 5 seconds)
  useEffect(() => {
    // Initial fetch on load
    fetchReservations();
    
    // Set up polling at a faster rate for real-time updates
    const intervalId = setInterval(() => {
      fetchReservations();
    }, 5000); // 5 seconds for more responsive updating

    return () => clearInterval(intervalId);
  }, [fetchReservations]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchReservations();
  };

  // Create test data for fallback
  const updatedTestReservations: Reservation[] = [
    {
      id: 101,
      guest_name: "Brandanlee",
      room_name: "Villa 1",
      check_in: "2025-04-14",
      check_out: "2025-04-15",
      status: "pending",
      accommodation_id: 1
    },
    {
      id: 102,
      guest_name: "sample",
      room_name: "Villa 2",
      check_in: "2025-04-14",
      check_out: "2025-04-15",
      status: "pending",
      accommodation_id: 2
    },
    {
      id: 103,
      guest_name: "hellws",
      room_name: "Villa 3",
      check_in: "2025-04-14",
      check_out: "2025-04-17",
      status: "pending",
      accommodation_id: 3
    },
    {
      id: 104,
      guest_name: "Brandanlee",
      room_name: "Villa 4",
      check_in: "2025-04-14",
      check_out: "2025-04-17",
      status: "arrival",
      accommodation_id: 4
    },
    {
      id: 105,
      guest_name: "testing",
      room_name: "Villa 5",
      check_in: "2025-04-14",
      check_out: "2025-04-17",
      status: "pending",
      accommodation_id: 5
    }
  ];
  
  // Process reservations for display
  const processedReservations = React.useMemo(() => {
    console.log("Processing reservations:", reservations);
    const result = reservations.map(res => {
      const processed = {
        ...res,
        check_in: typeof res.check_in === 'string' ? new Date(res.check_in) : res.check_in,
        check_out: typeof res.check_out === 'string' ? new Date(res.check_out) : res.check_out,
      };
      return processed;
    });
    console.log("All processed reservations:", result);
    return result;
  }, [reservations]);

  // Dynamically generate accommodation lists based on database counts
  const accommodations = React.useMemo(() => {
    const villas = Array.from({ length: roomCounts.villas }, (_, i) => `Villa ${i + 1}`);
    const cottages = Array.from({ length: roomCounts.cottages }, (_, i) => `Cottage ${i + 1}`);
    const cabins = Array.from({ length: roomCounts.cabins }, (_, i) => `Cabin ${i + 1}`);
    
    const allAccommodations = [...villas, ...cottages, ...cabins];
    console.log('Generated accommodations list:', allAccommodations);
    return allAccommodations;
  }, [roomCounts]);

  // Filter accommodations based on selection
  const filteredAccommodations = React.useMemo(() => {
    if (selectedRoom === 'all') return accommodations;
    if (selectedRoom === 'villas') return accommodations.filter(acc => acc.startsWith('Villa'));
    if (selectedRoom === 'cottages') return accommodations.filter(acc => acc.startsWith('Cottage'));
    if (selectedRoom === 'cabins') return accommodations.filter(acc => acc.startsWith('Cabin'));
    return accommodations.filter(acc => acc.toLowerCase().replace(' ', '-') === selectedRoom);
  }, [selectedRoom, accommodations]);

  // Generate time slots for daily view (24-hour format)
  const timeSlots = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return `${hour}:00`;
    });
  }, []);

  const handlePreviousClick = () => {
    if (selectedView === 'daily') {
      setSelectedDate(prev => subDays(prev, 1));
    } else if (selectedView === 'weekly') {
      setSelectedDate(prev => subDays(prev, 7));
    } else {
      setSelectedDate(prev => {
        const firstDayOfPrevMonth = startOfMonth(subDays(startOfMonth(prev), 1));
        return firstDayOfPrevMonth;
      });
    }
  };

  const handleNextClick = () => {
    if (selectedView === 'daily') {
      setSelectedDate(prev => addDays(prev, 1));
    } else if (selectedView === 'weekly') {
      setSelectedDate(prev => addDays(prev, 7));
    } else {
      setSelectedDate(prev => {
        const firstDayOfNextMonth = startOfMonth(addDays(endOfMonth(prev), 1));
        return firstDayOfNextMonth;
      });
    }
  };

  // Calculate the date range for the current view
  const dateRange = {
    start: selectedDate,
    end: addDays(selectedDate, 6), // End is inclusive of the 7th day
  };

  // Debug current date range
  console.log("Current date range:", {
    start: format(dateRange.start, 'yyyy-MM-dd'),
    end: format(dateRange.end, 'yyyy-MM-dd')
  });

  // Get all villas, cottages, and cabins separately
  const villas = accommodations.filter(acc => acc.startsWith('Villa'));
  const cottages = accommodations.filter(acc => acc.startsWith('Cottage'));
  const cabins = accommodations.filter(acc => acc.startsWith('Cabin'));

  // Calculate total columns for daily view
  const totalColumns = villas.length + cottages.length + cabins.length;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'arrival':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Get tooltip text for reservation
  const getReservationTooltip = (reservation: any) => {
    return `${reservation.guest_name} - ${format(new Date(reservation.check_in), 'MMM dd')} to ${format(new Date(reservation.check_out), 'MMM dd')} - ${reservation.status}`;
  };

  // Update the filter function to more accurately match rooms
  const getReservationsForRoom = (room: string, reservations: Reservation[]) => {
    return reservations.filter(res => {
      // Direct room name match
      if (res.room_name === room) {
        return true;
      }
      
      // Match using accommodation_id and our helper function
      if (res.accommodation_id) {
        const mappedName = getAccommodationName(res.accommodation_id);
        console.log(`Comparing: reservation room (${res.room_name}) / mapped from ID ${res.accommodation_id} (${mappedName}) / with current room (${room})`);
        return mappedName === room;
      }
      
      return false;
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Booking Calendar', href: '/reservations/booking-calendar' }]}>
      <Head title="Booking Calendar" />
      <div className="p-6">
        <div className="container mx-auto space-y-6 select-none">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              View and manage room availability and reservations across all accommodations
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Last updated: {format(lastUpdated, 'MMM d, yyyy HH:mm:ss')}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Calendar Section */}
          <Card className="rounded-lg">
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="ml-2">Loading rooms from database...</span>
                </div>
              ) : (
              <div className="flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-[140px]">
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Rooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rooms</SelectItem>
                            <SelectItem value="villas">All Villas ({roomCounts.villas})</SelectItem>
                            <SelectItem value="cottages">All Cottages ({roomCounts.cottages})</SelectItem>
                            <SelectItem value="cabins">All Cabins ({roomCounts.cabins})</SelectItem>
                          {accommodations.map((acc) => (
                            <SelectItem key={acc} value={acc.toLowerCase().replace(' ', '-')}>
                              {acc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* View Options - Dropdown on mobile, buttons on desktop */}
                    <div className="sm:hidden">
                      <Select value={selectedView} onValueChange={setSelectedView}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant={selectedView === 'daily' ? 'default' : 'outline'}
                        onClick={() => setSelectedView('daily')}
                        className="px-3"
                        size="sm"
                      >
                        Daily
                      </Button>
                      <Button
                        variant={selectedView === 'weekly' ? 'default' : 'outline'}
                        onClick={() => setSelectedView('weekly')}
                        className="px-3"
                        size="sm"
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={selectedView === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setSelectedView('monthly')}
                        className="px-3"
                        size="sm"
                      >
                        Monthly
                      </Button>
                    </div>

                    {/* Navigation - Icons only on mobile */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        onClick={handlePreviousClick}
                        size="sm"
                        className="px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextClick}
                        size="sm"
                        className="px-2"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Scrollable Container */}
                <div className="overflow-x-auto max-w-[950px]">
                  {selectedView === 'weekly' ? (
                    // Weekly View
                    <div className="flex min-w-[800px]">
                      {/* Room Labels */}
                      <div className="w-40 border-r">
                        <div className="h-[84px] border-b px-4 flex items-end pb-2 font-medium">Rooms</div>
                        <div className="space-y-0">
                          {filteredAccommodations.map((room) => (
                            <div key={room} className="px-4 h-[52px] flex items-center text-sm border-b last:border-b-0">
                              {room}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="flex-1 overflow-x-auto">
                        <div className="min-w-[800px] flex flex-col h-full">
                          {/* Month Header */}
                          <div className="h-[44px] flex items-center px-4 border-b text-lg font-medium">
                            {format(dateRange.start, 'MMMM') !== format(addDays(dateRange.start, 6), 'MMMM')
                              ? `${format(dateRange.start, 'MMMM')} - ${format(addDays(dateRange.start, 6), 'MMMM')} ${format(dateRange.start, 'yyyy')}`
                              : `${format(dateRange.start, 'MMMM yyyy')}`
                            }
                          </div>

                          {/* Date Headers */}
                          <div className="grid grid-cols-7 border-b h-[40px]">
                            {Array.from({ length: 7 }).map((_, i) => {
                              const date = addDays(dateRange.start, i);
                              return (
                                <div key={i} className="border-r flex flex-col justify-center">
                                  <div className="px-4 text-center text-sm text-muted-foreground">
                                    {format(date, 'EEE')}
                                  </div>
                                  <div className="px-4 text-center font-medium">
                                    {format(date, 'd')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Room Rows */}
                            {filteredAccommodations.map((room) => {
                              // Find reservations for this room
                              const roomReservations = getReservationsForRoom(room, processedReservations);
                              
                              // Log which reservations were found for debugging
                              console.log(`Reservations for ${room}:`, roomReservations);
                              
                              return (
                                <div key={room} className="grid grid-cols-7 border-b h-[52px] relative">
                                  {Array.from({ length: 7 }).map((_, i) => {
                                    const cellDate = addDays(dateRange.start, i);
                                    return (
                                <div
                                  key={i}
                                        className="border-r relative group hover:bg-accent/50 transition-colors h-full"
                                      />
                                    );
                                  })}
                                  
                                  {/* Render reservation bars that span across multiple days */}
                                  {roomReservations.map(reservation => {
                                    // Check if the reservation overlaps with the current week
                                    const startDate = new Date(reservation.check_in);
                                    const endDate = new Date(reservation.check_out);
                                    
                                    // Debug each reservation calculation
                                    console.log(`Checking reservation for ${room}:`, {
                                      id: reservation.id,
                                      name: reservation.guest_name,
                                      startDate: format(startDate, 'yyyy-MM-dd'),
                                      endDate: format(endDate, 'yyyy-MM-dd'),
                                      weekStart: format(dateRange.start, 'yyyy-MM-dd'),
                                      weekEnd: format(dateRange.end, 'yyyy-MM-dd'),
                                      isOutsideRange: endDate < dateRange.start || startDate > dateRange.end
                                    });
                                    
                                    // Skip if outside current week
                                    if (endDate < dateRange.start || startDate > dateRange.end) {
                                      console.log("Skipping - outside date range");
                                      return null;
                                    }
                                    
                                    // Calculate display start (max of reservation start and week start)
                                    const displayStart = startDate < dateRange.start ? dateRange.start : startDate;
                                    
                                    // Calculate display end (min of reservation end and week end)
                                    const displayEnd = endDate > dateRange.end ? dateRange.end : endDate;
                                    
                                    // Calculate position - Fix the date calculation to ensure accurate alignment
                                    const startDiff = Math.round((displayStart.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
                                    const endDiff = Math.round((displayEnd.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
                                    const width = `${(endDiff - startDiff + 1) * (100/7)}%`;
                                    const left = `${startDiff * (100/7)}%`;
                                    
                                    console.log("Reservation positioning (fixed):", {
                                      reservation: reservation.room_name,
                                      guest: reservation.guest_name,
                                      startDiff,
                                      endDiff,
                                      daysDiff: (endDiff - startDiff + 1),
                                      width,
                                      left,
                                      checkIn: format(startDate, 'yyyy-MM-dd'),
                                      checkOut: format(endDate, 'yyyy-MM-dd')
                                    });
                                    
                                    return (
                                      <div
                                        key={reservation.id}
                                        className={`absolute h-[40px] top-[6px] z-10 rounded-md px-2 text-xs text-white font-medium flex items-center justify-start overflow-hidden whitespace-nowrap shadow-md border-2 border-white ${getStatusColor(reservation.status)}`}
                                        style={{ left, width }}
                                        title={getReservationTooltip(reservation)}
                                      >
                                        {reservation.guest_name}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : selectedView === 'daily' ? (
                    // Daily View
                    <div className="flex min-w-[1000px]">
                      {/* Time Labels Column */}
                      <div className="w-40 border-r flex-shrink-0">
                        <div className="h-[44px] border-b"></div>
                        <div className="h-[40px] border-b flex items-center justify-center font-medium">
                          Time
                        </div>
                        <div>
                          {timeSlots.map((time) => (
                            <div key={time} className="h-[52px] flex items-center justify-center text-sm border-b">
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="flex-1">
                        <div className="flex flex-col h-full">
                          {/* Date Header */}
                          <div className="h-[44px] flex items-center px-4 border-b text-lg font-medium">
                            {format(selectedDate, 'MMMM d, yyyy')}
                          </div>

                          {/* Room Headers */}
                          <div className="h-[40px] flex border-b">
                            {filteredAccommodations.map((room) => (
                              <div key={room} className="w-[110px] border-r flex items-center justify-center">
                                <span className="font-medium text-sm whitespace-nowrap">
                                  {room}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Time Slots Grid */}
                          <div>
                            {timeSlots.map((time) => (
                              <div key={time} className="flex border-b">
                                {filteredAccommodations.map((room) => (
                                  <div
                                    key={`${time}-${room}`}
                                    className="w-[110px] h-[52px] border-r relative group hover:bg-accent/50 transition-colors"
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Monthly View
                    <div className="flex flex-col min-w-[800px]">
                      {/* Month Header */}
                      <div className="h-[44px] flex items-center px-4 border-b text-lg font-medium">
                        {format(selectedDate, 'MMMM yyyy')}
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 border-b">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="h-[40px] border-r last:border-r-0 flex items-center justify-center">
                            <span className="text-sm font-medium">{day}</span>
                          </div>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                        <div className="grid grid-cols-7 grid-rows-6 h-[312px]">
                          {generateMonthGrid(selectedDate).map((day, i) => (
                            <div
                              key={i}
                              className={`border-r border-b p-1 relative ${
                                !isSameMonth(day, selectedDate) ? 'bg-gray-50 text-gray-400' : ''
                              }`}
                            >
                              <span className="text-sm font-medium">{format(day, 'd')}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                  {/* Status Legend */}
                  <div className="flex items-center justify-start gap-4 pt-4 mt-4 border-t">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Arrival</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Cancelled</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper function to generate the month grid
function generateMonthGrid(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

// Helper function to get accommodation name from ID
function getAccommodationName(id: number): string {
  // Based on the seeding structure in the system:
  // Villa IDs: 1-5
  // Cottage IDs: 6-14
  // Cabin IDs: 15-23
  if (id >= 1 && id <= 5) {
    return `Villa ${id}`;
  } else if (id >= 6 && id <= 14) {
    return `Cottage ${id - 5}`;
  } else if (id >= 15 && id <= 23) {
    return `Cabin ${id - 14}`;
  }
  return 'Unknown';
} 