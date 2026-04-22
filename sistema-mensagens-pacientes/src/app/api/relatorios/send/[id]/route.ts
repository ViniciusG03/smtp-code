import { NextResponse } from "next/server";
import { obterPacientePorId } from "@/app/lib/db";
import { enviarEmail } from "@/app/lib/email";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/relatorios/send/[id] — envia relatório para um paciente específico
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const paciente = obterPacientePorId(params.id);

    if (!paciente) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 },
      );
    }

    if (!paciente.convenio) {
      return NextResponse.json(
        { error: "Paciente não possui convênio cadastrado" },
        { status: 400 },
      );
    }

    const sucesso = await enviarEmail(paciente, "relatorioConvenio");

    if (sucesso) {
      return NextResponse.json({
        success: true,
        message: `Relatório enviado para ${paciente.email}`,
      });
    } else {
      return NextResponse.json(
        { error: "Erro ao enviar relatório. Verifique se o PDF foi encontrado." },
        { status: 500 },
      );
    }
  } catch (erro) {
    console.error("Erro ao enviar relatório:", erro);
    return NextResponse.json(
      { error: "Falha ao enviar relatório" },
      { status: 500 },
    );
  }
}
