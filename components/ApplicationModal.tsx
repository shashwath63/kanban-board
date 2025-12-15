'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Application, ApplicationStatus } from '@/types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Application>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Application;
  isLoading?: boolean;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['Applied', 'Interviewing', 'Rejected', 'Offer'];

export function ApplicationModal({ isOpen, onClose, onSubmit, onDelete, initialData, isLoading }: ApplicationModalProps) {
  const [formData, setFormData] = useState<Partial<Application>>({
    company_name: '',
    job_title: '',
    status: 'Applied',
    date_applied: new Date().toISOString().split('T')[0],
    job_posting_url: '',
    salary_notes: '',
    private_notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date_applied: new Date(initialData.date_applied).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        company_name: '',
        job_title: '',
        status: 'Applied',
        date_applied: new Date().toISOString().split('T')[0],
        job_posting_url: '',
        salary_notes: '',
        private_notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Application' : 'Add Application'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Title *
          </label>
          <input
            type="text"
            required
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
              className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Applied
            </label>
            <input
              type="date"
              value={formData.date_applied}
              onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
              className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Posting URL
          </label>
          <input
            type="url"
            value={formData.job_posting_url || ''}
            onChange={(e) => setFormData({ ...formData, job_posting_url: e.target.value })}
            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Private Notes
          </label>
          <textarea
            value={formData.private_notes || ''}
            onChange={(e) => setFormData({ ...formData, private_notes: e.target.value })}
            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
            rows={3}
          />
        </div>

        <div className="mt-2 flex justify-between gap-2">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this application?')) {
                  await onDelete(initialData.id);
                }
              }}
              disabled={isLoading}
              className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
