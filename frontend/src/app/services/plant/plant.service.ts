// src/app/services/plant/plant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, switchMap, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';


interface FavoriteBackendResponse {
  plant_id: string;
  source_type: string;
}

interface FavoriteWithPlantDetails {
  plant_id: string;
  source_type: string;
  plant: any;
  error?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getPlants(limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plants?limit=${limit}`).pipe(
      map(response => {
        const localPlants = response.local_plants?.data || [];
        const treflePlants = response.trefle_plants || [];
        return [...localPlants, ...treflePlants];
      }),
      catchError(error => {
        console.error('Error loading plants:', error);
        return of([]);
      })
    );
  }

  getPlant(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plants/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Plant not found');
      }),
      catchError(error => {
        console.error('Error loading plant:', error);
        return of(null);
      })
    );
  }

  searchPlants(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plants/search/${name}`).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  }

  toggleFavorite(plantId: string, sourceType: string): Observable<any> {
    const xsrfToken = this.authService.getCookie('XSRF-TOKEN');

    return this.authService.initializeCsrf().pipe(
      switchMap(() => {
        return this.http.post(
          `${this.apiUrl}/favorites`,
          { plant_id: plantId, source_type: sourceType },
          {
            withCredentials: true,
            headers: {
              'X-XSRF-TOKEN': xsrfToken ?? '',
              'Content-Type': 'application/json'
            }
          }
        );
      }),
      catchError(error => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
        errorMessage = `Server Error: ${error.error.message}`;
    } else if (error.message) {
        errorMessage = `HTTP Error: ${error.status} - ${error.message}`;
    } else {
        errorMessage = JSON.stringify(error);
    }

    console.error('Detailed Error:', errorMessage);

    if (error.status === 401) {
      this.authService.logout().subscribe();
    }
    return throwError(() => new Error(errorMessage));
  }
  checkFavorite(plantId: string, sourceType: string): Observable<boolean> {
    const xsrfToken = this.authService.getCookie('XSRF-TOKEN');

    return this.authService.initializeCsrf().pipe(
      switchMap(() => {
        return this.http.get<boolean>(
          `${this.apiUrl}/favorites/check?plant_id=${plantId}&source_type=${sourceType}`,
          {
            withCredentials: true,
            headers: {
              'X-XSRF-TOKEN': xsrfToken ?? '',
              'Content-Type': 'application/json'
            }
          }
        );
      }),
      catchError(error => {
        console.error('Error checking favorite:', error);
        if (error.status === 401) {
          return of(false); 
        }
        return throwError(() => this.handleError(error));
      })
    );
  }

  addPlant(plantData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/plants`, plantData).pipe(
      catchError(this.handleError)
    );
  }
}
