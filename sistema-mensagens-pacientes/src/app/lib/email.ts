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
    subject: "Pedido de Descredenciamento Fusex PNE",
    body: `Senhor(a) paciente ou responsável,\n\nTendo em vista a significativa defasagem nos preços praticados pelo Fusex para “prestação de serviços especializados para a assistência aos beneficiários do Fusex com necessidades especiais”, objeto do Credenciamento nº 15/2022, bem como a falta de resposta objetiva ao pedido de reajustamento dos valores praticados, solicitamos, nesta dada (24/11/2025), descredenciamento para prestação de serviços de assistência à saúde dos beneficiários Fusex PNE.\n\nInformamos que manteremos os atendimentos aos pacientes Fusex PNE até 30/12/2025. Os pacientes que desejarem manter os atendimentos em dezembro devem fornecer a guia de encaminhamento para o período até 3/12/2025.\n\nNossa equipe terapêutica está à disposição para fornecer os relatórios necessários à transferência do tratamento para outra clínica credenciada pelo Fusex.\n\nAtenciosamente,\nEspaço Lavorato Psicologia Ltda.`,
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
  coloniaFerias: {
    subject:
      "🌞 A Colônia de Férias Terapêutica da Clínica Lavorato está chegando! Garanta a vaga! 🌈",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colônia de Férias Lavorato</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        /* Header colorido para combinar com a imagem */
        .header { background: linear-gradient(135deg, #FFC107, #FF9800); padding: 20px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin-bottom: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .hero-image { width: 100%; max-width: 400px; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .content { padding: 25px; }
        .content p { margin-bottom: 15px; font-size: 16px; text-align: justify; line-height: 1.5; }
        
        .highlight-box { background-color: #FFF8E1; border-left: 5px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
        
        .benefits { background-color: #E3F2FD; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .benefits h3 { color: #1976D2; margin-bottom: 12px; text-align: center; }
        .benefits ul { list-style: none; padding: 0; }
        .benefits li { padding: 8px 0; position: relative; padding-left: 30px; }
        .benefits li:before { content: "👉"; position: absolute; left: 0; }
        
        .info-card { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .info-card strong { color: #e91e63; }

        .contacts { text-align: center; margin-top: 20px; }
        .contacts a { display: block; color: #0066cc; text-decoration: none; font-weight: bold; font-size: 18px; margin: 5px 0; }

        .cta-button { display: block; width: fit-content; margin: 20px auto; background-color: #4CAF50; color: white !important; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .cta-button:hover { background-color: #43a047; }
        
        .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .address { font-style: normal; margin-top: 10px; opacity: 0.9; }
        .no-reply { margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; font-size: 12px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Colônia de Férias Terapêutica</h1>
            <p>Diversão, Inclusão e Desenvolvimento!</p>
        </div>
        
        <div style="padding: 0 10px;">
            <img src="cid:colonia-ferias-hero" alt="Colônia de Férias Lavorato" class="hero-image">
        </div>
        
        <div class="content">
            <p><strong>Olá, família! 💛</strong></p>
            
            <p>Temos uma novidade super especial para tornar o fim de ano das crianças ainda mais divertido, inclusivo e cheio de desenvolvimento!</p>
            
            <div class="highlight-box">
                <p><strong>🌞 A Colônia de Férias Terapêutica da Clínica Lavorato está chegando! 🌈</strong></p>
                <p style="margin-bottom:0;">Um espaço preparado com muito carinho para que nossas crianças — típicas e atípicas — vivenciem novas experiências!</p>
            </div>

            <div class="benefits">
                <h3>💛 O que oferecemos:</h3>
                <p style="text-align: center; margin-bottom: 10px;">Nossa Colônia de Férias é <strong>inclusiva</strong>. Contamos com uma equipe multidisciplinar formada por psicopedagogos e terapeutas experientes.</p>
                <ul>
                    <li>Autonomia e autoestima</li>
                    <li>Comunicação e trabalho em grupo</li>
                    <li>Regulação emocional</li>
                    <li>Flexibilidade cognitiva</li>
                </ul>
                <p style="text-align: center; margin-top: 15px; font-weight: 500;">Tudo isso em um ambiente seguro, acolhedor e cheio de afeto! 🥰</p>
            </div>

            <div class="info-card">
                <p>📅 <strong>Período:</strong> 08/12/2025 a 23/01/2026</p>
                <p>💰 Valores acessíveis e pacotes especiais!</p>
                <p>👕 <strong>Camiseta exclusiva:</strong> R$ 35</p>
            </div>

            <div class="contacts">
                <h3>📲 Garanta já a vaga do seu(a) pequeno(a)!</h3>
                <a href="https://wa.me/5561999850432">(61) 99985-0432</a>
                <a href="https://wa.me/5561996621567">(61) 99662-1567</a>
                <a href="tel:+556137979004">(61) 3797-9004</a>
            </div>

            <a href="https://wa.me/5561996621567" class="cta-button">Falar no WhatsApp</a>

            <div style="text-align: center; margin-top: 20px;">
                <p>Será uma alegria receber seu pequeno(a) para viver momentos inesquecíveis conosco! ✨</p>
            </div>
        </div>
        
        <div class="footer">
            <strong>Clínica Lavorato</strong>
            <div class="address">
                📍 SGAN 915, Bloco G, Loja 03<br>
                Ed. Golden Office Corporate
            </div>
            
            <div class="no-reply">
                ⚠️ <strong>Atenção:</strong> Por favor, não responda a este e-mail.<br>
                Esta é uma mensagem automática enviada por noreply@lavorato.com.br.<br>
                Para entrar em contato, utilize os telefones acima.
            </div>
        </div>
    </div>
</body>
</html>`,
  },
  recadastramento: {
    subject: "📝 Importante: Recadastramento de Pacientes - Lavorato",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recadastramento Lavorato</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* Header Institucional Azul */
        .header { background: linear-gradient(135deg, #005c97, #363795); padding: 25px; text-align: center; color: white; }
        .header h1 { font-size: 22px; margin-bottom: 5px; font-weight: 600; }
        
        .content { padding: 30px; }
        .content p { margin-bottom: 15px; font-size: 15px; text-align: justify; line-height: 1.6; }
        
        /* Box de destaque para o App */
        .highlight-box { background-color: #e8f4fd; border-left: 5px solid #363795; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .highlight-box h3 { color: #005c97; margin-bottom: 10px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
        
        /* Lista de benefícios */
        .benefits ul { list-style: none; padding: 0; margin-bottom: 15px; }
        .benefits li { padding: 5px 0; padding-left: 25px; position: relative; font-size: 14px; }
        .benefits li:before { content: "✓"; position: absolute; left: 0; color: #28a745; font-weight: bold; }

        /* Botão CTA */
        .cta-button { display: block; width: fit-content; margin: 30px auto; background-color: #005c97; color: white !important; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s; }
        .cta-button:hover { background-color: #004a7c; }
        
        /* Seção de Suporte */
        .support-info { background-color: #fff8e1; border: 1px solid #ffe0b2; padding: 15px; border-radius: 6px; font-size: 14px; color: #664d03; margin-top: 20px; }

        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; font-size: 14px; }
        .no-reply { margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; font-size: 12px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Atualização Cadastral</h1>
            <p>Melhorias nos serviços e sistemas Lavorato</p>
        </div>
        
        <div class="content">
            <p><strong>Prezados(as) pacientes e responsáveis,</strong></p>
            
            <p>A Lavorato está em processo de aperfeiçoamento dos seus serviços e práticas administrativas. O objetivo é oferecer atendimentos mais tempestivos e adequados às demandas administrativas.</p>
            
            <p>Neste cenário, percebemos a necessidade de promover o <strong>recadastramento dos nossos pacientes ativos</strong>, visando reduzir erros nos processos de agendamento, comunicação e faturamento.</p>
            
            <p>Os novos sistemas de informação exigem dados mais consistentes para integração com operadoras de planos de saúde e sistemas tributários, facilitando tanto o reembolso quanto o faturamento.</p>

            <div class="highlight-box">
                <h3>📱 Acesso ao Novo Aplicativo</h3>
                <p>O recadastramento é fundamental para liberar seu acesso ao nosso aplicativo. Com ele você terá:</p>
                <div class="benefits">
                    <ul>
                        <li>Login via CPF (do paciente ou responsável);</li>
                        <li>Acesso ao histórico de atendimentos;</li>
                        <li>Gestão de múltiplos pacientes (para responsáveis legais);</li>
                        <li>Troca ágil de documentos com a clínica.</li>
                    </ul>
                </div>
            </div>

            <p>⚠️ <strong>Atenção:</strong> Estamos iniciando esta fase focada nos <strong>pacientes particulares</strong> e <strong>CBMDF Ressarcimento</strong>.</p>
            
            <p>O processo é simples e rápido. Basta clicar no botão abaixo:</p>

            <a href="https://forms.gle/3ZFF5G1MbDhGMKCU8" class="cta-button">PREENCHER FORMULÁRIO</a>

            <div class="support-info">
                <strong>Precisa de ajuda?</strong><br>
                A partir de quinta-feira (27/11/2025), disponibilizaremos uma equipe dedicada para auxiliar no preenchimento via telefone, WhatsApp ou e-mail. Os contatos serão divulgados em breve.
            </div>
        </div>
        
        <div class="footer">
            <strong>Espaço Lavorato Psicologia</strong>
            <p style="margin-top: 5px; opacity: 0.8;">Inovação e excelência em cuidados de saúde</p>
            
            <div class="no-reply">
                ⚠️ <strong>Atenção:</strong> Por favor, não responda a este e-mail.<br>
                Esta é uma mensagem automática enviada por noreply@lavorato.com.br.
            </div>
        </div>
    </div>
</body>
</html>`,
  },
  neuronupParceria: {
    subject: "Lavorato + NeuronUP: treino cognitivo e reabilitação",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lavorato + NeuronUP: treino cognitivo e reabilitação</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #0066cc, #004499);
            padding: 20px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .hero-image {
            width: 100%;
            max-width: 350px;
            height: auto;
            display: block;
            margin: 15px auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .content {
            padding: 25px;
        }
        
        .content p {
            margin-bottom: 12px;
            font-size: 16px;
            text-align: justify;
            line-height: 1.4;
        }
        
        .highlight {
            background: linear-gradient(120deg, #a8e6cf 0%, #dcedc1 100%);
            padding: 15px;
            border-left: 4px solid #0066cc;
            border-radius: 4px;
            margin: 15px 0;
        }
        
        .highlight h3 {
            color: #0066cc;
            margin-bottom: 8px;
            font-size: 18px;
        }
        
        .highlight p {
            margin-bottom: 0;
            line-height: 1.4;
        }
        
        .benefits {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .benefits h3 {
            color: #0066cc;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .benefits ul {
            list-style: none;
            padding: 0;
        }
        
        .benefits li {
            padding: 6px 0;
            position: relative;
            padding-left: 25px;
            line-height: 1.4;
        }
        
        .benefits li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
            font-size: 16px;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #0066cc, #004499);
            padding: 20px;
            text-align: center;
            color: white;
            margin: 15px 0;
            border-radius: 8px;
        }
        
        .cta-section h3 {
            margin-bottom: 8px;
        }
        
        .cta-section p {
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin-top: 15px;
            transition: background-color 0.3s ease;
        }
        
        .cta-button:hover {
            background-color: #218838;
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 20px 25px;
            text-align: center;
        }
        
        .footer .logo {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #0066cc;
        }
        
        .footer p {
            font-size: 14px;
            opacity: 0.8;
            margin: 3px 0;
            line-height: 1.3;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, #0066cc, #28a745);
            margin: 15px 0;
            border-radius: 1px;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0 10px;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 15px;
            }
            
            .header h1 {
                font-size: 20px;
            }
            
            .hero-image {
                margin: 15px auto;
            }
            
            .cta-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Lavorato + NeuronUP</h1>
            <p>Treino Cognitivo e Reabilitação Neuropsicológica</p>
        </div>
        
        <div style="padding: 0 20px;">
            <img src="cid:neuronup-hero" alt="Lavorato + NeuronUP" class="hero-image">
        </div>
        
        <div class="content">
            
            <p>Quero compartilhar uma grande inovação da Lavorato. Fechamos parceria com a <strong>NeuronUP</strong>, empresa espanhola que também é parceira do <strong>Albert Einstein</strong>, <strong>Hospital das Clínicas</strong>, <strong>Centro de Reabilitação Lucy Montoro</strong> e outros gigantes da saúde.</p>
            
            <div class="highlight">
                <h3>🧠 NEUROPLASTICIDADE</h3>
                <p>Esse programa parte da premissa de <strong>NEUROPLASTICIDADE</strong>, que é o potencial que o cérebro tem de se modificar e se adaptar em resposta à experiência, a substâncias químicas, hormônios ou lesões.</p>
            </div>
            
            <p>Essa capacidade do cérebro de se reorganizar, criando e fortalecendo conexões neuronais, é a <strong>chave para a recuperação</strong>. Embora o próprio sistema seja capaz de ativar os sistemas neuroplásticos, esses têm limites; por isso, é necessário <strong>estimulá-los e modulá-los</strong>, o que é alcançado por meio de uma <strong>intervenção terapêutica adequada</strong>.</p>
            
            <div class="divider"></div>
            
            <div class="benefits">
                <h3>🎯 Nosso Programa Oferece</h3>
                <ul>
                    <li><strong>Treino Cognitivo</strong> personalizado e eficaz</li>
                    <li><strong>Reabilitação Neuropsicológica</strong> baseada em evidências</li>
                    <li>Atividades adequadas para <strong>diferentes idades</strong></li>
                    <li>Programas adaptados a cada <strong>faixa etária e necessidade</strong></li>
                    <li><strong>Comprovação científica</strong> da eficácia</li>
                </ul>
            </div>
            
            <p>A partir de <strong>outubro</strong> teremos essas ferramentas para trabalhar <strong>treino cognitivo</strong> e <strong>reabilitação neuropsicológica</strong> aqui na Lavorato.</p>
            
            <div class="cta-section">
                <h3>🚀 Participe dessa Inovação!</h3>
                <p>Entre em contato para saber mais e participar desse programa inovador, já com comprovação científica da sua eficácia.</p>
                <a href="tel:+556196621567" class="cta-button">Entre em Contato Agora</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="logo">Lavorato Saúde Integrada</div>
            <p>Inovação e excelência em cuidados de saúde</p>
            <p>Atenciosamente, Equipe Lavorato</p>
        </div>
    </div>
</body>
</html>`,
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
  } else if (nomeModelo === "coloniaFerias") {
    // Certifique-se de salvar a imagem como ColoniaFerias.jpg na pasta uploads
    const flyerPath = path.join(process.cwd(), "uploads", "ColoniaFerias.jpeg");

    if (fs.existsSync(flyerPath)) {
      attachments.push({
        filename: "ColoniaFerias.jpg",
        path: flyerPath,
        cid: "colonia-ferias-hero", // Este ID deve bater com o src="cid:..." no HTML
        contentDisposition: "inline",
      });
    } else {
      console.warn("Flyer Colônia de Férias não encontrado em:", flyerPath);
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
    html:
      corpo.includes("<!DOCTYPE html>") || corpo.includes("<html")
        ? corpo
        : corpo.replace(/\n/g, "<br>"),
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
