import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  | 'UNPAID' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE'
  | 'ACTIVE' | 'WITHDRAWN' | 'GRADUATED' | 'SUSPENDED' | 'DEFERRED'
  | 'SUCCESS' | 'FAILED' | 'REVERSED'
  | 'APPLIED' | 'SHORTLISTED' | 'ADMITTED'
  | 'DRAFT' | 'UNDER_REVIEW';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeClasses = 'px-2 py-1 text-xs font-semibold rounded-full border ';

  switch (status.toUpperCase()) {
    case 'PAID':
    case 'APPROVED':
    case 'SUCCESS':
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'ADMITTED':
    case 'CONFIRMED':
    case 'DELIVERED':
    case 'CONCLUDED':
      badgeClasses += 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      break;

    case 'PENDING':
    case 'SUBMITTED':
    case 'DRAFT':
    case 'UNDER_REVIEW':
    case 'PARTIAL':
    case 'APPLIED':
    case 'PROCESSING':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
    case 'BOOKED':
      badgeClasses += 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      break;

    case 'REJECTED':
    case 'FAILED':
    case 'REVERSED':
    case 'UNPAID':
    case 'OVERDUE':
    case 'SUSPENDED':
    case 'WITHDRAWN':
    case 'CANCELLED':
    case 'BOUNCED':
      badgeClasses += 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      break;

    case 'WAIVED':
    case 'GRADUATED':
    case 'DEFERRED':
    case 'SHORTLISTED':
    case 'DISPATCHED':
      badgeClasses += 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      break;

    default:
      badgeClasses += 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }

  return (
    <span className={cn(badgeClasses, className)}>
      {status}
    </span>
  );
}
