import { emailLayout } from "./layout";

export const relatorioConvenio = {
  subject: "Relatório de Solicitação",
  body: emailLayout(`
    <p>Prezado(a),</p>

    <p>Segue em anexo o relatório de solicitação do(a) paciente <strong>{{nome}}</strong>.</p>

    
    <p>Atenciosamente,<br>
  `),
};
