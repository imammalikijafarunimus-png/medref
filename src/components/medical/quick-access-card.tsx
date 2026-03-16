import Link from 'next/link';
import { 
  Pill, 
  Calculator, 
  AlertTriangle, 
  Leaf, 
  FileText, 
  Activity, 
  Heart,
  ChevronRight 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal';
  count?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pill: Pill,
  calculator: Calculator,
  alert: AlertTriangle,
  leaf: Leaf,
  file: FileText,
  stethoscope: Activity,
  heart: Heart,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'hover:border-orange-300 dark:hover:border-orange-700',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'hover:border-red-300 dark:hover:border-red-700',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'hover:border-green-300 dark:hover:border-green-700',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-300 dark:hover:border-purple-700',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'hover:border-teal-300 dark:hover:border-teal-700',
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
    <Link href={href} className="block">
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        colors.border
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className={cn('p-2.5 rounded-xl', colors.bg)}>
              <Icon className={cn('h-5 w-5', colors.text)} />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
          
          <h3 className="font-semibold mt-3">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          
          {count !== undefined && (
            <div className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-3',
              colors.bg,
              colors.text
            )}>
              {count} item
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}