export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold">KolTechat</h1>
        <p className="mt-2 text-slate-300">
          Client is running. The dev server proxies <code>/api</code> to the backend.
        </p>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-300">Try:</p>
          <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-200">
            <code>fetch('/api/health').then(r =&gt; r.json()).then(console.log)</code>
          </pre>
        </div>
      </div>
    </main>
  );
}
