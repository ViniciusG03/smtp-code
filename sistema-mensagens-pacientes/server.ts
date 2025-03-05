// server.ts - Arquivo para iniciar o servidor e configurar tarefas agendadas
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import "dotenv/config";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Inicializar o banco de dados e as tarefas agendadas
const initServer = async () => {
  // Importar módulos ESM usando dynamic import
  const { inicializarBancoDados } = await import("./src/app/lib/db");
  const { inicializarServicoEmail } = await import("./src/app/lib/email");
  const { configurarTarefasAgendadas } = await import(
    "./src/app/lib/scheduledTasks"
  );

  // Inicializar o banco de dados
  inicializarBancoDados();

  // Inicializar o serviço de email
  const emailDisponivel = await inicializarServicoEmail();
  console.log(
    `Serviço de email ${emailDisponivel ? "disponível" : "indisponível"}`
  );

  // Configurar tarefas agendadas
  configurarTarefasAgendadas();
};

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      if (!req.url) {
        res.statusCode = 400;
        res.end("URL inválida");
        return;
      }

      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err?: Error) => {
      if (err) throw err;
      console.log(`> Servidor pronto na porta ${port}`);

      // Inicializar banco de dados e tarefas agendadas
      initServer().catch((err) => {
        console.error("Erro ao inicializar componentes do servidor:", err);
      });
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
