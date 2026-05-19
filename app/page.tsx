import OTPLogin from "./components/OTPLogin";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <OTPLogin />
    </main>
  );
}
