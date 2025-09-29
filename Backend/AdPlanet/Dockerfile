FROM gradle:8.7-jdk17-alpine AS build
WORKDIR /src
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle --no-daemon clean bootJar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /src/build/libs/*.jar app.jar

RUN mkdir -p /app/secrets

EXPOSE 8081

ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","/app/app.jar"]