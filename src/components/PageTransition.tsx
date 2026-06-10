import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

interface PageTransitionProps {
  children: React.ReactNode
  animationDuration?: number
}

export function PageTransition({ children, animationDuration = 300 }: PageTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, animationDuration)

    return () => clearTimeout(timer)
  }, [children, location, animationDuration])

  return (
    <div className={`page-transition ${isTransitioning ? 'transitioning' : 'visible'}`}>
      {displayChildren}
    </div>
  )
}

export default PageTransition
