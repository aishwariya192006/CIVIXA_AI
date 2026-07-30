import React from 'react'

export const SharedContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`w-full max-w-[1400px] mx-auto px-[48px] ${className}`}>
    {children}
  </div>
)
