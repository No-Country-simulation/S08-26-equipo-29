FROM gradle:8.14-jdk21 AS build

WORKDIR /app

COPY . .

# Agregamos esto para darle permisos de ejecución al gradlew
RUN chmod +x gradlew

RUN ./gradlew build -x test

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/backend-o-splitflow-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]