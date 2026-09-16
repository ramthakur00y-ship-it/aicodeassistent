package Aiva.controller;

import Aiva.service.GroqService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class CodeController {

    private final GroqService groqService;

    public CodeController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping("/code")
    public String generateCode(@RequestBody Map<String, String> request) {

        // Frontend se prompt lena
        String prompt = request.get("prompt");

        // Groq AI ko prompt bhejna
        return groqService.askGroq(prompt);
    }
}