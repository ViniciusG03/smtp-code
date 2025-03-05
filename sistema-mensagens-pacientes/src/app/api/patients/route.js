import { NextResponse } from "next/server";
import { carregarPacientes, criarPaciente } from "@/lib/db";

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
export async function POST(request) {
  try {
    const dados = await request.json();
    const { nome, email, dataNascimento, telefone } = dados;

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
    });

    return NextResponse.json(novoPaciente, { status: 201 });
  } catch (erro) {
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
