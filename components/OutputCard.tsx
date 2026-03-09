"use client";

export default function OutputCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 min-h-[400px]">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">标题</h3>
          <p className="text-lg font-semibold">[生成的标题]</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">概述</h3>
          <p className="text-gray-700">[生成的概述内容...]</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">目标</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>[目标 1]</li>
            <li>[目标 2]</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">时间线</h3>
          <p className="text-gray-700">[时间线]</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">预算范围</h3>
          <p className="text-gray-700">[预算]</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
        <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          复制
        </button>
        <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          下载
        </button>
      </div>
    </div>
  );
}
