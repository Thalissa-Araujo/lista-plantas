<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function toggle(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            \Log::info('Favoriting - Unauthenticated user attempt.');
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $plantId = $request->input('plant_id');
        $sourceType = $request->input('source_type');

        if (!$plantId) {
            return response()->json(['message' => 'Plant ID is required'], 400);
        }
        
        \Log::info('Favoriting attempt:', [
            'user_id' => $user->id,
            'plant_id' => $plantId,
            'source_type' => $sourceType,
        ]);

        $favoriteExists = DB::table('favorites')
            ->where('user_id', $user->id)
            ->where('plant_id', $plantId)
            ->where('source_type', $sourceType)
            ->exists();

        if ($favoriteExists) {
            DB::table('favorites')
                ->where('user_id', $user->id)
                ->where('plant_id', $plantId)
                ->where('source_type', $sourceType)
                ->delete();
            
            \Log::info('Removed from favorites:', [
                'user_id' => $user->id,
                'plant_id' => $plantId,
                'source_type' => $sourceType,
            ]);
            return response()->json(['message' => 'Removed from favorites']);
        } else {
            DB::table('favorites')->insert([
                'user_id' => $user->id,
                'plant_id' => $plantId,
                'source_type' => $sourceType,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            \Log::info('Added to favorites:', [
                'user_id' => $user->id,
                'plant_id' => $plantId,
                'source_type' => $sourceType,
            ]);
            return response()->json(['message' => 'Added to favorites']);
        }
    }


    public function check(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(false, 401);
        }

        $plantId = $request->query('plant_id');
        $sourceType = $request->query('source_type');

        if (!$plantId || !$sourceType) {
            return response()->json(false, 400);
        }

        $isFavorite = DB::table('favorites')
            ->where('user_id', $user->id)
            ->where('plant_id', $plantId)
            ->where('source_type', $sourceType)
            ->exists();

        return response()->json($isFavorite);
    }
}