import { NextRequest, NextResponse } from "next/server";
import {
  obterPacientePorId,
  atualizarPaciente,
  excluirPaciente,
} from "@/app/lib/db";
import { PatientData } from "@/app/types";

// GET /api/patients/[id] - Obter um paciente específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // CORREÇÃO: await params

    const paciente = obterPacientePorId(id);

    if (!paciente) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(paciente);
  } catch (erro) {
    console.error("Erro ao obter paciente:", erro);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Atualizar um paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // CORREÇÃO: await params
    const dadosPaciente: Partial<PatientData> = await request.json();

    // Validação básica
    if (dadosPaciente.email && typeof dadosPaciente.email !== "string") {
      return NextResponse.json(
        { error: "Email deve ser uma string válida" },
        { status: 400 }
      );
    }

    if (dadosPaciente.nome && typeof dadosPaciente.nome !== "string") {
      return NextResponse.json(
        { error: "Nome deve ser uma string válida" },
        { status: 400 }
      );
    }

    // Validar anexos se fornecidos
    if (dadosPaciente.anexos && !Array.isArray(dadosPaciente.anexos)) {
      return NextResponse.json(
        { error: "Anexos devem ser um array de strings" },
        { status: 400 }
      );
    }

    const pacienteAtualizado = atualizarPaciente(id, dadosPaciente);

    return NextResponse.json({
      message: "Paciente atualizado com sucesso",
      ...pacienteAtualizado,
    });
  } catch (erro: any) {
    console.error("Erro ao atualizar paciente:", erro);

    if (erro.message === "Paciente não encontrado.") {
      return NextResponse.json({ error: erro.message }, { status: 404 });
    }

    if (erro.message === "O email informado já está cadastrado.") {
      return NextResponse.json({ error: erro.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Excluir um paciente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // CORREÇÃO: await params

    excluirPaciente(id);

    return NextResponse.json({
      message: "Paciente excluído com sucesso",
    });
  } catch (erro: any) {
    console.error("Erro ao excluir paciente:", erro);

    if (erro.message === "Paciente não encontrado.") {
      return NextResponse.json({ error: erro.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
