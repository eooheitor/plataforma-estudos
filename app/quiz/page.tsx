"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Questao, RespostaUsuario } from "@/types/quiz";

export default function QuizPage() {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState<RespostaUsuario[]>([]);
  const [selecionada, setSelecionada] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("questoes");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as Questao[];
      if (!parsed || parsed.length === 0) {
        router.replace("/");
        return;
      }
      setQuestoes(parsed);
      setCarregado(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!carregado || questoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  const questaoAtual = questoes[indiceAtual];
  const totalQuestoes = questoes.length;
  const progresso = ((indiceAtual) / totalQuestoes) * 100;

  function handleSelecionar(letra: "A" | "B" | "C" | "D") {
    if (confirmada) return;
    setSelecionada(letra);
  }

  function handleConfirmar() {
    if (!selecionada || confirmada) return;
    setConfirmada(true);
  }

  function handleProxima() {
    if (!selecionada) return;

    const resposta: RespostaUsuario = {
      questaoId: questaoAtual.id,
      alternativaEscolhida: selecionada,
      correta: selecionada === questaoAtual.correta,
    };

    const novasRespostas = [...respostas, resposta];

    if (indiceAtual + 1 >= totalQuestoes) {
      sessionStorage.setItem("respostas", JSON.stringify(novasRespostas));
      router.push("/resultado");
    } else {
      setRespostas(novasRespostas);
      setIndiceAtual(indiceAtual + 1);
      setSelecionada(null);
      setConfirmada(false);
    }
  }

  function getEstiloAlternativa(letra: "A" | "B" | "C" | "D") {
    const base = "w-full text-left px-4 py-3.5 rounded-xl border text-sm leading-relaxed transition-all duration-150 ";

    if (!confirmada) {
      if (selecionada === letra) {
        return base + "border-indigo-500 bg-indigo-500/15 text-white";
      }
      return base + "border-slate-600 bg-slate-900/40 text-slate-300 hover:border-slate-400 hover:bg-slate-900/60 hover:text-white cursor-pointer";
    }

    // Modo confirmado: mostrar apenas se a resposta está correta ou errada
    if (letra === questaoAtual.correta) {
      return base + "border-emerald-500 bg-emerald-500/15 text-emerald-300";
    }
    if (selecionada === letra && letra !== questaoAtual.correta) {
      return base + "border-red-500 bg-red-500/15 text-red-400";
    }
    return base + "border-slate-700 bg-slate-900/20 text-slate-500";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header com progresso */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push("/")}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              ← Sair
            </button>
            <span className="text-sm font-medium text-slate-300">
              {indiceAtual + 1} / {totalQuestoes}
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Questão */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-4 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                {indiceAtual + 1}
              </span>
              <p className="text-white text-base leading-relaxed font-medium pt-1">
                {questaoAtual.enunciado}
              </p>
            </div>

            {/* Alternativas */}
            <div className="space-y-2.5 mt-5">
              {questaoAtual.alternativas.map((alt) => (
                <button
                  key={alt.letra}
                  onClick={() => handleSelecionar(alt.letra)}
                  className={getEstiloAlternativa(alt.letra)}
                  disabled={confirmada}
                >
                  <span className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                      {alt.letra}
                    </span>
                    <span>{alt.texto}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Feedback após confirmar */}
            {confirmada && (
              <div className={`mt-5 rounded-xl p-4 border text-sm leading-relaxed ${
                selecionada === questaoAtual.correta
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}>
                <p className="font-semibold mb-1">
                  {selecionada === questaoAtual.correta ? "✓ Resposta correta!" : "✗ Resposta incorreta"}
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {questaoAtual.explicacao}
                </p>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            {!confirmada ? (
              <button
                onClick={handleConfirmar}
                disabled={!selecionada}
                className="flex-1 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Confirmar resposta
              </button>
            ) : (
              <button
                onClick={handleProxima}
                className="flex-1 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all cursor-pointer"
              >
                {indiceAtual + 1 >= totalQuestoes ? "Ver resultado →" : "Próxima questão →"}
              </button>
            )}
          </div>

          {/* Indicador modo prova */}
          {!confirmada && (
            <p className="text-center text-xs text-slate-600 mt-4">
              Modo prova · Escolha uma alternativa e confirme para avançar
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
