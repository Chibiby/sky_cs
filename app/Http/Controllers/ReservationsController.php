<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Reservation;
use App\Models\Accommodation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Guest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReservationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $reservations = Reservation::with('accommodation')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'first_name' => $reservation->first_name,
                    'last_name' => $reservation->last_name,
                    'email' => $reservation->email,
                    'phone' => $reservation->phone,
                    'check_in_date' => $reservation->check_in_date,
                    'check_out_date' => $reservation->check_out_date,
                    'accommodation' => $reservation->accommodation,
                    'number_of_guests' => $reservation->number_of_guests,
                    'status' => $reservation->status,
                    'created_at' => $reservation->created_at
                ];
            });
        
        if ($request->wantsJson()) {
            return response()->json($reservations);
        }

        return Inertia::render('reservations', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Display a listing of reservations with management options.
     */
    public function manage(): Response
    {
        // Get the first reservation to check field names and formats
        $firstReservation = Reservation::first();
        if ($firstReservation) {
            Log::info('First reservation raw attributes:', $firstReservation->getAttributes());
            
            // Debug the date format specifically
            Log::info('Date format details:', [
                'check_in' => [
                    'value' => $firstReservation->check_in,
                    'type' => gettype($firstReservation->check_in),
                    'formatted' => $firstReservation->check_in ? $firstReservation->check_in->format('Y-m-d') : null
                ],
                'check_out' => [
                    'value' => $firstReservation->check_out,
                    'type' => gettype($firstReservation->check_out),
                    'formatted' => $firstReservation->check_out ? $firstReservation->check_out->format('Y-m-d') : null
                ]
            ]);
        }
        
        $reservations = Reservation::with(['accommodation', 'guest'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                // For each reservation, format the dates correctly for frontend consumption
                $checkInDate = $reservation->check_in;
                $checkOutDate = $reservation->check_out;
                
                // Format dates consistently as Y-m-d (required for HTML date inputs)
                $formattedCheckIn = $checkInDate ? $checkInDate->format('Y-m-d') : null;
                $formattedCheckOut = $checkOutDate ? $checkOutDate->format('Y-m-d') : null;
                
                Log::info('Reservation ID ' . $reservation->id . ' formatted dates:', [
                    'check_in_raw' => $checkInDate,
                    'check_out_raw' => $checkOutDate,
                    'check_in_formatted' => $formattedCheckIn,
                    'check_out_formatted' => $formattedCheckOut
                ]);
                
                return [
                    'id' => $reservation->id,
                    'first_name' => $reservation->guest->first_name,
                    'last_name' => $reservation->guest->last_name,
                    'email' => $reservation->guest->email,
                    'phone' => $reservation->guest->phone_number,
                    // Use consistently formatted dates
                    'check_in_date' => $formattedCheckIn,
                    'check_out_date' => $formattedCheckOut,
                    'accommodation_id' => $reservation->accommodation_id,
                    'accommodation' => [
                        'id' => $reservation->accommodation->id,
                        'name' => $reservation->accommodation->name,
                        'type' => $reservation->accommodation->type,
                        // Fix: Just use the name directly without repeating the type
                        'formatted_name' => $reservation->accommodation->name
                    ],
                    'number_of_guests' => $reservation->number_of_guests,
                    'status' => $reservation->status,
                    'special_requests' => $reservation->notes, // Use notes as per Reservation model
                    'created_at' => $reservation->created_at,
                    'address' => $reservation->guest->address
                ];
            });

        return Inertia::render('reservations/manage', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $accommodations = Accommodation::where('is_active', true)
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('reservations/create', [
            'accommodations' => $accommodations
        ]);
    }

    /**
     * Store a reservation in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Received reservation request (universal):', $request->all());
            
            // Validate the request data
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:255',
                'check_in' => 'required|string',
                'check_out' => 'required|string',
                'accommodation_id' => 'required|exists:accommodations,id',
                'number_of_guests' => 'required|integer|min:1',
                'notes' => 'nullable|string',
                'address' => 'nullable|string|max:255',
                'total_amount' => 'nullable',
            ]);

            // First, create or find the guest
            $guest = Guest::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone_number' => $validated['phone'],
                    'address' => $validated['address'] ?? 'Default Address',
                ]
            );

            // Format dates and prepare reservation data
            $reservationData = [
                'guest_id' => $guest->id,
                'accommodation_id' => $validated['accommodation_id'],
                'check_in' => date('Y-m-d', strtotime($validated['check_in'])),
                'check_out' => date('Y-m-d', strtotime($validated['check_out'])),
                'number_of_guests' => $validated['number_of_guests'],
                'notes' => $validated['notes'] ?? null,
                'total_amount' => $validated['total_amount'] ?? 0,
                'status' => 'pending'
            ];

            Log::info('Creating reservation with data:', $reservationData);

            $reservation = Reservation::create($reservationData);

            if (!$reservation) {
                throw new \Exception('Failed to create reservation record');
            }

            Log::info('Reservation created successfully with ID: ' . $reservation->id);

            // For Inertia requests, redirect with flash data (do NOT return JSON)
            if ($request->header('X-Inertia')) {
                return redirect()->route('reservations.create')
                    ->with('success', 'Reservation created successfully!')
                    ->with('reservation_id', $reservation->id);
            }

            // For AJAX/JSON requests (axios/fetch, not Inertia)
            if (
                $request->wantsJson() ||
                $request->ajax() ||
                $request->isJson() ||
                $request->header('Accept') === 'application/json'
            ) {
                return response()->json([
                    'success' => true, 
                    'message' => 'Reservation created successfully!',
                    'reservation_id' => $reservation->id
                ]);
            }
            
            // For direct browser POST (non-Inertia, non-AJAX)
            return redirect()->route('reservations.create')
                ->with('success', 'Reservation created successfully!')
                ->with('reservation_id', $reservation->id);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Reservation validation failed: ' . $e->getMessage());
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Reservation creation failed: ' . $e->getMessage());
            return back()
                ->with('error', 'Failed to create reservation. Please try again.')
                ->withInput();
        }
    }

    /**
     * Store a public reservation (for guests).
     */
    public function publicStore(Request $request)
    {
        Log::info('Received public reservation request:', $request->all());
        
        try {
            $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'required|string',
                'check_in_date' => 'required|string',
                'check_out_date' => 'required|string',
                'accommodation_id' => 'required',
                'number_of_guests' => 'required|integer',
                'special_requests' => 'nullable|string',
            ]);

            // 1. First, create the guest record manually
            $guest = new Guest();
            $guest->first_name = $request->first_name;
            $guest->last_name = $request->last_name;
            $guest->email = $request->email;
            $guest->phone_number = $request->phone;
            $guest->address = 'Default Address';
            $guest->save();

            Log::info('Created guest with ID: ' . $guest->id);

            // 2. Create the reservation manually
            $reservation = new Reservation();
            $reservation->guest_id = $guest->id;
            $reservation->accommodation_id = $request->accommodation_id;
            $reservation->check_in = $request->check_in_date;
            $reservation->check_out = $request->check_out_date;
            $reservation->number_of_guests = $request->number_of_guests;
            $reservation->notes = $request->special_requests;
            $reservation->status = 'pending';
            $reservation->total_amount = '0.00';
            $reservation->save();

            Log::info('Created reservation with ID: ' . $reservation->id);

            // Return success response
            return back()->with('success', 'Your reservation has been submitted successfully!');
        } catch (\Exception $e) {
            Log::error('Reservation failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return back()
                ->with('error', 'Failed to submit your reservation. Please try again.')
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Implement reservation details view
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Implement reservation edit view
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info('Updating reservation ' . $id . ' with data:', $request->all());
        
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'accommodation_id' => 'required|integer|exists:accommodations,id',
            'number_of_guests' => 'required|integer|min:1',
            'status' => 'required|in:pending,arrival,departure,completed,cancelled',
            'special_requests' => 'nullable|string',
        ]);

        try {
            // Get the reservation and the guest
            $reservation = Reservation::findOrFail($id);
            $guest = $reservation->guest;
            
            // Update guest information
            $guest->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone'],
            ]);
            
            // Debug logging for accommodation_id
            Log::info('Room change details: ', [
                'current_id' => $reservation->accommodation_id,
                'new_id' => $validated['accommodation_id'],
                'data_type' => gettype($validated['accommodation_id'])
            ]);
            
            // Update reservation - including accommodation_id
            $reservation->update([
                'accommodation_id' => $validated['accommodation_id'],
                'check_in' => $validated['check_in_date'],
                'check_out' => $validated['check_out_date'],
                'number_of_guests' => $validated['number_of_guests'],
                'status' => $validated['status'],
                'notes' => $validated['special_requests'],
            ]);
            
            Log::info('Reservation updated successfully with data:', [
                'id' => $reservation->id,
                'accommodation_id' => $reservation->accommodation_id,
                'check_in' => $reservation->check_in,
                'check_out' => $reservation->check_out
            ]);

            return redirect()->back()->with('success', 'Reservation updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update reservation: ' . $e->getMessage(), [
                'id' => $id,
                'validation_data' => $validated,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'Failed to update reservation: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $reservation->delete();
            
            return redirect()->route('reservations.manage')
                ->with('success', 'Reservation deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Reservation deletion failed: ' . $e->getMessage());
            return redirect()->route('reservations.manage')
                ->with('error', 'Failed to delete reservation. Please try again.');
        }
    }

    public function availability(): Response
    {
        return Inertia::render('reservations/availability', [
            'rooms' => [], // Add room availability data here
        ]);
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            
            if (!is_array($ids) || empty($ids)) {
                return back()->with('error', 'No reservations selected');
            }

            $deleted = Reservation::whereIn('id', $ids)->delete();
            
            if ($deleted) {
                return back()->with('success', 'Reservations deleted successfully');
            } else {
                return back()->with('error', 'No reservations found to delete');
            }
        } catch (\Exception $e) {
            Log::error('Bulk deletion failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete reservations');
        }
    }

    public function bookingCalendar()
    {
        return Inertia::render('reservations/booking-calendar', [
            'reservations' => Reservation::with('accommodation')
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id' => $reservation->id,
                        'guest_name' => $reservation->first_name . ' ' . $reservation->last_name,
                        'room_name' => $reservation->accommodation->name,
                        'check_in' => $reservation->check_in_date,
                        'check_out' => $reservation->check_out_date,
                        'status' => $reservation->status,
                    ];
                }),
        ]);
    }

    /**
     * Display dashboard with booking analytics.
     */
    public function dashboard(): Response
    {
        // Get bookings per day of week (0 = Sunday, 6 = Saturday)
        $bookingsByDayOfWeek = Reservation::selectRaw('DAYOFWEEK(check_in) - 1 as day_of_week, COUNT(*) as count')
            ->groupBy('day_of_week')
            ->orderBy('day_of_week')
            ->get()
            ->keyBy('day_of_week')
            ->map(function ($item) {
                return $item->count;
            });

        // Ensure we have data for all days of the week
        $daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $bookingsByDay = [];
        
        foreach ($daysOfWeek as $index => $day) {
            $bookingsByDay[$day] = $bookingsByDayOfWeek[$index] ?? 0;
        }

        // Get most booked rooms
        $popularRooms = Reservation::select('accommodation_id')
            ->selectRaw('COUNT(*) as booking_count')
            ->with('accommodation:id,name,type')
            ->groupBy('accommodation_id')
            ->orderByDesc('booking_count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->accommodation_id,
                    'name' => $item->accommodation->name ?? 'Unknown',
                    'type' => $item->accommodation->type ?? 'Unknown',
                    'count' => $item->booking_count
                ];
            });

        // Get monthly booking counts for the last 12 months
        $monthlyTrends = Reservation::selectRaw('YEAR(check_in) as year, MONTH(check_in) as month, COUNT(*) as count')
            ->whereRaw('check_in >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                $monthName = date('M', mktime(0, 0, 0, $item->month, 1));
                return [
                    'month' => $monthName . ' ' . $item->year,
                    'count' => $item->count
                ];
            });

        // Get revenue per month
        $revenueByMonth = Reservation::selectRaw('YEAR(check_in) as year, MONTH(check_in) as month, SUM(total_amount) as total')
            ->whereRaw('check_in >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                $monthName = date('M', mktime(0, 0, 0, $item->month, 1));
                return [
                    'month' => $monthName . ' ' . $item->year,
                    'total' => $item->total
                ];
            });

        return Inertia::render('reservations/dashboard', [
            'bookingsByDay' => $bookingsByDay,
            'popularRooms' => $popularRooms,
            'monthlyTrends' => $monthlyTrends,
            'revenueByMonth' => $revenueByMonth
        ]);
    }
}
