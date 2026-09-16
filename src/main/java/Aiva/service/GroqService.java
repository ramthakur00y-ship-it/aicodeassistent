package Aiva.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.List;

@Service
public class GroqService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public GroqService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public String askGroq(String prompt) {

        try {

            // Groq request ka JSON safely create karna
            Map<String, Object> requestBody = Map.of(
                    "model", "openai/gpt-oss-120b",
                    "messages", List.of(
                            Map.of(
                                    "role", "user",
                                    "content", prompt
                            )
                    )
            );

            // Groq API ko request bhejna
            String response = restClient
                    .post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            // Groq JSON response ko parse karna
            JsonNode json = objectMapper.readTree(response);

            // choices -> first result -> message -> content
            String answer = json
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // Sirf AI ka actual answer return hoga
            return answer;

        } catch (Exception e) {

            System.out.println("===== GROQ ERROR =====");
            System.out.println(e.getMessage());
            System.out.println("======================");

            throw new RuntimeException("Groq API error", e);
        }
    }
}