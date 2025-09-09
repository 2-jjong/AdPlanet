FROM gradle:8.7-jdk17-alpine AS build
WORKDIR /src
COPY gradlew gradle ./
COPY build.gradle settings.gradle ./
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /src/build/libs/*.jar app.jar
EXPOSE 8081
HEALTHCHECK --interval=10s --timeout=3s --retries=15 \
  CMD wget -qO- http://localhost:8081/actuator/health | grep -q '"status":"UP"' || exit 1
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","/app/app.jar"]