// Arquivo de inicialização do servidor
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";

// Obter __dirname em módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constantes para o banco de dados
const DATA_DIR = path.join(process.cwd(), "data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

// Verificar se o arquivo .env existe
const verificarConfiguracao = () => {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.warn("⚠️ Arquivo .env não encontrado!");
    console.warn("Criando arquivo .env de exemplo...");

    // Criar um arquivo .env básico se não existir
    const envExample = `# Configurações do servidor
PORT=3000
NODE_ENV=development

# Configurações do serviço de e-mail (modo de demonstração)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=test@example.com
EMAIL_PASSWORD=senha123
EMAIL_SECURE=false
`;

    try {
      fs.writeFileSync(envPath, envExample);
      console.log("✅ Arquivo .env criado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar arquivo .env:", error);
    }
  }
};

// Inicializar banco de dados
const inicializarBancoDados = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log("Diretório de dados criado com sucesso!");
    }

    if (!fs.existsSync(PATIENTS_FILE)) {
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      console.log("Arquivo de pacientes criado com sucesso!");
    } else {
      //Verifica se o arquivo contém um JSON válido
      try {
        const conteudo = fs.readFileSync(PATIENTS_FILE, "utf8");
        if (!conteudo || conteudo.trim() === "") {
          fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
        } else {
          JSON.parse(conteudo);
        }
      } catch (errorParser) {
        console.error("Erro ao analisar o arquivo de pacientes:", errorParser);
        const caminhoBackup = `${PATIENTS_FILE}.bak.${Date.now()}`;
        fs.copyFileSync(PATIENTS_FILE, caminhoBackup);
        fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      }
    }

    return true;
  } catch (erro) {
    console.error("Erro ao inicializar o banco de dados:", erro);
    return false;
  }
};

// Inicializar serviço de email
let transporter = null;
let servicoEmailDisponivel = false;

const inicializarServicoEmail = async () => {
  try {
    // Verificar se as configurações de email estão completas
    // Aceitando tanto EMAIL_PASS quanto EMAIL_PASSWORD para compatibilidade
    const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !emailPass
    ) {
      console.warn(
        "Configurações de email incompletas. Serviço de email não será inicializado."
      );
      console.log(
        "Verifique se as seguintes variáveis estão configuradas no .env:"
      );
      console.log(
        "EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD (ou EMAIL_PASS)"
      );
      servicoEmailDisponivel = false;
      return false;
    }

    // Configuração de e-mail
    const configEmail = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      tls: {
        rejectUnauthorized: false,
      },
    };

    console.log(
      "Tentando conectar ao servidor de email:",
      process.env.EMAIL_HOST
    );

    transporter = nodemailer.createTransport(configEmail);

    // Verificar conexão com o servidor de e-mail
    try {
      const sucesso = await transporter.verify();
      servicoEmailDisponivel = Boolean(sucesso);

      if (servicoEmailDisponivel) {
        console.log("✅ Serviço de e-mail inicializado com sucesso");
      } else {
        console.warn(
          "⚠️ Serviço de e-mail não pôde ser verificado. Verifique as configurações."
        );
      }

      return servicoEmailDisponivel;
    } catch (error) {
      console.warn(
        "⚠️ Não foi possível verificar o serviço de email:",
        error.message
      );
      servicoEmailDisponivel = false;
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar serviço de e-mail:", error);
    servicoEmailDisponivel = false;
    return false;
  }
};

// Configurar tarefas agendadas
const configurarTarefasAgendadas = () => {
  // Verificar aniversários todos os dias às 9h
  cron.schedule("0 9 * * *", async () => {
    console.log("Executando tarefa agendada: verificação de aniversários");
    try {
      // Carregar pacientes
      const pacientesJson = fs.readFileSync(PATIENTS_FILE, "utf8");
      const pacientes = JSON.parse(pacientesJson);

      // Verificar aniversários
      const hoje = new Date();
      const dia = hoje.getDate();
      const mes = hoje.getMonth() + 1; // getMonth() retorna 0-11

      // Filtrar pacientes que fazem aniversário hoje
      const aniversariantes = pacientes.filter((paciente) => {
        if (!paciente.dataNascimento) return false;

        const dataNasc = new Date(paciente.dataNascimento);
        return dataNasc.getDate() === dia && dataNasc.getMonth() + 1 === mes;
      });

      console.log(`Encontrados ${aniversariantes.length} aniversariantes hoje`);

      // Lógica para enviar emails de aniversário seria aqui
      console.log("Verificação de aniversários finalizada");
    } catch (erro) {
      console.error("Erro ao verificar aniversários:", erro);
    }
  });

  console.log("✅ Tarefas agendadas configuradas com sucesso");
  return true;
};

// Inicializar o servidor
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Inicializar componentes do servidor
const initServer = async () => {
  console.log("Inicializando componentes do servidor...");

  // Verificar configuração
  verificarConfiguracao();

  try {
    // Inicializar o banco de dados
    const dbInicializado = inicializarBancoDados();
    console.log(
      `Banco de dados ${dbInicializado ? "inicializado" : "com erro"}`
    );

    // Inicializar o serviço de email
    const emailDisponivel = await inicializarServicoEmail();
    console.log(
      `Serviço de email ${emailDisponivel ? "disponível" : "indisponível"}`
    );

    // Configurar tarefas agendadas
    const tarefasConfiguradas = configurarTarefasAgendadas();
    console.log(
      `Tarefas agendadas ${tarefasConfiguradas ? "configuradas" : "com erro"}`
    );

    console.log("Inicialização do servidor concluída!");
  } catch (err) {
    console.error("Erro ao inicializar componentes do servidor:", err);
  }
};

// Iniciar servidor Next.js
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
