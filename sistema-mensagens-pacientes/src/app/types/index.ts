// Definições de tipos para todo o projeto

// Tipo para dados básicos de paciente (usado em formulários)
export interface PatientData {
  nome: string;
  email: string;
  dataNascimento?: string | null;
  telefone?: string | null;
}

// Tipo para um paciente completo (com ID e metadados)
export interface Patient extends PatientData {
  id: string;
  dataCadastro: string;
  dataAtualizacao?: string;
}

// Tipo para informações de alerta
export interface AlertInfo {
  mensagem: string;
  tipo: "sucesso" | "erro" | "aviso" | "info";
}

// Tipo para resultado de envio de email
export interface EmailResultado {
  id: string;
  email: string;
  sucesso: boolean;
}

// Tipo para resultado de envio em massa
export interface EmailResultadoEmMassa {
  sucesso: boolean;
  totalResultados: number;
  contagemSucesso: number;
  contagemFalhas: number;
  resultados: EmailResultado[];
}

// Tipo para template de email
export interface EmailTemplate {
  subject: string;
  body: string;
}
