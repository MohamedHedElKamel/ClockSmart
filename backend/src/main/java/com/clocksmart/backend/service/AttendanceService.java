package com.clocksmart.backend.service;

import com.clocksmart.backend.model.Attendance;
import com.clocksmart.backend.model.Employee;
import com.clocksmart.backend.repository.AttendanceRepository;
import com.clocksmart.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public Attendance clockIn(Long employeeId) {
        Optional<Attendance> openAttendance = attendanceRepository.findFirstByEmployeeIdAndClockOutIsNull(employeeId);
        if (openAttendance.isPresent()) {
            throw new IllegalStateException("Employee is already clocked in. Please clock out first.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setClockIn(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    public Attendance clockOut(Long employeeId) {
        Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndClockOutIsNull(employeeId)
                .orElseThrow(() -> new IllegalStateException("Employee is not currently clocked in."));

        attendance.setClockOut(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getHistory(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public Map<String, Double> getHoursPerEmployee() {
        List<Attendance> all = attendanceRepository.findAll();
        Map<String, Double> result = new HashMap<>();

        for (Attendance a : all) {
            if (a.getClockIn() != null && a.getClockOut() != null) {
                String name = a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName();
                double hours = Duration.between(a.getClockIn(), a.getClockOut()).toMinutes() / 60.0;
                result.merge(name, hours, Double::sum);
            }
        }

        return result;
    }

    public double getTotalHoursWorked() {
        return getHoursPerEmployee().values().stream().mapToDouble(Double::doubleValue).sum();
    }


}