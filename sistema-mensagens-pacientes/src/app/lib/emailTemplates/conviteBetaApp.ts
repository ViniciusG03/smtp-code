export const conviteBetaApp ={
    subject: "App de pais",
    body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App dos Pais</title>
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
        .support-box { background-color: #e8f4fd; border-left: 4px solid #2196F3; padding: 15px; margin-top: 25px; font-size: 14px; color: #0c5460; border-radius: 10px; }

        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; font-size: 13px; border-radius: 10px; }
        .no-reply { margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; font-size: 11px; opacity: 0.7;}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>App dos Pais Lavorato</h1>
        </div>
        
        <div class="content">
            <p><strong>Prezado(a) pai, mãe ou responsável,</strong></p>
            
            <p>Nosso app está completamente disponível!!.</p>

            <p>A partir de agora, você poderá acompanhar as informações dos atendimentos de seus filhos de forma prática e segura através da plataforma online..</p>

            <div class="access-box">
                <h3>📲 Instruções para acesso:</h3>
                <p style="text-align: center; margin-bottom: 10px;">Aponte a câmera do seu celular para o QR Code abaixo:</p>
                
                <img src="cid:qrcode-portal" alt="Acesse pelo QR Code" class="qr-code">
                
                <p style="font-size: 13px; color: #666; margin-top: 5px;">Ou use o botão abaixo:</p>
                <a href="https://lavorato.hiposaudeintegrada.com.br/portalpaciente/" class="cta-button">ACESSAR PLATAFORMA</a>

                <div class="credentials">
                    <p>🔒 <strong>Para entrar use os dados de Acesso:</strong></p>
                    <p>Login: <strong>CPF do Responsável</strong></p>
                    <p>Senha: <strong>CPF do Responsável</strong></p>
                </div>
            </div>

            <div class="support-box">
                <strong>Precisa de ajuda?</strong><br>
                Em caso de dúvidas, chame nossa equipe no WhatsApp selecionando a opção "6 - Aplicativo":<br>
                <strong><a href="https://wa.me/+5561996621567" style="color: #2196F3; text-decoration: none;">(61) 99662-1567</a></strong>
            </div>
        </div>
        
        <div class="footer">
            <strong>Equipe de Desenvolvimento</strong><br>
            Lavorato Saúde Integrada
            
            <div class="no-reply">
                ⚠️ Mensagem automática. Por favor, utilize os canais de suporte informados acima.
            </div>
        </div>
    </div>
</body>
</html>`,
}