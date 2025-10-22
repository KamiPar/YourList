package org.example.yourlist.domain.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.listshare.entity.ShoppingListShare;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    private Set<ShoppingList> ownedLists = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<ShoppingListShare> sharedLists = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

  @Override
  public String getPassword() {
    return passwordHash;
  }

  @Override
  public String getUsername() {
    return email;
  }
}
