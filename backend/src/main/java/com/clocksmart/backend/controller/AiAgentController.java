package com.clocksmart.backend.controller;

import com.clocksmart.backend.model.Employee;
import com.clocksmart.backend.service.AiAgentService;
import com.clocksmart.backend.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAgentController {

    @Autowired
    private AiAgentService aiAgentService;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody Map<String, String> body, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String username = jwt.getClaimAsString("preferred_username");
        Employee employee = employeeService.getByUsername(username);

        String question = body.get("question");
        String answer = aiAgentService.askQuestion(employee, question);

        return Map.of("answer", answer);
    }
}