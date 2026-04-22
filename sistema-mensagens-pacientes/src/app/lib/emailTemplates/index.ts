import { alertaHipo } from "./alertaHipo";
import { recadastramento } from "./recadastramento";
import { neuronupParceria } from "./neuronupParceria";
import { conviteBetaApp } from "./conviteBetaApp";
import { regraCondutas } from "./regraCondutas";
import { calendarioFeriados } from "./calendarioFeriados";
import { palestraAutismo } from "./palestraAutismo";
import { relatorioConvenio } from "./relatorioConvenio";

export const templates = {
  alertaHipo,
  recadastramento,
  neuronupParceria,
  conviteBetaApp,
  regraCondutas,
  calendarioFeriados,
  palestraAutismo,
  relatorioConvenio,
};

export type TemplateName = keyof typeof templates;