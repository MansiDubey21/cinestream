package com.cinestream.service;

import com.cinestream.dto.AuthDtos.*;
import com.cinestream.entity.User;
import com.cinestream.exception.ApiException;
import com.cinestream.repository.UserRepository;
import com.cinestream.security.AuthUser;
import com.cinestream.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = userRepository.save(new User(req.name().trim(), email, passwordEncoder.encode(req.password())));
        return toResponse(user.getId(), user.getName(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim().toLowerCase(), req.password()));
        AuthUser user = (AuthUser) auth.getPrincipal();
        return toResponse(user.getId(), user.getName(), user.getUsername());
    }

    private AuthResponse toResponse(Long id, String name, String email) {
        return new AuthResponse(jwtService.generateToken(id, email), new UserResponse(id, name, email));
    }
}
