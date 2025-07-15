<?php

use Illuminate\Support\Facades\Response;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;

Route::get('/images/plants/{filename}', function ($filename) {
    $path = storage_path('app/public/plants/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return Response::file($path);
});

Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout']);
Route::get('/api/user', function () {
    return auth()->user();
});

Route::middleware(['auth'])->group(function () {
    Route::post('/api/favorites', [FavoriteController::class, 'toggle']);
    Route::get('/api/favorites', [FavoriteController::class, 'index']);
    Route::get('/api/plants/{plant}/favorite', [FavoriteController::class, 'check']);
});
