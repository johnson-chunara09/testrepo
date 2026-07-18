package com.example.rag.chat;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagChatService {

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that answers questions strictly based on the \
            document excerpts provided in the CONTEXT section. \
            If the answer is not contained in the context, say that you could not find \
            the answer in the uploaded documents — do not invent information. \
            Answer concisely and cite the relevant document filename when possible.""";

    private static final String USER_TEMPLATE = """
            CONTEXT:
            %s

            QUESTION:
            %s""";

    private final ChatClient chatClient;
    private final SimpleVectorStore vectorStore;

    public RagChatService(ChatClient chatClient, SimpleVectorStore vectorStore) {
        this.chatClient = chatClient;
        this.vectorStore = vectorStore;
    }

    public ChatResponse ask(String question) {
        List<Document> matches = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(5)
                        .similarityThreshold(0.25)
                        .build());

        if (matches == null || matches.isEmpty()) {
            return new ChatResponse(
                    "No relevant content was found. Either no documents have been uploaded yet, "
                            + "or the question is unrelated to the uploaded documents.",
                    List.of());
        }

        String context = matches.stream()
                .map(doc -> "[Source: " + doc.getMetadata().getOrDefault("filename", "unknown")
                        + "]\n" + doc.getText())
                .collect(Collectors.joining("\n\n---\n\n"));

        String answer = chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(USER_TEMPLATE.formatted(context, question))
                .call()
                .content();

        List<String> sources = matches.stream()
                .map(doc -> Objects.toString(doc.getMetadata().get("filename"), null))
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        return new ChatResponse(answer, sources);
    }
}
