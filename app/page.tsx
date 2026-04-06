"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizConfig } from "@/types/quiz";

const OPCOES_QUESTOES = [5, 10, 15, 20];

export default function HomePage() {
  const router = useRouter();
  const [conteudo, setConteudo] = useState("");
  const [numQuestoes, setNumQuestoes] = useState(10);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!conteudo.trim()) {
      setErro("Por favor, insira um tema ou conteúdo de estudo.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/gerar-questoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: conteudo.trim(), numQuestoes } as QuizConfig),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar questões");
      }

      sessionStorage.setItem("questoes", JSON.stringify(data.questoes));
      sessionStorage.setItem("conteudo", conteudo.trim());
      router.push("/quiz");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">QuizIA</h1>
          <p className="text-slate-400 text-lg">
            Transforme qualquer conteúdo em um simulado completo
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Textarea */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tema ou conteúdo de estudo
              </label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder={"Cole aqui um resumo, capítulo de livro, anotações de aula ou apenas escreva o tema que deseja estudar.\n\nExemplo: \"Revolução Francesa: causas, desenvolvimento e consequências\""}
                rows={8}
                className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed transition"
                disabled={carregando}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-500">
                  {conteudo.length} caracteres
                </span>
              </div>
            </div>

            {/* Número de questões */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Quantidade de questões
              </label>
              <div className="grid grid-cols-4 gap-2">
                {OPCOES_QUESTOES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumQuestoes(n)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      numQuestoes === n
                        ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-slate-900/60 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                    }`}
                    disabled={carregando}
                  >
                    {n} questões
                  </button>
                ))}
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {erro}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={carregando || !conteudo.trim()}
              className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Gerando {numQuestoes} questões...
                </span>
              ) : (
                "Gerar Quiz →"
              )}
            </button>
          </form>

          {carregando && (
            <p className="text-center text-xs text-slate-500 mt-4">
              A IA está analisando o conteúdo e criando questões personalizadas. Isso pode levar alguns segundos.
            </p>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by OpenAI · Questões geradas com IA para maximizar seu aprendizado
        </p>
      </div>
    </main>
  );
}
