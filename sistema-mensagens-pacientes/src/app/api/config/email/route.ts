import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obter o diretório atual no modo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para o arquivo de configuração
const CONFIG_DIR = path.join(process.cwd(), "data");
const EMAIL_CONFIG_FILE = path.join(CONFIG_DIR, "email-config.json");

// Tipo para a configuração de email
interface EmailConfig {
  defaultBcc: string;
  templateBcc: {
    [key: string]: string;
  };
}

// Função para garantir que o arquivo de configuração exista
const inicializarConfiguracao = (): boolean => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (!fs.existsSync(EMAIL_CONFIG_FILE)) {
      // Criar configuração inicial vazia
      const configInicial: EmailConfig = {
        defaultBcc: "",
        templateBcc: {},
      };

      fs.writeFileSync(
        EMAIL_CONFIG_FILE,
        JSON.stringify(configInicial, null, 2)
      );
    } else {
      // Verificar se o arquivo contém um JSON válido
      try {
        const conteudo = fs.readFileSync(EMAIL_CONFIG_FILE, "utf8");
        if (!conteudo || conteudo.trim() === "") {
          // Arquivo vazio, criar configuração inicial
          const configInicial: EmailConfig = {
            defaultBcc: "",
            templateBcc: {},
          };

          fs.writeFileSync(
            EMAIL_CONFIG_FILE,
            JSON.stringify(configInicial, null, 2)
          );
        } else {
          // Tentar fazer parse do JSON
          JSON.parse(conteudo);
        }
      } catch (errorParser) {
        console.error(
          "Erro ao analisar o arquivo de configuração:",
          errorParser
        );
        // Fazer backup do arquivo corrompido
        const caminhoBackup = `${EMAIL_CONFIG_FILE}.bak.${Date.now()}`;
        fs.copyFileSync(EMAIL_CONFIG_FILE, caminhoBackup);

        // Criar configuração inicial
        const configInicial: EmailConfig = {
          defaultBcc: "",
          templateBcc: {},
        };

        fs.writeFileSync(
          EMAIL_CONFIG_FILE,
          JSON.stringify(configInicial, null, 2)
        );
      }
    }

    return true;
  } catch (erro) {
    console.error("Erro ao inicializar o arquivo de configuração:", erro);
    return false;
  }
};

// Função para carregar a configuração de email
export const carregarConfiguracao = (): EmailConfig => {
  try {
    inicializarConfiguracao();

    const dados = fs.readFileSync(EMAIL_CONFIG_FILE, "utf8");

    if (!dados || dados.trim() === "") {
      return {
        defaultBcc: "",
        templateBcc: {},
      };
    }

    return JSON.parse(dados);
  } catch (erro) {
    console.error("Erro ao carregar configuração de email:", erro);
    return {
      defaultBcc: "",
      templateBcc: {},
    };
  }
};

// Função para salvar a configuração de email
export const salvarConfiguracao = (config: EmailConfig): boolean => {
  try {
    inicializarConfiguracao();
    fs.writeFileSync(EMAIL_CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (erro) {
    console.error("Erro ao salvar configuração de email:", erro);
    return false;
  }
};

// GET /api/config/email - Obter configuração de email
export async function GET() {
  try {
    const config = carregarConfiguracao();
    return NextResponse.json(config);
  } catch (erro) {
    console.error("Erro ao obter configuração de email:", erro);
    return NextResponse.json(
      { error: "Falha ao carregar configuração de email" },
      { status: 500 }
    );
  }
}

// POST /api/config/email - Atualizar configuração de email
export async function POST(request: Request) {
  try {
    const dados = (await request.json()) as EmailConfig;

    // Validar os dados
    if (typeof dados.defaultBcc !== "string") {
      return NextResponse.json(
        { error: "Campo defaultBcc deve ser uma string" },
        { status: 400 }
      );
    }

    if (typeof dados.templateBcc !== "object") {
      return NextResponse.json(
        { error: "Campo templateBcc deve ser um objeto" },
        { status: 400 }
      );
    }

    // Limpar e validar emails BCC
    const defaultBcc = dados.defaultBcc.trim();
    const templateBcc: { [key: string]: string } = {};

    // Processar templateBcc
    if (dados.templateBcc) {
      Object.entries(dados.templateBcc).forEach(([key, value]) => {
        if (typeof value === "string") {
          templateBcc[key] = value.trim();
        }
      });
    }

    // Salvar configuração
    const sucesso = salvarConfiguracao({
      defaultBcc,
      templateBcc,
    });

    if (sucesso) {
      return NextResponse.json({
        success: true,
        message: "Configuração de email atualizada com sucesso",
      });
    } else {
      return NextResponse.json(
        { error: "Falha ao salvar configuração de email" },
        { status: 500 }
      );
    }
  } catch (erro) {
    console.error("Erro ao atualizar configuração de email:", erro);
    return NextResponse.json(
      { error: "Falha ao atualizar configuração de email" },
      { status: 500 }
    );
  }
}
