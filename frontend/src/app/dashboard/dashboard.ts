import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  imports: [MatButtonModule]
})
export class Dashboard {

  private router = inject(Router);

  logout(): void {
    console.log('Logout clicked');

    localStorage.removeItem('isLoggedIn');

    this.router.navigate(['/login']);
  }
}