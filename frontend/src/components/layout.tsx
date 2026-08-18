import { Toaster } from "./ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="relative flex flex-col flex-wrap items-center justify-center w-full min-h-screen bg-slate-50 text-slate-800">
                {/* Fixed Aurora Mesh Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 flex items-center justify-center">
                    <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/40 blur-3xl mix-blend-multiply opacity-80" />
                    <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/40 blur-3xl mix-blend-multiply opacity-70" />
                    <div className="absolute -bottom-[10%] left-[15%] w-[60vw] h-[60vw] rounded-full bg-cyan-300/40 blur-3xl mix-blend-multiply opacity-60" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen">
                    {children}
                </div>
            </div>
            <Toaster richColors position="top-center" />
        </>
    );
}