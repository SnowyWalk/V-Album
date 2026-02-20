// /app/providers.tsx
"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {SessionProvider} from "next-auth/react"
import {ThemeProvider} from "next-themes"
import {useState} from "react"
import {TooltipProvider} from "@/components/ui/tooltip";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";

export default function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <TooltipProvider>
                        <SidebarProvider>
                            <AppSidebar/>
                            <SidebarInset>
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </SessionProvider>
        </QueryClientProvider>
    )
}