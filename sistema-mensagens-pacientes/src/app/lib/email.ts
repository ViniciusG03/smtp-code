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
    subject:
      "Fusex PNE: novo critério para solicitação de guias de encaminhamento",
    body: `Senhor(a) paciente <strong>Fusex PNE</strong>,\n\nNo mês passado, o Fusex alterou  a forma de solicitação das guias de encaminhamento. Estabeleceu procedimento no sentido de que o paciente ou responsável deve  retirar a guia na primeira semana do mês. Hoje, fomos informados que a regra foi tornada definitiva para os pacientes da Espaço Lavorato.\n\n Por essa razão, escrevemos para orientar os pacientes Fusex PNE que, <strong>todos os meses</strong>, terão que retirar as guias de encaminhamento na <strong>primeira semana do mês</strong>. As guias obtidas pelos pacientes devem ser encaminhadas para o e-mail guias@lavorato.com.br de acordo com o calendário que divulgaremos mensalmente.\n\nDe acordo com o Ofício do Fusex, os pacientes da Lavorato devem retirar as guias de encaminhamento em 1º/9/2025. A guia deve ser encaminhada, de preferência já assinada pelo assinador gov.br, para o email guias@lavorato.com.br <strong>até 5/9/2025.</strong> No dia 6/9/2025, faremos a conferência das guias e os pacientes que não encaminharam as guias ou encaminharam guias com erros serão <strong>suspensos da agenda a partir de 8/8/2025, sem novo aviso.</strong>\n\nPedimos a gentileza de, ao receber as guias de encaminhamento, conferir todos os dados. É necessário conferir o nome do paciente, o nome do prestador (Espaço Lavorato Psicologia Ltda.), as especialidades e quantidades de sessões autorizadas e o mês de referência indicado no campo observações.\n\nGuias com erro no nome do paciente, no nome do prestador ou na indicação do mês de referência serão rejeitadas. Guias com omissão de especialidades serão atendidas apenas nas especialidades autorizadas. Guias com quantidade de atendimentos inferior à solicitada serão atendidas nas quantidades autorizadas.\n\nO paciente suspenso da agenda poderá retornar aos atendimentos, após o saneamento das pendências e de acordo com a disponibilidade de agenda. Dessa forma, a Clínica não garante que o paciente será atendido nos mesmos dias e pelos mesmos profissionais. Na verdade, não há nem mesmo garantia da vaga, porque temos fila de espera para algumas especialidades.\n\nOs pacientes <strong>Fusex PNE</strong> receberão mensagem por e-mail com tais orientações.\n\nEstamos à disposição para maiores esclarecimentos pelo WhatsApp da Clínica: (61) 3797-9004.\n\nAtenciosamente,\nValdir Lavorato\nDiretor Administrativo`,
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

  const opcoesEmail = {
    from: `"Lavorato" <${process.env.EMAIL_USER}>`,
    to: paciente.email,
    cc,
    bcc,
    subject: modelo.subject,
    text: corpo,
    html: corpo.replace(/\n/g, "<br>"),
    attachments: [
      {
        filename: "Lavorato.pdf",
        path: "./src/app/assets/Lavorato.pdf",
      },
    ],
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
