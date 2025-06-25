<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlantController;

Route::get('/plants/search/{query}', [PlantController::class, 'searchPlants']);
Route::get('/plants/{id}', [PlantController::class, 'getPlant']);
Route::get('/plants', [PlantController::class, 'listPlants']);