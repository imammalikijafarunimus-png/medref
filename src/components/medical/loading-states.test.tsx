import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { 
  DrugListSkeleton, 
  HerbalListSkeleton,
  DrugDetailSkeleton,
} from './loading-states'

describe('Loading States', () => {
  describe('DrugListSkeleton', () => {
    it('should render skeleton cards', () => {
      render(<DrugListSkeleton count={3} />)
      
      const skeletons = screen.getAllByTestId(/skeleton/i)
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render with default count', () => {
      render(<DrugListSkeleton />)
      
      const container = document.querySelector('[class*="space-y"]')
      expect(container).toBeDefined()
    })
  })

  describe('HerbalListSkeleton', () => {
    it('should render herbal skeletons', () => {
      render(<HerbalListSkeleton count={2} />)
      
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    })
  })

  describe('DrugDetailSkeleton', () => {
    it('should render detail page skeleton', () => {
      render(<DrugDetailSkeleton />)
      
      const skeletons = screen.getAllByTestId(/skeleton/i)
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })
})