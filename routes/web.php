<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReservationsController;
use App\Http\Controllers\GuestsController;
use App\Http\Controllers\PaymentInvoicesController;
use App\Http\Controllers\ReportsAnalyticsController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'flash' => [
            'success' => session('success'),
            'error' => session('error')
        ]
    ]);
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

// Public reservation route
Route::post('/public/reservations', [ReservationsController::class, 'publicStore'])
    ->name('public.reservations.store')
    ->middleware(['web']);

Route::middleware(['auth', 'verified'])->group(function () {
    // API routes
    Route::prefix('api')->group(function () {
        Route::get('reservations', [ReservationsController::class, 'index']);
    });

    // Reservations routes
    Route::prefix('reservations')->group(function () {
        Route::get('/', [ReservationsController::class, 'index'])->name('reservations.index');
        Route::get('/create', [ReservationsController::class, 'create'])->name('reservations.create');
        Route::post('/', [ReservationsController::class, 'store'])->name('reservations.store');
        Route::get('/availability', [ReservationsController::class, 'availability'])->name('reservations.availability');
        Route::get('/calendar', [ReservationsController::class, 'calendar'])->name('reservations.calendar');
        Route::get('/manage', [ReservationsController::class, 'manage'])->name('reservations.manage');
    });

    // Guests routes
    Route::prefix('guests')->group(function () {
        Route::get('/', [GuestsController::class, 'index'])->name('guests.index');
        Route::get('/checked-in', [GuestsController::class, 'checkedIn'])->name('guests.checked-in');
        Route::get('/history', [GuestsController::class, 'history'])->name('guests.history');
        Route::get('/vip', [GuestsController::class, 'vip'])->name('guests.vip');
    });

    // Payments & Invoices routes
    Route::prefix('payment-invoices')->group(function () {
        Route::get('/', [PaymentInvoicesController::class, 'index'])->name('payment-invoices.index');
        Route::get('/pending', [PaymentInvoicesController::class, 'pending'])->name('payment-invoices.pending');
        Route::get('/history', [PaymentInvoicesController::class, 'history'])->name('payment-invoices.history');
        Route::get('/generate', [PaymentInvoicesController::class, 'generate'])->name('payment-invoices.generate');
    });

    // Reports & Analytics routes
    Route::prefix('reports-analytics')->group(function () {
        Route::get('/', [ReportsAnalyticsController::class, 'index'])->name('reports-analytics.index');
        Route::get('/reservations', [ReportsAnalyticsController::class, 'reservations'])->name('reports-analytics.reservations');
        Route::get('/trends', [ReportsAnalyticsController::class, 'trends'])->name('reports-analytics.trends');
        Route::get('/revenue', [ReportsAnalyticsController::class, 'revenue'])->name('reports-analytics.revenue');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
