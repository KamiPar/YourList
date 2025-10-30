package org.example.yourlist.domain.websocket.dto;

import java.time.Instant;

public record WebSocketMessage<T>(
    String type,
    Instant timestamp,
    T data
) {}
