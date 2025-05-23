<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'room_number',
        'description',
        'max_occupancy',
        'base_price',
        'extra_person_fee',
        'is_active',
        'amenities',
        'location',
        'is_occupied',
        'housekeeping_status'
    ];

    protected $casts = [
        'max_occupancy' => 'integer',
        'base_price' => 'decimal:2',
        'extra_person_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'amenities' => 'array',
        'is_occupied' => 'boolean'
    ];

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name}";
    }
} 