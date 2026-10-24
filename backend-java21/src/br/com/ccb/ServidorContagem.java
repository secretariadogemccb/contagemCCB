package br.com.ccb;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;

/** Backend opcional Java 21: servidor local e persistência do evento em JSON. */
public final class ServidorContagem {
    private static final Path ROOT = Path.of("..").toAbsolutePath().normalize();
    private static final Path DATA = Path.of("dados-evento.json").toAbsolutePath().normalize();
    private static final int MAX_BODY = 2 * 1024 * 1024;
    private ServidorContagem() {}

    public static void main(String[] args) throws Exception {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/api/evento", ServidorContagem::evento);
        server.createContext("/", ServidorContagem::staticFile);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("CONTAGEM CCB Java 21: http://localhost:" + port);
    }

    private static void evento(HttpExchange ex) throws IOException {
        try {
            switch(ex.getRequestMethod()) {
                case "GET" -> reply(ex, 200, Files.exists(DATA) ? Files.readString(DATA) : "{}", "application/json; charset=utf-8");
                case "POST" -> {
                    int length = ex.getRequestHeaders().getFirst("Content-Length") == null ? -1 : Integer.parseInt(ex.getRequestHeaders().getFirst("Content-Length"));
                    if (length > MAX_BODY) { reply(ex, 413, "Conteúdo muito grande", "text/plain"); return; }
                    byte[] bytes = ex.getRequestBody().readNBytes(MAX_BODY + 1);
                    if (bytes.length > MAX_BODY) {reply(ex,413,"Conteúdo muito grande","text/plain");return;}
                    String json = new String(bytes, StandardCharsets.UTF_8).trim();
                    if (!json.startsWith("{") || !json.endsWith("}")) { reply(ex,400,"Informe um objeto JSON","text/plain");return; }
                    Files.writeString(DATA, json, StandardCharsets.UTF_8);
                    reply(ex, 200, "{\"salvo\":true}", "application/json; charset=utf-8");
                }
                case "DELETE" -> { Files.deleteIfExists(DATA); reply(ex, 200, "{\"excluido\":true}", "application/json; charset=utf-8"); }
                default -> {ex.getResponseHeaders().set("Allow","GET, POST, DELETE");reply(ex,405,"Método não permitido","text/plain");}
            }
        } catch(Exception e) {reply(ex,500,"Erro ao processar solicitação","text/plain");}
    }

    private static void staticFile(HttpExchange ex) throws IOException {
        if (!ex.getRequestMethod().equals("GET")) {reply(ex,405,"Método não permitido","text/plain");return;}
        String request=ex.getRequestURI().getPath();
        Path path=ROOT.resolve(request.equals("/") ? "index.html" : request.substring(1)).normalize();
        if (!path.startsWith(ROOT) || !Files.isRegularFile(path)) {reply(ex,404,"Não encontrado","text/plain");return;}
        String name=path.getFileName().toString().toLowerCase();
        String type=name.endsWith(".html")?"text/html":name.endsWith(".css")?"text/css":name.endsWith(".js")?"text/javascript":name.endsWith(".png")?"image/png":name.endsWith(".jpg")?"image/jpeg":name.endsWith(".pdf")?"application/pdf":"application/octet-stream";
        byte[] contents=Files.readAllBytes(path);
        ex.getResponseHeaders().set("Content-Type",type+ (type.startsWith("text/")?"; charset=utf-8":""));
        ex.sendResponseHeaders(200,contents.length);
        try(var os=ex.getResponseBody()){os.write(contents);}
    }
    private static void reply(HttpExchange ex,int code,String content,String type)throws IOException{
        byte[] bytes=content.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type",type);
        ex.sendResponseHeaders(code,bytes.length);
        try(var out=ex.getResponseBody()){out.write(bytes);}
    }
}
