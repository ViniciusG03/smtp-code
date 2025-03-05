import { NextResponse } from "next/server";
import { obterPacientePorId } from "@/app/lib/db";
import { enviarEmail } from "@/app/lib/email";

interface RouteParams {
  params: {
    id: string;
  };
}

interface SendRequestData {
  templateName: string;
}

// POST /api/send/[id] - Enviar uma mensagem para um paciente específico
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const dados = (await request.json()) as SendRequestData;
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
