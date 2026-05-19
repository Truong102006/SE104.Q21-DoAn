package com.se104.goldstore.security;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class AuthUserPrincipal implements UserDetails {

    private final String username;
    private final String password;
    private final String groupCode;
    private final List<String> roles;
    private final List<String> permissions;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthUserPrincipal(
        String username,
        String password,
        String groupCode,
        List<String> roles,
        List<String> permissions,
        Collection<? extends GrantedAuthority> authorities
    ) {
        this.username = username;
        this.password = password;
        this.groupCode = groupCode;
        this.roles = roles;
        this.permissions = permissions;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public String getGroupCode() {
        return groupCode;
    }

    public List<String> getRoles() {
        return roles;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
