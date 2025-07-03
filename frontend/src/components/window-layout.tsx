import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "./ui/card"

function WindowHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <CardHeader
      data-slot="card-header"
      className={cn(
        "bg-white/80 backdrop-blur-md py-4 rounded-t-xl",
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
        "p-6 rounded-b-xl bg-gray-100x bg-white/20 backdrop-blur-md",
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
        "max-w-full mx-auto bg-gray-100x shadow-lg py-0 gap-0 bg-white/10 backdrop-blur-md",
        className
      )}
      {...props}
    >
      {props.children}
    </Card>
  )
}

export { WindowHeader, WindowContent, WindowLayout }