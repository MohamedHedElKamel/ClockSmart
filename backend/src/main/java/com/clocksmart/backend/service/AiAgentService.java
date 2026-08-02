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
import com.clocksmart.backend.model.LeaveStatus;

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

    @Autowired
    private EmployeeService employeeService;

    public String askQuestion(Employee employee, String question, boolean isAdmin) {
        StringBuilder context = new StringBuilder();
        context.append("You are an HR assistant for the ClockSmart app. ");
        context.append("Answer the employee's question using ONLY the data below. Be concise and friendly.\n\n");
        context.append("Employee: ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append("\n");
        context.append("Position: ").append(employee.getPosition()).append("\n");
        context.append("Role: ").append(isAdmin ? "Admin" : "Employee").append("\n\n");

        List<LeaveRequest> myLeaveRequests = leaveRequestService.getRequestsForEmployee(employee.getId());
        context.append("Your own leave requests:\n");
        if (myLeaveRequests.isEmpty()) {
            context.append("- No leave requests found.\n");
        } else {
            for (LeaveRequest r : myLeaveRequests) {
                context.append("- ").append(r.getStartDate()).append(" to ").append(r.getEndDate())
                        .append(" (").append(r.getReason()).append(") - Status: ").append(r.getStatus()).append("\n");
            }
        }

        if (isAdmin) {
            List<Employee> allEmployees = employeeService.getAllEmployees();
            context.append("\nCompany-wide data (visible to you as an admin):\n");
            context.append("Total number of employees: ").append(allEmployees.size()).append("\n");

            List<LeaveRequest> allLeaveRequests = leaveRequestService.getAllRequests();

            long totalCount = allLeaveRequests.size();
            long pendingCount = allLeaveRequests.stream().filter(r -> r.getStatus() == LeaveStatus.PENDING).count();
            long approvedCount = allLeaveRequests.stream().filter(r -> r.getStatus() == LeaveStatus.APPROVED).count();
            long rejectedCount = allLeaveRequests.stream().filter(r -> r.getStatus() == LeaveStatus.REJECTED).count();

            context.append("Total leave requests across the company (all statuses): ").append(totalCount).append("\n");
            context.append("  - Pending: ").append(pendingCount).append("\n");
            context.append("  - Approved: ").append(approvedCount).append("\n");
            context.append("  - Rejected: ").append(rejectedCount).append("\n");

            long pendingNotMine = allLeaveRequests.stream()
                    .filter(r -> r.getStatus() == LeaveStatus.PENDING)
                    .filter(r -> !r.getEmployee().getId().equals(employee.getId()))
                    .count();

            context.append("Pending leave requests awaiting YOUR review (excluding your own requests): ").append(pendingNotMine).append("\n");

            context.append("\nFull list of ALL leave requests in the company:\n");
            for (LeaveRequest r : allLeaveRequests) {
                context.append("- ")
                        .append(r.getEmployee().getFirstName()).append(" ").append(r.getEmployee().getLastName())
                        .append(": ").append(r.getStartDate()).append(" to ").append(r.getEndDate())
                        .append(" (").append(r.getReason()).append(") - Status: ").append(r.getStatus())
                        .append("\n");
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