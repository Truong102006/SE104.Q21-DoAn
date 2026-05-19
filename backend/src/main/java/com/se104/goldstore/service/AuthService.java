package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.AuthLoginRequest;
import com.se104.goldstore.dto.response.AuthLoginResponse;
import com.se104.goldstore.dto.response.AuthMeResponse;

public interface AuthService {

    AuthLoginResponse login(AuthLoginRequest request);

    AuthMeResponse me(String username);

    void logout();
}
