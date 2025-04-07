<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Guest;

class GuestsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('guests/index', [
            'guests' => Guest::all(),
        ]);
    }

    public function checkedIn(): Response
    {
        return Inertia::render('guests/checked-in', [
            'guests' => Guest::where('status', 'checked_in')->get(),
        ]);
    }

    public function history(): Response
    {
        return Inertia::render('guests/history', [
            'guests' => Guest::with('pastStays')->get(),
        ]);
    }

    public function vip(): Response
    {
        return Inertia::render('guests/vip', [
            'guests' => Guest::where('is_vip', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('guests/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Implement guest creation logic
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Implement guest details view
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Implement guest edit view
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Implement guest update logic
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Implement guest deletion logic
    }
}
