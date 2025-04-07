<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $reservations_count = Reservation::count();
        $recent_reservations = Reservation::latest()
            ->take(3)
            ->get(['id', 'first_name', 'last_name', 'check_in_date', 'room_type', 'status']);

        return Inertia::render('dashboard', [
            'reservations_count' => $reservations_count,
            'recent_reservations' => $recent_reservations,
        ]);
    }
} 