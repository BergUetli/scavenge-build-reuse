import { useState } from 'react';
import { ChevronRight, ChevronDown, Cpu, CircuitBoard, Box, Layers, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdmin } from '@/hooks/useAdmin';
import type { HierarchicalComponent, AbstractionLevel } from '@/types/admin';
import { cn } from '@/lib/utils';

interface ComponentTreeNodeProps {
  component: HierarchicalComponent;
  depth: number;
}

const levelIcons: Record<AbstractionLevel, React.ReactNode> = {
  device: <Layers className="h-4 w-4 text-blue-500" />,
  module: <CircuitBoard className="h-4 w-4 text-green-500" />,
  ic: <Cpu className="h-4 w-4 text-orange-500" />,
  discrete: <Box className="h-4 w-4 text-purple-500" />,
};

const levelLabels: Record<AbstractionLevel, string> = {
  device: 'Device',
  module: 'Module',
  ic: 'IC',
  discrete: 'Discrete',
};

export function ComponentTreeNode({ component, depth }: ComponentTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteComponent } = useAdmin();
  const hasChildren = component.children && component.children.length > 0;

  const handleDelete = () => {
    if (confirm(`Delete "${component.component_name}"? This cannot be undone.`)) {
      deleteComponent.mutate(component.id);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 group',
          depth > 0 && 'ml-6'
        )}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'p-0.5 rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Level icon */}
        {levelIcons[component.abstraction_level]}

        {/* Component name */}
        <span className="font-medium text-sm flex-1">{component.component_name}</span>

        {/* Brand/Model */}
        {(component.brand || component.model) && (
          <span className="text-xs text-muted-foreground">
            {[component.brand, component.model].filter(Boolean).join(' ')}
          </span>
        )}

        {/* Category badge */}
        <Badge variant="outline" className="text-xs">
          {component.category}
        </Badge>

        {/* Level badge */}
        <Badge variant="secondary" className="text-xs">
          {levelLabels[component.abstraction_level]}
        </Badge>

        {/* Verified badge */}
        {component.verified && (
          <Badge className="bg-accent text-accent-foreground text-xs">Verified</Badge>
        )}

        {/* Children count */}
        {hasChildren && (
          <span className="text-xs text-muted-foreground">
            ({component.children!.length})
          </span>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="border-l border-border ml-4 pl-2">
          {component.children!.map((child) => (
            <ComponentTreeNode key={child.id} component={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
