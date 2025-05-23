<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Accommodation;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API routes
Route::get('/rooms/by-type/{type}', function (Request $request, $type) {
    $validTypes = ['villa', 'cottage', 'cabin'];
    
    if (!in_array(strtolower($type), $validTypes)) {
        return response()->json(['error' => 'Invalid room type'], 400);
    }
    
    $rooms = Accommodation::where('type', strtolower($type))
        ->where('is_active', true)
        ->orderBy('room_number')
        ->get(['id', 'name', 'room_number']);
        
    return response()->json($rooms);
});

// Room-related routes
Route::get('rooms/by-type/{type}', function ($type) {
    return App\Models\Accommodation::where('type', 'like', $type . '%')
        ->orWhere('type', 'like', ucfirst($type) . '%')
        ->get();
});

// Room availability route
Route::get('rooms/available', 'App\Http\Controllers\Api\RoomAvailabilityController@getAvailableRooms');

// Room count endpoint
Route::get('rooms/count', function () {
    $rooms = [
        'villas' => App\Models\Accommodation::where('type', 'like', 'Villa%')->count(),
        'cottages' => App\Models\Accommodation::where('type', 'like', 'Cottage%')->count(),
        'cabins' => App\Models\Accommodation::where('type', 'like', 'Cabin%')->count(),
    ];
    return response()->json($rooms);
});

// Fetch all current reservations with guest names and accommodation details
Route::get('reservations/current', function () {
    // Get the latest reservation data with eager loading
    $reservations = App\Models\Reservation::with(['guest', 'accommodation'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($reservation) {
            // Ensure we have the right room name by using the accommodation name directly
            $roomName = $reservation->accommodation ? $reservation->accommodation->name : 'Unknown Room';
            
            // For debugging
            \Illuminate\Support\Facades\Log::info('Reservation data:', [
                'id' => $reservation->id,
                'guest_name' => $reservation->guest ? $reservation->guest->first_name . ' ' . $reservation->guest->last_name : 'Unknown Guest',
                'room_name' => $roomName,
                'accommodation_id' => $reservation->accommodation_id,
                'check_in' => $reservation->check_in,
                'check_out' => $reservation->check_out,
                'status' => $reservation->status,
            ]);
            
            return [
                'id' => $reservation->id,
                'guest_name' => $reservation->guest ? $reservation->guest->first_name . ' ' . $reservation->guest->last_name : 'Unknown Guest',
                'room_name' => $roomName,
                'check_in' => $reservation->check_in,
                'check_out' => $reservation->check_out,
                'status' => $reservation->status,
                'guest_id' => $reservation->guest_id,
                'accommodation_id' => $reservation->accommodation_id,
            ];
        });
    
    return response()->json($reservations);
}); 