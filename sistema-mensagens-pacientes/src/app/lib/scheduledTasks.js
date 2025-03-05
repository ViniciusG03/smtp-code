import cron from "node-cron";
import { carregarPacientes } from "./db";
import { enviarEmail, modelosMensagens } from "./email";

// Função para verificar aniversários
const verificarAniversariosHoje = async () => {
  const pacientes = carregarPacientes();
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1; // getMonth() retorna 0-11

  // Filtrar pacientes que fazem aniversário hoje
  const aniversariantes = pacientes.filter((paciente) => {
    if (!paciente.dataNascimento) return false;

    const dataNasc = new Date(paciente.dataNascimento);
    return dataNasc.getDate() === dia && dataNasc.getMonth() + 1 === mes;
  });

  console.log(`Encontrados ${aniversariantes.length} aniversariantes hoje`);

  // Enviar email para cada aniversariante
  for (const paciente of aniversariantes) {
    console.log(`Enviando email de aniversário para ${paciente.nome}`);
    await enviarEmail(paciente, "aniversario");
  }
};

// Função para configurar tarefas agendadas
export const configurarTarefasAgendadas = () => {
  // Verificar aniversários todos os dias às 9h
  cron.schedule("0 9 * * *", async () => {
    console.log("Executando tarefa agendada: verificação de aniversários");
    try {
      await verificarAniversariosHoje();
    } catch (erro) {
      console.error("Erro ao verificar aniversários:", erro);
    }
  });

  console.log("Tarefas agendadas configuradas com sucesso");
  return true;
};
