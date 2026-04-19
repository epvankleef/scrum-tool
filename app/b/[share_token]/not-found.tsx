import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="layer flex flex-1 items-center justify-center px-6 py-16">
      <div className="text-center">
        <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-caveat)' }}>
          Board niet gevonden
        </h1>
        <p className="opacity-70 mb-6">Deze share-link bestaat niet (meer).</p>
        <Link
          href="/"
          className="inline-block px-5 py-2 rounded-md bg-[#5b2e8c] text-white hover:brightness-110"
        >
          Terug naar home
        </Link>
      </div>
    </main>
  );
}
