export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    excluirPaciente(id);

    return NextResponse.json({
      success: true,
      message: "Paciente excluído com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao excluir paciente:", erro);

    if (erro.message === "Paciente não encontrado") {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao excluir paciente" },
      { status: 500 }
    );
  }
}
