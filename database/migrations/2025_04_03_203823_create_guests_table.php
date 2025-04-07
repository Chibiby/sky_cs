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
        Schema::create('guests', function (Blueprint $table) {
            $table->id();  // Auto-incrementing ID
            $table->string('first_name');  // Guest's first name
            $table->string('last_name');  // Guest's last name
            $table->string('email')->unique()->nullable();  // Guest's email (optional, unique)
            $table->string('phone_number')->nullable();  // Guest's phone number (optional)
            $table->string('address')->nullable();  // Guest's address (optional)
            $table->timestamps();  // Created at and Updated at timestamps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');  // Rollback method to drop the table
    }
};
