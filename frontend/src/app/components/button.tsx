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
  const baseStyles = 'rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary1: 'bg-primary1 hover:bg-yellow-600 text-white',
    primary2: 'bg-primary2 hover:bg-yellow-600 text-white',
    primary3: 'bg-yellow-500 hover:bg-yellow-600 text-primary1',
    secondary1: 'border border-secondary1 hover:bg-grey-900 text-secondary1',
    secondary2: 'bg-gray-500 hover:bg-gray-600 text-white',
    secondary3: 'bg-gray-500 hover:bg-gray-600 text-white',
    calltoaction1: 'bg-calltoaction1 hover:bg-calltoaction2 text-black',
    calltoaction2: 'bg-calltoaction2  hover:bg-gray-600 text-white',
    calltoaction3: 'bg-gray-500 hover:bg-gray-600 calltoaction1',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: ''
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