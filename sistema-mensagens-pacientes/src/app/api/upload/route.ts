import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pacienteId = formData.get("pacienteId") as string;

    if (!file || !pacienteId) {
      return NextResponse.json(
        { error: "Arquivo e ID do paciente são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar diretório do paciente se não existir
    const uploadDir = path.join(process.cwd(), "uploads", pacienteId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, buffer);

    // Retornar caminho relativo para salvar no banco
    const relativePath = path.join(pacienteId, file.name);

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename: file.name,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
