

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col flex-wrap items-center justify-center w-full min-h-screen bg-gray-200x bg-gradient-to-br from-amber-200 via-rose-200 to-violet-200">
            {children}
        </div>
    );
}