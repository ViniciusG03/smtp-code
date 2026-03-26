export const recadastramento = {
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
}