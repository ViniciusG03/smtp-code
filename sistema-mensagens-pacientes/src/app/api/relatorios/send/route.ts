import { NextResponse } from "next/server";
import { carregarPacientes } from "@/app/lib/db";
import { enviarEmail } from "@/app/lib/email";
import { EmailResultado } from "@/app/types";

interface SendRelatoriosRequest {
  convenio: "CBMDF" | "FUSEX";
}

// POST /api/relatorios/send — envia relatórios para todos os pacientes de um convênio
export async function POST(request: Request) {
  try {
    const dados = (await request.json()) as SendRelatoriosRequest;
    const { convenio } = dados;

    if (!convenio || !["CBMDF", "FUSEX"].includes(convenio)) {
      return NextResponse.json(
        { error: "Convênio inválido. Use CBMDF ou FUSEX." },
        { status: 400 },
      );
    }

    const pacientes = carregarPacientes().filter(
      (p) => p.convenio === convenio,
    );

    if (pacientes.length === 0) {
      return NextResponse.json(
        { error: `Nenhum paciente encontrado para o convênio ${convenio}` },
        { status: 404 },
      );
    }

    const resultados: EmailResultado[] = [];

    for (const paciente of pacientes) {
      const sucesso = await enviarEmail(paciente, "relatorioConvenio");
      resultados.push({ id: paciente.id, email: paciente.email, sucesso });
    }

    const contagemSucesso = resultados.filter((r) => r.sucesso).length;
    const contagemFalhas = resultados.length - contagemSucesso;

    return NextResponse.json({
      sucesso: contagemFalhas === 0,
      convenio,
      totalResultados: resultados.length,
      contagemSucesso,
      contagemFalhas,
      resultados,
    });
  } catch (erro) {
    console.error("Erro ao enviar relatórios em massa:", erro);
    return NextResponse.json(
      { error: "Falha ao enviar relatórios" },
      { status: 500 },
    );
  }
}
