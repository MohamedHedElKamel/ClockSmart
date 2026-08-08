package com.clocksmart.backend.service;


import com.clocksmart.backend.model.Employee;
import com.clocksmart.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    public Employee getByUsername(String username) {
        return employeeRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("No employee found for username: " + username));
    }

    @Autowired
    private KeycloakAdminService keycloakAdminService;

    public Employee createEmployeeWithAccount(Employee employee, String password, String role) {
        keycloakAdminService.createUser(
                employee.getUsername(),
                employee.getEmail(),
                employee.getFirstName(),
                employee.getLastName(),
                password,
                role
        );

        return employeeRepository.save(employee);
    }

    public Employee setEmployeeEnabled(Long employeeId, boolean enabled) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        employee.setEnabled(enabled);
        employeeRepository.save(employee);

        keycloakAdminService.setUserEnabled(employee.getUsername(), enabled);

        return employee;
    }



}