import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render children', () => {
      render(<Card>Card content</Card>)
      
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      
      const card = screen.getByText('Content').closest('div')
      expect(card?.className).toContain('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('should render header content', () => {
      render(<CardHeader>Header</CardHeader>)
      
      expect(screen.getByText('Header')).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('should render title', () => {
      render(<CardTitle>Title</CardTitle>)
      
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })

  describe('CardDescription', () => {
    it('should render description', () => {
      render(<CardDescription>Description text</CardDescription>)
      
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('should render content', () => {
      render(<CardContent>Main content</CardContent>)
      
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('should render footer', () => {
      render(<CardFooter>Footer</CardFooter>)
      
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Full Card', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
      expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })
  })
})