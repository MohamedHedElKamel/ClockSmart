package com.clocksmart.backend.controller;

import com.clocksmart.backend.model.Attendance;
import com.clocksmart.backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in/{employeeId}")
    public Attendance clockIn(@PathVariable Long employeeId) {
        return attendanceService.clockIn(employeeId);
    }

    @PostMapping("/clock-out/{employeeId}")
    public Attendance clockOut(@PathVariable Long employeeId) {
        return attendanceService.clockOut(employeeId);
    }

    @GetMapping("/history/{employeeId}")
    public List<Attendance> getHistory(@PathVariable Long employeeId) {
        return attendanceService.getHistory(employeeId);
    }
}