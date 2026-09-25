import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="w-full text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf4ff] text-[#174f9e]"><MailCheck size={26} /></span>
      <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-[#171b2f]">Check your inbox</h1>
      <p className="mt-3 text-base leading-7 text-[#697086]">Use the confirmation link we sent you, then return to sign in.</p>
      <Link href="/login" className="button button-primary mt-8">Back to sign in</Link>
    </div>
  );
}
