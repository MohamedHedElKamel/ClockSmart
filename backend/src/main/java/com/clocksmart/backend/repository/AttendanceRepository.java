package com.clocksmart.backend.repository;

import com.clocksmart.backend.model.Attendance;
import com.clocksmart.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    Optional<Attendance> findFirstByEmployeeIdAndClockOutIsNull(Long employeeId);
}