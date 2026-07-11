package com.clocksmart.backend.controller;

import com.clocksmart.backend.model.LeaveRequest;
import com.clocksmart.backend.model.LeaveStatus;
import com.clocksmart.backend.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @PostMapping("/{employeeId}")
    public LeaveRequest createRequest(@PathVariable Long employeeId, @RequestBody LeaveRequest request) {
        return leaveRequestService.createRequest(employeeId, request);
    }

    @GetMapping
    public List<LeaveRequest> getAllRequests() {
        return leaveRequestService.getAllRequests();
    }

    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequest> getRequestsForEmployee(@PathVariable Long employeeId) {
        return leaveRequestService.getRequestsForEmployee(employeeId);
    }

    @PutMapping("/{requestId}/status")
    public LeaveRequest updateStatus(@PathVariable Long requestId, @RequestParam LeaveStatus status) {
        return leaveRequestService.updateStatus(requestId, status);
    }
}