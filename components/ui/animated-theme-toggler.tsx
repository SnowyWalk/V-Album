"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {Moon, Sun} from "lucide-react"
import {flushSync} from "react-dom"

import {cn} from "@/lib/utils"
import {useTheme} from "next-themes";

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
}

interface ToggleThemeWithTransitionOptions {
    isDark: boolean,
    duration?: number,
    cursorX?: number,
    cursorY?: number,
    onThemeChange?: () => void
}

export async function toggleThemeWithTransition(
    triggerElement: HTMLElement,
    {isDark, duration = 400, cursorX = 0, cursorY = 0, onThemeChange}: ToggleThemeWithTransitionOptions
) {
    if (typeof document.startViewTransition !== "function") {
        if (onThemeChange)
            onThemeChange()
        return
    }

    await document.startViewTransition(() => {
        flushSync(() => {
            if (onThemeChange)
                onThemeChange()
        })
    }).ready

    const {top, left, width, height} = triggerElement.getBoundingClientRect()
    let x:number = left + width / 2
    let y:number = top + height / 2
    let maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
    )

    if (cursorX && cursorY) {
        x = cursorX
        y = cursorY
        maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )
    }

    document.documentElement.animate(
        {
            clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
        },
        {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
        }
    )
}