// Modificar o arquivo src/app/api/patients/route.ts

import { NextResponse } from "next/server";
import { carregarPacientes, criarPaciente } from "@/app/lib/db";

// Tipos para os dados do paciente
interface PatientData {
  nome: string;
  email: string;
  dataNascimento?: string | null;
  telefone?: string | null;
  especialidades?: string[];
}

// GET /api/patients - Obter todos os pacientes
export async function GET() {
  try {
    const pacientes = carregarPacientes();
    return NextResponse.json(pacientes);
  } catch (erro) {
    console.error("Erro ao carregar pacientes:", erro);
    return NextResponse.json(
      { error: "Falha ao carregar pacientes" },
      { status: 500 }
    );
  }
}

// POST /api/patients - Criar um novo paciente
export async function POST(request: Request) {
  try {
    const dados = (await request.json()) as PatientData;
    const { nome, email, dataNascimento, telefone, especialidades } = dados;

    if (!nome || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const novoPaciente = criarPaciente({
      nome,
      email,
      dataNascimento: dataNascimento || null,
      telefone: telefone || null,
      especialidades: especialidades || [],
    });

    return NextResponse.json(novoPaciente, { status: 201 });
  } catch (erro: any) {
    console.error("Erro ao criar paciente:", erro);

    if (erro.message === "Este e-mail já está cadastrado") {
      return NextResponse.json({ error: erro.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Falha ao criar paciente" },
      { status: 500 }
    );
  }
}
