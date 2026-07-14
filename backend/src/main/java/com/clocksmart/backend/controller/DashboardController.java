package com.clocksmart.backend.controller;

import com.clocksmart.backend.dto.DashboardSummary;
import com.clocksmart.backend.service.AttendanceService;
import com.clocksmart.backend.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping("/summary")
    public DashboardSummary getSummary() {
        return new DashboardSummary(
                attendanceService.getTotalHoursWorked(),
                attendanceService.getHoursPerEmployee(),
                leaveRequestService.getLeaveRequestCountsByStatus()
        );
    }
}