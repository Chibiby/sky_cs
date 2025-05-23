import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    check_in_date: Date | null;
    check_out_date: Date | null;
    room_type: string;
    room_number: string;
    number_of_guests: string;
    special_requests: string;
    status: string;
    accommodation_id: string;
    address: string;
    [key: string]: string | Date | null;
}

export function useBookingForm() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [availableRoomNumbers, setAvailableRoomNumbers] = useState<string[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
    
    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        check_in_date: null,
        check_out_date: null,
        room_type: '',
        room_number: '',
        number_of_guests: '',
        special_requests: '',
        status: 'pending',
        accommodation_id: '',
        address: 'Default Address'
    });

    // Room type options
    const roomTypes = ['Villa', 'Cottage', 'Cabin'];

    // Update available room numbers when room type or dates change
    useEffect(() => {
        if (data.room_type && data.check_in_date && data.check_out_date) {
            setIsLoadingRooms(true);
            
            // Reset room number when room type or dates change
            if (data.room_number) {
                setData('room_number', '');
            }
            
            // Format dates for the API request - ensure dates are not null
            const checkInFormatted = data.check_in_date ? format(new Date(data.check_in_date), 'yyyy-MM-dd') : '';
            const checkOutFormatted = data.check_out_date ? format(new Date(data.check_out_date), 'yyyy-MM-dd') : '';
            
            console.log(`Checking availability for ${data.room_type} between ${checkInFormatted} and ${checkOutFormatted}`);
            
            // Use API to get available room numbers for the selected dates
            axios.get(`/api/rooms/available`, {
                params: {
                    room_type: data.room_type.toLowerCase(), // Always use lowercase for consistency
                    check_in: checkInFormatted,
                    check_out: checkOutFormatted
                }
            })
                .then(response => {
                    console.log('Room availability API response:', response.data);
                    
                    if (response.data && Array.isArray(response.data)) {
                        // Map the response to room numbers
                        const roomNumbers = response.data.map(room => room.room_number.toString());
                        console.log(`Found ${roomNumbers.length} available room(s):`, roomNumbers);
                        
                        setAvailableRoomNumbers(roomNumbers);
                        
                        // Store this data in localStorage for getAccommodationId to use
                        try {
                            // Get existing cache or create a new one
                            let accommodationCache = [];
                            const existingCache = localStorage.getItem('accommodationCache');
                            
                            if (existingCache) {
                                accommodationCache = JSON.parse(existingCache);
                                // Remove any rooms of this type to avoid duplication
                                accommodationCache = accommodationCache.filter(
                                    (room: any) => room.type.toLowerCase() !== data.room_type.toLowerCase()
                                );
                            }
                            
                            // Add the new rooms and save back to localStorage
                            accommodationCache.push(...response.data);
                            localStorage.setItem('accommodationCache', JSON.stringify(accommodationCache));
                        } catch (error) {
                            console.error('Error updating accommodation cache:', error);
                        }
                    } else {
                        console.error('Unexpected API response format:', response.data);
                        setAvailableRoomNumbers([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching available room numbers:', error);
                    
                    // Fall back to making a direct query for all rooms of this type
                    console.log(`Falling back to separate API calls for room type ${data.room_type}`);
                    
                    // This is a fallback if the availability API fails
                    axios.get(`/api/rooms/by-type/${data.room_type.toLowerCase()}`)
                        .then(response => {
                            console.log(`Fetched all ${data.room_type} rooms:`, response.data);
                            
                            if (response.data && Array.isArray(response.data)) {
                                // Get all room numbers for this type, regardless of availability
                                const allRoomNumbers = response.data.map(room => room.room_number.toString());
                                console.log(`All room numbers for ${data.room_type}:`, allRoomNumbers);
                                
                                // Make another request to get current bookings
                                axios.get('/api/reservations/current')
                                    .then(bookingsResponse => {
                                        console.log('Current reservations:', bookingsResponse.data);
                                        
                                        if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
                                            // Get all room IDs that are currently booked
                                            const bookedRoomIds = bookingsResponse.data
                                                .filter(booking => {
                                                    // Check if booking dates overlap with selected dates
                                                    const bookingCheckIn = new Date(booking.check_in);
                                                    const bookingCheckOut = new Date(booking.check_out);
                                                    const selectedCheckIn = new Date(checkInFormatted);
                                                    const selectedCheckOut = new Date(checkOutFormatted);
                                                    
                                                    const overlaps = (
                                                        (bookingCheckIn <= selectedCheckOut && 
                                                         bookingCheckOut >= selectedCheckIn)
                                                    );
                                                    
                                                    console.log(`Booking #${booking.id} (${booking.accommodation_id}): ${booking.check_in} to ${booking.check_out} - Overlaps: ${overlaps}`);
                                                    
                                                    return overlaps;
                                                })
                                                .map(booking => booking.accommodation_id.toString());
                                            
                                            console.log('Booked room IDs:', bookedRoomIds);
                                            
                                            // Find the rooms from our list that are not booked
                                            const availableRooms = response.data.filter(
                                                (room: any) => !bookedRoomIds.includes(room.id.toString())
                                            );
                                            
                                            const availableRoomNumbers = availableRooms.map(
                                                (room: any) => room.room_number.toString()
                                            );
                                            
                                            console.log(`Available room numbers after filtering:`, availableRoomNumbers);
                                            
                                            setAvailableRoomNumbers(availableRoomNumbers);
                                            
                                            // Update the accommodation cache
                                            localStorage.setItem('accommodationCache', JSON.stringify(availableRooms));
                                        } else {
                                            // If we can't get booking data, just show all rooms
                                            console.log('No booking data found, showing all rooms');
                                            setAvailableRoomNumbers(allRoomNumbers);
                                        }
                                    })
                                    .catch(bookingsError => {
                                        console.error('Error fetching current bookings:', bookingsError);
                                        // If we can't get booking data, just show all rooms
                                        console.log('Error fetching bookings, showing all rooms');
                                        setAvailableRoomNumbers(allRoomNumbers);
                                    });
                            } else {
                                console.error('Invalid room data response:', response.data);
                                setAvailableRoomNumbers([]);
                            }
                        })
                        .catch(fallbackError => {
                            console.error('Even fallback room fetch failed:', fallbackError);
                            setAvailableRoomNumbers([]);
                        });
                })
                .finally(() => {
                    setIsLoadingRooms(false);
                });
        } else {
            setAvailableRoomNumbers([]);
        }
    }, [data.room_type, data.check_in_date, data.check_out_date]);

    // Validate a single field with common validation rules
    const validateField = (name: string, value: string): string | null => {
        const patterns = {
            first_name: {
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'First name should only contain letters and be 2-50 characters long'
            },
            last_name: {
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'Last name should only contain letters and be 2-50 characters long'
            },
            email: {
                pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                pattern: /^(\+63|0)[\d]{10}$/,
                message: 'Please enter a valid Philippine phone number (e.g., +639123456789 or 09123456789)'
            },
            number_of_guests: {
                pattern: /^[1-9][0-9]*$/,
                message: 'Number of guests must be a positive number'
            }
        };

        if (name === 'room_type' && !value) {
            return 'Please select a room type';
        }

        if (name === 'room_number' && !value) {
            return 'Please select a room number';
        }

        if (name === 'number_of_guests' && !value) {
            return 'Please specify the number of guests';
        }

        if (name in patterns) {
            const { pattern, message } = patterns[name as keyof typeof patterns];
            return !value || pattern.test(value) ? null : message;
        }
        return null;
    };
    
    // Handle input changes with validation
    const handleInputChange = (field: string, value: string) => {
        const error = validateField(field, value);
        setData(field, value);
        
        if (error) {
            setError(field, error);
        } else {
            clearErrors(field);
        }
    };
    
    // Get accommodation ID from room type and room number
    const getAccommodationId = (roomType: string, roomNumber: string): number => {
        // Handle empty inputs
        if (!roomType || !roomNumber) {
            console.error("Invalid room selection: type or number missing", roomType, roomNumber);
            return 0;
        }
        
        // Log detailed information about the inputs
        console.log("=== getAccommodationId DEBUGGING ===");
        console.log("Looking for room:", { type: roomType, number: roomNumber });
        console.log("Input types:", { 
            roomType: typeof roomType, 
            roomNumber: typeof roomNumber,
            roomNumberParsed: parseInt(roomNumber) 
        });
        
        // Direct mapping logic - this is the most reliable method
        const number = parseInt(roomNumber);
        if (isNaN(number) || number <= 0) {
            console.error("Invalid room number:", roomNumber);
            return 0;
        }
        
        // Map to accommodation IDs based on the seeding structure
        let accommodationId = 0;
        if (roomType === 'Villa') {
            accommodationId = number; // Villa 1 = ID 1, Villa 2 = ID 2, etc.
        } else if (roomType === 'Cottage') {
            accommodationId = 5 + number; // Cottage 1 = ID 6, Cottage 2 = ID 7, etc.
        } else if (roomType === 'Cabin') {
            accommodationId = 14 + number; // Cabin 1 = ID 15, Cabin 2 = ID 16, etc.
        }
        
        console.log("Using direct mapping:", { roomType, roomNumber, accommodationId });
        return accommodationId;
    };

    // Validate the entire form
    const validateForm = (): boolean => {
        // Get current form state for debugging
        console.log('Form state at validation:', {
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            check_in_type: data.check_in_date ? typeof data.check_in_date : 'null',
            check_out_type: data.check_out_date ? typeof data.check_out_date : 'null'
        });
        
        // Validate basic required fields first (non-date fields)
        const basicRequiredFields = ['first_name', 'last_name', 'email', 'phone', 'room_type', 'number_of_guests'];
        let hasErrors = false;
        
        basicRequiredFields.forEach(field => {
            if (!data[field]) {
                setError(field, `${field.replace(/_/g, ' ')} is required`);
                hasErrors = true;
            }
        });
        
        // Validate date fields separately with special handling
        if (!data.check_in_date) {
            setError('check_in_date', 'Check-in date is required');
            hasErrors = true;
        } else {
            clearErrors('check_in_date');
        }
        
        if (!data.check_out_date) {
            setError('check_out_date', 'Check-out date is required');
            hasErrors = true;
        } else {
            clearErrors('check_out_date');
        }

        if (hasErrors) {
            toast.error('Please fill in all required fields');
            return false;
        }

        // Get accommodation_id from room type
        const accommodation_id = getAccommodationId(data.room_type, data.room_number);
        
        if (accommodation_id === 0) {
            toast.error('Invalid room selection');
            return false;
        }
        
        return true;
    };
    
    // Format and validate dates for submission
    const prepareFormData = (): any => {
        try {
            // Ensure we have valid Date objects by creating new ones if needed
            let checkInDate = data.check_in_date;
            let checkOutDate = data.check_out_date;
            
            if (checkInDate && !(checkInDate instanceof Date)) {
                // Try to convert string to Date if we somehow got a string
                checkInDate = new Date(checkInDate);
            }
            
            if (checkOutDate && !(checkOutDate instanceof Date)) {
                // Try to convert string to Date if we somehow got a string
                checkOutDate = new Date(checkOutDate);
            }
            
            // Format dates using date-fns if we have valid Date objects
            let check_in_formatted = '';
            let check_out_formatted = '';
            
            if (checkInDate instanceof Date && !isNaN(checkInDate.getTime())) {
                check_in_formatted = format(checkInDate, 'yyyy-MM-dd');
            } else {
                setError('check_in_date', 'Invalid check-in date');
                return null;
            }
            
            if (checkOutDate instanceof Date && !isNaN(checkOutDate.getTime())) {
                check_out_formatted = format(checkOutDate, 'yyyy-MM-dd');
            } else {
                setError('check_out_date', 'Invalid check-out date');
                return null;
            }
            
            // Get accommodation ID directly using the mapping function
            const accommodation_id = getAccommodationId(data.room_type, data.room_number);
            console.log(`Mapped ${data.room_type} ${data.room_number} to accommodation_id: ${accommodation_id}`);
            
            if (!accommodation_id) {
                console.error("Failed to get valid accommodation ID");
                toast.error('Error with room selection. Please try again.');
                return null;
            }
            
            // Extract the basic room type (cottage, villa, cabin) - convert to expected values
            let roomTypeValue = '';
            if (data.room_type) {
                const type = data.room_type.split(' ')[0].toLowerCase();
                // Map to the server's expected values
                if (type === 'cottage') {
                    roomTypeValue = 'cottage';
                } else if (type === 'villa') {
                    roomTypeValue = 'family';  // Map villa to family as per server expectation
                } else if (type === 'cabin') {
                    roomTypeValue = 'double';  // Map cabin to double as per server expectation
                }
            }
            
            // Prepare the final request data
            return {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                accommodation_id: accommodation_id.toString(),
                room_type: roomTypeValue,  // Add the expected room_type field
                check_in: check_in_formatted, // Remove the time portion
                check_out: check_out_formatted, // Remove the time portion
                check_in_date: check_in_formatted, // For compatibility
                check_out_date: check_out_formatted, // For compatibility
                number_of_guests: data.number_of_guests,
                special_requests: data.special_requests || '',
                notes: data.special_requests || '',
                total_amount: '0.00',
                address: 'Default Address',
                status: 'pending'
            };
        } catch (error) {
            console.error('Error processing dates:', error);
            toast.error('Error processing dates. Please try again.');
            return null;
        }
    };
    
    // Handle form submission
    const handleSubmit = (e: React.FormEvent, showConfirmation: boolean = true) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) return;
        
        // Validate the form first
        if (!validateForm()) return;
        
        // Set submitting state
        setIsSubmitting(true);
        
        // Prepare form data
        const requestData = prepareFormData();
        if (!requestData) {
            setIsSubmitting(false);
            return;
        }
        
        // If we want to show confirmation dialog first (public site)
        if (showConfirmation) {
            console.log('Showing confirmation dialog with data:', requestData);
            setBookingData(requestData);
            setShowConfirmDialog(true);
            setIsSubmitting(false);
        } else {
            // For admin page, submit directly
            submitRequest(requestData);
        }
    };
    
    // Handle confirmation dialog actions
    const handleConfirmBooking = () => {
        if (!bookingData) return;
        
        setIsSubmitting(true);
        submitRequest(bookingData);
        setShowConfirmDialog(false);
    };

    const handleCancelBooking = () => {
        setShowConfirmDialog(false);
        setBookingData(null);
    };
    
    // Create a function to handle the actual submission
    const submitRequest = async (requestData: any) => {
        setIsSubmitting(true);
        
        try {
            // Use the direct API endpoint instead of Inertia
            const response = await axios.post('/reservations', requestData);
            
            console.log('API response:', response.data);
            
            if (response.data.success) {
                // Store the success message for display on page refresh/redirect
                sessionStorage.setItem('booking_success', JSON.stringify({
                    message: response.data.message,
                    reservationId: response.data.reservation_id
                }));
                
                // Reset the form
                reset();
                
                // Show booking confirmation modal
                document.body.classList.add('show-booking-confirmation');
                
                // Dispatch the booking success event
                window.dispatchEvent(new CustomEvent('booking:success', { 
                    detail: { 
                        message: response.data.message,
                        reservationId: response.data.reservation_id
                    } 
                }));
                
                // Hide any Inertia error if present
                const inertiaError = document.querySelector('.inertia-error');
                if (inertiaError) {
                    (inertiaError as HTMLElement).style.display = 'none';
                }
            } else {
                // Handle validation errors
                if (response.data.errors) {
                    console.error('Validation errors:', response.data.errors);
                    toast.error('Please check the form for errors and try again.');
                } else {
                    // General error
                    console.error('Error submitting form:', response.data.message || 'An error occurred');
                    toast.error(response.data.message || 'An error occurred. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                // Handle server validation errors
                if (error.response.status === 422 && error.response.data.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                    toast.error('Please check the form for errors and try again.');
                } else {
                    // General error
                    toast.error(error.response.data.message || 'An error occurred. Please try again.');
                }
            } else {
                // Network error or unexpected error
                toast.error('Network error. Please check your connection and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return {
        data,
        setData,
        errors,
        setError,
        clearErrors,
        reset,
        isSubmitting,
        setIsSubmitting,
        showConfirmDialog,
        setShowConfirmDialog,
        bookingData,
        setBookingData,
        validateField,
        handleInputChange,
        getAccommodationId,
        validateForm,
        prepareFormData,
        handleSubmit,
        handleConfirmBooking,
        handleCancelBooking,
        submitRequest,
        roomTypes,
        availableRoomNumbers,
        isLoadingRooms
    };
} 