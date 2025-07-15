<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    protected $fillable = [
        'common_name',
        'scientific_name',
        'family',
        'genus',
        'observations',
        'image_url',
        'synonyms',
        'user_id'
    ];

    protected $casts = [
        'synonyms' => 'array'
    ];
        public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }
}