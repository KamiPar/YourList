package org.example.yourlist.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<String>> allUsers() {
        List <String> users = userService.allUsers();
        return ResponseEntity.ok(users);
    }
}
