import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { Questao } from "@/types/quiz";

const client = new OpenAI();

const SYSTEM_PROMPT = `Você é um especialista em educação e avaliação pedagógica. Sua tarefa é gerar questões de múltipla escolha de alta qualidade a partir de conteúdo fornecido pelo usuário.

Regras obrigatórias:
- Cada questão deve ter exatamente 4 alternativas (A, B, C, D)
- Apenas UMA alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis e elaboradas, nunca óbvias
- O nível de dificuldade deve ser coerente com o conteúdo fornecido
- As perguntas devem cobrir diferentes aspectos e profundidades do conteúdo
- Evite perguntas triviais ou que dependam de memorização pura
- Prefira perguntas que exijam compreensão, aplicação ou análise

Retorne APENAS um JSON válido, sem texto adicional, no seguinte formato:
{
  "questoes": [
    {
      "id": 1,
      "enunciado": "Texto da pergunta",
      "alternativas": [
        { "letra": "A", "texto": "Primeira alternativa" },
        { "letra": "B", "texto": "Segunda alternativa" },
        { "letra": "C", "texto": "Terceira alternativa" },
        { "letra": "D", "texto": "Quarta alternativa" }
      ],
      "correta": "A",
      "explicacao": "Explicação breve de por que esta é a resposta correta"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { conteudo, numQuestoes } = await request.json();

    if (!conteudo || !numQuestoes) {
      return NextResponse.json(
        { error: "Conteúdo e número de questões são obrigatórios" },
        { status: 400 }
      );
    }

    if (numQuestoes < 1 || numQuestoes > 20) {
      return NextResponse.json(
        { error: "Número de questões deve ser entre 1 e 20" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Gere exatamente ${numQuestoes} questões de múltipla escolha com base no seguinte conteúdo:\n\n${conteudo}`,
        },
      ],
    });

    const jsonText = response.choices[0]?.message?.content?.trim();
    if (!jsonText) throw new Error("Resposta inválida da API");

    const parsed = JSON.parse(jsonText) as { questoes: Questao[] };

    if (!parsed.questoes || parsed.questoes.length === 0) {
      throw new Error("Nenhuma questão gerada");
    }

    return NextResponse.json({ questoes: parsed.questoes });
  } catch (error) {
    console.error("Erro ao gerar questões:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erro ao processar resposta da IA. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao gerar questões. Tente novamente." },
      { status: 500 }
    );
  }
}
