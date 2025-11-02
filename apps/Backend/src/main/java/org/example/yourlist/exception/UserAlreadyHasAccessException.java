package org.example.yourlist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to access or join a resource
 * (like a shopping list) they already have access to.
 *
 * This results in a 409 Conflict HTTP status.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class UserAlreadyHasAccessException extends RuntimeException {

    public UserAlreadyHasAccessException(String message) {
        super(message);
    }
}
