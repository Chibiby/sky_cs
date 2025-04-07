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
        Schema::create('reports_analytics', function (Blueprint $table) {
            $table->id();  // Auto-incrementing ID for each report/analytics record
            $table->string('report_type');  // Type of report (e.g., "financial", "user activity", etc.)
            $table->date('start_date');  // Start date of the report's time range
            $table->date('end_date');  // End date of the report's time range
            $table->text('data');  // The actual report data (could be JSON or plain text, depending on how you store it)
            $table->enum('status', ['pending', 'completed', 'failed']);  // Status of the report generation
            $table->timestamps();  // Created at and Updated at timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports_analytics');
    }
};
