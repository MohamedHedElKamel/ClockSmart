package com.clocksmart.backend.service;

import com.clocksmart.backend.config.GeminiConfig;
import com.clocksmart.backend.model.Employee;
import com.clocksmart.backend.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiAgentService {

    @Autowired
    private GeminiConfig geminiConfig;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private AttendanceService attendanceService;

    public String askQuestion(Employee employee, String question) {
        List<LeaveRequest> leaveRequests = leaveRequestService.getRequestsForEmployee(employee.getId());

        StringBuilder context = new StringBuilder();
        context.append("You are an HR assistant for the ClockSmart app. ");
        context.append("Answer the employee's question using ONLY the data below. Be concise and friendly.\n\n");
        context.append("Employee: ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append("\n");
        context.append("Position: ").append(employee.getPosition()).append("\n\n");
        context.append("Leave requests:\n");

        if (leaveRequests.isEmpty()) {
            context.append("- No leave requests found.\n");
        } else {
            for (LeaveRequest r : leaveRequests) {
                context.append("- ").append(r.getStartDate()).append(" to ").append(r.getEndDate())
                        .append(" (").append(r.getReason()).append(") - Status: ").append(r.getStatus()).append("\n");
            }
        }

        context.append("\nQuestion: ").append(question);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key="
                + geminiConfig.getGeminiApiKey();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", context.toString())
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Map response = restTemplate.postForObject(url, entity, Map.class);

        try {
            List candidates = (List) response.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            Map firstPart = (Map) parts.get(0);
            return (String) firstPart.get("text");
        } catch (Exception e) {
            return "Sorry, I couldn't process that question right now.";
        }
    }
}