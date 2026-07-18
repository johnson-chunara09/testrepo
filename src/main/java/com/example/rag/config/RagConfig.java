package com.example.rag.config;

import java.io.File;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagConfig {

    private static final Logger log = LoggerFactory.getLogger(RagConfig.class);

    /**
     * File-persisted in-memory vector store. Embeddings come from the local ONNX
     * transformers model (all-MiniLM-L6-v2) — Anthropic does not offer an embedding
     * API, so this keeps the whole RAG pipeline on a single ANTHROPIC_API_KEY.
     */
    @Bean
    public SimpleVectorStore vectorStore(
            EmbeddingModel embeddingModel,
            @Value("${app.vector-store.path}") String storePath) {
        SimpleVectorStore store = SimpleVectorStore.builder(embeddingModel).build();
        File file = new File(storePath);
        if (file.exists()) {
            store.load(file);
            log.info("Loaded existing vector store from {}", file.getAbsolutePath());
        }
        return store;
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
