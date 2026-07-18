package com.example.rag.user;

/**
 * Non-sensitive view of an account (never exposes the password hash).
 */
public record UserSummary(Long id, String username, Role role) {

    static UserSummary from(AppUser user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getRole());
    }
}
