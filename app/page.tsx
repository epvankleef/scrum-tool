import { createProject } from './actions/projects';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-3">
          Digitaal scrum-bord
        </div>
        <h1
          className="text-7xl mb-5 leading-none text-neutral-900"
          style={{ fontFamily: 'var(--font-caveat)' }}
        >
          Scrum-tool
        </h1>
        <p className="text-base text-neutral-500 mb-10 leading-relaxed">
          Een bord dat aanvoelt als het papieren bord in de klas.
          Plak stickies, verplaats ze, werk samen &mdash; live.
        </p>
        <form action={createProject}>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 active:scale-[0.98] transition"
          >
            Maak nieuw board
          </button>
        </form>
        <p className="text-xs text-neutral-400 mt-6">
          De URL is je share-link &mdash; deel 'm met je team.
        </p>
      </div>
    </main>
  );
}
