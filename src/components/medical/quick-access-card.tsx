import Link from 'next/link';
import { 
  Pill, 
  Calculator, 
  AlertTriangle, 
  Leaf, 
  FileText, 
  Heart,
  ChevronRight,
  Beaker,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal' | 'cyan';
  count?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pill: Pill,
  calculator: Calculator,
  alert: AlertTriangle,
  leaf: Leaf,
  file: FileText,
  stethoscope: Stethoscope,
  heart: Heart,
  beaker: Beaker,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'hover:border-sky-300 dark:hover:border-sky-700',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'hover:border-teal-300 dark:hover:border-teal-700',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
  },
};

export function QuickAccessCard({
  title,
  description,
  href,
  icon,
  color,
  count,
}: QuickAccessCardProps) {
  const Icon = iconMap[icon] || Pill;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer h-full',
        colors.border
      )}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className={cn('p-2.5 sm:p-3 rounded-xl', colors.bg)}>
              <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', colors.text)} />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
          </div>
          
          <h3 className="font-semibold mt-3 text-base sm:text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          
          {count !== undefined && (
            <div className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-3',
              colors.bg,
              colors.text
            )}>
              {count.toLocaleString('id-ID')} item
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}