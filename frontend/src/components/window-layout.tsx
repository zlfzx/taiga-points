import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "./ui/card"

function WindowHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <CardHeader
      data-slot="card-header"
      className={cn(
        "bg-white/50 backdrop-blur-2xl py-4 md:py-5 px-6 md:px-8 rounded-t-2xl border-b border-white/60 z-10 relative shadow-sm print:hidden",
        className
      )}
      {...props}
    >
      {props.children}
    </CardHeader>
  )
}

function WindowContent({ className, ...props }: React.ComponentProps<"div">) {
return (
    <CardContent
      data-slot="card-content"
      className={cn(
        "p-6 md:p-8 rounded-b-2xl bg-white/40 backdrop-blur-xl print:p-0 print:bg-transparent",
        className
      )}
      {...props}
    >
      {props.children}
    </CardContent>
  )
}

function WindowLayout({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      data-slot="card"
      className={cn(
        "max-w-full mx-auto shadow-2xl shadow-blue-900/10 py-0 gap-0 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden ring-1 ring-black/5 print:shadow-none print:border-none print:ring-0 print:bg-transparent print:rounded-none",
        className
      )}
      {...props}
    >
      {props.children}
    </Card>
  )
}

export { WindowHeader, WindowContent, WindowLayout }