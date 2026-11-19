package com.weighwiz.weighwizbackend.sc;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.weighwiz.weighwizbackend.InternalUtil.Ls;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class Lf extends OncePerRequestFilter {
    private final Ls i;

    public Lf(Ls i) {
        this.i = i;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/l") ||
        path.equals("/health") ||
        path.startsWith("/static") ||
        path.equals("/") ||
        path.startsWith("/error"))  {

        filterChain.doFilter(request, response);
        return;
    }

        if (!i.e()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Lx expired or invalid.");
            return;
        }

        // Continue normally
        filterChain.doFilter(request, response);
    }
}