import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DocumentMeta } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="card" style="margin-bottom: 24px;">
      <h1>Upload PDF document</h1>
      <p style="color: #64748b; font-size: 14px;">
        Uploaded PDFs are chunked, embedded, and indexed. All users can then ask
        questions answered from these documents.
      </p>

      @if (error) {
        <div class="error">{{ error }}</div>
      }
      @if (success) {
        <div class="success">{{ success }}</div>
      }

      <div style="display: flex; gap: 12px; align-items: center;">
        <input type="file" accept="application/pdf" (change)="onFileSelected($event)" [disabled]="uploading" />
        <button (click)="upload()" [disabled]="!selectedFile || uploading">
          {{ uploading ? 'Indexing… (this can take a moment)' : 'Upload & Index' }}
        </button>
      </div>
    </div>

    <div class="card">
      <h2>Indexed documents</h2>
      @if (documents.length === 0) {
        <p style="color: #94a3b8;">No documents uploaded yet.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Chunks</th>
              <th>Uploaded by</th>
              <th>Uploaded at</th>
            </tr>
          </thead>
          <tbody>
            @for (doc of documents; track doc.id) {
              <tr>
                <td>{{ doc.filename }}</td>
                <td>{{ doc.chunkCount }}</td>
                <td>{{ doc.uploadedBy }}</td>
                <td>{{ doc.uploadedAt | date: 'medium' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);

  documents: DocumentMeta[] = [];
  selectedFile: File | null = null;
  uploading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error = '';
    this.success = '';
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploading = true;
    this.error = '';
    this.success = '';

    this.http.post<DocumentMeta>('/api/documents', formData).subscribe({
      next: (meta) => {
        this.uploading = false;
        this.success = `"${meta.filename}" indexed into ${meta.chunkCount} chunks.`;
        this.selectedFile = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading = false;
        this.error =
          err.status === 400
            ? 'Invalid file — only non-empty PDF files are supported.'
            : 'Upload failed. Please try again.';
      },
    });
  }

  private loadDocuments(): void {
    this.http.get<DocumentMeta[]>('/api/documents').subscribe({
      next: (docs) => (this.documents = docs),
      error: () => (this.error = 'Could not load document list.'),
    });
  }
}
