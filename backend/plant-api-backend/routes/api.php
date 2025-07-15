<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\AuthController;


Route::get('/plants/search/{query}', [PlantController::class, 'searchPlants']);
Route::get('/plants/{id}', [PlantController::class, 'getPlant']);
Route::get('/plants', [PlantController::class, 'listPlants']);
Route::post('/plants', [PlantController::class, 'store']);

Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/favorites', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/check', [FavoriteController::class, 'check']);
});