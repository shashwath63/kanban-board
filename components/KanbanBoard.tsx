'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { ApplicationModal } from './ApplicationModal';
import { Application, ApplicationStatus } from '@/types';

const columns: ApplicationStatus[] = ['Applied', 'Interviewing', 'Rejected', 'Offer'];

export function KanbanBoard({ initialApplications, token }: { initialApplications: Application[], token: string }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeApp = applications.find((app) => app.id === activeId);
    const overApp = applications.find((app) => app.id === overId);

    if (!activeApp) return;

    if (columns.includes(overId as ApplicationStatus)) {
      const overColumn = overId as ApplicationStatus;
      if (activeApp.status !== overColumn) {
        setApplications((apps) => {
          const activeIndex = apps.findIndex((a) => a.id === activeId);
          const newApps = [...apps];
          newApps[activeIndex] = { ...newApps[activeIndex], status: overColumn };
          return newApps;
        });
      }
    } else if (overApp && activeApp.status !== overApp.status) {
      setApplications((apps) => {
        const activeIndex = apps.findIndex((a) => a.id === activeId);
        const overIndex = apps.findIndex((a) => a.id === overId);
        const newApps = [...apps];
        newApps[activeIndex] = { ...newApps[activeIndex], status: overApp.status };
        return arrayMove(newApps, activeIndex, overIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((app) => app.id === activeId);
    if (!activeApp) return;

    let newStatus = activeApp.status;

    if (columns.includes(overId as ApplicationStatus)) {
        newStatus = overId as ApplicationStatus;
    } else {
        const overApp = applications.find(a => a.id === overId);
        if (overApp) {
            newStatus = overApp.status;
        }
    }

    setApplications((apps) => {
        const oldIndex = apps.findIndex((a) => a.id === activeId);
        const overIndex = apps.findIndex((a) => a.id === overId);

        let newApps = [...apps];

        if (columns.includes(overId as ApplicationStatus)) {
             newApps[oldIndex] = { ...newApps[oldIndex], status: newStatus };
        } else {
            newApps = arrayMove(newApps, oldIndex, overIndex);
            newApps[oldIndex] = { ...newApps[oldIndex], status: newStatus };
        }

        const appsInNewStatus = newApps.filter(a => a.status === newStatus);
        const calculatedNewIndex = appsInNewStatus.findIndex(a => a.id === activeId);

        fetch('/api/v1/applications/reorder', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                applicationId: activeId,
                newStatus: newStatus,
                newIndex: calculatedNewIndex,
            }),
        }).catch(err => console.error('Reorder failed', err));

        return newApps;
    });
  };

  const handleAddApplication = () => {
    setEditingApp(undefined);
    setIsModalOpen(true);
  };

  const handleEditApplication = (app: Application) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Partial<Application>) => {
    setIsLoading(true);
    try {
      if (editingApp) {
        // Edit logic (Not fully implemented in API yet, but let's assume PUT exists or use POST for now?
        // Wait, the plan said "Edit Application Modal", but I didn't implement PUT endpoint in previous steps.
        // I should probably implement PUT endpoint or just update local state for now if API is missing.
        // Actually, requirements said "Update specific information". I missed implementing PUT /api/v1/applications/[id].
        // I will implement the API endpoint next. For now, let's just log it or try to call it.
        // Let's assume I will add the endpoint.
        const res = await fetch(`/api/v1/applications/${editingApp.id}`, {
            method: 'PUT', // or PATCH
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update');

        // Optimistic update or refetch? Let's just update local state
        setApplications(apps => apps.map(a => a.id === editingApp.id ? { ...a, ...data } as Application : a));
      } else {
        // Add logic
        const res = await fetch('/api/v1/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create');
        const newApp = await res.json();
        setApplications(apps => [...apps, newApp]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setApplications(apps => apps.filter(a => a.id !== id));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold">Board</h2>
            <button
                onClick={handleAddApplication}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                <Plus size={16} />
                New Application
            </button>
        </div>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto p-4 pt-0">
            {columns.map((col) => (
                <KanbanColumn
                key={col}
                id={col}
                title={col}
                applications={applications.filter((app) => app.status === col)}
                onCardClick={handleEditApplication}
                />
            ))}
            </div>
            <DragOverlay>
            {activeId ? (
                <KanbanCard application={applications.find(a => a.id === activeId)!} />
            ) : null}
            </DragOverlay>
        </DndContext>
      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={handleDeleteApplication}
        initialData={editingApp}
        isLoading={isLoading}
      />
    </>
  );
}
