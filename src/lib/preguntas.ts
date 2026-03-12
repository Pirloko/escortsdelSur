import type { CorrectOption } from "@/types/quiz";

export interface ParsedQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
}

const PREGUNTAS_URL = "/preguntas.txt";

/** Normaliza texto para comparar respuesta con opciones. */
function normalizeOption(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Parsea el contenido de preguntas.txt.
 * Acepta:
 * - "Respuesta correcta: A" (o B, C, D)
 * - "Respuesta: [texto] | dificultad: ..." (infiere la letra comparando con las opciones)
 */
function parsePreguntasText(text: string): ParsedQuestion[] {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const result: ParsedQuestion[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) continue;

    const optionLines = lines.filter((l) => /^[A-D]\)\s*.+/.test(l));
    if (optionLines.length !== 4) continue;

    const questionLine = lines.find((l) => /^\d+\.\s+/.test(l) && !l.startsWith("Respuesta"));
    if (!questionLine) continue;

    const question_text = questionLine.replace(/^\d+\.\s*/, "").trim();
    const option_a = (optionLines.find((l) => l.startsWith("A)")) ?? "").replace(/^A\)\s*/, "").trim();
    const option_b = (optionLines.find((l) => l.startsWith("B)")) ?? "").replace(/^B\)\s*/, "").trim();
    const option_c = (optionLines.find((l) => l.startsWith("C)")) ?? "").replace(/^C\)\s*/, "").trim();
    const option_d = (optionLines.find((l) => l.startsWith("D)")) ?? "").replace(/^D\)\s*/, "").trim();

    if (!question_text || !option_a || !option_b || !option_c || !option_d) continue;

    let correct_option: CorrectOption = "A";
    const correctLetter = lines.find((l) => /^Respuesta correcta:\s*([A-D])$/i.test(l))?.match(/^Respuesta correcta:\s*([A-D])$/i)?.[1]?.toUpperCase();
    if (correctLetter && ["A", "B", "C", "D"].includes(correctLetter)) {
      correct_option = correctLetter as CorrectOption;
    } else {
      const respLine = lines.find((l) => /^Respuesta:\s*.+/.test(l));
      const answerText = respLine ? respLine.replace(/^Respuesta:\s*/, "").trim().split(/\s*\|\s*/)[0]?.trim() ?? "" : "";
      const norm = normalizeOption(answerText);
      if (norm && [option_a, option_b, option_c, option_d].some((o) => normalizeOption(o) === norm)) {
        if (normalizeOption(option_a) === norm) correct_option = "A";
        else if (normalizeOption(option_b) === norm) correct_option = "B";
        else if (normalizeOption(option_c) === norm) correct_option = "C";
        else if (normalizeOption(option_d) === norm) correct_option = "D";
      }
    }

    if (!["A", "B", "C", "D"].includes(correct_option)) continue;

    result.push({
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
    });
  }

  return result;
}

/** Carga preguntas desde /preguntas.txt y las parsea. */
export async function loadPreguntas(): Promise<ParsedQuestion[]> {
  const res = await fetch(PREGUNTAS_URL);
  if (!res.ok) throw new Error("No se pudo cargar preguntas.txt");
  const text = await res.text();
  return parsePreguntasText(text);
}

/** Elige n preguntas al azar sin repetir. */
export function pickRandomQuestions(questions: ParsedQuestion[], n: number): ParsedQuestion[] {
  if (questions.length <= n) return [...questions];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
