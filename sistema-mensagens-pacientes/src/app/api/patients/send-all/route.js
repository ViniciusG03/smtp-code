import { NextResponse } from "next/server";
import { carregarPacientes } from "@/lib/db";
import { enviarEmailEmMassa } from "@/lib/email";

// POST /api/send-all - Enviar uma mensagem para todos os pacientes
export async function POST(request) {
  try {
    const dados = await request.json();
    const { templateName } = dados;

    if (!templateName) {
      return NextResponse.json(
        { error: "Template da mensagem não especificado" },
        { status: 400 }
      );
    }

    const pacientes = carregarPacientes();

    if (pacientes.length === 0) {
      return NextResponse.json(
        { error: "Nenhum paciente encontrado" },
        { status: 404 }
      );
    }

    const resultado = await enviarEmailEmMassa(pacientes, templateName);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("Erro ao enviar mensagens em massa:", erro);
    return NextResponse.json(
      { error: "Falha ao enviar mensagens em massa" },
      { status: 500 }
    );
  }
}
