<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->text('description')->nullable();
            $table->integer('max_occupancy');
            $table->decimal('base_price', 10, 2);
            $table->decimal('extra_person_fee', 10, 2);
            $table->json('amenities')->nullable();
            $table->string('location');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_occupied')->default(false);
            $table->string('housekeeping_status')->default('clean');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('accommodations');
    }
}; 