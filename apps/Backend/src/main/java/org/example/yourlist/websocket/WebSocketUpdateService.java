package org.example.yourlist.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.yourlist.domain.websocket.dto.WebSocketMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketUpdateService {

    private final ConcurrentHashMap<Long, List<WebSocketSession>> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public void registerSession(Long listId, WebSocketSession session) {
        sessions.computeIfAbsent(listId, k -> new CopyOnWriteArrayList<>()).add(session);
        log.info("WebSocket session {} registered for listId {}", session.getId(), listId);
    }

    public void removeSession(WebSocketSession session) {
        sessions.forEach((listId, sessionList) -> {
            if (sessionList.remove(session)) {
                log.info("WebSocket session {} removed for listId {}", session.getId(), listId);
                if (sessionList.isEmpty()) {
                    sessions.remove(listId);
                }
            }
        });
    }

    @Async
    public <T> void broadcast(Long listId, String type, T data) {
        List<WebSocketSession> sessionList = sessions.get(listId);
        if (sessionList == null || sessionList.isEmpty()) {
            log.debug("No active sessions for listId {}", listId);
            return;
        }

        WebSocketMessage<T> message = new WebSocketMessage<>(type, Instant.now(), data);
        try {
            String messageJson = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(messageJson);

            log.debug("Broadcasting message type {} to {} sessions for listId {}", type, sessionList.size(), listId);

            for (WebSocketSession session : sessionList) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    } else {
                        log.warn("Session {} is closed, removing from list {}", session.getId(), listId);
                        sessionList.remove(session);
                    }
                } catch (IOException e) {
                    log.error("Failed to send message to session {}: {}", session.getId(), e.getMessage());
                    sessionList.remove(session);
                }
            }
        } catch (IOException e) {
            log.error("Failed to serialize WebSocket message: {}", e.getMessage());
        }
    }
}
