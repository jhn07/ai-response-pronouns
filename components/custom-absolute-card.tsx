import { Card } from "./ui/card";
import { cn } from "@/lib/utils";


interface CustomAbsoluteCardProps {
  title: string;
  descriptions: Array<Record<string, string>>
  className?: string;
  isVisible?: boolean;
}


export const CustomAbsoluteCard = ({ title, descriptions, className, isVisible }: CustomAbsoluteCardProps) => {
  return (
    <div className={cn(
      isVisible ? "hidden" : "absolute",
      className
    )}>
      <Card className="relative p-6">
        <div className="absolute -top-5 left-3 bg-white">
          <h2 className="text-2xl font-medium">{title}</h2>
        </div>
        <ul className="space-y-3 mt-4">
          {descriptions.map((description) => (
            <li key={description.title} className="border-b last:border-b-0 pb-2 last:pb-0">
              <h3 className="text-lg font-medium text-primary">{description.title}</h3>
              <p className="text-sm text-muted-foreground">{description.description}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}