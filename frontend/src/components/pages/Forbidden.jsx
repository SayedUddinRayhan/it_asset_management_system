// src/components/pages/Forbidden.jsx
export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-500">
      <span className="text-6xl font-bold text-red-400">403</span>
      <p className="text-lg">You don't have permission to view this page.</p>
    </div>
  );
}
