export default function Home() {
  return (
    <main className="layer flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <h1
          className="text-6xl mb-4"
          style={{ fontFamily: 'var(--font-caveat)' }}
        >
          Scrum-tool
        </h1>
        <p className="text-lg opacity-70 mb-10">
          Een digitaal scrum-bord dat aanvoelt als het papieren bord in de
          klas. Plak stickies, verplaats ze, werk samen — live.
        </p>
        <button
          type="button"
          disabled
          className="px-6 py-3 rounded-md bg-[#d63f7a] text-white font-medium opacity-60 cursor-not-allowed"
          title="Komt in M1"
        >
          Maak nieuw board
        </button>
        <p className="text-sm mt-6 opacity-50">
          M0 skeleton &mdash; de knop wordt in M1 levend.
        </p>
      </div>
    </main>
  );
}
