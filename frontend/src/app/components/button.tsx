import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary1' | 'primary2' | 'primary3' | 'calltoaction1' | 'calltoaction2'| 'calltoaction3'| 'secondary1'| 'secondary2'| 'secondary3' | 'danger' | 'success'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export default function Button({
  variant = 'primary1',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary1: 'bg-primary1 hover:bg-primary2 text-white',
    primary2: 'bg-primary2 hover:bg-primary1 text-white',
    primary3: 'bg-primary3 hover:bg-primary3/70 text-primary1 border border-primary2/30',
    secondary1: 'border border-secondary1 hover:bg-secondary1/10 text-secondary1',
    secondary2: 'bg-secondary2/20 hover:bg-secondary2/35 text-secondary1 border border-secondary2/40',
    secondary3: 'bg-transparent hover:bg-secondary1/10 text-secondary1 border border-secondary1/30',
    calltoaction1: 'bg-calltoaction1 hover:bg-calltoaction2 text-primary1 shadow-sm',
    calltoaction2: 'border-2 border-calltoaction1 hover:bg-calltoaction1/15 text-calltoaction2',
    calltoaction3: 'bg-calltoaction1/20 hover:bg-calltoaction1/35 text-calltoaction2 border border-calltoaction1/40',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    success: 'bg-calltoactionsuccess hover:bg-calltoactionsuccess/85 text-white shadow-sm',
}

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}