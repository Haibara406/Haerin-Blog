'use client'

import Link from 'next/link'
import { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePageTransition } from './PageTransitionProvider'

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export default function TransitionLink({
  href,
  onClick,
  prefetch,
  replace,
  scroll,
  target,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = usePageTransition()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      isModifiedEvent(event) ||
      event.button !== 0 ||
      (target && target !== '_self')
    ) {
      return
    }

    event.preventDefault()
    navigate({
      href,
      replace,
      scroll,
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      target={target}
      {...rest}
    />
  )
}
