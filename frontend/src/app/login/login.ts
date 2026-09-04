import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Router } from '@angular/router';
import { Auth } from '../services/auth';

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

  user = {
    email: '',
    password: ''
  };

  // true = no error
  // false = show error
  loginvalid = true;

  errorMessage = '';

  router = inject(Router);
  authService = inject(Auth);

  login(): void {

    // Check if fields are empty
    if (!this.user.email || !this.user.password) {
      this.loginvalid = false;
      this.errorMessage = 'Please enter email and password';
      return;
    }

    // Call Node.js API
    this.authService.login(
      this.user.email,
      this.user.password
    ).subscribe({

      // Successful API response
      next: (response) => {

        if (response.success) {

          localStorage.setItem(
            'isLoggedIn',
            JSON.stringify(this.user.email)
          );

          this.loginvalid = true;
          this.errorMessage = '';

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        }

      },

      // API error
      error: (error) => {

        this.loginvalid = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        }
        else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server';
        }
        else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }

      }

    });
  }
}