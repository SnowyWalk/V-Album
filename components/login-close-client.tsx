"use client"

import { useEffect } from "react"

export default function LoginCloseClient() {
  useEffect(() => {
    // window.opener?.postMessage({ type: "AUTH_DONE" }, "*")
    window.close()
  }, [])
  
  return <div className="p-6">로그인 완료 처리 중...</div>
}
