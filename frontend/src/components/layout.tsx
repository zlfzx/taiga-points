import { Toaster } from "./ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="flex flex-col flex-wrap items-center justify-center w-full min-h-screen bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200">
                {children}
            </div>
            <Toaster richColors position="top-center" />
        </>
    );
}