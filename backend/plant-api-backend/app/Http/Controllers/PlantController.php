<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PlantController extends Controller
{
    private $trefleToken;
    private $baseUrl = 'https://trefle.io/api/v1/';

    public function __construct()
    {
        $this->trefleToken = env('TREFLE_TOKEN');
    }

    public function searchPlants($query)
    {
        $response = Http::get($this->baseUrl . 'plants/search', [
            'token' => $this->trefleToken,
            'q' => $query
        ]);

        return response()->json($response->json());
    }

    public function getPlant($id)
    {
        $response = Http::get($this->baseUrl . 'plants/' . $id, [
            'token' => $this->trefleToken
        ]);

        return response()->json($response->json());
    }

    public function listPlants($page = 1, $perPage = 30)
    {
        $response = Http::get($this->baseUrl . 'plants', [
            'token' => $this->trefleToken,
            'page' => $page,
            'per_page' => $perPage
        ]);

        return response()->json($response->json());
    }
}