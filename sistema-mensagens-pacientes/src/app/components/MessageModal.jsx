"use client";

import { useState } from "react";

export function MessageModal({ onClose, onSend }) {
  const [template, setTemplate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!template) {
      alert("Por favor, selecione um modelo de mensagem");
      return;
    }

    onSend(template);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-blue-700 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-semibold">Enviar Mensagem</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="messageTemplate"
              className="block text-sm font-medium text-gray-700 mb-1">
              Modelo de Mensagem
            </label>
            <select
              id="messageTemplate"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required>
              <option value="">Selecione um modelo</option>
              <option value="lembreteConsulta">Lembrete de Consulta</option>
              <option value="resultadoExame">Resultado de Exame</option>
              <option value="aniversario">Aniversário</option>
              <option value="lembreteRetorno">Lembrete de Retorno</option>
              <option value="campanhaVacinacao">Campanha de Vacinação</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500">
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
