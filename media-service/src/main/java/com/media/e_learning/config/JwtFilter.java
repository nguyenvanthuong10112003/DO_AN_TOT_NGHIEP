package com.media.e_learning.config;

import com.media.e_learning.client.ELearningAppClient;
import com.media.e_learning.client.IntrospectTokenRequest;
import com.media.e_learning.client.IntrospectTokenResponse;
import com.media.e_learning.client.UserResponse;
import com.media.e_learning.dto.ResponseApi;
import com.media.e_learning.exception.AuthException;
import com.media.e_learning.helper.DataUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private ELearningAppClient eLearningAuthClient;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                throw new AuthException("Required authorization with token type 'Bearer '");

            String token = authHeader.replaceFirst("Bearer ", "").trim();

            ResponseEntity<ResponseApi<IntrospectTokenResponse>> introspectResponse = eLearningAuthClient.introspectToken(new IntrospectTokenRequest(token));

            UserResponse userResponse = getUserResponse(introspectResponse);
            List<SimpleGrantedAuthority> authorities = DataUtil.defaultIfNull(
                userResponse.getRoles(),
                new ArrayList<String>()
            ).stream().map(role -> new SimpleGrantedAuthority("ROLE_" + Strings.toUpperCase(role))).toList();

            Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                    userResponse.getId(),
                    null,
                    authorities
                );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ignored) {}
        filterChain.doFilter(request, response);
    }

    private UserResponse getUserResponse(ResponseEntity<ResponseApi<IntrospectTokenResponse>> introspectResponse) {
        if (introspectResponse == null || introspectResponse.getBody() == null)
            throw new AuthException("Cannot introspect token");
        ResponseApi<IntrospectTokenResponse> body = introspectResponse.getBody();
        if (!(introspectResponse.getStatusCode().is2xxSuccessful() &&
            DataUtil.boolValue(body.getData().getIsValid())))
            throw new AuthException(introspectResponse.getBody());

        UserResponse userResponse = body.getData().getUserResponse();
        if (userResponse == null)
            throw new AuthException("Cannot get user info");
        return userResponse;
    }
}