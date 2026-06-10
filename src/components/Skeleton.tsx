import React from 'react'
import './Skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  circle?: boolean
  count?: number
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export function SkeletonText({ width = '100%', height = '20px', count = 1, className = '' }: SkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            marginBottom: i < count - 1 ? '8px' : '0'
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ width = '48px', height = '48px', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton-circular ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '16px' }} />
      <SkeletonText width="80%" height="24px" />
      <SkeletonText width="100%" height="16px" count={2} />
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <div className="skeleton" style={{ flex: 1, height: '40px' }} />
        <div className="skeleton" style={{ flex: 1, height: '40px' }} />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="skeleton-table">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton" style={{ width: '8%', height: '16px' }} />
          <div className="skeleton" style={{ width: '24%', height: '16px' }} />
          <div className="skeleton" style={{ width: '20%', height: '16px' }} />
          <div className="skeleton" style={{ width: '24%', height: '16px' }} />
          <div className="skeleton" style={{ width: '16%', height: '16px' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '200px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              flex: 1,
              height: `${Math.random() * 100 + 50}px`,
              borderRadius: '4px'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function Skeleton({ variant = 'text', width = '100%', height = '20px', circle = false, className = '' }: SkeletonProps) {
  if (variant === 'circular' || circle) {
    return (
      <div
        className={`skeleton skeleton-circular ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }}
      />
    )
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`skeleton skeleton-rectangular ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }}
      />
    )
  }

  return (
    <div
      className={`skeleton skeleton-text ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}

export default Skeleton
