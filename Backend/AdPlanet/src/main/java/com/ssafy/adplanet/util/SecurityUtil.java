package com.ssafy.adplanet.util;

import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.security.JwtUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal principal) {
            return principal.userId();
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal principal) {
            return principal.email();
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    public static JwtUserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal principal) {
            return principal;
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
}