import { NextResponse } from "next/server";
import { obterPacientePorId } from "@/lib/db";
import { enviarEmail } from "@/lib/email";

// POST /api/send/[id] - Enviar uma mensagem para um paciente específico
export async function POST(request, { params }) {
  try {
    const id = params.id;
    const dados = await request.json();
    const { templateName } = dados;

    if (!templateName) {
      return NextResponse.json(
        { error: "Template da mensagem não especificado" },
        { status: 400 }
      );
    }

    const paciente = obterPacientePorId(id);

    if (!paciente) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const sucesso = await enviarEmail(paciente, templateName);

    if (sucesso) {
      return NextResponse.json({
        success: true,
        message: `Mensagem enviada para ${paciente.email}`,
      });
    } else {
      return NextResponse.json(
        { error: "Erro ao enviar mensagem" },
        { status: 500 }
      );
    }
  } catch (erro) {
    console.error("Erro ao enviar mensagem:", erro);
    return NextResponse.json(
      { error: "Falha ao enviar mensagem" },
      { status: 500 }
    );
  }
}
