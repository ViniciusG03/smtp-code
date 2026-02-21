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
  alertaHipo: {
    subject: "Acesso Hipo Saúde",
    body: "Prezado(a) {{nome}},\n\nEstamos entrando em contato para informar que o seu acesso a plataforma Hipo Saúde foi criado com sucesso. Abaixo estão os detalhes para o seu login:\n\nLink de acesso: http://56.124.35.86:8080/\nUsuário: {primeiro_nome}.{ultimo_nome}\nSenha temporária: LAVORATO@2025\n\nPor favor, ao acessar a plataforma pela primeira vez, utilize a senha temporária fornecida acima. A alteração acontece após o primeiro login. Segue também o manual de utilização da plataforma em anexo.\n\nCaso tenha alguma dúvida ou necessite de assistência, não hesite em entrar em contato conosco.\n\nAtenciosamente,\nVinicius Oliveira,\n(61) 99412-8831",
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
  conviteBetaApp: {
    subject: "🚀 Convite Exclusivo: Beta Test do App dos Pais",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite Beta Test - App dos Pais</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* Header Moderno Roxo/Azul */
        .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin-bottom: 5px; font-weight: 600; letter-spacing: 0.5px; }
        .header p { opacity: 0.9; font-size: 15px; }
        
        .content { padding: 30px; }
        .content p { margin-bottom: 15px; font-size: 15px; text-align: justify; color: #444; }
        
        /* Box de Destaque com Credenciais */
        .access-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .access-box h3 { color: #764ba2; margin-bottom: 15px; font-size: 18px; }
        
        .credentials { background-color: #fff; border: 1px dashed #764ba2; padding: 15px; border-radius: 6px; display: inline-block; margin: 15px 0; }
        .credentials p { margin: 5px 0; font-size: 14px; text-align: center; color: #333; }
        .credentials strong { color: #764ba2; font-size: 16px; }

        /* QR Code Style */
        .qr-code { width: 150px; height: 150px; margin: 15px auto; display: block; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        
        /* Botão */
        .cta-button { display: block; width: fit-content; margin: 20px auto 10px auto; background-color: #764ba2; color: white !important; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: bold; font-size: 16px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.15); transition: background 0.3s; }
        .cta-button:hover { background-color: #5b3a7d; }
        
        /* Box de Suporte */
        .support-box { background-color: #e8f4fd; border-left: 4px solid #2196F3; padding: 15px; margin-top: 25px; font-size: 14px; color: #0c5460; }

        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; font-size: 13px; }
        .no-reply { margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; font-size: 11px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>App dos Pais Lavorato</h1>
            <p>Convite Exclusivo para Beta Test</p>
        </div>
        
        <div class="content">
            <p><strong>Prezado(a) pai, mãe ou responsável,</strong></p>
            
            <p>Você foi selecionado(a) especialmente para participar do <strong>Beta Test</strong> do nosso novo <strong>App dos Pais</strong>.</p>
            
            <p>Essa fase de testes é fundamental para nós. Sua participação nos ajudará a avaliar o funcionamento do aplicativo na prática e realizar as melhorias necessárias antes do lançamento oficial para todos os pacientes.</p>

            <div class="access-box">
                <h3>📲 Como Acessar</h3>
                <p style="text-align: center; margin-bottom: 10px;">Aponte a câmera do seu celular para o QR Code abaixo:</p>
                
                <img src="cid:qrcode-portal" alt="Acesse pelo QR Code" class="qr-code">
                
                <p style="font-size: 13px; color: #666; margin-top: 5px;">Ou use o botão abaixo:</p>
                <a href="http://56.124.35.86:8080/portalpaciente/" class="cta-button">ACESSAR PLATAFORMA</a>

                <div class="credentials">
                    <p>🔒 <strong>Seus Dados de Acesso</strong></p>
                    <p>Login: <strong>CPF do Responsável</strong></p>
                    <p>Senha: <strong>CPF do Responsável</strong></p>
                </div>
            </div>

            <div class="support-box">
                <strong>Precisa de ajuda?</strong><br>
                Em caso de dúvidas, utilize a opção "Suporte" dentro da própria plataforma ou chame nossa equipe no WhatsApp:<br>
                <strong><a href="https://wa.me/+5561996621567" style="color: #2196F3; text-decoration: none;">(61) 99662-1567</a></strong>
            </div>
        </div>
        
        <div class="footer">
            <strong>Equipe de Desenvolvimento</strong><br>
            Clínica Lavorato
            
            <div class="no-reply">
                ⚠️ Mensagem automática. Por favor, utilize os canais de suporte informados acima.
            </div>
        </div>
    </div>
</body>
</html>`,
  },
  regraCondutas: {
    subject: "📋 Regras de Conduta – Clínica Lavorato",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regras de Conduta – Clínica Lavorato</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* Header gradiente elegante */
        .header { background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin-bottom: 5px; font-weight: 600; letter-spacing: 0.5px; }
        .header p { opacity: 0.9; font-size: 15px; }
        
        .content { padding: 30px; }
        .content p { margin-bottom: 15px; font-size: 15px; text-align: justify; color: #444; }
        
        /* Box de Informação */
        .info-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .info-box h3 { color: #1e3c72; margin-bottom: 15px; font-size: 18px; }
        .info-box p { text-align: center; font-size: 14px; color: #555; }

        .clarifications {text-align: center;}
        
        /* Assinatura */
        .signature { margin-top: 35px; padding-top: 25px; border-top: 2px solid #e1e1e1; text-align: left; }
        .signature p { margin-bottom: 5px; font-size: 15px; }
        .signature .company { font-weight: bold; color: #1e3c72; font-size: 16px; margin-top: 10px; }
        
        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; font-size: 13px; }
        .address { font-style: normal; margin-top: 12px; opacity: 0.9; line-height: 1.6; }
        .no-reply { margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; font-size: 11px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Regras de Conduta</h1>
            <p>Clínica Lavorato</p>
        </div>
        
        <div class="content">
            <p><strong>Prezados pais e/ou responsáveis, bom dia!</strong></p>
            
            <p>Encaminhamos em anexo as <strong>Regras de Conduta para Pais e/ou Responsáveis de Pacientes</strong>, elaboradas com o objetivo de tornar a experiência de todos na Clínica Lavorato a melhor possível.</p>
            
            <p>Neste documento, reunimos as principais orientações relacionadas ao funcionamento e à convivência na clínica, visando garantir um ambiente seguro, organizado, respeitoso e favorável ao sucesso do acompanhamento terapêutico.</p>
            
            <p>Contamos com a parceria de vocês para que o atendimento ocorra de forma tranquila e harmoniosa para todos os pacientes, familiares e profissionais envolvidos.</p>
            
            <p>Este manual tem como finalidade orientar pais, responsáveis e pacientes adultos quanto às regras de conduta durante o período de acompanhamento terapêutico em nossa clínica.</p>
            </div>
            
            <p class="clarifications">Permanecemos à disposição para quaisquer dúvidas ou esclarecimentos.</p>
            
            <div class="signature">
                <p>Atenciosamente,</p>
                <p class="company">Clínica Lavorato</p>
            </div>
        </div>
        
        <div class="footer">
            <strong>Clínica Lavorato</strong>
            <div class="address">
                📍 SGAN 915, Bloco G, Loja 03<br>
                Ed. Golden Office Corporate<br>
                Brasília - DF
            </div>
            
            <div class="no-reply">
                ⚠️ <strong>Atenção:</strong> Por favor, não responda a este e-mail.<br>
                Mensagem gerada automaticamente.
            </div>
        </div>
    </div>
</body>
</html>`,
  },
  calendarioFeriados: {
    subject: "📅 Calendário de Feriados 2026 – Clínica Lavorato",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendário de Feriados 2026 – Clínica Lavorato</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* Header gradiente elegante */
        .header { background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin-bottom: 5px; font-weight: 600; letter-spacing: 0.5px; }
        .header p { opacity: 0.9; font-size: 15px; }
        
        .content { padding: 30px; }
        .content p { margin-bottom: 15px; font-size: 15px; text-align: justify; color: #444; }
        
        /* Box de Informação */
        .info-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .info-box h3 { color: #1e3c72; margin-bottom: 15px; font-size: 18px; }
        .info-box p { text-align: center; font-size: 14px; color: #555; }

        .clarifications {text-align: center;}
        
        /* Assinatura */
        .signature { margin-top: 35px; padding-top: 25px; border-top: 2px solid #e1e1e1; text-align: left; }
        .signature p { margin-bottom: 5px; font-size: 15px; }
        .signature .company { font-weight: bold; color: #1e3c72; font-size: 16px; margin-top: 10px; }
        
        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; font-size: 13px; }
        .address { font-style: normal; margin-top: 12px; opacity: 0.9; line-height: 1.6; }
        .no-reply { margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; font-size: 11px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Calendário de Feriados 2026</h1>
            <p>Clínica Lavorato</p>
        </div>
        
        <div class="content">
            <p><strong>Queridos pacientes,</strong></p>
            
            <p>Passando para compartilhar com vocês o calendário de feriados de 2026 e como será o funcionamento da Clínica nesses dias.</p>
            
            <p>Preparamos tudo com muito carinho e atenção, pensando sempre no que é melhor para cada um de vocês e para que possam se programar conforme as datas informadas.</p>
            
            <p>Nosso compromisso é cuidar, acolher e estar presentes sempre que precisarem 🤍</p>
            
            <p class="clarifications">Caso tenham dúvida, estaremos à disposição!</p>
            
            <div class="signature">
                <p>Um abraço,</p>
                <p class="company">Clínica Lavorato</p>
            </div>
        </div>
        
        <div class="footer">
            <strong>Clínica Lavorato</strong>
            <div class="address">
                📍 SGAN 915, Bloco G, Loja 03<br>
                Ed. Golden Office Corporate<br>
                Brasília - DF
            </div>
            
            <div class="no-reply">
                ⚠️ <strong>Atenção:</strong> Por favor, não responda a este e-mail.<br>
                Mensagem gerada automaticamente.
            </div>
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
        "Configurações de email incompletas. Serviço de email não será inicializado.",
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
        "Serviço de e-mail não pôde ser verificado. Verifique as configurações.",
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
  nomeModelo: string,
): Promise<boolean> => {
  //Inicializar serviço de e-mail *CASO NÃO ESTEJA habilitado*
  if (!transporter) {
    await inicializarServicoEmail();
  }

  //Em caso de erro registrar e retornar
  if (!servicoEmailDisponivel) {
    console.log(
      `Não é possível enviar e-mail para ${paciente.email}: serviço de e-mail indisponível`,
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
      paciente.especialidades,
    );
    corpo = corpo.replace(/\{\{especialidades\}\}/g, especialidadesFormatadas);
  } else {
    // Se não houver especialidades, substituir o placeholder por string vazia
    corpo = corpo.replace(/\{\{especialidades\}\}/g, "");
    // Também ajustar a frase para não mencionar especialidades
    corpo = corpo.replace(
      /na\(s\) especialidade\(s\) \{\{especialidades\}\}/g,
      "",
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
  } else if (nomeModelo === "conviteBetaApp") {
    // Caminho para o arquivo que você informou
    const qrCodePath = path.join(
      process.cwd(),
      "uploads",
      "qrcode_portal_paciente.png",
    );

    if (fs.existsSync(qrCodePath)) {
      attachments.push({
        filename: "qrcode_portal_paciente.png",
        path: qrCodePath,
        cid: "qrcode-portal", // IMPORTANTE: Este CID deve bater com o src="cid:..." do HTML
        contentDisposition: "inline",
      });
    } else {
      console.warn("QR Code do portal não encontrado em:", qrCodePath);
    }
  } else if (nomeModelo === "regraCondutas") {
    const rules = path.join(
      process.cwd(),
      "uploads",
      "RegraCondutas-responsaveis.pdf",
    );
    if (fs.existsSync(rules)) {
      attachments.push({
        filename: "RegraConduta-responsaveis.pdf",
        path: rules,
      });
    }
  } else if (nomeModelo === "calendarioFeriados") {
    const calendar = path.join(process.cwd(), "uploads", "CalendarioFeriados.jpeg");
    if (fs.existsSync(calendar)) {
      attachments.push({
        filename: "CalendarioFeriados.jpeg",
        path: calendar,
      });
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
        "Erro de timeout - verifique se o servidor SMTP está acessível",
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
  nomeModelo: string,
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
        pacientes.length / tamanhoDaRemessa,
      )}`,
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
