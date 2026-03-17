import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
}

export function Card({ glass, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border
        ${glass
          ? 'bg-dark-800/60 border-dark-600/50 backdrop-blur-sm'
          : 'bg-dark-800 border-dark-600'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
