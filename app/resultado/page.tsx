"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Questao, RespostaUsuario } from "@/types/quiz";

export default function ResultadoPage() {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<RespostaUsuario[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [mostrarRevisao, setMostrarRevisao] = useState(false);

  useEffect(() => {
    const storedQuestoes = sessionStorage.getItem("questoes");
    const storedRespostas = sessionStorage.getItem("respostas");

    if (!storedQuestoes || !storedRespostas) {
      router.replace("/");
      return;
    }

    try {
      setQuestoes(JSON.parse(storedQuestoes));
      setRespostas(JSON.parse(storedRespostas));
      setCarregado(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!carregado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Carregando resultado...</div>
      </div>
    );
  }

  const acertos = respostas.filter((r) => r.correta).length;
  const erros = respostas.length - acertos;
  const percentual = Math.round((acertos / respostas.length) * 100);

  function getNivel(): { label: string; cor: string; emoji: string } {
    if (percentual >= 90) return { label: "Excelente!", cor: "text-emerald-400", emoji: "🏆" };
    if (percentual >= 75) return { label: "Muito bom!", cor: "text-green-400", emoji: "🎯" };
    if (percentual >= 60) return { label: "Bom resultado", cor: "text-yellow-400", emoji: "👍" };
    if (percentual >= 40) return { label: "Pode melhorar", cor: "text-orange-400", emoji: "📚" };
    return { label: "Continue estudando", cor: "text-red-400", emoji: "💪" };
  }

  const nivel = getNivel();

  function handleNovoQuiz() {
    sessionStorage.removeItem("questoes");
    sessionStorage.removeItem("respostas");
    sessionStorage.removeItem("conteudo");
    router.push("/");
  }

  function handleRefazer() {
    sessionStorage.removeItem("respostas");
    router.push("/quiz");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header resultado */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{nivel.emoji}</div>
          <h1 className={`text-3xl font-bold mb-1 ${nivel.cor}`}>{nivel.label}</h1>
          <p className="text-slate-400 text-sm">Você concluiu o simulado</p>
        </div>

        {/* Card principal de score */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-4 shadow-xl">
          {/* Percentual grande */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={percentual >= 60 ? "#6366f1" : "#ef4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentual / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{percentual}%</span>
                <span className="text-xs text-slate-400">acerto</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{respostas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Questões</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{acertos}</p>
              <p className="text-xs text-slate-400 mt-0.5">Acertos</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{erros}</p>
              <p className="text-xs text-slate-400 mt-0.5">Erros</p>
            </div>
          </div>

          {/* Barra visual de acertos */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Desempenho</span>
              <span>{acertos}/{respostas.length}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        </div>

        {/* Revisão de questões */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden mb-4">
          <button
            onClick={() => setMostrarRevisao(!mostrarRevisao)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-700/20 transition-colors"
          >
            <span className="font-medium text-slate-200">Revisão das questões</span>
            <span className="text-slate-400 text-sm">
              {mostrarRevisao ? "▲ Ocultar" : "▼ Ver todas"}
            </span>
          </button>

          {mostrarRevisao && (
            <div className="border-t border-slate-700/50 divide-y divide-slate-700/30">
              {questoes.map((questao, idx) => {
                const resposta = respostas.find((r) => r.questaoId === questao.id);
                const acertou = resposta?.correta;

                return (
                  <div key={questao.id} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        acertou ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {acertou ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-200 font-medium leading-snug">
                          <span className="text-slate-500 mr-1">{idx + 1}.</span>
                          {questao.enunciado}
                        </p>

                        <div className="mt-3 space-y-1.5">
                          {questao.alternativas.map((alt) => {
                            const eCorreta = alt.letra === questao.correta;
                            const foiSelecionada = alt.letra === resposta?.alternativaEscolhida;
                            const eErro = foiSelecionada && !eCorreta;

                            if (!eCorreta && !eErro) return null;

                            return (
                              <div
                                key={alt.letra}
                                className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                                  eCorreta
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                <span className="font-bold">{alt.letra})</span>
                                <span>{alt.texto}</span>
                                {eCorreta && <span className="ml-auto font-medium shrink-0">✓ Correta</span>}
                                {eErro && <span className="ml-auto font-medium shrink-0">✗ Sua resposta</span>}
                              </div>
                            );
                          })}
                        </div>

                        {!acertou && (
                          <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-1">
                            💡 {questao.explicacao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRefazer}
            className="py-3.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-medium text-sm transition-all cursor-pointer"
          >
            ↩ Refazer quiz
          </button>
          <button
            onClick={handleNovoQuiz}
            className="py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all cursor-pointer"
          >
            Novo quiz →
          </button>
        </div>
      </div>
    </main>
  );
}
