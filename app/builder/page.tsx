import BriefForm from "@/components/BriefForm";

export default function BuilderPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-2">
            把一句模糊需求，整理成可进入提案阶段的项目 Brief
          </h1>
          <p className="text-gray-500 text-sm">
            适用于零售门店、展会展台、品牌快闪、商业空间升级等前期沟通场景。
          </p>
          <p className="mt-3 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            This is a demo prototype for early-stage brief structuring and proposal direction, not a final costing/review/construction system.
          </p>
        </div>
        <BriefForm />
      </div>
    </main>
  );
}
