import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { useMe } from "@confer/react-query";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: me } = useMe();

  return (
    <>
      <Head>
        <title>Home | @confer/admin</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white">
            Confer <span className="text-[hsl(0,100%,70%)]">AdminClient</span>
          </h1>
          {me?.sub && (
            <h2 className="text-xl font-light tracking-tight text-white">
              Hi {me.sub}!
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">
            <Link
              className="flex max-w-xs flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/api/confer/sign-in"
            >
              <h3 className="text-2xl font-bold">Sign in 🔓</h3>
            </Link>
            <Link
              className="flex max-w-xs flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/api/confer/register"
            >
              <h3 className="text-2xl font-bold">Register 📝</h3>
            </Link>
            <Link
              className="flex max-w-xs flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/api/confer/sign-out"
            >
              <h3 className="text-2xl font-bold">Sign out 🫥</h3>
            </Link>
          </div>
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
}
