import BriefForm from "@/components/BriefForm";
import Link from "next/link";

export default function BuilderPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-tight">
            Pro<span className="font-semibold">Brief</span>
          </Link>
          <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 border border-neutral-800 px-3 py-1">
            Demo
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-3">
            From a vague idea to a <span className="font-semibold">structured brief</span>
          </h1>
          <p className="text-neutral-500 text-sm max-w-xl">
            Describe your project in natural language. The system extracts requirements, identifies gaps, flags risks, and suggests proposal directions.
          </p>
        </div>
        <BriefForm />
      </div>
    </main>
  );
}
