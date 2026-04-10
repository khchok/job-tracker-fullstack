export default function LoginHero() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full bg-slate-900 px-12 py-16 text-white">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
          <span className="text-sm font-bold">JT</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Job Tracker</span>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Streamline your
          <br />
          recruitment pipeline
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
          Track every applicant from first contact to accepted offer — all in one
          place.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { label: "30+", description: "Active applicants tracked" },
          { label: "5",   description: "Pipeline stages" },
          { label: "∞",   description: "Status history retained" },
        ].map(({ label, description }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white w-12">{label}</span>
            <span className="text-sm text-slate-400">{description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
