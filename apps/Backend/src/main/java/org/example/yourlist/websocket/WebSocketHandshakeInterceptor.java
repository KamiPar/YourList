package org.example.yourlist.websocket;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.yourlist.domain.list.service.ShoppingListService;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.domain.user.repository.UserRepository;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.example.yourlist.security.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final ShoppingListService shoppingListService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        try {
            Long listId = extractListId(request);
            String token = extractToken(request);

            if (token == null) {
                log.warn("WebSocket handshake failed: Missing Authorization token");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            String username = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!jwtService.isTokenValid(token, user)) {
                log.warn("WebSocket handshake failed: Invalid or expired token");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            shoppingListService.checkAccess(listId, user);

            attributes.put("listId", listId);
            attributes.put("userId", user.getId());
            log.info("WebSocket handshake successful for user {} on list {}", user.getEmail(), listId);
            return true;

        } catch (ResourceNotFoundException e) {
            log.warn("Handshake failed: {}", e.getMessage());
            response.setStatusCode(HttpStatus.NOT_FOUND);
            return false;
        } catch (ForbiddenException e) {
            log.warn("Handshake failed: {}", e.getMessage());
            response.setStatusCode(HttpStatus.FORBIDDEN);
            return false;
        } catch (JwtException e) {
            log.warn("Handshake failed: Invalid JWT token - {}", e.getMessage());
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during WebSocket handshake", e);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            return false;
        }
    }

    private Long extractListId(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        try {
            return Long.parseLong(path.substring(path.lastIndexOf('/') + 1));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid listId in WebSocket URL");
        }
    }

    private String extractToken(ServerHttpRequest request) {
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // No action needed after handshake
    }
}
