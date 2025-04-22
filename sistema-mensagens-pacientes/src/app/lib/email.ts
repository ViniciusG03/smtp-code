import nodemailer from "nodemailer";
import {
  Patient,
  EmailTemplate,
  EmailResultado,
  EmailResultadoEmMassa,
} from "@/app/types";
import { carregarConfiguracao } from "@/app/api/config/email/route";

//Modelos de mensagens
export const modelosMensagens: Record<string, EmailTemplate> = {
  alertaGuias: {
    subject: "Alerta: Não Recebimento das Guias - Clínica Lavorato",
    body: `Senhor(a) paciente ou responsável,\n\n Informamos que não identificamos, até o momento, o recebimento das guias de atendimento do paciente {{nome}} na(s) especialidade(s) {{especialidades}} para o mês de Abril de 2025.\n\n Tendo em vista o cronograma a ser seguido por essa Clínica, para o faturamento dos atendimentos, pedimos a gentileza de encaminhar a guia emitida pelo Fusex até 24/04/2025 para o e-mail guias@lavorato.com.br. Esclarecemos que a entrega tempestiva das guias é fundamental para garantir a continuidade dos atendimentos.\n\n Caso a guia já tenha sido encaminhada, pedimos a gentileza de informar a remessa para o e-mail guias@lavorato.com.br.\n\n Atenciosamente\nEspaço Lavorato Psicologia Ltda.`,
  },
  alertaMedTherapy: {
    subject: "Liberação de Acesso",
    body: "Prezado(a),\n\n Informamos que a sua solicitação foi recebida e a demanda devidamente analisada por nossa equipe.\n\n O acesso será liberado no dia 23/04/10 (Quarta-Feira), das 14:00 às 23:00.\n\n Ressaltamos que, em caso de atraso no cumprimento deste prazo, será necessário realizar uma nova análise da solicitação, o que poderá impactar a liberação do acesso.\n\n Permanecemos à disposição para quaisquer dúvidas.\n\n\n Atenciosamente,\nEspaço Lavorato - Equipe de Desenvolvimento.",
  },
};

//Configuração de e-mail
let transporter: nodemailer.Transporter | null = null;
let servicoEmailDisponivel = false;

// Função para verificar se todas as variáveis de ambiente necessárias estão definidas
const verificarConfiguracoesEmail = (): boolean => {
  // Aceitando tanto EMAIL_PASS quanto EMAIL_PASSWORD para compatibilidade
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !emailPass
  ) {
    console.error(`Configurações de email incompletas`);
    return false;
  }

  return true;
};

export const inicializarServicoEmail = async (): Promise<boolean> => {
  try {
    // Verificar se as configurações de email estão completas
    if (!verificarConfiguracoesEmail()) {
      console.warn(
        "Configurações de email incompletas. Serviço de email não será inicializado."
      );
      servicoEmailDisponivel = false;
      return false;
    }

    // Aceitando tanto EMAIL_PASS quanto EMAIL_PASSWORD para compatibilidade
    const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

    //Configuração de e-mail
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

    transporter = nodemailer.createTransport(configEmail);

    //Verificar conexão com o servidor de e-mail
    const sucesso = await transporter.verify().catch((error) => {
      console.error("Erro ao verificar serviço de email:", error);
      return false;
    });

    servicoEmailDisponivel = Boolean(sucesso);

    if (servicoEmailDisponivel) {
      console.log("Serviço de e-mail inicializado com sucesso");
    } else {
      console.warn(
        "Serviço de e-mail não pôde ser verificado. Verifique as configurações."
      );
    }

    return servicoEmailDisponivel;
  } catch (error) {
    console.error("Erro ao inicializar serviço de e-mail:", error);
    servicoEmailDisponivel = false;
    return false;
  }
};

// Função para obter os destinatários em cópia (CC) e cópia oculta (BCC)
const obterDestinatariosCopias = (nomeModelo: string) => {
  // Obter destinatários em cópia configurados nas variáveis de ambiente
  const cc = process.env.EMAIL_CC
    ? process.env.EMAIL_CC.split(",").map((email) => email.trim())
    : [];

  // Obter configuração de BCC do arquivo de configuração
  const config = carregarConfiguracao();

  // Verificar se há BCC específico para este modelo
  let bcc: string[] = [];

  if (config.templateBcc && config.templateBcc[nomeModelo]) {
    // Usar BCC específico para este modelo
    bcc = config.templateBcc[nomeModelo]
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  } else if (config.defaultBcc) {
    // Usar BCC padrão
    bcc = config.defaultBcc
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  } else if (process.env.EMAIL_BCC) {
    // Cair para variável de ambiente se nenhuma configuração estiver definida
    bcc = process.env.EMAIL_BCC.split(",").map((email) => email.trim());
  }

  return { cc, bcc };
};

export const enviarEmail = async (
  paciente: Patient,
  nomeModelo: string
): Promise<boolean> => {
  //Inicializar serviço de e-mail *CASO NÃO ESTEJA habilitado*
  if (!transporter) {
    await inicializarServicoEmail();
  }

  //Em caso de erro registrar e retornar
  if (!servicoEmailDisponivel) {
    console.log(
      `Não é possível enviar e-mail para ${paciente.email}: serviço de e-mail indisponível`
    );
    return false;
  }

  const modelo = modelosMensagens[nomeModelo];

  if (!modelo) {
    console.error(`Modelo "${nomeModelo}" não encontrado`);
    return false;
  }

  //Substituir placeholders no corpo da mensagem
  let corpo = modelo.body.replace(/\{\{nome\}\}/g, paciente.nome);

  // Adicionar as especialidades ao corpo do e-mail, se houver
  if (paciente.especialidades && paciente.especialidades.length > 0) {
    const especialidadesFormatadas = formatarEspecialidades(
      paciente.especialidades
    );
    corpo = corpo.replace(/\{\{especialidades\}\}/g, especialidadesFormatadas);
  } else {
    // Se não houver especialidades, substituir o placeholder por string vazia
    corpo = corpo.replace(/\{\{especialidades\}\}/g, "");
    // Também ajustar a frase para não mencionar especialidades
    corpo = corpo.replace(
      /na\(s\) especialidade\(s\) \{\{especialidades\}\}/g,
      ""
    );
  }

  // Obter destinatários em cópia e cópia oculta
  const { cc, bcc } = obterDestinatariosCopias(nomeModelo);

  const opcoesEmail = {
    from: `"Sistema de E-mails - Lavorato" <${process.env.EMAIL_USER}>`,
    to: paciente.email,
    cc,
    bcc,
    subject: modelo.subject,
    text: corpo,
    html: corpo.replace(/\n/g, "<br>"),
  };

  try {
    console.log(`Tentando enviar email para: ${paciente.email}`);
    if (bcc.length > 0) {
      console.log(`Com cópia oculta para: ${bcc.join(", ")}`);
    }

    // Enviar email
    if (!transporter) {
      throw new Error("Transporter não inicializado");
    }

    const info = await transporter.sendMail(opcoesEmail);

    console.log(`Email enviado para ${paciente.email}: ${info.messageId}`);
    return true;
  } catch (erro: any) {
    console.error(`Erro ao enviar email para ${paciente.email}:`, erro);

    // Verificar tipo de erro para feedback mais específico
    if (erro.code === "EAUTH") {
      console.log("Erro de autenticação - verifique usuário e senha do email");
    } else if (erro.code === "ETIMEDOUT") {
      console.log(
        "Erro de timeout - verifique se o servidor SMTP está acessível"
      );
    } else if (erro.code === "ESOCKET") {
      console.log("Erro de conexão - verifique configurações de host/porta");
    }

    return false;
  }
};

// Função auxiliar para formatar especialidades
function formatarEspecialidades(especialidades: string[]): string {
  if (!especialidades || especialidades.length === 0) {
    return "";
  }

  if (especialidades.length === 1) {
    return especialidades[0];
  }

  const ultimaEspecialidade = especialidades.pop();
  return `${especialidades.join(", ")} e ${ultimaEspecialidade}`;
}

export const enviarEmailEmMassa = async (
  pacientes: Patient[],
  nomeModelo: string
): Promise<EmailResultadoEmMassa> => {
  const resultados: EmailResultado[] = [];
  const tamanhoDaRemessa = 5;

  // Inicializar serviço de email se ainda não estiver
  if (!servicoEmailDisponivel && !transporter) {
    await inicializarServicoEmail();
  }

  // Verificar se o serviço está disponível
  if (!servicoEmailDisponivel) {
    return {
      sucesso: false,
      totalResultados: pacientes.length,
      contagemSucesso: 0,
      contagemFalhas: pacientes.length,
      resultados: pacientes.map((p) => ({
        id: p.id,
        email: p.email,
        sucesso: false,
      })),
    };
  }

  // Dividir pacientes em lotes
  for (let i = 0; i < pacientes.length; i += tamanhoDaRemessa) {
    const lote = pacientes.slice(i, i + tamanhoDaRemessa);

    // Processar cada lote
    console.log(
      `Processando lote ${Math.floor(i / tamanhoDaRemessa) + 1} de ${Math.ceil(
        pacientes.length / tamanhoDaRemessa
      )}`
    );

    // Enviar emails no lote em paralelo
    const promessasLote = lote.map(async (paciente) => {
      const sucesso = await enviarEmail(paciente, nomeModelo);
      return {
        id: paciente.id,
        email: paciente.email,
        sucesso,
      };
    });

    // Aguardar todos os emails no lote
    const resultadosLote = await Promise.all(promessasLote);
    resultados.push(...resultadosLote);

    // Pequeno atraso entre lotes para evitar sobrecarga do servidor SMTP
    if (i + tamanhoDaRemessa < pacientes.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  const sucedidos = resultados.filter((r) => r.sucesso).length;
  const falhas = resultados.length - sucedidos;

  return {
    sucesso: falhas === 0,
    totalResultados: resultados.length,
    contagemSucesso: sucedidos,
    contagemFalhas: falhas,
    resultados,
  };
};
