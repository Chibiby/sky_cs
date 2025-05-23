<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AccommodationController extends Controller
{
    public function index()
    {
        $today = Carbon::now()->format('Y-m-d');
        $accommodations = Accommodation::all()->map(function ($accommodation) use ($today) {
            // Get current reservation (check if today falls between check-in and check-out)
            $currentReservation = Reservation::where('accommodation_id', $accommodation->id)
                ->whereDate('check_in', '<=', $today)
                ->whereDate('check_out', '>', $today)
                ->whereIn('status', ['confirmed', 'arrival', 'pending'])
                ->first();

            // Get all future reservations sorted by check-in date
            $futureReservations = Reservation::where('accommodation_id', $accommodation->id)
                ->whereDate('check_in', '>=', $today)
                ->whereIn('status', ['confirmed', 'arrival', 'pending'])
                ->orderBy('check_in', 'asc')
                ->get();

            // Map reservations to consistent format
            $formattedReservations = $futureReservations->map(function($reservation) {
                return [
                    'id' => $reservation->id,
                    'check_in' => $reservation->check_in,
                    'check_out' => $reservation->check_out,
                    'guest_name' => $reservation->guest->first_name . ' ' . $reservation->guest->last_name,
                    'number_of_guests' => $reservation->number_of_guests,
                    'status' => $reservation->status
                ];
            });

            // Extract next reservation for backward compatibility
            $nextReservation = $futureReservations->first();

            return [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'type' => $accommodation->type,
                'description' => $accommodation->description,
                'max_occupancy' => $accommodation->max_occupancy,
                'base_price' => $accommodation->base_price,
                'extra_person_fee' => $accommodation->extra_person_fee,
                'amenities' => json_decode($accommodation->amenities),
                'location' => $accommodation->location,
                'is_active' => $accommodation->is_active,
                'is_occupied' => $currentReservation !== null,
                'housekeeping_status' => $accommodation->housekeeping_status,
                'current_guests' => $currentReservation ? $currentReservation->number_of_guests : 0,
                'check_in' => $currentReservation ? [
                    'date' => $currentReservation->check_in,
                    'time' => '14:00' // 2:00 PM
                ] : [
                    'date' => $today,
                    'time' => '00:00'
                ],
                'check_out' => $currentReservation ? [
                    'date' => $currentReservation->check_out,
                    'time' => '12:00' // 12:00 PM
                ] : [
                    'date' => $today,
                    'time' => '00:00'
                ],
                'current_reservation' => $currentReservation ? [
                    'check_in' => $currentReservation->check_in,
                    'check_out' => $currentReservation->check_out,
                    'guest_name' => $currentReservation->guest->first_name . ' ' . $currentReservation->guest->last_name,
                    'number_of_guests' => $currentReservation->number_of_guests,
                    'status' => $currentReservation->status
                ] : null,
                'next_reservation' => $nextReservation ? [
                    'check_in' => $nextReservation->check_in,
                    'check_out' => $nextReservation->check_out,
                    'guest_name' => $nextReservation->guest->first_name . ' ' . $nextReservation->guest->last_name,
                    'number_of_guests' => $nextReservation->number_of_guests,
                    'status' => $nextReservation->status
                ] : null,
                'all_reservations' => $formattedReservations
            ];
        });

        return Inertia::render('reservations/accommodation', [
            'accommodations' => $accommodations
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:accommodations,name,'.$id,
            'type' => 'required|string|in:villa,cottage,cabin',
            'description' => 'nullable|string',
            'max_occupancy' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'extra_person_fee' => 'required|numeric|min:0',
            'location' => 'required|string',
            'is_active' => 'required|boolean',
            'is_occupied' => 'required|boolean',
            'housekeeping_status' => 'required|string|in:clean,dirty,cleaning,inspection',
        ]);

        $accommodation = Accommodation::findOrFail($id);

        // Extract room number from name for the database
        $room_number = null;
        preg_match('/\d+$/', $request->name, $matches);
        if (!empty($matches)) {
            $room_number = intval($matches[0]);
        }

        $accommodation->update([
            'name' => $request->name,
            'type' => $request->type,
            'room_number' => $room_number,
            'description' => $request->description,
            'max_occupancy' => $request->max_occupancy,
            'base_price' => $request->base_price,
            'extra_person_fee' => $request->extra_person_fee,
            'amenities' => json_encode($request->amenities ?? $accommodation->amenities),
            'location' => $request->location,
            'is_active' => $request->is_active,
            'is_occupied' => $request->is_occupied,
            'housekeeping_status' => $request->housekeeping_status,
        ]);

        return redirect()->back()->with('success', 'Room updated successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:accommodations,name',
            'type' => 'required|string|in:villa,cottage,cabin',
            'description' => 'nullable|string',
            'max_occupancy' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'extra_person_fee' => 'required|numeric|min:0',
            'location' => 'required|string',
            'is_active' => 'required|boolean',
            'is_occupied' => 'required|boolean',
            'housekeeping_status' => 'required|string|in:clean,dirty,cleaning,inspection',
        ]);

        // Extract room number from name for the database
        $room_number = null;
        preg_match('/\d+$/', $request->name, $matches);
        if (!empty($matches)) {
            $room_number = intval($matches[0]);
        }

        $accommodation = Accommodation::create([
            'name' => $request->name,
            'type' => $request->type,
            'room_number' => $room_number,
            'description' => $request->description,
            'max_occupancy' => $request->max_occupancy,
            'base_price' => $request->base_price,
            'extra_person_fee' => $request->extra_person_fee,
            'amenities' => json_encode($request->amenities ?? []),
            'location' => $request->location,
            'is_active' => $request->is_active,
            'is_occupied' => $request->is_occupied,
            'housekeeping_status' => $request->housekeeping_status,
        ]);

        return redirect()->back()->with('success', 'Room added successfully');
    }

    public function destroy($id)
    {
        $accommodation = Accommodation::findOrFail($id);
        
        // Check if there are any reservations for this accommodation
        $reservations = Reservation::where('accommodation_id', $id)->exists();
        
        if ($reservations) {
            return redirect()->back()->with('error', 'Cannot delete room with existing reservations');
        }
        
        $accommodation->delete();
        
        return redirect()->back()->with('success', 'Room deleted successfully');
    }
} 