import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserSummary } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card" style="margin-bottom: 24px;">
      <h1>Create user</h1>
      <p style="color: #64748b; font-size: 14px;">
        Only admins can reach this screen. Create an account and choose whether it
        gets the <strong>USER</strong> or <strong>ADMIN</strong> role.
      </p>

      @if (error) {
        <div class="error">{{ error }}</div>
      }
      @if (success) {
        <div class="success">{{ success }}</div>
      }

      <form (ngSubmit)="create()">
        <label for="username">Username</label>
        <input id="username" type="text" name="username" [(ngModel)]="username" required
               autocomplete="off" [disabled]="saving" />

        <label for="password">Password</label>
        <input id="password" type="password" name="password" [(ngModel)]="password" required
               autocomplete="new-password" [disabled]="saving" />

        <label for="role">Role</label>
        <select id="role" name="role" [(ngModel)]="role" [disabled]="saving">
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button type="submit" [disabled]="saving || !username || !password" style="margin-top: 12px;">
          {{ saving ? 'Creating…' : 'Create user' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2>Existing users</h2>
      @if (users.length === 0) {
        <p style="color: #94a3b8;">No users yet.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users; track u.id) {
              <tr>
                <td>{{ u.id }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.role }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);

  users: UserSummary[] = [];
  username = '';
  password = '';
  role: 'USER' | 'ADMIN' = 'USER';
  saving = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  create(): void {
    if (!this.username || !this.password) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    this.http
      .post<UserSummary>('/api/users', {
        username: this.username,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: (user) => {
          this.saving = false;
          this.success = `User "${user.username}" created with role ${user.role}.`;
          this.username = '';
          this.password = '';
          this.role = 'USER';
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          if (err.status === 409) {
            this.error = 'That username is already taken.';
          } else if (err.status === 400) {
            this.error = 'Username must be 3+ chars and password 6+ chars.';
          } else {
            this.error = 'Could not create user. Please try again.';
          }
        },
      });
  }

  private loadUsers(): void {
    this.http.get<UserSummary[]>('/api/users').subscribe({
      next: (users) => (this.users = users),
      error: () => (this.error = 'Could not load user list.'),
    });
  }
}
