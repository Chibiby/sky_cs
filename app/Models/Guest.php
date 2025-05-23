<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'address',
        'is_vip',
        'status',
    ];

    protected $casts = [
        'is_vip' => 'boolean',
    ];

    /**
     * Get all reservations for the guest.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the full name of the guest.
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function pastStays(): HasMany
    {
        return $this->hasMany(Reservation::class)->where('reservation_date', '<', now());
    }
} 