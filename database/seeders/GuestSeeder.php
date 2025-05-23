<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Guest;

class GuestSeeder extends Seeder
{
    public function run()
    {
        $guests = [
            // All guest entries removed
        ];

        foreach ($guests as $guest) {
            Guest::create($guest);
        }
    }
} 