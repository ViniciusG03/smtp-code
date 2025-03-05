// Sistema de Cadastro de Pacientes e Envio de Mensagens Automáticas
// Dependências necessárias:
// npm install express body-parser nodemailer node-cron fs

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Pasta para armazenar os dados dos pacientes
const DATA_DIR = path.join(__dirname, "data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

require("dotenv").config();

// Configurações de envio de e-mail
// Configuração para servidor SMTP da Localweb
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
  },
};

// Configuração do transporter do Nodemailer
let transporter = nodemailer.createTransport(emailConfig);
let emailServiceAvailable = false;

// Verificar conexão com o servidor de e-mail
transporter.verify(function (error, success) {
  if (error) {
    console.error("Erro ao conectar com servidor de e-mail:", error);
    console.log("AVISO: Sistema iniciado sem capacidade de envio de e-mails!");
    console.log(
      "Verifique as configurações do servidor SMTP no código (host, porta, credenciais)."
    );
    console.log(
      "O sistema continuará funcionando, mas não enviará e-mails até que o problema seja resolvido."
    );
    emailServiceAvailable = false;
  } else {
    console.log("Servidor de e-mail está pronto para enviar mensagens");
    emailServiceAvailable = true;
  }
});

// Modelos de mensagens
const messageTemplates = {
  lembreteConsulta: {
    subject: "Lembrete: Sua Consulta Agendada - Clínica Lavorato",
    body: "Olá {{nome}},\n\nEste é um lembrete para sua consulta agendada para amanhã às 15:00 na Clínica Lavorato.\n\nPor favor, confirme sua presença respondendo este e-mail ou entrando em contato pelo telefone (XX) XXXX-XXXX.\n\nCaso precise reagendar, solicitamos que informe com pelo menos 4 horas de antecedência.\n\nAtenciosamente,\nEquipe Clínica Lavorato",
  },
  resultadoExame: {
    subject: "Resultados de Exames Disponíveis - Clínica Lavorato",
    body: "Olá {{nome}},\n\nInformamos que seus resultados de exames já estão disponíveis.\n\nVocê pode acessá-los pelo nosso portal usando seu CPF e data de nascimento, ou comparecer à nossa clínica com um documento de identificação.\n\nCaso tenha alguma dúvida, estamos à disposição pelos nossos canais de atendimento.\n\nAtenciosamente,\nEquipe Clínica Lavorato",
  },
  aniversario: {
    subject: "Feliz Aniversário! - Clínica Lavorato",
    body: "Olá {{nome}},\n\nA equipe da Clínica Lavorato deseja a você um Feliz Aniversário!\n\nQue este novo ciclo seja repleto de saúde, paz e realizações.\n\nAproveite seu dia especial!\n\nComo presente de aniversário, você tem direito a 10% de desconto em qualquer procedimento realizado em até 30 dias.\n\nAtenciosamente,\nEquipe Clínica Lavorato",
  },
  lembreteRetorno: {
    subject: "Lembrete de Retorno - Clínica Lavorato",
    body: "Olá {{nome}},\n\nGostaríamos de lembrá-lo(a) que já se passaram aproximadamente 6 meses desde sua última consulta.\n\nRecomendamos o agendamento de uma consulta de retorno para acompanhamento da sua saúde.\n\nPara agendar, entre em contato pelo telefone (XX) XXXX-XXXX ou responda este e-mail.\n\nSua saúde é nossa prioridade!\n\nAtenciosamente,\nEquipe Clínica Lavorato",
  },
  campanhaVacinacao: {
    subject: "Campanha de Vacinação - Clínica Lavorato",
    body: "Olá {{nome}},\n\nA Clínica Lavorato está realizando uma campanha de vacinação contra a gripe.\n\nProteja-se e a sua família agendando sua vacinação.\n\nDisponibilizamos horários especiais e preços promocionais para nossos pacientes cadastrados.\n\nPara mais informações ou agendamento, entre em contato pelo telefone (XX) XXXX-XXXX.\n\nAtenciosamente,\nEquipe Clínica Lavorato",
  },
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Assegurar que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar arquivo de pacientes se não existir
if (!fs.existsSync(PATIENTS_FILE)) {
  try {
    console.log("Criando arquivo de pacientes...");
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
    console.log("Arquivo de pacientes criado com sucesso");
  } catch (error) {
    console.error("Erro ao criar arquivo de pacientes:", error);
  }
} else {
  try {
    // Verificar se o arquivo é um JSON válido, senão reinicializa
    const content = fs.readFileSync(PATIENTS_FILE, "utf8");
    if (!content || content.trim() === "") {
      console.log("Arquivo de pacientes vazio, inicializando...");
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
    } else {
      // Tentar fazer o parse para verificar se é um JSON válido
      try {
        JSON.parse(content);
        console.log("Arquivo de pacientes válido encontrado");
      } catch (parseError) {
        console.error(
          "Arquivo de pacientes corrompido, recriando:",
          parseError
        );
        // Fazer backup do arquivo corrompido
        const backupPath = `${PATIENTS_FILE}.bak.${Date.now()}`;
        fs.copyFileSync(PATIENTS_FILE, backupPath);
        console.log(`Backup do arquivo corrompido salvo em: ${backupPath}`);

        // Recriar o arquivo
        fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      }
    }
  } catch (error) {
    console.error("Erro ao verificar arquivo de pacientes:", error);
  }
}

// Carregar pacientes do arquivo
function loadPatients() {
  try {
    if (!fs.existsSync(PATIENTS_FILE)) {
      console.log("Arquivo de pacientes não existe, criando um novo...");
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(PATIENTS_FILE, "utf8");

    // Verificar se o arquivo está vazio e retornar um array vazio se estiver
    if (!data || data.trim() === "") {
      console.log("Arquivo de pacientes vazio, inicializando com array vazio");
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);
    // Em caso de erro, retornar um array vazio e tentar recriar o arquivo
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

// Salvar pacientes no arquivo
function savePatients(patients) {
  try {
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));
    return true;
  } catch (error) {
    console.error("Erro ao salvar pacientes:", error);
    return false;
  }
}

// Enviar e-mail para um paciente
async function sendEmail(patient, templateName) {
  // Se o serviço de e-mail não estiver disponível, registrar e retornar
  if (!emailServiceAvailable) {
    console.log(
      `Não foi possível enviar e-mail para ${patient.email}: servidor de e-mail não está disponível`
    );
    console.log(
      `Mensagem que seria enviada (${templateName}): destinada a ${patient.nome}`
    );
    return false;
  }

  const template = messageTemplates[templateName];

  if (!template) {
    console.error(`Template "${templateName}" não encontrado`);
    return false;
  }

  // Substituir placeholders no template
  const body = template.body.replace(/\{\{nome\}\}/g, patient.nome);

  const mailOptions = {
    from: `"Sistema de Pacientes" <${process.env.EMAIL_USER}>`,
    to: patient.email,
    subject: template.subject,
    text: body,
    // Versão HTML do email
    html: body.replace(/\n/g, "<br>"),
  };

  try {
    console.log(`Tentando enviar email para: ${patient.email}`);

    // Tentar enviar com timeout
    const info = await transporter.sendMail(mailOptions);

    console.log(`E-mail enviado para ${patient.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${patient.email}:`, error);

    // Verificar tipo de erro para feedback mais específico
    if (error.code === "EAUTH") {
      console.log("Erro de autenticação - verifique usuário e senha do e-mail");
    } else if (error.code === "ETIMEDOUT") {
      console.log(
        "Erro de timeout - verifique se o servidor SMTP está acessível"
      );
    } else if (error.code === "ESOCKET") {
      console.log("Erro de conexão - verifique configurações de host/porta");
    }

    return false;
  }
}

// Rotas API
app.get("/", (req, res) => {
  console.log("Tentando servir index.html");
  const indexPath = path.join(__dirname, "public", "index.html");
  console.log("Caminho do arquivo:", indexPath);

  // Verificar se o arquivo existe
  if (fs.existsSync(indexPath)) {
    console.log("Arquivo index.html encontrado, enviando...");
    res.sendFile(indexPath);
  } else {
    console.log("Arquivo index.html NÃO encontrado!");
    res
      .status(404)
      .send(
        "Arquivo index.html não encontrado. Verifique se você criou a pasta public com o arquivo index.html dentro."
      );
  }
});

// Listar todos os pacientes
app.get("/api/patients", (req, res) => {
  const patients = loadPatients();
  res.json(patients);
});

// Obter paciente por ID
app.get("/api/patients/:id", (req, res) => {
  const patients = loadPatients();
  const patient = patients.find((p) => p.id === req.params.id);

  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ error: "Paciente não encontrado" });
  }
});

// Adicionar novo paciente
app.post("/api/patients", (req, res) => {
  const { nome, email, dataNascimento, telefone } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
  }

  const patients = loadPatients();

  // Verificar se o e-mail já está cadastrado
  if (patients.some((p) => p.email === email)) {
    return res.status(400).json({ error: "Este e-mail já está cadastrado" });
  }

  const newPatient = {
    id: Date.now().toString(),
    nome,
    email,
    dataNascimento: dataNascimento || null,
    telefone: telefone || null,
    dataCadastro: new Date().toISOString(),
  };

  patients.push(newPatient);

  if (savePatients(patients)) {
    res.status(201).json(newPatient);
  } else {
    res.status(500).json({ error: "Erro ao salvar paciente" });
  }
});

// Atualizar paciente existente
app.put("/api/patients/:id", (req, res) => {
  const { nome, email, dataNascimento, telefone } = req.body;
  const patients = loadPatients();
  const index = patients.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  // Verificar se o novo e-mail já está em uso por outro paciente
  if (
    email &&
    email !== patients[index].email &&
    patients.some((p) => p.id !== req.params.id && p.email === email)
  ) {
    return res
      .status(400)
      .json({ error: "Este e-mail já está em uso por outro paciente" });
  }

  // Atualizar campos
  patients[index] = {
    ...patients[index],
    nome: nome || patients[index].nome,
    email: email || patients[index].email,
    dataNascimento: dataNascimento || patients[index].dataNascimento,
    telefone: telefone || patients[index].telefone,
    dataAtualizacao: new Date().toISOString(),
  };

  if (savePatients(patients)) {
    res.json(patients[index]);
  } else {
    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
});

// Excluir paciente
app.delete("/api/patients/:id", (req, res) => {
  const patients = loadPatients();
  const filteredPatients = patients.filter((p) => p.id !== req.params.id);

  if (patients.length === filteredPatients.length) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  if (savePatients(filteredPatients)) {
    res.json({ success: true, message: "Paciente excluído com sucesso" });
  } else {
    res.status(500).json({ error: "Erro ao excluir paciente" });
  }
});

// Enviar mensagem para um paciente específico
app.post("/api/send/:id", async (req, res) => {
  const { templateName } = req.body;

  if (!templateName) {
    return res
      .status(400)
      .json({ error: "Template da mensagem não especificado" });
  }

  const patients = loadPatients();
  const patient = patients.find((p) => p.id === req.params.id);

  if (!patient) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  const success = await sendEmail(patient, templateName);

  if (success) {
    res.json({
      success: true,
      message: `Mensagem enviada para ${patient.email}`,
    });
  } else {
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Enviar mensagem para todos os pacientes
app.post("/api/send-all", async (req, res) => {
  const { templateName } = req.body;

  if (!templateName) {
    return res
      .status(400)
      .json({ error: "Template da mensagem não especificado" });
  }

  const patients = loadPatients();

  if (patients.length === 0) {
    return res.status(404).json({ error: "Nenhum paciente encontrado" });
  }

  // Usar uma fila para evitar sobrecarga
  const results = [];
  const batchSize = 5; // Enviar em lotes pequenos

  // Dividir pacientes em lotes
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);

    // Processar cada lote
    console.log(
      `Processando lote ${i / batchSize + 1} de ${Math.ceil(
        patients.length / batchSize
      )}`
    );

    // Enviar e-mails do lote em paralelo
    const batchPromises = batch.map(async (patient) => {
      const success = await sendEmail(patient, templateName);
      return {
        id: patient.id,
        email: patient.email,
        success,
      };
    });

    // Aguardar todos os envios do lote
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Pequeno intervalo entre lotes para não sobrecarregar o servidor SMTP
    if (i + batchSize < patients.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;

  res.json({
    success: true,
    resultsTotal: results.length,
    successCount: successful,
    failureCount: failed,
    details: results,
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Configurar tarefas agendadas
  setupScheduledTasks();
});

// Configurar tarefas agendadas para envio automático de mensagens
function setupScheduledTasks() {
  // Exemplo: Enviar lembretes de consulta todos os dias às 9h
  cron.schedule("0 9 * * *", async () => {
    console.log("Executando tarefa agendada: lembretes de consulta");
    const patients = loadPatients();

    for (const patient of patients) {
      // Aqui você pode adicionar lógica para verificar quais pacientes
      // têm consultas no dia seguinte antes de enviar o lembrete
      await sendEmail(patient, "lembreteConsulta");
    }
  });

  // Exemplo: Verificar aniversariantes do dia
  cron.schedule("0 8 * * *", async () => {
    console.log("Executando tarefa agendada: verificação de aniversários");
    const patients = loadPatients();
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    for (const patient of patients) {
      if (patient.dataNascimento) {
        const birthDate = new Date(patient.dataNascimento);
        const birthDay = birthDate.getDate();
        const birthMonth = birthDate.getMonth() + 1;

        if (birthDay === day && birthMonth === month) {
          console.log(`Hoje é aniversário de ${patient.nome}!`);
          await sendEmail(patient, "aniversario");
        }
      }
    }
  });
}
