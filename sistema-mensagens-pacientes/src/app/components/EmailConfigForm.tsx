"use client";

import { useState, useEffect, FormEvent } from "react";

interface EmailConfigProps {
  onSave: (config: EmailConfigData) => void;
}

export interface EmailConfigData {
  defaultBcc: string;
  templateBcc: {
    [key: string]: string;
  };
}

export function EmailConfigForm({ onSave }: EmailConfigProps) {
  const [defaultBcc, setDefaultBcc] = useState<string>("");
  const [templateBcc, setTemplateBcc] = useState<{ [key: string]: string }>({
    lembreteConsulta: "",
    resultadoExame: "",
    aniversario: "",
    lembreteRetorno: "",
    campanhaVacinacao: "",
  });
  const [carregando, setCarregando] = useState<boolean>(true);

  // Carregar configurações existentes
  useEffect(() => {
    const carregarConfig = async () => {
      try {
        setCarregando(true);
        const response = await fetch("/api/config/email");

        if (response.ok) {
          const data = await response.json();
          setDefaultBcc(data.defaultBcc || "");

          // Inicializar templateBcc com valores do servidor ou padrões vazios
          const templates = {
            lembreteConsulta: "",
            resultadoExame: "",
            aniversario: "",
            lembreteRetorno: "",
            campanhaVacinacao: "",
            ...data.templateBcc,
          };

          setTemplateBcc(templates);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarConfig();
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Remover espaços extras e filtrar entradas vazias para templateBcc
    const cleanedTemplateBcc: { [key: string]: string } = {};

    Object.entries(templateBcc).forEach(([key, value]) => {
      const trimmedValue = value.trim();
      if (trimmedValue) {
        cleanedTemplateBcc[key] = trimmedValue;
      }
    });

    onSave({
      defaultBcc: defaultBcc.trim(),
      templateBcc: cleanedTemplateBcc,
    });
  };

  const handleTemplateChange = (template: string, value: string) => {
    setTemplateBcc((prev) => ({
      ...prev,
      [template]: value,
    }));
  };

  if (carregando) {
    return <div className="text-center py-4">Carregando configurações...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="defaultBcc"
          className="block text-sm font-medium text-gray-700 mb-1">
          BCC Padrão (emails separados por vírgula)
        </label>
        <input
          type="text"
          id="defaultBcc"
          value={defaultBcc}
          onChange={(e) => setDefaultBcc(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="ex: admin@clinica.com, secretaria@clinica.com"
        />
        <p className="mt-1 text-sm text-gray-500">
          Estes emails receberão cópia oculta de todas as mensagens enviadas.
        </p>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-2">BCC para Modelos Específicos</h3>
        <p className="text-sm text-gray-500 mb-3">
          Configure emails BCC específicos para cada tipo de mensagem
          (opcional). Estes substituirão o BCC padrão.
        </p>

        {Object.entries(templateBcc).map(([template, value]) => (
          <div key={template} className="mb-3">
            <label
              htmlFor={`bcc-${template}`}
              className="block text-sm font-medium text-gray-700 mb-1">
              {getTemplateLabel(template)}
            </label>
            <input
              type="text"
              id={`bcc-${template}`}
              value={value}
              onChange={(e) => handleTemplateChange(template, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: admin@clinica.com, secretaria@clinica.com"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          Salvar Configurações
        </button>
      </div>
    </form>
  );
}

// Função auxiliar para obter nomes amigáveis dos templates
function getTemplateLabel(templateKey: string): string {
  const labels: { [key: string]: string } = {
    lembreteConsulta: "Lembrete de Consulta",
    resultadoExame: "Resultado de Exame",
    aniversario: "Aniversário",
    lembreteRetorno: "Lembrete de Retorno",
    campanhaVacinacao: "Campanha de Vacinação",
  };

  return labels[templateKey] || templateKey;
}
