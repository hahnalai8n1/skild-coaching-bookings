import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Brand } from "./brand";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-[#e5e8f2] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden max-w-52 truncate text-sm font-medium text-[#6b7285] sm:block">{email}</span>
          <form action={signOutAction}>
            <button type="submit" className="icon-button" aria-label="Sign out" title="Sign out">
              <LogOut aria-hidden="true" size={17} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
