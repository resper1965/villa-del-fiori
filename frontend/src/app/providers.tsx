"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AuthProvider } from "@/contexts/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            retry: 1, // Tentar apenas 1 vez
            retryDelay: 1000, // 1 segundo
            refetchOnWindowFocus: false, // Não refazer fetch ao focar na janela
            refetchOnMount: false, // NÃO refazer fetch ao montar (usar cache se disponível) - OTIMIZAÇÃO CRÍTICA
            refetchOnReconnect: false, // Não refazer fetch ao reconectar automaticamente
            gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
            // Timeout global para todas as queries (10 segundos)
            networkMode: "online",
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
            networkMode: "online",
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
