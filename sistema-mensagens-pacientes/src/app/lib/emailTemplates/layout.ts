export function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
margin:0;
padding:0;
}

.email-container{
max-width:600px;
margin:0 auto;
background:#ffffff;
}

.content{
padding:30px;
font-size:15px;
color:#444;
}

.footer{
background:#22abf5;
color:white;
padding:20px;
text-align:center;
font-size:12px;
border-radius: 25px;
}

.event-box{
background:#f0f4ff;
border:1px solid #c0cfe8;
border-radius:8px;
padding:20px;
margin:20px 0;
}

.event-info{
margin:6px 0;
}

.warning{
background:#fff8e1;
border-left:4px solid #f5a623;
padding:12px 15px;
margin:15px 0;
border-radius:4px;
font-size:14px;
}

.button-container{
text-align:center;
margin-top:20px;
}

.cta-button{
display:inline-block;
background:#1e3c72;
color:white;
text-decoration:none;
padding:12px 28px;
border-radius:6px;
font-weight:bold;
font-size:15px;
}

</style>

</head>

<body>

<div class="email-container">

<div class="content">
${content}
</div>

<div class="footer">

<strong>Lavorato Saúde Integrada</strong><br>

📍 SGAN 915, Bloco G, Loja 03<br>
Brasília - DF

</div>

</div>

</body>
</html>
`;
}
