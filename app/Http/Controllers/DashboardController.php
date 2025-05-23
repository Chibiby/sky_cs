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
        $recent_reservations = Reservation::with(['accommodation', 'guest'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'guest_name' => $reservation->guest ? $reservation->guest->first_name . ' ' . $reservation->guest->last_name : 'Guest',
                    'accommodation' => [
                        'name' => $reservation->accommodation ? $reservation->accommodation->name : 'N/A',
                        'type' => $reservation->accommodation ? $reservation->accommodation->type : 'N/A'
                    ],
                    'check_in' => $reservation->check_in ? $reservation->check_in->format('Y-m-d') : null,
                    'check_out' => $reservation->check_out ? $reservation->check_out->format('Y-m-d') : null,
                    'status' => $reservation->status
                ];
            });

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

        return Inertia::render('dashboard', [
            'reservations_count' => $reservations_count,
            'recent_reservations' => $recent_reservations,
            'bookingsByDay' => $bookingsByDay,
            'popularRooms' => $popularRooms,
            'monthlyTrends' => $monthlyTrends,
            'revenueByMonth' => $revenueByMonth
        ]);
    }
} 