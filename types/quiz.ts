export interface Alternativa {
  letra: "A" | "B" | "C" | "D";
  texto: string;
}

export interface Questao {
  id: number;
  enunciado: string;
  alternativas: Alternativa[];
  correta: "A" | "B" | "C" | "D";
  explicacao: string;
}

export interface QuizConfig {
  conteudo: string;
  numQuestoes: number;
}

export interface RespostaUsuario {
  questaoId: number;
  alternativaEscolhida: "A" | "B" | "C" | "D";
  correta: boolean;
}
