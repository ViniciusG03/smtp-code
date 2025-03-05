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
  });

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
      });
    } else {
      // Resetar formulário quando não há paciente atual
      setFormData({
        nome: "",
        email: "",
        dataNascimento: "",
        telefone: "",
      });
    }
  }, [currentPatient]);

  // Manipular mudanças nos campos
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
