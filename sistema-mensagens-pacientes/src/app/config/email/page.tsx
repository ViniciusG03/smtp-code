"use client";

import { useState } from "react";
import {
  EmailConfigForm,
  EmailConfigData,
} from "@/app/components/EmailConfigForm";
import Link from "next/link";

export default function EmailConfigPage() {
  const [infoAlerta, setInfoAlerta] = useState<{
    mensagem: string;
    tipo: "sucesso" | "erro" | "aviso" | "info";
  } | null>(null);

  const handleSalvarConfig = async (configData: EmailConfigData) => {
    try {
      const resposta = await fetch("/api/config/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.error || "Erro ao salvar configurações");
      }

      const resultado = await resposta.json();
      mostrarAlerta("Configurações de email salvas com sucesso!", "sucesso");
    } catch (erro: any) {
      console.error("Erro:", erro);
      mostrarAlerta(erro.message || "Erro ao salvar configurações", "erro");
    }
  };

  const mostrarAlerta = (
    mensagem: string,
    tipo: "sucesso" | "erro" | "aviso" | "info" = "info"
  ) => {
    setInfoAlerta({ mensagem, tipo });
    setTimeout(() => {
      setInfoAlerta(null);
    }, 5000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            Configurações de Email
          </h1>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500">
            Voltar
          </Link>
        </div>

        {/* Componente de alerta */}
        {infoAlerta && (
          <div
            className={`mb-4 p-4 rounded ${
              infoAlerta.tipo === "sucesso"
                ? "bg-green-100 text-green-800"
                : infoAlerta.tipo === "erro"
                ? "bg-red-100 text-red-800"
                : infoAlerta.tipo === "aviso"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}>
            {infoAlerta.mensagem}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-700 text-white p-4">
            <h2 className="text-xl font-semibold">
              Configurações de Cópia Oculta (BCC)
            </h2>
          </div>
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              Configure aqui os emails que receberão cópias ocultas (BCC) das
              mensagens enviadas aos pacientes. Utilize vírgulas para separar
              múltiplos endereços de email.
            </p>

            <EmailConfigForm onSave={handleSalvarConfig} />

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2 text-gray-700">Como funciona?</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <strong>BCC Padrão:</strong> Estes endereços receberão cópias
                  ocultas de todas as mensagens enviadas pelo sistema.
                </li>
                <li>
                  <strong>BCC por Modelo:</strong> Você pode configurar
                  endereços específicos para cada tipo de mensagem. Estes
                  substituirão o BCC padrão.
                </li>
                <li>
                  Os destinatários de cópia oculta não serão visíveis para o
                  paciente que recebe a mensagem principal.
                </li>
                <li>
                  Esta configuração é útil para manter arquivos de comunicação e
                  permitir que outros membros da equipe fiquem cientes das
                  mensagens enviadas.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
