package com.ssafy.adplanet.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;

@RequiredArgsConstructor
public class AiHttp {
    private final String baseUrl;
    private final Duration readTimeout;
    private final ObjectMapper om = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public byte[] postForImage(String path, Object body) {
        try {
            String url = path.startsWith("http") ? path
                    : (baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length()-1) : baseUrl) + path;

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(readTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "image/png,image/jpeg,*/*")
                    .POST(HttpRequest.BodyPublishers.ofString(om.writeValueAsString(body)))
                    .build();

            HttpResponse<byte[]> res = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (res.statusCode() / 100 != 2) {
                String snippet = new String(res.body(), 0, Math.min(res.body().length, 256));
                throw new IllegalStateException("AI 서버 오류(" + res.statusCode() + "): " + snippet);
            }
            return res.body();
        } catch (Exception e) {
            throw new IllegalStateException("AI 서버 호출 실패: " + e.getMessage(), e);
        }
    }
}
