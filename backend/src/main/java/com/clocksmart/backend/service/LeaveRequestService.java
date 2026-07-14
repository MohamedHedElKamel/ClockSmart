package com.clocksmart.backend.service;

import com.clocksmart.backend.model.Employee;
import com.clocksmart.backend.model.LeaveRequest;
import com.clocksmart.backend.model.LeaveStatus;
import com.clocksmart.backend.repository.EmployeeRepository;
import com.clocksmart.backend.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;


import java.util.List;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public LeaveRequest createRequest(Long employeeId, LeaveRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        request.setEmployee(employee);
        request.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(request);
    }

    public List<LeaveRequest> getAllRequests() {
        return leaveRequestRepository.findAll();
    }

    public List<LeaveRequest> getRequestsForEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public LeaveRequest updateStatus(Long requestId, LeaveStatus status) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        request.setStatus(status);
        return leaveRequestRepository.save(request);
    }

    public Map<String, Long> getLeaveRequestCountsByStatus() {
        List<LeaveRequest> all = leaveRequestRepository.findAll();
        Map<String, Long> counts = new HashMap<>();

        for (LeaveRequest r : all) {
            String status = r.getStatus().toString();
            counts.merge(status, 1L, Long::sum);
        }

        return counts;
    }

}