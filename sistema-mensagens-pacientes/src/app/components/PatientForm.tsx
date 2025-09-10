import { useState, useEffect } from "react";
import { Patient, PatientData } from "@/app/types";

interface PatientFormProps {
  currentPatient: Patient | null;
  onSubmit: (data: PatientData) => void;
  onCancel: () => void;
}

// Componente de upload de arquivos
interface FileUploadProps {
  pacienteId: string | null;
  anexosAtuais: string[];
  onFileUploaded: (caminho: string) => void;
  onFileRemoved: (caminho: string) => void;
}

const FileUpload = ({
  pacienteId,
  anexosAtuais,
  onFileUploaded,
  onFileRemoved,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !pacienteId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pacienteId", pacienteId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        onFileUploaded(result.path);
        // Limpar o input
        event.target.value = "";
      } else {
        alert("Erro no upload: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro no upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (caminho: string) => {
    if (window.confirm("Tem certeza que deseja remover este arquivo?")) {
      onFileRemoved(caminho);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar Anexo
        </label>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading || !pacienteId}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {uploading && (
          <p className="text-sm text-blue-600 mt-1">Enviando arquivo...</p>
        )}
        {!pacienteId && (
          <p className="text-sm text-gray-500 mt-1">
            Salve o paciente primeiro para adicionar anexos
          </p>
        )}
      </div>

      {/* Lista de arquivos anexados */}
      {anexosAtuais.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivos Anexados
          </label>
          <div className="space-y-2">
            {anexosAtuais.map((anexo, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600 truncate">
                  {anexo.split("/").pop()}{" "}
                  {/* Mostra apenas o nome do arquivo */}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(anexo)}
                  className="text-red-600 hover:text-red-800 text-sm">
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PatientForm = ({
  currentPatient,
  onSubmit,
  onCancel,
}: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientData>({
    nome: "",
    email: "",
    dataNascimento: null,
    telefone: null,
    especialidades: [],
    anexos: [], // Adicionar anexos ao estado
  });

  const [anexos, setAnexos] = useState<string[]>([]);

  // Carregar dados do paciente atual quando o componente monta ou quando currentPatient muda
  useEffect(() => {
    if (currentPatient) {
      setFormData({
        nome: currentPatient.nome || "",
        email: currentPatient.email || "",
        dataNascimento: currentPatient.dataNascimento || null,
        telefone: currentPatient.telefone || null,
        especialidades: currentPatient.especialidades || [],
        anexos: currentPatient.anexos || [], // Carregar anexos existentes
      });
      setAnexos(currentPatient.anexos || []);
    } else {
      // Resetar formulário para novo paciente
      setFormData({
        nome: "",
        email: "",
        dataNascimento: null,
        telefone: null,
        especialidades: [],
        anexos: [],
      });
      setAnexos([]);
    }
  }, [currentPatient]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleEspecialidadesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const especialidades = e.target.value
      .split(",")
      .map((esp) => esp.trim())
      .filter((esp) => esp.length > 0);

    setFormData((prev) => ({
      ...prev,
      especialidades,
    }));
  };

  const handleFileUploaded = (caminho: string) => {
    const novosAnexos = [...anexos, caminho];
    setAnexos(novosAnexos);
    setFormData((prev) => ({
      ...prev,
      anexos: novosAnexos,
    }));
  };

  const handleFileRemoved = (caminho: string) => {
    const novosAnexos = anexos.filter((anexo) => anexo !== caminho);
    setAnexos(novosAnexos);
    setFormData((prev) => ({
      ...prev,
      anexos: novosAnexos,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.nome.trim() || !formData.email.trim()) {
      alert("Nome e email são obrigatórios");
      return;
    }

    // Incluir anexos nos dados enviados
    const dadosParaEnvio = {
      ...formData,
      anexos: anexos,
    };

    onSubmit(dadosParaEnvio);
  };

  const handleCancel = () => {
    setFormData({
      nome: "",
      email: "",
      dataNascimento: null,
      telefone: null,
      especialidades: [],
      anexos: [],
    });
    setAnexos([]);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo Nome */}
      <div>
        <label
          htmlFor="nome"
          className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo Data de Nascimento */}
      <div>
        <label
          htmlFor="dataNascimento"
          className="block text-sm font-medium text-gray-700 mb-1">
          Data de Nascimento
        </label>
        <input
          type="date"
          id="dataNascimento"
          name="dataNascimento"
          value={formData.dataNascimento || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo Telefone */}
      <div>
        <label
          htmlFor="telefone"
          className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          id="telefone"
          name="telefone"
          value={formData.telefone || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo Especialidades */}
      <div>
        <label
          htmlFor="especialidades"
          className="block text-sm font-medium text-gray-700 mb-1">
          Especialidades (separadas por vírgula)
        </label>
        <input
          type="text"
          id="especialidades"
          name="especialidades"
          value={formData.especialidades?.join(", ") || ""}
          onChange={handleEspecialidadesChange}
          placeholder="Ex: Cardiologia, Neurologia"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Seção de Upload de Arquivos */}
      <div className="border-t border-gray-200 pt-4">
        <FileUpload
          pacienteId={currentPatient?.id || null}
          anexosAtuais={anexos}
          onFileUploaded={handleFileUploaded}
          onFileRemoved={handleFileRemoved}
        />
      </div>

      {/* Botões */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          {currentPatient ? "Atualizar Paciente" : "Cadastrar Paciente"}
        </button>

        {currentPatient && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
