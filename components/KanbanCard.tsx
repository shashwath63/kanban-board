import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application } from '@/types';
import { Calendar, Briefcase, Edit2 } from 'lucide-react';

interface Props {
  application: Application;
  onClick?: (app: Application) => void;
}

export function KanbanCard({ application, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
    data: { ...application },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(application);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex cursor-grab flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-none dark:hover:border-gray-600"
    >
      {/* Drag handle - the whole card is draggable */}
      <div {...attributes} {...listeners} className="absolute inset-0 z-0" />

      {/* Edit button - separate from drag */}
      <button
        onClick={handleEditClick}
        className="absolute right-2 top-2 z-10 rounded-md p-1.5 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700"
        aria-label="Edit application"
      >
        <Edit2 size={14} className="text-gray-500 dark:text-gray-400" />
      </button>

      <div className="relative z-[1] pointer-events-none flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-gray-100">{application.job_title}</h3>
      </div>

      <div className="relative z-[1] pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Briefcase size={14} className="text-gray-400" />
          <span className="truncate">{application.company_name}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={14} className="text-gray-400" />
          <span>Applied {new Date(application.date_applied).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
