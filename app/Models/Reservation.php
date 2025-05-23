<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_id',
        'accommodation_id',
        'check_in',
        'check_out',
        'number_of_guests',
        'status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'number_of_guests' => 'integer',
    ];

    public function accommodation()
    {
        return $this->belongsTo(Accommodation::class);
    }

    public function getRoomTypeAttribute()
    {
        return $this->accommodation->type ?? '';
    }

    /**
     * Get the guest that owns the reservation.
     */
    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
} 