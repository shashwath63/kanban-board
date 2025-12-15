import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Application } from '@/types';

interface Props {
  id: string;
  title: string;
  applications: Application[];
  onCardClick?: (app: Application) => void;
}

export function KanbanColumn({ id, title, applications, onCardClick }: Props) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex h-full w-80 flex-col rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <SortableContext id={id} items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {applications.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-200 p-4 text-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
              <p className="text-sm">No applications</p>
            </div>
          ) : (
            applications.map((app) => (
              <KanbanCard key={app.id} application={app} onClick={onCardClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
