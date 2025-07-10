import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

const url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
  };

  getPlants(limit: number): Observable<any> {
    return this.http.get<any>(`${url}/plants?limit=${limit}`);
  }

  getPlant(id: string): Observable<any> {
    return this.http.get<any>(`${url}/plants/${id}`);
  }

  searchPlants(name: string): Observable<any> {
    return this.http.get<any>(`${url}/plants/search/${name}`);
  }

  toggleFavorite(plantId: string): Observable<any> {
    // Implementar chamada para o backend Laravel para salvar favoritos
    return this.http.post<any>(`${url}/favorites`, { plantId });
  }

checkFavorite(plantId: string): Observable<boolean> {
  return this.http.get<boolean>(`${url}/plants/${plantId}/favorite`);
}

}