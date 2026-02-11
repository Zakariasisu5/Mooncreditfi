import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatsCard = ({ title, value, description, icon: Icon, trend, className = '' }) => {
  return (
    <Card className={`card-glow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3 md:p-4 pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-1">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
        <div className="text-base sm:text-lg md:text-2xl font-bold truncate">{value}</div>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
            {description}
          </p>
        )}
        {trend && (
          <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;