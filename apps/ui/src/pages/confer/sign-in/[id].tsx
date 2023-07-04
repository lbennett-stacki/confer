import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";

export interface Credentials {
  username: string;
  password: string;
}

export default function SignIn() {
  const router = useRouter();
  const { id } = router.query;
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { mutate: register } = useMutation({
    mutationFn: async ({ username, password }: Credentials) => {
      const data = new FormData();
      data.set("username", username);
      data.set("password", password);

      const result = await (
        await fetch(`/api/confer/sign-in/${id}`, {
          method: "POST",
          body: data,
          headers: { "Content-Type": "x-www-form-data" },
          credentials: "same-origin",
        })
      ).json();
      console.log("login result", result);

      if (!result.redirectTo) {
        throw new Error("login failed"); // TODO: handle error
      }

      router.push(result.redirectTo);
    },
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Head>
        <title>Sign in | @mdrxtech/confer-ui</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white">
            Confer <span className="text-[hsl(31,100%,70%)]">DevClient</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                register({ username, password });
              }}
            >
              <input
                required
                placeholder="login username"
                type="text"
                name="login"
                onChange={(event) => setUsername(event.target.value)}
              />
              <input
                required
                placeholder="login password"
                type="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="submit" disabled={!Boolean(username && password)}>
                Sign in
              </button>
            </form>
          </div>
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
}
