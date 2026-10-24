@echo off
cd /d "%~dp0"
if not exist out mkdir out
javac -encoding UTF-8 -d out src\br\com\ccb\ServidorContagem.java
if errorlevel 1 (echo Erro: instale o JDK 21 e configure JAVA_HOME. & pause & exit /b 1)
java -cp out br.com.ccb.ServidorContagem
pause
