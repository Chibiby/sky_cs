<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Accommodation;
use Faker\Factory as FakerFactory;

class AccommodationSeeder extends Seeder
{
    public function run()
    {
        $faker = FakerFactory::create();

        // Villa accommodations
        for ($i = 1; $i <= 5; $i++) {
            Accommodation::create([
                // No ID needed - it will be auto-assigned
                'name' => "Villa {$i}",
                'type' => 'villa',
                'description' => 'Luxurious beachfront villa with comfortable stay and complete amenities',
                'max_occupancy' => 8,
                'base_price' => 1500.00,
                'extra_person_fee' => 100.00,
                'is_active' => true,
                'amenities' => json_encode(['Air Conditioning', 'Private Bathroom', 'Hot & Cold Shower', 'Mini Refrigerator', 'TV with Cable', 'Coffee Maker', 'Room Service', 'Daily Housekeeping']),
                'location' => 'South Pool Side',
                'housekeeping_status' => 'clean',
                'room_number' => $i,
            ]);
        }

        // Cottages (9)
        for ($i = 1; $i <= 9; $i++) {
            Accommodation::create([
                // No ID needed - it will be auto-assigned
                'name' => "Cottage {$i}",
                'type' => 'cottage',
                'description' => "Spacious venue perfect for events and gatherings, located near the pool area",
                'max_occupancy' => 4,
                'base_price' => 1000.00,
                'extra_person_fee' => 100.00,
                'is_active' => true,
                'amenities' => json_encode([]),
                'location' => $i % 2 === 0 ? 'East Pool Side' : 'North Pool Side',
                'housekeeping_status' => 'clean',
                'room_number' => $i,
            ]);
        }

        // Cabins (9)
        for ($i = 1; $i <= 9; $i++) {
            Accommodation::create([
                // No ID needed - it will be auto-assigned
                'name' => "Cabin {$i}",
                'type' => 'cabin',
                'description' => "A rustic retreat nestled in nature, offering a peaceful and simple stay experience",
                'max_occupancy' => 4,
                'base_price' => 500.00,
                'extra_person_fee' => 100.00,
                'is_active' => true,
                'amenities' => json_encode([]),
                'location' => 'East Pool Side',
                'housekeeping_status' => 'clean',
                'room_number' => $i,
            ]);
        }
    }
} 