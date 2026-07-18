package com.example.rag.document;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin-only endpoints (enforced in SecurityConfig via hasRole("ADMIN")).
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final IngestionService ingestionService;
    private final DocumentRepository documentRepository;

    public DocumentController(IngestionService ingestionService, DocumentRepository documentRepository) {
        this.ingestionService = ingestionService;
        this.documentRepository = documentRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, Principal principal)
            throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            return ResponseEntity.badRequest().body("Only PDF files are supported");
        }

        DocumentMeta meta = ingestionService.ingestPdf(file, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(meta);
    }

    @GetMapping
    public List<DocumentMeta> list() {
        return documentRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadedAt"));
    }
}
