package org.example.yourlist.security.service;

import org.example.yourlist.domain.user.dto.UserDto;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.domain.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(UserDto.UserRegistrationRequest input) {
        User user = User.builder()
                .email(input.email())
                .passwordHash(passwordEncoder.encode(input.password()))
                .build();

        return userRepository.save(user);
    }

    public User authenticate(UserDto.UserLoginRequest input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.email(),
                        input.password()
                )
        );

        return userRepository.findByEmail(input.email())
                .orElseThrow();
    }
}
