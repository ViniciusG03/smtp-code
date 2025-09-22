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

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.",
        },
        { status: 400 }
      );
    }

    // Limitar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo permitido: 5MB" },
        { status: 400 }
      );
    }

    // Criar diretório do paciente se não existir
    const uploadDir = path.join(process.cwd(), "uploads", pacienteId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}_${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Retornar caminho relativo para salvar no banco
    const relativePath = path.join(pacienteId, fileName);

    console.log(`Arquivo salvo: ${filePath}`);
    console.log(`Caminho relativo: ${relativePath}`);

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
