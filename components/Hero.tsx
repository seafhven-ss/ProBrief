import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 py-20 max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
        ProBrief
      </h1>
      <p className="text-lg text-gray-500 mb-8 max-w-md">
        生成专业的项目提案和需求文档。输入关键信息，AI 帮你快速构建完整结构。
      </p>
      <Link
        href="/builder"
        className="px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        开始构建
      </Link>
    </section>
  );
}
