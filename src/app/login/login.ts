import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../services/auth';

@Component({
  selector: 'app-login',

  templateUrl: './login.html',

  styleUrl: './login.css',

  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class Login {

  // ========================================
  // USER
  // ========================================

  user = {
    email: '',
    password: ''
  };

  // ========================================
  // UI
  // ========================================

  loginvalid = true;

  errorMessage = '';

  loading = false;

  hidePassword = true;

  // ========================================
  // SERVICES
  // ========================================

  private router = inject(Router);

  private authService = inject(Auth);

  // ========================================
  // LOGIN
  // ========================================

  login(): void {

    this.errorMessage = '';

    this.loginvalid = true;

    if (!this.user.email) {

      this.loginvalid = false;

      this.errorMessage =
        'Please enter your email';

      return;
    }

    if (!this.user.password) {

      this.loginvalid = false;

      this.errorMessage =
        'Please enter your password';

      return;
    }

    this.loading = true;

    this.authService
      .login(
        this.user.email,
        this.user.password
      )
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (
            response.success &&
            response.token
          ) {

            // Save JWT
            localStorage.setItem(
              'token',
              response.token
            );

            // Save login status
            localStorage.setItem(
              'isLoggedIn',
              'true'
            );

            // Save email
            if (response.user) {

              localStorage.setItem(
                'userEmail',
                response.user.email
              );
            }

            this.loginvalid = true;

            this.errorMessage = '';

            this.router.navigate([
              '/dashboard'
            ]);

          } else {

            this.loginvalid = false;

            this.errorMessage =
              'Login failed';
          }
        },

        error: (error) => {

          this.loading = false;

          this.loginvalid = false;

          if (error.status === 401) {

            this.errorMessage =
              'Invalid email or password';

          } else if (error.status === 400) {

            this.errorMessage =
              'Email and password are required';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to server';

          } else {

            this.errorMessage =
              'Something went wrong. Please try again.';
          }
        }
      });
  }

  // ========================================
  // SHOW/HIDE PASSWORD
  // ========================================

  togglePassword(): void {

    this.hidePassword =
      !this.hidePassword;
  }
}