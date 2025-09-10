import nodemailer from "nodemailer";
import {
  Patient,
  EmailTemplate,
  EmailResultado,
  EmailResultadoEmMassa,
} from "@/app/types";
import { carregarConfiguracao } from "@/app/api/config/email/route";
import path from "path";
import fs from "fs";

//Modelos de mensagens
export const modelosMensagens: Record<string, EmailTemplate> = {
  alertaGuias: {
    subject:
      "IMPORTANTE: Interrupção dos atendimentos de psicopedagogia pelo Fusex",
    body: `Senhores(as) pacientes <strong>Fusex</strong>,\n\nHoje, recebemos visita da equipe técnica do Fusex para esclarecer algumas dúvidas que havíamos suscitado.\n\nNa conversa, fomos informados que o Fusex <strong>não aceita</strong> a realização de tratamento de <strong>psicopedagogia</strong> por <strong>pedagogo com especialização em psicopedagogia</strong>, apenas por <strong>psicólogo</strong> com especialização em psicopedagogia. O Fusex esclareceu que os procedimentos realizados por pedagogo, mesmo com especialização em psicopedagogia, podem ser glosados (até mesmo os já realizados).\n\nFomos surpreendidos com a notícia, porque se trata de profissão não regulamentada e os cursos de especialização aceitam matrículas de psicólogos e pedagogos. Além disso, o projeto de Lei 1.675/2023, que visa a regulamentar a profissão de psicopedagogo, estabelece que os “formados em psicologia, <strong>pedagogia e licenciatura</strong>, que tenham concluído curso de <strong>especialização em psicopedagogia</strong>, com duração mínima de 600 horas, <strong>também poderão atuar na área</strong>”. Todavia, em razão de não haver Lei dispondo sobre o exercício da profissão, vamos seguir fielmente as orientações recebidas do Fusex.\n\nTendo em vista que não temos nenhum <strong>psicólogo</strong> com especialização em psicopedagogia em nosso quadro – todos os nossos psicopedagogos são formados em <strong>pedagogia</strong>, <strong>com especialização em psicopedagogia</strong> – somos forçados a interromper, a partir da próxima segunda-feira (1/9/2025) os atendimentos nesta modalidade <strong>para os beneficiários do Fusex.</strong>\n\nFicamos à disposição para maiores esclarecimentos pelo WhatsApp da Clínica: (61) 3797-9004.`,
  },
  alertaMedTherapy: {
    subject: "Liberação para Evoluções Retroativas",
    body: "Olá, {{nome}},\n\n Estou entrando em contato para informar que vamos liberar o sistema a partir de hoje 06/06/2025 às 11:00 até domingo dia 08/06/2025 até as 23:00.\n\n Solicitamos que, dentro desse período, sejam concluídas todas as pendências, referentes ao mês de maio\n Após essa data, o sistema voltará ao funcionamento normal com as evoluções podendo ser adicionadas apenas no dia do atendimento até as 23:59.\n\n\n Agradecemos a compreensão e a paciência no processo.\n\n Não responda esse email.\n\n Atenciosamente,\n José Williams - Equipe de Desenvolvimento",
  },
  alertaEvolucao: {
    subject: "Atualização Importante no Processo de Evoluções - MedTherapy",
    body: "Prezados(as) Colaboradores(as),\n\nGostaríamos de comunicar uma importante atualização no procedimento para o registro de evoluções de pacientes no sistema MedTherapy, que entrará em vigor a partir do próximo dia 13 de junho de 2025. A partir desta data, a prática de liberação de pendências de evolução através de e-mail será descontinuada. Dessa forma, qualquer solicitação para regularização de evoluções fora do prazo estabelecido deverá ser tratada como um caso excepcional, sendo mediada e autorizada exclusivamente pela Dra. Simone mediante a apresentação de um documento formal assinado pela mesma. É fundamental ressaltar que o não cumprimento dos horários de registro, poderá acarretar em advertência formal. Contudo, caso a impossibilidade de registro ocorra por comprovadas falhas em serviços de terceiros, como instabilidade do sistema, internet ou falta do paciente na agenda, o fato deverá ser comunicado imediatamente à gestão para que seja considerado na análise da ocorrência.\n\n Agradecemos a compreensão e a colaboração de todos na implementação desta melhoria em nossos processos.\n\nAtenciosamente,\nEspaço Lavorato - Equipe de Desenvolvimento",
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

  const attachments: Array<{
    filename: string;
    path: string;
  }> = [];

  const arquivoPadrao = "./src/app/assets/Lavorato.pdf";
  if (fs.existsSync(arquivoPadrao)) {
    attachments.push({
      filename: "Lavorato.pdf",
      path: arquivoPadrao,
    });
  }

  if (paciente.anexos && paciente.anexos.length > 0) {
    paciente.anexos.forEach((caminhoAnexo) => {
      const caminhoCompleto = path.join(process.cwd(), "uploads", caminhoAnexo);
      if (fs.existsSync(caminhoCompleto)) {
        const nomeArquivo = path.basename(caminhoAnexo);
        attachments.push({
          filename: nomeArquivo,
          path: caminhoCompleto,
        });
      }
    });
  }

  const opcoesEmail = {
    from: `"Lavorato" <${process.env.EMAIL_USER}>`,
    to: paciente.email,
    cc,
    bcc,
    subject: modelo.subject,
    text: corpo,
    html: corpo.replace(/\n/g, "<br>"),
    attachments: attachments,
    // attachments: [
    //   {
    //     filename: "Lavorato.pdf",
    //     path: "./src/app/assets/Lavorato.pdf",
    //   },
    // ],
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
