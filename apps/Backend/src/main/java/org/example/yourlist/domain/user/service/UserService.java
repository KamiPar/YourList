package org.example.yourlist.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<String> allUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false).map(User::getUsername).collect(Collectors.toList());
    }
}
