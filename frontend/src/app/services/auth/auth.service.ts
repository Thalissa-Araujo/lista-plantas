import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  initializeCsrf() {
    return this.http.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true
    });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.initializeCsrf().pipe(
      switchMap(() => {
        const xsrfToken = this.getCookie('XSRF-TOKEN');
        return this.http.post(`${this.apiUrl}/register`, {
          name,
          email,
          password
        }, {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': xsrfToken ?? ''
          }
        });
      }),
      tap((user) => {
        this.storeUserData(user);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        return throwError(() => this.handleAuthError(error));
      })
    );
  }


  login(email: string, password: string): Observable<any> {
    return this.initializeCsrf().pipe(
      switchMap(() => {
        const xsrfToken = this.getCookie('XSRF-TOKEN');
        return this.http.post(`${this.apiUrl}/login`, {
          email,
          password
        }, {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': xsrfToken ?? ''
          }
        });
      }),
      tap((user) => {
        this.storeUserData(user);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        return throwError(() => this.handleAuthError(error));
      })
  );
}

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearUserData();
        this.router.navigate(['/login']);
      })
    );
  }

  private storeUserData(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
  }

  private handleAuthError(error: any): Error {
    const errorMsg = error.error?.message || 
                    error.error?.error || 
                    'Authentication failed';
    return new Error(errorMsg);
  }

  public getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  get currentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}