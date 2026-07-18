package com.example.rag.document;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "documents")
public class DocumentMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private int chunkCount;

    @Column(nullable = false)
    private String uploadedBy;

    @Column(nullable = false)
    private Instant uploadedAt;

    protected DocumentMeta() {
    }

    public DocumentMeta(String filename, int chunkCount, String uploadedBy, Instant uploadedAt) {
        this.filename = filename;
        this.chunkCount = chunkCount;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }
}
