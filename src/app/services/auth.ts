import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly apiUrl =
    'http://localhost:3000/api';

  constructor(
    private http: HttpClient
  ) {}

  // ========================================
  // LOGIN
  // ========================================

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );
  }

  // ========================================
  // REGISTER
  // ========================================

  register(
    email: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/register`,
      {
        email,
        password
      }
    );
  }

  // ========================================
  // TOKEN
  // ========================================

  getToken(): string | null {

    return localStorage.getItem('token');
  }

  // ========================================
  // LOGGED IN
  // ========================================

  isLoggedIn(): boolean {

    return !!this.getToken();
  }

  // ========================================
  // DASHBOARD
  // ========================================

  getDashboard(): Observable<DashboardResponse> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<DashboardResponse>(
      `${this.apiUrl}/dashboard`,
      {
        headers
      }
    );
  }

  // ========================================
  // CHECK TOKEN
  // ========================================

  checkToken(): Observable<any> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/auth/check`,
      {
        headers
      }
    );
  }

  // ========================================
  // LOGOUT
  // ========================================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('isLoggedIn');

    localStorage.removeItem('userEmail');
  }
}