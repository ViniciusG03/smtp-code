"use client";

import { useState, useEffect } from "react";
import { PatientForm } from "@/components/PatientForm";
import { PatientList } from "@/components/PatientList";
import { BulkMessageForm } from "@/components/BulkMessageForm";
import { MessageModal } from "@/components/MessageModal";

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [mostrarModalMensagem, setMostrarModalMensagem] = useState(false);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState(null);
  const [infoAlerta, setInfoAlerta] = useState(null);

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    carregarPacientes();
  }, []);

  // Função para carregar pacientes
  const carregarPacientes = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch("/api/patients");
      if (!resposta.ok) throw new Error("Erro ao carregar pacientes");

      const dados = await resposta.json();
      setPacientes(dados);
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarAlerta("Erro ao carregar pacientes", "erro");
    } finally {
      setCarregando(false);
    }
  };

  // Função para mostrar alerta
  const mostrarAlerta = (mensagem, tipo = "info") => {
    setInfoAlerta({ mensagem, tipo });
    setTimeout(() => {
      setInfoAlerta(null);
    }, 5000);
  };

  // Função para lidar com a criação/atualização de paciente
  const handleFormSubmit = async (pacienteData) => {
    try {
      let url = "/api/patients";
      let metodo = "POST";

      if (pacienteAtual) {
        url = `/api/patients/${pacienteAtual.id}`;
        metodo = "PUT";
      }

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteData),
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.error || "Erro ao processar requisição");
      }

      const resultado = await resposta.json();
      mostrarAlerta(
        pacienteAtual
          ? `Paciente ${resultado.nome} atualizado com sucesso!`
          : `Paciente ${resultado.nome} cadastrado com sucesso!`,
        "sucesso"
      );

      // Resetar estado e recarregar lista
      setPacienteAtual(null);
      carregarPacientes();
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarAlerta(erro.message, "erro");
    }
  };

  // Função para editar paciente
  const handleEditarPaciente = (paciente) => {
    setPacienteAtual(paciente);
  };

  // Função para cancelar edição
  const handleCancelarEdicao = () => {
    setPacienteAtual(null);
  };

  // Função para abrir modal de mensagem
  const handleAbrirModalMensagem = (pacienteId) => {
    setPacienteSelecionadoId(pacienteId);
    setMostrarModalMensagem(true);
  };

  // Função para enviar mensagem individual
  const handleEnviarMensagem = async (templateName) => {
    try {
      const resposta = await fetch(`/api/send/${pacienteSelecionadoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateName }),
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.error || "Erro ao enviar mensagem");
      }

      const resultado = await resposta.json();
      mostrarAlerta(resultado.message, "sucesso");
      setMostrarModalMensagem(false);
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarAlerta(erro.message, "erro");
    }
  };

  // Função para enviar mensagem em massa
  const handleEnviarMensagemEmMassa = async (templateName) => {
    if (
      !window.confirm(
        "Tem certeza que deseja enviar esta mensagem para TODOS os pacientes?"
      )
    ) {
      return;
    }

    try {
      const resposta = await fetch("/api/send-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateName }),
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.error || "Erro ao enviar mensagens");
      }

      const resultado = await resposta.json();
      const sucedidos = resultado.contagemSucesso;
      const falhas = resultado.contagemFalhas;

      mostrarAlerta(
        `Mensagens enviadas: ${sucedidos} com sucesso, ${falhas} falhas.`,
        falhas > 0 ? "aviso" : "sucesso"
      );
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarAlerta(erro.message, "erro");
    }
  };

  // Função para excluir paciente
  const handleExcluirPaciente = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este paciente?"))
      return;

    try {
      const resposta = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.error || "Erro ao excluir paciente");
      }

      mostrarAlerta("Paciente excluído com sucesso!", "sucesso");

      // Recarregar lista de pacientes
      carregarPacientes();

      // Se estávamos editando este paciente, resetar o formulário
      if (pacienteAtual && pacienteAtual.id === id) {
        setPacienteAtual(null);
      }
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarAlerta(erro.message, "erro");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-blue-800">
          Sistema de Mensagens para Pacientes
        </h1>

        {/* Componente de alerta */}
        {infoAlerta && (
          <div
            className={`mb-4 p-4 rounded ${
              infoAlerta.tipo === "sucesso"
                ? "bg-green-100 text-green-800"
                : infoAlerta.tipo === "erro"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}>
            {infoAlerta.mensagem}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda */}
          <div className="md:col-span-1">
            {/* Formulário de Paciente */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="bg-blue-700 text-white p-4">
                <h2 className="text-xl font-semibold">
                  {pacienteAtual
                    ? "Editar Paciente"
                    : "Cadastrar Novo Paciente"}
                </h2>
              </div>
              <div className="p-4">
                <PatientForm
                  currentPatient={pacienteAtual}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelarEdicao}
                />
              </div>
            </div>

            {/* Formulário de Mensagem em Massa */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-yellow-600 text-white p-4">
                <h2 className="text-xl font-semibold">
                  Enviar Mensagem para Todos
                </h2>
              </div>
              <div className="p-4">
                <BulkMessageForm onSubmit={handleEnviarMensagemEmMassa} />
              </div>
            </div>
          </div>

          {/* Coluna da direita */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Lista de Pacientes</h2>
                <button
                  onClick={carregarPacientes}
                  className="bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm">
                  Atualizar
                </button>
              </div>
              <div className="p-4">
                {carregando ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : (
                  <PatientList
                    patients={pacientes}
                    onEdit={handleEditarPaciente}
                    onDelete={handleExcluirPaciente}
                    onSendMessage={handleAbrirModalMensagem}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mensagem */}
      {mostrarModalMensagem && (
        <MessageModal
          onClose={() => setMostrarModalMensagem(false)}
          onSend={handleEnviarMensagem}
        />
      )}
    </main>
  );
}
