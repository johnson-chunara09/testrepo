import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card" style="max-width: 420px; margin: 48px auto;">
      <h1>{{ registerMode ? 'Create account' : 'Sign in' }}</h1>

      @if (error) {
        <div class="error">{{ error }}</div>
      }

      <form (ngSubmit)="submit()">
        <label for="username">Username</label>
        <input id="username" type="text" name="username" [(ngModel)]="username" required autocomplete="username" />

        <label for="password">Password</label>
        <input id="password" type="password" name="password" [(ngModel)]="password" required
               autocomplete="current-password" />

        <button type="submit" [disabled]="loading || !username || !password" style="width: 100%;">
          {{ loading ? 'Please wait…' : (registerMode ? 'Register' : 'Login') }}
        </button>
      </form>

      <p style="text-align: center; font-size: 14px; margin-top: 16px;">
        @if (registerMode) {
          Already have an account?
          <a href="javascript:void(0)" (click)="toggleMode()">Sign in</a>
        } @else {
          New here?
          <a href="javascript:void(0)" (click)="toggleMode()">Create an account</a>
        }
      </p>

      <p style="font-size: 13px; color: #64748b; text-align: center;">
        Demo accounts — admin: <code>admin/admin123</code>, user: <code>user/user123</code>
      </p>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';
  loading = false;
  registerMode = false;

  toggleMode(): void {
    this.registerMode = !this.registerMode;
    this.error = '';
  }

  submit(): void {
    this.loading = true;
    this.error = '';
    const call = this.registerMode
      ? this.auth.register(this.username, this.password)
      : this.auth.login(this.username, this.password);

    call.subscribe({
      next: () => this.router.navigate(['/chat']),
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Invalid username or password.';
        } else if (err.status === 409) {
          this.error = 'That username is already taken.';
        } else {
          this.error = 'Something went wrong. Please try again.';
        }
      },
    });
  }
}
