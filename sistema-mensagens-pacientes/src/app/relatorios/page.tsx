"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Patient, AlertInfo } from "@/app/types";

interface PacienteComRelatorio {
  paciente: Patient;
  pdf: string | null;
}

interface RelatoriosData {
  cbmdf: PacienteComRelatorio[];
  fusex: PacienteComRelatorio[];
  totalPdfs: number;
  arquivos: string[];
}

export default function RelatoriosPage() {
  const [dados, setDados] = useState<RelatoriosData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null); // "CBMDF" | "FUSEX" | pacienteId
  const [infoAlerta, setInfoAlerta] = useState<AlertInfo | null>(null);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch("/api/relatorios");
      if (!resposta.ok) throw new Error("Erro ao carregar relatórios");
      const data = await resposta.json();
      setDados(data);
    } catch (erro) {
      mostrarAlerta("Erro ao carregar dados de relatórios", "erro");
    } finally {
      setCarregando(false);
    }
  };

  const mostrarAlerta = (mensagem: string, tipo: AlertInfo["tipo"] = "info") => {
    setInfoAlerta({ mensagem, tipo });
    setTimeout(() => setInfoAlerta(null), 6000);
  };

  const enviarIndividual = async (pacienteId: string, nomePaciente: string) => {
    try {
      setEnviando(pacienteId);
      const resposta = await fetch(`/api/relatorios/send/${pacienteId}`, {
        method: "POST",
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.error || "Erro ao enviar relatório");
      }

      mostrarAlerta(`Relatório enviado para ${nomePaciente}`, "sucesso");
    } catch (erro: any) {
      mostrarAlerta(erro.message, "erro");
    } finally {
      setEnviando(null);
    }
  };

  const enviarConvenio = async (convenio: "CBMDF" | "FUSEX") => {
    const lista = convenio === "CBMDF" ? dados?.cbmdf : dados?.fusex;
    const comPdf = lista?.filter((item) => item.pdf !== null).length ?? 0;

    if (
      !window.confirm(
        `Enviar relatórios para todos os pacientes ${convenio} com PDF encontrado? (${comPdf} pacientes)`
      )
    ) {
      return;
    }

    try {
      setEnviando(convenio);
      const resposta = await fetch("/api/relatorios/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convenio }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.error || "Erro ao enviar relatórios");
      }

      mostrarAlerta(
        `${convenio}: ${resultado.contagemSucesso} enviados, ${resultado.contagemFalhas} falhas.`,
        resultado.contagemFalhas > 0 ? "aviso" : "sucesso"
      );
    } catch (erro: any) {
      mostrarAlerta(erro.message, "erro");
    } finally {
      setEnviando(null);
    }
  };

  const corAlerta = {
    sucesso: "bg-green-50 text-green-700 border border-green-200",
    erro: "bg-red-50 text-red-700 border border-red-200",
    aviso: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            Relatórios de Convênio
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-white py-2 px-4 rounded shadow">
            ← Voltar
          </Link>
        </div>

        {/* Alerta */}
        {infoAlerta && (
          <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded shadow-md text-sm ${corAlerta[infoAlerta.tipo]}`}>
            {infoAlerta.mensagem}
          </div>
        )}

        {carregando ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : !dados ? (
          <div className="text-center py-12 text-red-500">
            Erro ao carregar dados.
          </div>
        ) : (
          <>
            {/* Info da pasta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  Pasta:{" "}
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    uploads/relatorios/
                  </code>
                </span>
                <span className="ml-4 text-sm font-medium text-gray-700">
                  {dados.totalPdfs} PDF{dados.totalPdfs !== 1 ? "s" : ""} encontrado{dados.totalPdfs !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={carregarRelatorios}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded">
                Atualizar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CBMDF */}
              <ConvenioSection
                titulo="CBMDF"
                cor="blue"
                itens={dados.cbmdf}
                enviando={enviando}
                onEnviarIndividual={enviarIndividual}
                onEnviarTodos={() => enviarConvenio("CBMDF")}
              />

              {/* FUSEX */}
              <ConvenioSection
                titulo="FUSEX"
                cor="green"
                itens={dados.fusex}
                enviando={enviando}
                onEnviarIndividual={enviarIndividual}
                onEnviarTodos={() => enviarConvenio("FUSEX")}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

interface ConvenioSectionProps {
  titulo: string;
  cor: "blue" | "green";
  itens: PacienteComRelatorio[];
  enviando: string | null;
  onEnviarIndividual: (id: string, nome: string) => void;
  onEnviarTodos: () => void;
}

function ConvenioSection({
  titulo,
  cor,
  itens,
  enviando,
  onEnviarIndividual,
  onEnviarTodos,
}: ConvenioSectionProps) {
  const comPdf = itens.filter((i) => i.pdf !== null).length;
  const semPdf = itens.length - comPdf;

  const headerCor = cor === "blue" ? "bg-blue-700" : "bg-green-700";
  const btnCor =
    cor === "blue"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-green-600 hover:bg-green-700";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${headerCor} text-white p-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{titulo}</h2>
          <span className="text-sm opacity-80">
            {itens.length} paciente{itens.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-xs mt-1 opacity-70">
          ✅ {comPdf} com PDF &nbsp;·&nbsp; ❌ {semPdf} sem PDF
        </div>
      </div>

      <div className="p-4">
        {itens.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            Nenhum paciente cadastrado com convênio {titulo}.
          </p>
        ) : (
          <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
            {itens.map(({ paciente, pdf }) => (
              <div
                key={paciente.id}
                className="flex items-center justify-between border border-gray-100 rounded p-3 bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {pdf ? "✅" : "❌"} {paciente.nome}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {paciente.email}
                  </p>
                  {pdf && (
                    <p className="text-xs text-green-600 truncate mt-0.5">
                      {pdf}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onEnviarIndividual(paciente.id, paciente.nome)}
                  disabled={!pdf || enviando !== null}
                  title={!pdf ? "PDF não encontrado" : "Enviar relatório"}
                  className="ml-3 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  {enviando === paciente.id ? "Enviando..." : "Enviar"}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onEnviarTodos}
          disabled={comPdf === 0 || enviando !== null}
          className={`w-full ${btnCor} text-white font-medium py-2 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed text-sm`}>
          {enviando === titulo
            ? "Enviando..."
            : `Enviar todos ${titulo} (${comPdf} com PDF)`}
        </button>
      </div>
    </div>
  );
}
