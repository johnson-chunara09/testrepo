import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <span class="brand">📄 Document Q&amp;A</span>
      @if (auth.isLoggedIn()) {
        <a routerLink="/chat" routerLinkActive="active">Ask Questions</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active">Manage Documents</a>
        }
        <span class="spacer"></span>
        <span class="user">{{ auth.username() }} ({{ auth.isAdmin() ? 'Admin' : 'User' }})</span>
        <button class="secondary" (click)="auth.logout()">Logout</button>
      } @else {
        <span class="spacer"></span>
        <a routerLink="/login" routerLinkActive="active">Login</a>
      }
    </nav>
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
}
