package com.clocksmart.backend.dto;

import java.util.Map;

public class DashboardSummary {

    private double totalHoursWorked;
    private Map<String, Double> hoursPerEmployee;
    private Map<String, Long> leaveRequestsByStatus;

    public DashboardSummary(double totalHoursWorked, Map<String, Double> hoursPerEmployee, Map<String, Long> leaveRequestsByStatus) {
        this.totalHoursWorked = totalHoursWorked;
        this.hoursPerEmployee = hoursPerEmployee;
        this.leaveRequestsByStatus = leaveRequestsByStatus;
    }

    public double getTotalHoursWorked() {
        return totalHoursWorked;
    }

    public Map<String, Double> getHoursPerEmployee() {
        return hoursPerEmployee;
    }

    public Map<String, Long> getLeaveRequestsByStatus() {
        return leaveRequestsByStatus;
    }
}