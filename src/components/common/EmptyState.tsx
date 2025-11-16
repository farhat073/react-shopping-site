import { motion } from 'framer-motion';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref
}: EmptyStateProps) => {
  const defaultIcon = (
    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  const ActionButton = actionHref ? (
    <a href={actionHref} className="inline-block">
      <Button>{actionLabel}</Button>
    </a>
  ) : onAction ? (
    <Button onClick={onAction}>{actionLabel}</Button>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {icon || defaultIcon}

        <h1 className="mt-8 text-3xl font-bold text-gray-900">{title}</h1>

        <p className="mt-4 text-lg text-gray-600">{description}</p>

        {ActionButton && (
          <div className="mt-8">
            {ActionButton}
          </div>
        )}
      </div>
    </motion.div>
  );
};