<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Accommodation;
use App\Models\Reservation;
use Carbon\Carbon;

class RoomAvailabilityController extends Controller
{
    /**
     * Get available rooms for the given date range
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getAvailableRooms(Request $request)
    {
        $roomType = $request->input('room_type');
        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');

        // Debug logging
        Log::info('Room availability request:', [
            'room_type' => $roomType,
            'check_in' => $checkIn,
            'check_out' => $checkOut
        ]);

        // Validate input
        if (!$roomType || !$checkIn || !$checkOut) {
            return response()->json(['error' => 'Room type, check-in, and check-out dates are required'], 400);
        }

        // Get all rooms of the given type - Fix the query to use exact type matching
        $allRooms = Accommodation::where('type', strtolower($roomType))
            ->where('is_active', true)
            ->get();

        Log::info('All rooms found:', [
            'count' => $allRooms->count(),
            'rooms' => $allRooms->toArray()
        ]);

        if ($allRooms->isEmpty()) {
            return response()->json([], 200); // No rooms of this type
        }

        // Get all room IDs
        $roomIds = $allRooms->pluck('id')->toArray();
        
        Log::info('Room IDs to check for availability:', $roomIds);

        // Get reservations that overlap with the requested dates
        $overlappingReservations = Reservation::whereIn('accommodation_id', $roomIds)
            ->where(function($query) use ($checkIn, $checkOut) {
                $query->where(function($q) use ($checkIn, $checkOut) {
                    $q->where('check_in', '<', $checkOut)
                      ->where('check_out', '>', $checkIn);
                });
            })
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->get();

        Log::info('Overlapping reservations:', [
            'count' => $overlappingReservations->count(),
            'reservations' => $overlappingReservations->toArray()
        ]);

        // Get the IDs of rooms that have overlapping reservations
        $unavailableRoomIds = $overlappingReservations->pluck('accommodation_id')->unique()->toArray();

        Log::info('Unavailable room IDs:', $unavailableRoomIds);
        
        // Make sure unavailableRoomIds are actually in our room list
        $validUnavailableRoomIds = array_intersect($unavailableRoomIds, $roomIds);
        Log::info('Valid unavailable room IDs (intersection with our rooms):', $validUnavailableRoomIds);

        // Filter out unavailable rooms
        $availableRooms = $allRooms->filter(function($room) use ($validUnavailableRoomIds) {
            $isAvailable = !in_array($room->id, $validUnavailableRoomIds);
            Log::info("Room {$room->id} ({$room->name}) availability check: " . ($isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'));
            return $isAvailable;
        });

        Log::info('Available rooms:', [
            'count' => $availableRooms->count(),
            'rooms' => $availableRooms->values()->toArray()
        ]);

        return response()->json($availableRooms->values());
    }
} 