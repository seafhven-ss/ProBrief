import BriefForm from "@/components/BriefForm";

export default function BuilderPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">构建提案</h1>
        <BriefForm />
      </div>
    </main>
  );
}
