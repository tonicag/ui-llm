import React from 'react';
import { useLLMAction, LLMScope } from '@ui-llm/react';
import type { Notification } from '../App';

interface NotificationsProps {
  items: Notification[];
  onDismiss: (id: string) => void;
}

const typeColors = {
  success: '#2ecc71',
  error: '#e74c3c',
  info: '#3498db',
};

export function Notifications({ items, onDismiss }: NotificationsProps) {
  if (items.length === 0) return null;

  return (
    <LLMScope name="Notification Toasts" description="Dismissible notification toasts in the bottom-right">
      <div style={{
        position: 'fixed',
        bottom: 16,
        right: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 9999,
      }}>
        {items.map(n => (
          <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </div>
    </LLMScope>
  );
}

function NotificationToast({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const { ref } = useLLMAction({
    name: `Dismiss ${notification.type} notification`,
    description: `Dismiss the notification: "${notification.message}"`,
    dynamicState: { message: notification.message, type: notification.type },
    onExecute: async () => {
      onDismiss(notification.id);
      return { status: 'success', message: 'Notification dismissed' };
    },
  });

  return (
    <div
      ref={ref}
      onClick={() => onDismiss(notification.id)}
      style={{
        padding: '0.75rem 1rem',
        background: 'white',
        borderLeft: `4px solid ${typeColors[notification.type]}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        minWidth: 250,
      }}
    >
      {notification.message}
    </div>
  );
}
