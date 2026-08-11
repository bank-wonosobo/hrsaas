import SignInForm from "../../../features/user/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-800">
      <div className="bg-card p-8 shadow-xl w-full max-w-md rounded-3xl space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Sign In </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Masukan email dan password yang terdaftar untuk login.
          </p>
        </div>
        <div>
          <SignInForm />
        </div>
        <hr />

        <div>
          <p className="text-xs text-zinc-500 font-medium">
            Belum punya akun?{" "}
            <a href="/sign-up" className="text-blue-500 hover:underline">
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
