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
import type Mail from "nodemailer/lib/mailer";
import type { SendMailOptions } from "nodemailer";

//Modelos de mensagens
export const modelosMensagens: Record<string, EmailTemplate> = {
  alertaGuias: {
    subject: "Atendimento em psicopedagogia",
    body: `Prezado(a) paciente Fusex,\n\nEm 29/8/2025, fomos informados pelo Fusex que os atendimentos em <strong>psicopedagogia</strong> realizados por  <strong>pedagogo</strong> com especialização em <strong>psicopedagogia não são cobertos</strong> pelo Fusex. Apenas os atendimentos realizados por <strong>psicólogo</strong>, com especialização em psicopedagogia têm cobertura pelo Fusex.\n\nTendo em vista a restrição e que não tínhamos psicólogo com esta especialização, o Fusex autorizou a manutenção dos atendimentos pelos profissionais que temos no quadro de colaboradores. Na ocasião, informamos a dificuldade em recrutar <strong>psicólogo</strong> com <strong>especialização</strong> em <strong>psicopedagogia</strong>, sobretudo em razão do valor oferecido pelo Fusex. De qualquer sorte, ficou ajustado que a Lavorato encaminharia uma proposta de atendimentos para solução do impasse.\n\nPara superar a dificuldade, contratamos um psicólogo com  <strong>especialização</strong> em <strong>psicopedagogia</strong> para atuar na <strong><u>supervisão</u></strong> dos atendimentos prestados pelos psicopedagogos com formação na área de educação e assumir a <strong>responsabilidade técnica</strong> do setor.\n\nEncaminhamos proposta de atendimento ao Fusex, por e-mail, e estamos aguardando a resposta. Na mensagem eletrônica encaminhada, esclarecemos que a falta de resposta até 30/9/2025 será interpretada como “<i>rejeição à proposta</i>”\n\nAssim, em razão da proximidade do prazo para a tomada de decisão, informamos a situação aos pacientes e responsáveis, para que não sejam surpreendidos com <b>eventual encerramento dos atendimentos</b> em psicopedagogia a partir de 1º/10/2025.\n\nAtenciosamente,\nValdir Lavorato\nDiretor-administrativo`,
  },
  alertaMedTherapy: {
    subject: "Liberação para Evoluções Retroativas",
    body: "Olá, {{nome}},\n\n Estou entrando em contato para informar que vamos liberar o sistema a partir de hoje 06/06/2025 às 11:00 até domingo dia 08/06/2025 até as 23:00.\n\n Solicitamos que, dentro desse período, sejam concluídas todas as pendências, referentes ao mês de maio\n Após essa data, o sistema voltará ao funcionamento normal com as evoluções podendo ser adicionadas apenas no dia do atendimento até as 23:59.\n\n\n Agradecemos a compreensão e a paciência no processo.\n\n Não responda esse email.\n\n Atenciosamente,\n José Williams - Equipe de Desenvolvimento",
  },
  alertaEvolucao: {
    subject: "Atualização Importante no Processo de Evoluções - MedTherapy",
    body: "Prezados(as) Colaboradores(as),\n\nGostaríamos de comunicar uma importante atualização no procedimento para o registro de evoluções de pacientes no sistema MedTherapy, que entrará em vigor a partir do próximo dia 13 de junho de 2025. A partir desta data, a prática de liberação de pendências de evolução através de e-mail será descontinuada. Dessa forma, qualquer solicitação para regularização de evoluções fora do prazo estabelecido deverá ser tratada como um caso excepcional, sendo mediada e autorizada exclusivamente pela Dra. Simone mediante a apresentação de um documento formal assinado pela mesma. É fundamental ressaltar que o não cumprimento dos horários de registro, poderá acarretar em advertência formal. Contudo, caso a impossibilidade de registro ocorra por comprovadas falhas em serviços de terceiros, como instabilidade do sistema, internet ou falta do paciente na agenda, o fato deverá ser comunicado imediatamente à gestão para que seja considerado na análise da ocorrência.\n\n Agradecemos a compreensão e a colaboração de todos na implementação desta melhoria em nossos processos.\n\nAtenciosamente,\nEspaço Lavorato - Equipe de Desenvolvimento",
  },
  alertaHipo: {
    subject: "Acesso Hipo Saúde",
    body: "Prezado(a) {{nome}},\n\nEstamos entrando em contato para informar que o seu acesso a plataforma Hipo Saúde foi criado com sucesso. Abaixo estão os detalhes para o seu login:\n\nLink de acesso: http://56.124.35.86:8080/\nUsuário: {primeiro_nome}.{ultimo_nome}\nSenha temporária: LAVORATO@2025\n\nPor favor, ao acessar a plataforma pela primeira vez, utilize a senha temporária fornecida acima. A alteração acontece após o primeiro login. Segue também o manual de utilização da plataforma em anexo.\n\nCaso tenha alguma dúvida ou necessite de assistência, não hesite em entrar em contato conosco.\n\nAtenciosamente,\nVinicius Oliveira,\n(61) 99412-8831",
  },
  neuronupParceria: {
    subject: "Lavorato + NeuronUP: treino cognitivo e reabilitação",
    body: `<img src="cid:neuronup-hero" alt="Lavorato + NeuronUP" style="max-width:100%;height:auto;border-radius:8px;"><br><br>
Quero compartilhar uma grande inovação da Lavorato. Fechamos parceria com a <strong>NeuronUP</strong>, empresa espanhola que também é parceira do <strong>Hospital Israelita Albert Einstein</strong>, <strong>Hospital das Clínicas</strong>, <strong>Centro de Reabilitação Lucy Montoro</strong> e outros gigantes da saúde.
<br><br>
Esse programa parte da premissa de <strong>NEUROPLASTICIDADE</strong>, que é o potencial que o cérebro tem de se modificar e se adaptar em resposta à experiência, a substâncias químicas, hormônios ou lesões. Essa capacidade do cérebro de se reorganizar, criando e fortalecendo conexões neuronais, é a <strong>chave para a recuperação</strong>. Embora o próprio sistema seja capaz de ativar os sistemas neuroplásticos, esses têm limites; por isso, é necessário <strong>estimulá-los e modulá-los</strong>, o que é alcançado por meio de uma <strong>intervenção terapêutica adequada</strong>.
<br><br>
A partir de <strong>outubro</strong> teremos essas ferramentas para trabalhar <strong>treino cognitivo</strong> e <strong>reabilitação neuropsicológica</strong> aqui na Lavorato. O programa atende <strong>diferentes idades</strong>, com atividades adequadas a cada <strong>faixa etária</strong> e <strong>necessidade</strong>.
<br><br>
Entre em contato para saber mais e participar desse programa inovador, já com <strong>comprovação científica</strong> da sua eficácia.
<br><br>
Atenciosamente,<br>
Lavorato Saúde Integrada`,
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

  // const attachments: Array<{
  //   filename: string;
  //   path: string;
  // }> = [];

  const attachments: Mail.Attachment[] = [];

  if (nomeModelo === "neuronupParceria") {
    const bannerPath = path.join(process.cwd(), "uploads", "NeuronUp.jpg");
    if (fs.existsSync(bannerPath)) {
      attachments.push({
        filename: "NeuronUP.jpg",
        path: bannerPath,
        cid: "neuronup-hero", // Content-ID para usar em <img src="cid:neuronup-hero">
        contentDisposition: "inline",
      });
    } else {
      console.warn("Banner NeuronUP não encontrado em:", bannerPath);
    }
  }

  // const arquivoPadrao = "./src/app/assets/oficio_fusex.pdf";
  // if (fs.existsSync(arquivoPadrao)) {
  //   attachments.push({
  //     filename: "oficio_fusex.pdf",
  //     path: arquivoPadrao,
  //   });
  // }

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
    attachments,
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
