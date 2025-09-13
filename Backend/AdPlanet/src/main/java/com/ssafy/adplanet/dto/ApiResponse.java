package com.ssafy.adplanet.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"code","data","message"})
public record ApiResponse<T>(
        String code,
        T data,
        @JsonInclude(JsonInclude.Include.NON_NULL) String message
) {
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>("S0001", data, null); }
    public static <T> ApiResponse<T> error(String c, String m) { return new ApiResponse<>(c, null, m); }
}
