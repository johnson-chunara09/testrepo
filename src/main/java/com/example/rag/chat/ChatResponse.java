package com.example.rag.chat;

import java.util.List;

public record ChatResponse(String answer, List<String> sources) {
}
