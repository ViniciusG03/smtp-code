"use client";

import { useState } from "react";

export function BulkMessageForm({ onSubmit }) {
  const [template, setTemplate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!template) {
      alert("Por favor, selecione um modelo de mensagem");
      return;
    }

    onSubmit(template);
    setTemplate(""); // Reset após envio
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="bulkTemplate"
          className="block text-sm font-medium text-gray-700 mb-1">
          Modelo de Mensagem
        </label>
        <select
          id="bulkTemplate"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          required>
          <option value="">Selecione um modelo</option>
          <option value="lembreteConsulta">Lembrete de Consulta</option>
          <option value="resultadoExame">Resultado de Exame</option>
          <option value="aniversario">Aniversário</option>
          <option value="lembreteRetorno">Lembrete de Retorno</option>
          <option value="campanhaVacinacao">Campanha de Vacinação</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500">
        Enviar para Todos
      </button>
    </form>
  );
}
