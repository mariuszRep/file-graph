import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn('badge', variant === 'secondary' && 'badge-secondary', className)} {...props} />
}
