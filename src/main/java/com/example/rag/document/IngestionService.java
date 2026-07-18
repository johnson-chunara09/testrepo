package com.example.rag.document;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final SimpleVectorStore vectorStore;
    private final DocumentRepository documentRepository;
    private final String storePath;

    public IngestionService(
            SimpleVectorStore vectorStore,
            DocumentRepository documentRepository,
            @Value("${app.vector-store.path}") String storePath) {
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;
        this.storePath = storePath;
    }

    public synchronized DocumentMeta ingestPdf(MultipartFile file, String uploadedBy) throws IOException {
        String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename()
                : "document.pdf";

        var resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        // 1. Extract text page by page
        List<Document> pages = new PagePdfDocumentReader(resource).read();

        // 2. Split into token-sized chunks suitable for embedding + retrieval
        List<Document> chunks = new TokenTextSplitter().apply(pages);
        chunks.forEach(chunk -> chunk.getMetadata().put("filename", filename));

        // 3. Embed and index, then persist the store to disk
        vectorStore.add(chunks);
        File storeFile = new File(storePath);
        File parent = storeFile.getParentFile();
        if (parent != null) {
            parent.mkdirs();
        }
        vectorStore.save(storeFile);

        log.info("Ingested '{}' as {} chunks (by {})", filename, chunks.size(), uploadedBy);

        return documentRepository.save(
                new DocumentMeta(filename, chunks.size(), uploadedBy, Instant.now()));
    }
}
