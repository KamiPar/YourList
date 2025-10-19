package org.example.yourlist.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class UserDto {
    private UserDto() {}

    /**
     * DTO for user registration request.
     * @param email User's email, must be valid and unique.
     * @param password User's password, must be at least 8 characters long.
     */
    public record UserRegistrationRequest(
            @NotNull(message = "Email is required")
            @Email(message = "Invalid email format")
            @Size(max = 255, message = "Email must not exceed 255 characters")
            String email,

            @NotNull(message = "Password is required")
            @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
            String password
    ) {}

    /**
     * DTO for user registration response.
     * @param id The newly created user's ID.
     * @param email The user's email.
     * @param createdAt Timestamp of account creation.
     * @param token JWT for immediate authentication.
     */
    public record UserRegistrationResponse(
            Long id,
            String email,
            Instant createdAt,
            String token
    ) {}

    /**
     * DTO for user login request.
     * @param email User's email.
     * @param password User's password.
     */
    public record UserLoginRequest(
            String email,
            String password
    ) {}

    /**
     * DTO for user login response.
     * @param id The user's ID.
     * @param email The user's email.
     * @param token JWT for authentication.
     */
    public record UserLoginResponse(
            Long id,
            String email,
            String token
    ) {}

    /**
     * DTO for retrieving the current authenticated user's profile.
     * @param id The user's ID.
     * @param email The user's email.
     * @param createdAt Timestamp of account creation.
     */
    public record CurrentUserResponse(
            Long id,
            String email,
            Instant createdAt
    ) {}

    /**
     * DTO for the account deletion request.
     * @param password The user's current password for verification.
     */
    public record DeleteAccountRequest(
            @NotNull(message = "Password is required")
            String password
    ) {}

    /**
     * DTO representing a collaborator on a list.
     * Used in the collaborators list response.
     * @param id The collaborator's user ID.
     * @param email The collaborator's email.
     */
    public record CollaboratorDto(
            Long id,
            String email
    ) {}
}
