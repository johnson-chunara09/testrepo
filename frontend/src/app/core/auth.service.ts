import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse } from './models';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.username';
const ROLE_KEY = 'auth.role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private usernameSignal = signal<string | null>(localStorage.getItem(USER_KEY));
  private roleSignal = signal<string | null>(localStorage.getItem(ROLE_KEY));

  readonly isLoggedIn = computed(() => this.tokenSignal() !== null);
  readonly isAdmin = computed(() => this.roleSignal() === 'ADMIN');
  readonly username = computed(() => this.usernameSignal());

  get token(): string | null {
    return this.tokenSignal();
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>('/api/auth/login', { username, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(username: string, password: string) {
    return this.http
      .post<AuthResponse>('/api/auth/register', { username, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.tokenSignal.set(null);
    this.usernameSignal.set(null);
    this.roleSignal.set(null);
    this.router.navigate(['/login']);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, res.username);
    localStorage.setItem(ROLE_KEY, res.role);
    this.tokenSignal.set(res.token);
    this.usernameSignal.set(res.username);
    this.roleSignal.set(res.role);
  }
}
