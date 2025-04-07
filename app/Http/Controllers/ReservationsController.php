<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ReservationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $reservations = Reservation::orderBy('created_at', 'desc')
            ->select([
                'id',
                'first_name',
                'last_name',
                'email',
                'phone',
                'check_in_date',
                'check_out_date',
                'room_type',
                'number_of_guests',
                'status',
                'created_at'
            ])
            ->get();
        
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
        $reservations = Reservation::orderBy('check_in_date', 'desc')
            ->select([
                'id',
                'first_name',
                'last_name',
                'email',
                'phone',
                'check_in_date',
                'check_out_date',
                'room_type',
                'number_of_guests',
                'status',
                'special_requests',
                'created_at'
            ])
            ->get();

        return Inertia::render('reservations/manage', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('reservations/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'check_in_date' => date('Y-m-d', strtotime($request->check_in_date)),
                'check_out_date' => date('Y-m-d', strtotime($request->check_out_date)),
                'room_type' => $request->room_type,
                'number_of_guests' => $request->number_of_guests,
                'special_requests' => $request->special_requests,
                'status' => 'pending'
            ];

            $reservation = Reservation::create($data);

            return redirect()->route('reservations.create')
                ->with('success', 'Reservation created successfully! We will contact you shortly.');
        } catch (\Exception $e) {
            Log::error('Reservation creation failed: ' . $e->getMessage());
            return redirect()->route('reservations.create')
                ->with('error', 'Failed to create reservation. Please try again.');
        }
    }

    /**
     * Store a public reservation (for guests).
     */
    public function publicStore(Request $request)
    {
        try {
            $data = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'check_in_date' => date('Y-m-d', strtotime($request->check_in_date)),
                'check_out_date' => date('Y-m-d', strtotime($request->check_out_date)),
                'room_type' => $request->room_type,
                'number_of_guests' => $request->number_of_guests,
                'special_requests' => $request->special_requests,
                'status' => 'pending'
            ];

            $reservation = Reservation::create($data);

            return redirect()->route('home')
                ->with('success', 'Reservation request submitted successfully! We will contact you shortly.');
        } catch (\Exception $e) {
            Log::error('Public reservation creation failed: ' . $e->getMessage());
            return redirect()->route('home')
                ->with('error', 'Failed to submit reservation request. Please try again.');
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
        // Implement reservation update logic
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Implement reservation deletion logic
    }

    public function availability(): Response
    {
        return Inertia::render('reservations/availability', [
            'rooms' => [], // Add room availability data here
        ]);
    }

    public function calendar(): Response
    {
        return Inertia::render('reservations/calendar', [
            'events' => [], // Add calendar events data here
        ]);
    }
}
