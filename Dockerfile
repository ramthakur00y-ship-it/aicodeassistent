FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY . .

RUN chmod +x gradlew

RUN ./gradlew clean build -x test

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar build/libs/aiva-0.0.1-SNAPSHOT.jar"]