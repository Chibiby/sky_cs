<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reservation;
use App\Models\Guest;
use Carbon\Carbon;

class ReservationSeeder extends Seeder
{
    public function run()
    {
        $today = Carbon::now();
        $guests = Guest::all();

        // ID mapping based on our new schema:
        // Villas: IDs 1-5
        // Cottages: IDs 6-14
        // Cabins: IDs 15-23
        
        $reservations = [
            // All reservation entries removed
        ];

        foreach ($reservations as $reservation) {
            Reservation::create($reservation);
        }
    }
} 