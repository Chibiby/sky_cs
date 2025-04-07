<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments_invoices', function (Blueprint $table) {
            $table->id();  // Auto-incrementing ID
            $table->unsignedBigInteger('guest_id');  // Foreign key to associate with guests
            $table->decimal('amount', 10, 2);  // Amount of the payment
            $table->string('invoice_number')->unique();  // Unique invoice number
            $table->enum('status', ['paid', 'unpaid', 'pending']);  // Payment status
            $table->date('payment_date');  // Date of payment
            $table->timestamps();  // Created at and Updated at timestamps
            
            // Foreign key relationship with guests table
            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments_invoices');
    }
};
