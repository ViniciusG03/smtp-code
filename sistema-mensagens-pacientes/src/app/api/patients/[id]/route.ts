// Modificar o arquivo src/app/api/patients/[id]/route.ts

import { NextResponse } from "next/server";
import {
  excluirPaciente,
  obterPacientePorId,
  atualizarPaciente,
} from "@/app/lib/db";
import { PatientData } from "@/app/types";

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/patients/[id] - Atualizar paciente existente
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const paciente = obterPacientePorId(id);

    if (!paciente) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const dados = (await request.json()) as PatientData;
    const { nome, email, dataNascimento, telefone, especialidades } = dados;

    if (!nome || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const pacienteAtualizado = atualizarPaciente(id, {
      nome,
      email,
      dataNascimento: dataNascimento || null,
      telefone: telefone || null,
      especialidades: especialidades || [], // Adicionar especialidades
    });

    return NextResponse.json(pacienteAtualizado);
  } catch (erro: any) {
    console.error("Erro ao atualizar paciente:", erro);

    if (erro.message === "Paciente não encontrado") {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    if (erro.message === "O email informado já está cadastrado") {
      return NextResponse.json({ error: erro.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Falha ao atualizar paciente" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    excluirPaciente(id);

    return NextResponse.json({
      success: true,
      message: "Paciente excluído com sucesso",
    });
  } catch (erro: any) {
    console.error("Erro ao excluir paciente:", erro);

    if (erro.message === "Paciente não encontrado") {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao excluir paciente" },
      { status: 500 }
    );
  }
}
