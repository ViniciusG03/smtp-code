// server.js - Arquivo para iniciar o servidor e configurar tarefas agendadas
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Importar dotenv para carregar variáveis de ambiente
require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// Inicializar o banco de dados e as tarefas agendadas
const initServer = async () => {
  // Importar módulos ESM usando dynamic import
  const { inicializarBancoDados } = await import("./lib/db.js");
  const { inicializarServicoEmail } = await import("./lib/email.js");
  const { configurarTarefasAgendadas } = await import(
    "./lib/scheduledTasks.js"
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
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
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
