package com.example.rag.config;

import com.example.rag.user.AppUser;
import com.example.rag.user.Role;
import com.example.rag.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds a default admin and a default regular user so the app is usable out of the box.
 * Change these credentials before deploying anywhere real.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByUsername("admin")) {
                users.save(new AppUser("admin", encoder.encode("admin123"), Role.ADMIN));
                log.info("Seeded default admin user: admin / admin123");
            }
            if (!users.existsByUsername("user")) {
                users.save(new AppUser("user", encoder.encode("user123"), Role.USER));
                log.info("Seeded default regular user: user / user123");
            }
        };
    }
}
