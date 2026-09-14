import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../services/auth';

@Component({
  selector: 'app-dashboard',

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ]
})
export class Dashboard {

  private authService = inject(Auth);

  private router = inject(Router);

  userEmail = '';

  loading = true;

  errorMessage = '';

  // ========================================
  // INIT
  // ========================================

  ngOnInit(): void {

    this.loadDashboard();
  }

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  loadDashboard(): void {

    this.authService
      .getDashboard()
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (response.success) {

            this.userEmail =
              response.user.email;
          }
        },

        error: (error) => {

          this.loading = false;

          console.error(
            'Dashboard error:',
            error
          );

          if (
            error.status === 401 ||
            error.status === 403
          ) {

            this.authService.logout();

            this.router.navigate([
              '/login'
            ]);

            return;
          }

          this.errorMessage =
            'Unable to load dashboard';
        }
      });
  }

  // ========================================
  // LOGOUT
  // ========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}