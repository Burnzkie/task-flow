import Link   from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect }          from "next/navigation";
import { UserButton }        from "@clerk/nextjs";

export default async function LandingPage() {
  const { userId } = await auth();

  // If already logged in, go straight to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-sm font-bold">
            T
          </div>
          <span className="font-semibold">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in"
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/sign-up"
            className="text-sm bg-violet-600 hover:bg-violet-500 text-white
                       px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20
                        text-violet-300 text-xs px-3 py-1.5 rounded-full mb-8">
          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Now with AI-powered task suggestions
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-2xl leading-tight">
          Manage tasks,
          <span className="text-violet-400"> ship faster</span>
        </h1>

        <p className="text-gray-400 text-lg mb-10 max-w-xl leading-relaxed">
          A full-stack Kanban board with drag-and-drop, real-time updates,
          and AI-powered suggestions to keep your projects moving.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/sign-up"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white
                       rounded-xl font-medium transition-colors text-sm">
            Start for free →
          </Link>
          <Link href="/sign-in"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300
                       rounded-xl font-medium transition-colors text-sm border border-white/10">
            Sign in
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-4 mt-20 max-w-2xl w-full">
          {[
            { icon: "⬡", title: "Kanban board",    desc: "Drag and drop tasks across columns" },
            { icon: "⚡", title: "Real-time sync",  desc: "Updates instantly across all devices" },
            { icon: "✦", title: "AI suggestions",  desc: "Smart task ideas powered by Groq" },
            { icon: "⌖", title: "Search & filter", desc: "Find any task in seconds" },
            { icon: "◎", title: "Analytics",       desc: "Track your team's productivity" },
            { icon: "☁", title: "Cloud storage",   desc: "Powered by Neon PostgreSQL" },
          ].map((f) => (
            <div key={f.title}
              className="bg-white/3 border border-white/8 rounded-xl p-4 text-left
                         hover:bg-white/5 transition-colors">
              <div className="text-violet-400 text-lg mb-2">{f.icon}</div>
              <p className="text-sm font-medium text-white mb-1">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-700 border-t border-white/5">
        Built with Next.js · Prisma · Clerk · Supabase · Groq
      </footer>
    </div>
  );
}