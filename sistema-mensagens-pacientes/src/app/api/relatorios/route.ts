import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { carregarPacientes } from "@/app/lib/db";
import { normalizarNomePaciente } from "@/app/lib/email";
import { Patient } from "@/app/types";

const RELATORIOS_DIR = path.join(process.cwd(), "uploads", "relatorios");

export interface PacienteComRelatorio {
  paciente: Patient;
  pdf: string | null;
}

function listarPdfs(): string[] {
  if (!fs.existsSync(RELATORIOS_DIR)) {
    fs.mkdirSync(RELATORIOS_DIR, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(RELATORIOS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));
}

function encontrarPdf(nome: string, arquivos: string[]): string | null {
  const nomeNormalizado = normalizarNomePaciente(nome);
  return (
    arquivos.find((f) => {
      const semExtensao = f.replace(/\.pdf$/i, "");
      return (
        semExtensao === nomeNormalizado ||
        semExtensao.startsWith(nomeNormalizado + "_")
      );
    }) || null
  );
}

// GET /api/relatorios — retorna pacientes por convênio com status de PDF
export async function GET() {
  try {
    const pacientes = carregarPacientes();
    const arquivos = listarPdfs();

    const cbmdf: PacienteComRelatorio[] = pacientes
      .filter((p) => p.convenio === "CBMDF")
      .map((p) => ({ paciente: p, pdf: encontrarPdf(p.nome, arquivos) }));

    const fusex: PacienteComRelatorio[] = pacientes
      .filter((p) => p.convenio === "FUSEX")
      .map((p) => ({ paciente: p, pdf: encontrarPdf(p.nome, arquivos) }));

    return NextResponse.json({
      cbmdf,
      fusex,
      totalPdfs: arquivos.length,
      arquivos,
    });
  } catch (erro) {
    console.error("Erro ao carregar relatórios:", erro);
    return NextResponse.json(
      { error: "Falha ao carregar relatórios" },
      { status: 500 },
    );
  }
}
