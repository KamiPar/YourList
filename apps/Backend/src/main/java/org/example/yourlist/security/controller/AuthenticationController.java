package org.example.yourlist.security.controller;

import org.example.yourlist.domain.user.dto.UserDto;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.security.service.AuthenticationService;
import org.example.yourlist.security.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> register(@RequestBody UserDto.UserRegistrationRequest registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto.UserLoginResponse> authenticate(@RequestBody UserDto.UserLoginRequest loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        UserDto.UserLoginResponse loginResponse = new UserDto.UserLoginResponse(authenticatedUser.getId(), authenticatedUser.getUsername(), jwtToken);
        return ResponseEntity.ok(loginResponse);
    }
}
