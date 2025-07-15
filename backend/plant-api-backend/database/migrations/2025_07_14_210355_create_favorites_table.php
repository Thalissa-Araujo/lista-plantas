<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFavoritesTable extends Migration
{
    public function up()
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->string('plant_id');

            $table->string('source_type')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'plant_id', 'source_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('favorites');
    }
}