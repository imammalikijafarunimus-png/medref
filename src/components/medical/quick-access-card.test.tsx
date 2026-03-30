import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { QuickAccessCard, QuickAccessCardProps } from './quick-access-card';

// ✅ Mock next/link (Vitest version)
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: any) => (
      <a href={href}>{children}</a>
    ),
  };
});

// ─── Factory ─────────────────────────────────────────

const createMockProps = (
  overrides?: Partial<QuickAccessCardProps>
): QuickAccessCardProps => ({
  title: 'Obat',
  description: 'Cari informasi obat',
  href: '/obat',
  icon: 'pill',
  color: 'blue',
  count: undefined,
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────

describe('QuickAccessCard', () => {
  it('renders title and description', () => {
    render(<QuickAccessCard {...createMockProps()} />);

    expect(screen.getByText('Obat')).toBeInTheDocument();
    expect(screen.getByText('Cari informasi obat')).toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    render(<QuickAccessCard {...createMockProps()} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/obat');
  });

  it('renders default "Buka" when count is undefined', () => {
    render(<QuickAccessCard {...createMockProps({ count: undefined })} />);

    expect(screen.getByText('Buka')).toBeInTheDocument();
  });

  it('renders formatted count < 1000', () => {
    render(<QuickAccessCard {...createMockProps({ count: 120 })} />);

    expect(screen.getByText('120 item')).toBeInTheDocument();
  });

  it('renders formatted count >= 1000', () => {
    render(<QuickAccessCard {...createMockProps({ count: 1500 })} />);

    expect(screen.getByText('1.5K+ item')).toBeInTheDocument();
  });

  it('uses fallback icon when icon invalid', () => {
    render(
      <QuickAccessCard
        {...createMockProps({ icon: 'unknown' as any })}
      />
    );

    expect(screen.getByText('Obat')).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    render(<QuickAccessCard {...createMockProps({ color: 'red' })} />);

    const link = screen.getByRole('link');
    expect(link.className).toContain('quick-card-red');
  });
});