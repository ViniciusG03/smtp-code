"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Patient, PatientData } from "@/app/types";

interface PatientFormProps {
  currentPatient: Patient | null;
  onSubmit: (data: PatientData) => void;
  onCancel: () => void;
}

export function PatientForm({
  currentPatient,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientData>({
    nome: "",
    email: "",
    dataNascimento: "",
    telefone: "",
    especialidades: [],
  });
  const [novaEspecialidade, setNovaEspecialidade] = useState<string>("");

  // Atualizar formulário quando currentPatient muda
  useEffect(() => {
    if (currentPatient) {
      setFormData({
        nome: currentPatient.nome,
        email: currentPatient.email,
        dataNascimento: currentPatient.dataNascimento
          ? typeof currentPatient.dataNascimento === "string"
            ? currentPatient.dataNascimento.split("T")[0]
            : ""
          : "",
        telefone: currentPatient.telefone || "",
        especialidades: currentPatient.especialidades || [],
      });
    } else {
      // Resetar formulário quando não há paciente atual
      setFormData({
        nome: "",
        email: "",
        dataNascimento: "",
        telefone: "",
        especialidades: [],
      });
    }
  }, [currentPatient]);

  // Manipular mudanças nos campos de texto
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manipular nova especialidade
  const handleEspecialidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNovaEspecialidade(e.target.value);
  };

  // Adicionar nova especialidade
  const handleAddEspecialidade = () => {
    if (novaEspecialidade.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        especialidades: [
          ...(prev.especialidades || []),
          novaEspecialidade.trim(),
        ],
      }));
      setNovaEspecialidade("");
    }
  };

  // Remover especialidade
  const handleRemoveEspecialidade = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades?.filter((_, i) => i !== index) || [],
    }));
  };

  // Manipular envio do formulário
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="nome"
          className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1">
          E-mail *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="dataNascimento"
          className="block text-sm font-medium text-gray-700 mb-1">
          Data de Nascimento
        </label>
        <input
          type="date"
          id="dataNascimento"
          name="dataNascimento"
          value={formData.dataNascimento ?? ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="telefone"
          className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          id="telefone"
          name="telefone"
          value={formData.telefone ?? ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Especialidades
        </label>
        <div className="flex mb-2">
          <input
            type="text"
            value={novaEspecialidade}
            onChange={handleEspecialidadeChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nova especialidade"
          />
          <button
            type="button"
            onClick={handleAddEspecialidade}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-r-md">
            Adicionar
          </button>
        </div>
        <div className="mt-2">
          {formData.especialidades && formData.especialidades.length > 0 ? (
            <ul className="bg-gray-50 p-2 rounded-md">
              {formData.especialidades.map((esp, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-1 p-1 bg-white rounded border border-gray-200">
                  <span>{esp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEspecialidade(index)}
                    className="text-red-500 hover:text-red-700">
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Nenhuma especialidade adicionada
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          {currentPatient ? "Atualizar" : "Cadastrar"}
        </button>

        {currentPatient && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
