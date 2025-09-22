import { useState } from "react";
import { Patient } from "@/app/types";

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onSendMessage: (id: string) => void;
}

// Componente para mostrar anexos de um paciente
interface AttachmentsDisplayProps {
  anexos: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const AttachmentsDisplay = ({
  anexos,
  isExpanded,
  onToggle,
}: AttachmentsDisplayProps) => {
  if (!anexos || anexos.length === 0) {
    return <span className="text-xs text-gray-400 italic">Nenhum anexo</span>;
  }

  const formatFileName = (path: string) => {
    return path.split("/").pop() || path; // Pega apenas o nome do arquivo
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📎";
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-green-600">
          {anexos.length} arquivo{anexos.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={onToggle}
          className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
          {isExpanded ? "▼ Ocultar" : "▶ Ver arquivos"}
        </button>
      </div>

      {isExpanded && (
        <div className="ml-2 space-y-1 max-h-32 overflow-y-auto">
          {anexos.map((anexo, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-xs bg-gray-50 p-2 rounded">
              <span>{getFileIcon(formatFileName(anexo))}</span>
              <span
                className="truncate flex-1 text-gray-700"
                title={formatFileName(anexo)}>
                {formatFileName(anexo)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PatientList = ({
  patients,
  onEdit,
  onDelete,
  onSendMessage,
}: PatientListProps) => {
  const [expandedAttachments, setExpandedAttachments] = useState<Set<string>>(
    new Set()
  );

  const toggleAttachments = (patientId: string) => {
    const newExpanded = new Set(expandedAttachments);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedAttachments(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum paciente cadastrado.</p>
        <p className="text-sm">
          Use o formulário ao lado para adicionar um novo paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          {/* Cabeçalho do paciente */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {patient.nome}
              </h3>
              <p className="text-sm text-gray-600 truncate">{patient.email}</p>
              {patient.telefone && (
                <p className="text-sm text-gray-500">📞 {patient.telefone}</p>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(patient)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Editar paciente">
                ✏️ Editar
              </button>
              <button
                onClick={() => onSendMessage(patient.id)}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Enviar mensagem">
                📧 Enviar
              </button>
              <button
                onClick={() => onDelete(patient.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Excluir paciente">
                🗑️ Excluir
              </button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Coluna esquerda */}
            <div className="space-y-2">
              {patient.dataNascimento && (
                <div>
                  <span className="font-medium text-gray-700">
                    Data de nascimento:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(patient.dataNascimento)}
                  </span>
                </div>
              )}

              {patient.especialidades && patient.especialidades.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">
                    Especialidades:
                  </span>
                  <div className="ml-2 flex flex-wrap gap-1 mt-1">
                    {patient.especialidades.map((esp, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna direita */}
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">
                  Cadastrado em:
                </span>
                <span className="ml-2 text-gray-600">
                  {formatDate(patient.dataCadastro)}
                </span>
              </div>

              {patient.dataAtualizacao && (
                <div>
                  <span className="font-medium text-gray-700">
                    Atualizado em:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(patient.dataAtualizacao)}
                  </span>
                </div>
              )}

              {/* Seção de anexos */}
              <div>
                <span className="font-medium text-gray-700">Anexos:</span>
                <div className="ml-2 mt-1">
                  <AttachmentsDisplay
                    anexos={patient.anexos || []}
                    isExpanded={expandedAttachments.has(patient.id)}
                    onToggle={() => toggleAttachments(patient.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
