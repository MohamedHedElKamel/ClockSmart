package com.clocksmart.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    @Value("${keycloak.admin.token-url}")
    private String tokenUrl;

    @Value("${keycloak.admin.users-url}")
    private String usersUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getAdminAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        Map response = restTemplate.postForObject(tokenUrl, request, Map.class);
        return (String) response.get("access_token");
    }

    public String createUser(String username, String email, String firstName, String lastName, String password, String role) {
        String token = getAdminAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> credentials = Map.of(
                "type", "password",
                "value", password,
                "temporary", false
        );

        Map<String, Object> userPayload = Map.of(
                "username", username,
                "email", email,
                "firstName", firstName,
                "lastName", lastName,
                "enabled", true,
                "credentials", List.of(credentials)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userPayload, headers);
        ResponseEntity<Void> response = restTemplate.postForEntity(usersUrl, request, Void.class);

        // Keycloak returns the new user's location in the response header
        String location = response.getHeaders().getFirst("Location");
        String userId = location.substring(location.lastIndexOf('/') + 1);

        assignRole(userId, role, token);

        return userId;
    }

    private void assignRole(String userId, String roleName, String token) {
        // First, get the role's representation (id + name) from Keycloak
        String roleUrl = usersUrl.replace("/users", "/roles/" + roleName);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> getRequest = new HttpEntity<>(headers);

        ResponseEntity<Map> roleResponse = restTemplate.exchange(roleUrl, HttpMethod.GET, getRequest, Map.class);
        Map roleRepresentation = roleResponse.getBody();

        String assignUrl = usersUrl + "/" + userId + "/role-mappings/realm";

        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map>> assignRequest = new HttpEntity<>(List.of(roleRepresentation), headers);

        restTemplate.postForEntity(assignUrl, assignRequest, Void.class);
    }


    public void setUserEnabled(String username, boolean enabled) {
        String token = getAdminAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> getRequest = new HttpEntity<>(headers);

        String searchUrl = usersUrl + "?username=" + username + "&exact=true";
        ResponseEntity<List> searchResponse = restTemplate.exchange(searchUrl, HttpMethod.GET, getRequest, List.class);

        List<Map> users = searchResponse.getBody();
        if (users == null || users.isEmpty()) {
            throw new IllegalArgumentException("Keycloak user not found: " + username);
        }

        String userId = (String) users.get(0).get("id");

        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> update = Map.of("enabled", enabled);
        HttpEntity<Map<String, Object>> updateRequest = new HttpEntity<>(update, headers);

        restTemplate.exchange(usersUrl + "/" + userId, HttpMethod.PUT, updateRequest, Void.class);
    }



}