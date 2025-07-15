<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Plant;
use Illuminate\Support\Facades\Storage;

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
        // Primeiro verifica se é uma planta local
        $localPlant = Plant::find($id);
        
        if ($localPlant) {
            return response()->json([
                'success' => true,
                'data' => [
                    'common_name' => $localPlant->common_name,
                    'scientific_name' => $localPlant->scientific_name,
                    'family' => $localPlant->family,
                    'genus' => $localPlant->genus,
                    'image_url' => $localPlant->image_url ? url($localPlant->image_url) : null,
                    'observations' => $localPlant->observations,
                    'synonyms' => $localPlant->synonyms ?? []
                ],
                'source' => 'local'
            ]);
        }

        // Busca na API Trefle
        $response = Http::get($this->baseUrl . 'plants/' . $id, [
            'token' => $this->trefleToken
        ]);

        if ($response->successful()) {
            $trefleData = $response->json();
            $plantData = $trefleData['data'] ?? [];
            
            // Extrai o nome da família (pode ser string ou objeto)
            $family = is_array($plantData['family']) 
                ? ($plantData['family']['name'] ?? $plantData['main_species']['family'] ?? null)
                : $plantData['family'];

            // Extrai o nome do gênero (pode ser string ou objeto)
            $genus = is_array($plantData['genus']) 
                ? ($plantData['genus']['name'] ?? $plantData['main_species']['genus']['name'] ?? null)
                : $plantData['genus'];

            return response()->json([
                'success' => true,
                'data' => [
                    'common_name' => $plantData['common_name'] ?? null,
                    'scientific_name' => $plantData['scientific_name'] ?? null,
                    'family' => $family,
                    'genus' => $genus,
                    'image_url' => $plantData['image_url'] ?? null,
                    'observations' => $plantData['observations'] ?? $plantData['main_species']['observations'] ?? null,
                    'main_species' => $plantData['main_species'] ?? null,
                    'synonyms' => array_slice(
                        array_map(
                            function($synonym) {
                                return is_array($synonym) 
                                    ? ($synonym['name'] ?? $synonym['scientific_name'] ?? null) 
                                    : $synonym;
                            }, 
                            $plantData['main_species']['synonyms'] ?? $plantData['synonyms'] ?? []
                        ),
                        0, 5
                    )
                ],
                'source' => 'trefle'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Planta não encontrada'
        ], 404);
    }

    public function listPlants($page = 1, $perPage = 30)
    {
        $localPlantsRaw = Plant::latest()
            ->paginate($perPage, ['*'], 'local_page', $page);

        // Converte os dados da paginação para array e formata o campo image_url
        $localPlants = $localPlantsRaw->getCollection()->map(function ($plant) {
            return [
                'id' => $plant->id,
                'common_name' => $plant->common_name,
                'scientific_name' => $plant->scientific_name,
                'family' => $plant->family,
                'genus' => $plant->genus,
                'image_url' => $plant->image_url ? url($plant->image_url) : null,
                'source' => 'local'
            ];
        });

        $trefleResponse = Http::get($this->baseUrl . 'plants', [
            'token' => $this->trefleToken,
            'page' => $page,
            'per_page' => $perPage
        ]);

        $treflePlants = $trefleResponse->successful() 
            ? $trefleResponse->json()['data'] 
            : [];

        $formattedTreflePlants = array_map(function($plant) {
            return [
                'id' => $plant['id'],
                'common_name' => $plant['common_name'],
                'scientific_name' => $plant['scientific_name'],
                'image_url' => $plant['image_url'],
                'family' => $plant['family'] ?? null,
                'genus' => $plant['genus'] ?? null,
                'source' => 'trefle'
            ];
        }, $treflePlants);

        return response()->json([
            'local_plants' => [
                'data' => $localPlants,
                'pagination' => [
                    'total' => $localPlantsRaw->total(),
                    'per_page' => $localPlantsRaw->perPage(),
                    'current_page' => $localPlantsRaw->currentPage(),
                    'last_page' => $localPlantsRaw->lastPage(),
                ]
            ],
            'trefle_plants' => $formattedTreflePlants
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'common_name' => 'required|string',
            'scientific_name' => 'required|string',
            'family' => 'required|string',
            'genus' => 'required|string',
            'observations' => 'nullable|string',
            'image' => 'required|image',
            'synonyms' => 'nullable|array',
            'synonyms.*' => 'string'
        ]);

        $imagePath = $request->file('image')->store('plants', 'public');
        
        $plant = Plant::create([
            'common_name' => $validated['common_name'],
            'scientific_name' => $validated['scientific_name'],
            'family' => $validated['family'],
            'genus' => $validated['genus'],
            'observations' => $validated['observations'],
            'image_url' => config('app.url') . Storage::url($imagePath),
            'synonyms' => $validated['synonyms'] ?? [],
        ]);

        return response()->json($plant, 201);
    }
}