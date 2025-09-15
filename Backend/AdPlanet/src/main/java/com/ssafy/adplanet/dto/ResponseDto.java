package com.ssafy.adplanet.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"code","data","message"})
public record ResponseDto<T>(
        String code,
        @JsonInclude(JsonInclude.Include.NON_NULL) T data,
        @JsonInclude(JsonInclude.Include.NON_NULL) String message
) {
    public static <T> ResponseDto<T> ok(T data) { return new ResponseDto<>("S0000", data, null); }
    public static <T> ResponseDto<T> error(String c, String m) { return new ResponseDto<>(c, null, m); }
}
