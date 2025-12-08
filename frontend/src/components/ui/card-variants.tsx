import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"

interface CardWithBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  borderColor?: "blue" | "green" | "purple" | "yellow" | "red"
  children: React.ReactNode
}

const borderColorClasses = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  purple: "border-l-purple-500",
  yellow: "border-l-yellow-500",
  red: "border-l-red-500",
}

export function CardWithBorder({ 
  borderColor = "blue", 
  className, 
  children,
  ...props 
}: CardWithBorderProps) {
  return (
    <Card
      className={cn(
        "bg-gray-800/50 border-gray-700/50 border-l-4",
        borderColorClasses[borderColor],
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

// Re-exportar componentes do Card para facilitar uso
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

