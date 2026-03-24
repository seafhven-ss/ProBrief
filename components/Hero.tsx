import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-6">
          <span className="text-neutral-400">奇点社</span>
          <span className="mx-2 text-neutral-700">|</span>
          Singularity Society
        </p>

        <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-[1.1]">
          Pro<span className="font-semibold">Brief</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 mb-2 max-w-lg mx-auto leading-relaxed font-light">
          一句话，生成结构化项目提案
        </p>
        <p className="text-sm text-neutral-600 mb-4 max-w-lg mx-auto tracking-wide">
          Turn one vague sentence into a structured project brief.
        </p>

        <p className="text-xs text-neutral-600 mb-12 max-w-md mx-auto leading-relaxed">
          <span className="text-neutral-500">面向零售、展览、快闪、商业空间的 AI 提案引擎</span>
          <br />
          <span className="tracking-wide">AI-powered brief structuring for retail, exhibition, pop-up &amp; commercial spaces.</span>
        </p>

        <Link
          href="/builder"
          className="group inline-flex items-center gap-3 px-8 py-4 border border-neutral-700 text-sm font-medium tracking-wide uppercase hover:bg-white hover:text-black transition-all duration-300"
        >
          <span className="flex flex-col items-center leading-tight">
            <span className="text-[13px]">开始构建</span>
            <span className="text-[10px] tracking-widest text-neutral-500 group-hover:text-black/60">START BUILDING</span>
          </span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
    </section>
  );
}
