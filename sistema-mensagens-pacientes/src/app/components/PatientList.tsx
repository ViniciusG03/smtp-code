"use client";

import { Patient } from "@/app/types";

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onSendMessage: (id: string) => void;
}

export function PatientList({
  patients,
  onEdit,
  onDelete,
  onSendMessage,
}: PatientListProps) {
  if (!patients || patients.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-center">
        Nenhum paciente cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              E-mail
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especialidades
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {patient.nome}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{patient.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {patient.telefone || "—"}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {patient.especialidades &&
                  patient.especialidades.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patient.especialidades.map((esp, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {esp}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onSendMessage(patient.id)}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded mr-2">
                  Mensagem
                </button>
                <button
                  onClick={() => onEdit(patient)}
                  className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded mr-2">
                  Editar
                </button>
                <button
                  onClick={() => onDelete(patient.id)}
                  className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
