import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

//CAMINHOS
const DATA_DIR = path.join(process.cwd(), "data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

//Garantir que o diretório de dados exista
export const inicializarBancoDados = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log("Diretório de dados criado com sucesso!");
    }

    if (!fs.existsSync(PATIENTS_FILE)) {
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      console.log("Arquivo de pacientes criado com sucesso!");
    } else {
      //Verifica se o arquivo contém um JSON válido
      try {
        const conteudo = fs.readFileSync(PATIENTS_FILE, "utf8");
        if (!conteudo || conteudo.trim() === "") {
          fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
        } else {
          JSON.parse(conteudo);
        }
      } catch (errorParser) {
        console.error("Erro ao analisar o arquivo de pacientes:", errorParser);
        const caminhoBackup = `${PATIENTS_FILE}.bak.${Date.now()}`;
        fs.copyFileSync(PATIENTS_FILE, caminhoBackup);
        fs.writeFileSync(PATIENTS_FILE, JSON.stringify([], null, 2));
      }
    }

    return true;
  } catch (erro) {
    console.error("Erro ao inicializar o banco de dados:", erro);
    return false;
  }
};

//Carregar pacientes do JSON
export const carregarPacientes = () => {
  try {
    inicializarBancoDados();

    const dados = fs.readFileSync(PATIENTS_FILE, "utf8");

    if (!dados || dados.trim() === "") {
      return [];
    }

    return JSON.parse(dados);
  } catch (erro) {
    console.error("Erro ao carregar pacientes:", erro);
    return [];
  }
};

//Salvar pacientes no JSON
export const salvarPacientes = (pacientes) => {
  try {
    inicializarBancoDados();
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(pacientes, null, 2));
    return true;
  } catch (erro) {
    console.error("Erro ao salvar pacientes:", erro);
    return false;
  }
};

// Obter um único paciente pelo ID
export const obterPacientePorId = (id) => {
  const pacientes = carregarPacientes();
  return pacientes.find((p) => p.id === id) || null;
};

// Criar um novo paciente
export const criarPaciente = (dadosPaciente) => {
  const pacientes = carregarPacientes();

  // Correção: Acesso errado a dados.Paciente
  if (pacientes.some((p) => p.email === dadosPaciente.email)) {
    throw new Error("Este e-mail já está cadastrado");
  }

  const novoPaciente = {
    id: uuidv4(),
    ...dadosPaciente,
    // Correção: Faltou o parênteses para chamar a função
    dataCadastro: new Date().toISOString(),
  };

  pacientes.push(novoPaciente);

  if (salvarPacientes(pacientes)) {
    return novoPaciente;
  } else {
    throw new Error("Erro ao salvar o paciente.");
  }
};

//Atualizar um paciente existente
export const atualizarPaciente = (id, dadosPaciente) => {
  const pacientes = carregarPacientes();
  // Correção: findIdex para findIndex
  const indice = pacientes.findIndex((p) => p.id === id);

  if (indice === -1) {
    throw new Error("Paciente não encontrado.");
  }

  //Verificar se o email já está em uso por outro paciente
  if (
    dadosPaciente.email &&
    dadosPaciente.email !== pacientes[indice].email &&
    pacientes.some((p) => p.id !== id && p.email === dadosPaciente.email)
  ) {
    throw new Error("O email informado já está cadastrado.");
  }

  pacientes[indice] = {
    ...pacientes[indice],
    ...dadosPaciente,
    // Correção: Faltou o parênteses para chamar a função
    dataAtualizacao: new Date().toISOString(),
  };

  if (salvarPacientes(pacientes)) {
    return pacientes[indice];
  } else {
    throw new Error("Erro ao salvar o paciente.");
  }
};

//Excluir um paciente existente
export const excluirPaciente = (id) => {
  const pacientes = carregarPacientes();
  const pacientesFiltrados = pacientes.filter((p) => p.id !== id);

  if (pacientes.length === pacientesFiltrados.length) {
    throw new Error("Paciente não encontrado.");
  }

  if (salvarPacientes(pacientesFiltrados)) {
    return true;
  } else {
    throw new Error("Erro ao excluir o paciente");
  }
};
