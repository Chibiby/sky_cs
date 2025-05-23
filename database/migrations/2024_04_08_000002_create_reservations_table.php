<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('accommodation_id');
            $table->unsignedBigInteger('guest_id');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('number_of_guests');
            $table->string('status')->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('accommodation_id')
                  ->references('id')
                  ->on('accommodations')
                  ->onDelete('cascade');
                  
            $table->foreign('guest_id')
                  ->references('id')
                  ->on('guests')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
}; 