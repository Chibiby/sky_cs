<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReservationsController;
use App\Http\Controllers\GuestsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationExportController;
use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'flash' => [
            'success' => session('success'),
            'error' => session('error')
        ]
    ]);
});

// Public reservation route
Route::post('/reservations', [ReservationsController::class, 'store'])
    ->name('reservations.store')
    ->middleware(['web']);

// Dashboard/Home routes
Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/home', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // API routes
    Route::prefix('api')->group(function () {
        Route::get('reservations', [ReservationsController::class, 'index']);
    });

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Reservations routes
    Route::prefix('reservations')->group(function () {
        Route::get('/', [ReservationsController::class, 'index'])->name('reservations.index');
        Route::get('/create', [ReservationsController::class, 'create'])->name('reservations.create');
        Route::get('/availability', [ReservationsController::class, 'availability'])->name('reservations.availability');
        Route::get('/booking-calendar', [ReservationsController::class, 'bookingCalendar'])->name('reservations.booking-calendar');
        Route::get('/manage', [ReservationsController::class, 'manage'])->name('reservations.manage');
        Route::delete('/bulk-delete', [ReservationsController::class, 'bulkDelete'])->name('reservations.bulk-delete');
        Route::delete('/{id}', [ReservationsController::class, 'destroy'])->name('reservations.destroy');
        Route::put('/{id}', [ReservationsController::class, 'update'])->name('reservations.update');
        
        // Accommodation route
        Route::get('/accommodation', [AccommodationController::class, 'index'])->name('reservations.accommodation');
        
        // Export routes
        Route::post('/export/pdf', [ReservationExportController::class, 'exportPDF'])->name('reservations.export.pdf');
        Route::get('/download/pdf', [ReservationExportController::class, 'downloadPDF'])->name('reservations.download.pdf');
        Route::get('/download/excel', [ReservationExportController::class, 'downloadExcel'])->name('reservations.download.excel');
        Route::get('/download/csv', [ReservationExportController::class, 'downloadCSV'])->name('reservations.download.csv');
        Route::get('/view-pdf', [ReservationExportController::class, 'viewPDF'])->name('reservations.view.pdf');
        Route::post('/print', [ReservationExportController::class, 'print'])->name('reservations.print');
    });

    // Guests routes
    Route::prefix('guests')->group(function () {
        Route::get('/', [GuestsController::class, 'index'])->name('guests.index');
        Route::get('/checked-in', [GuestsController::class, 'checkedIn'])->name('guests.checked-in');
        Route::get('/history', [GuestsController::class, 'history'])->name('guests.history');
        Route::get('/vip', [GuestsController::class, 'vip'])->name('guests.vip');
    });

    // User Management routes
    Route::prefix('users')->middleware(['auth'])->group(function () {
        Route::get('/manage', [UserManagementController::class, 'index'])->name('users.manage');
        Route::get('/', [UserManagementController::class, 'index'])->name('users.index');
        Route::get('/create', [UserManagementController::class, 'create'])->name('users.create');
        Route::post('/', [UserManagementController::class, 'store'])->name('users.store');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
        Route::patch('/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'sendResetLink'])->name('users.reset-password');
        Route::patch('/{user}/change-role', [UserManagementController::class, 'changeRole'])->name('users.change-role');
        Route::delete('/bulk-destroy', [UserManagementController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    });

    // Guest management routes
    Route::get('/guests/manage', [GuestsController::class, 'manage'])->name('guests.manage');
    Route::get('/guests/history', [GuestsController::class, 'history'])->name('guests.history');
    Route::get('/guests/{guest}/edit', [GuestsController::class, 'edit'])->name('guests.edit');
    Route::put('/guests/{guest}', [GuestsController::class, 'update'])->name('guests.update');
    Route::delete('/guests/{guest}', [GuestsController::class, 'destroy'])->name('guests.destroy');

    // Guest export routes
    Route::get('/guests/download/pdf', [GuestsController::class, 'downloadPdf'])->name('guests.download.pdf');
    Route::get('/guests/download/excel', [GuestsController::class, 'downloadExcel'])->name('guests.download.excel');
    Route::get('/guests/download/csv', [GuestsController::class, 'downloadCsv'])->name('guests.download.csv');
    Route::get('/guests/view-pdf', [GuestsController::class, 'viewPdf'])->name('guests.view.pdf');

    // Accommodation routes
    Route::get('/reservations/accommodation', [AccommodationController::class, 'index'])->name('accommodation.index');
    Route::put('/accommodations/{id}', [AccommodationController::class, 'update'])->name('accommodation.update');
    Route::post('/accommodations', [AccommodationController::class, 'store'])->name('accommodation.store');
    Route::delete('/accommodations/{id}', [AccommodationController::class, 'destroy'])->name('accommodation.destroy');
});

// Sitemap
Route::get('/generate-sitemap', [\App\Http\Controllers\SitemapController::class, 'generate']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
