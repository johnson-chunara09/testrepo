import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatResponse } from '../../core/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h1>Ask the documents</h1>
      <p style="color: #64748b; font-size: 14px;">
        Answers are generated from the PDF documents uploaded by an administrator.
      </p>

      <div class="messages">
        @for (msg of messages; track $index) {
          <div class="msg" [class.user]="msg.from === 'user'">
            <div class="bubble">
              <div class="text">{{ msg.text }}</div>
              @if (msg.sources?.length) {
                <div class="sources">
                  Sources:
                  @for (s of msg.sources; track s) {
                    <span class="source-chip">{{ s }}</span>
                  }
                </div>
              }
            </div>
          </div>
        } @empty {
          <p style="color: #94a3b8; text-align: center; padding: 24px 0;">
            No questions asked yet — type one below.
          </p>
        }
        @if (loading) {
          <div class="msg"><div class="bubble">Thinking…</div></div>
        }
      </div>

      @if (error) {
        <div class="error">{{ error }}</div>
      }

      <form (ngSubmit)="ask()" style="display: flex; gap: 10px;">
        <input type="text" name="question" [(ngModel)]="question"
               placeholder="e.g. What is the refund policy?"
               style="flex: 1; margin-bottom: 0;" [disabled]="loading" />
        <button type="submit" [disabled]="loading || !question.trim()">Ask</button>
      </form>
    </div>
  `,
  styles: [
    `
      .messages { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
      .msg { display: flex; }
      .msg.user { justify-content: flex-end; }
      .bubble {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 12px;
        background: #eef2f7;
        white-space: pre-wrap;
        font-size: 15px;
        line-height: 1.5;
      }
      .msg.user .bubble { background: #2563eb; color: #fff; }
      .sources { margin-top: 8px; font-size: 12px; color: #64748b; }
      .source-chip {
        display: inline-block;
        background: #e0e7ff;
        color: #3730a3;
        border-radius: 999px;
        padding: 2px 10px;
        margin-left: 6px;
      }
    `,
  ],
})
export class ChatComponent {
  private http = inject(HttpClient);

  question = '';
  messages: ChatMessage[] = [];
  loading = false;
  error = '';

  ask(): void {
    const q = this.question.trim();
    if (!q || this.loading) {
      return;
    }
    this.messages.push({ from: 'user', text: q });
    this.question = '';
    this.loading = true;
    this.error = '';

    this.http.post<ChatResponse>('/api/chat/ask', { question: q }).subscribe({
      next: (res) => {
        this.loading = false;
        this.messages.push({ from: 'assistant', text: res.answer, sources: res.sources });
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to get an answer. Please try again.';
      },
    });
  }
}
