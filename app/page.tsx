import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1 className="text-xl mb-3">Home</h1>
      <div className="flex flex-col">
        <Link className="underline" href="/custom">
          Custom
        </Link>
        <Link className="underline" href="/embedded">
          Embedded
        </Link>
      </div>
    </div>
  );
}
