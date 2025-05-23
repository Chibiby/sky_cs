<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');
            
            if (!is_array($ids) || empty($ids)) {
                return response()->json(['message' => 'No reservations selected'], 400);
            }

            // Delete all selected reservations
            Reservation::whereIn('id', $ids)->delete();

            return response()->json(['message' => 'Reservations deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete reservations'], 500);
        }
    }
} 