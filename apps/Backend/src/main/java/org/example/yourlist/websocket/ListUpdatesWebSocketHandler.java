package org.example.yourlist.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class ListUpdatesWebSocketHandler extends TextWebSocketHandler {

    private final WebSocketUpdateService webSocketUpdateService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long listId = (Long) session.getAttributes().get("listId");
        if (listId != null) {
            webSocketUpdateService.registerSession(listId, session);
        } else {
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Missing listId attribute"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        webSocketUpdateService.removeSession(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

    }
}
