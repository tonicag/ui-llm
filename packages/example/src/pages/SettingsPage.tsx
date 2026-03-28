import React, { useState } from 'react';
import { LLMScope, useLLMAction, useLLMInput } from '@ui-llm/react';
import * as s from '../styles';

interface SettingsPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function SettingsPage({ onNotify }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState('Alice');
  const [email, setEmail] = useState('alice@example.com');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inputs — capture entryId for relations
  const { ref: nameRef, entryId: nameEntryId } = useLLMInput({
    name: 'Display Name',
    description: 'The name shown to other users in the app',
    inputType: 'text',
    value: displayName,
  });

  const { ref: emailRef, entryId: emailEntryId } = useLLMInput({
    name: 'Email Address',
    description: 'The primary email address for the account',
    inputType: 'email',
    value: email,
  });

  // Dark mode — parameterized action with onExecute
  const { ref: darkModeRef } = useLLMAction({
    name: 'Set Dark Mode',
    description: 'Set dark mode to a specific state or toggle it',
    dynamicState: { toggled: darkMode },
    params: {
      enabled: { type: 'boolean', description: 'Whether dark mode should be on or off', required: true },
    },
    onExecute: async (req) => {
      const shouldEnable = req.params?.enabled as boolean ?? !darkMode;
      setDarkMode(shouldEnable);
      return { status: 'success', message: `Dark mode ${shouldEnable ? 'enabled' : 'disabled'}` };
    },
  });

  // Notifications — parameterized action with onExecute
  const { ref: notifRef } = useLLMAction({
    name: 'Set Email Notifications',
    description: 'Set email notifications to a specific state or toggle them',
    dynamicState: { toggled: notifications },
    params: {
      enabled: { type: 'boolean', description: 'Whether notifications should be on or off', required: true },
    },
    onExecute: async (req) => {
      const shouldEnable = req.params?.enabled as boolean ?? !notifications;
      setNotifications(shouldEnable);
      return { status: 'success', message: `Notifications ${shouldEnable ? 'enabled' : 'disabled'}` };
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onNotify('Settings saved successfully', 'success');
    }, 1500);
  };

  // Save — with relations to form inputs and onExecute
  const { ref: saveRef } = useLLMAction({
    name: 'Save Settings',
    description: 'Save all changes to user settings',
    enabled: displayName.length > 0 && email.length > 0,
    loading: isSaving,
    relations: [
      { type: 'submits', targetId: nameEntryId, description: 'Saves the display name' },
      { type: 'submits', targetId: emailEntryId, description: 'Saves the email' },
    ],
    onExecute: async () => {
      handleSave();
      return {
        status: 'success',
        message: 'Settings saved',
        sideEffects: ['Settings persisted', 'Save button shows loading state'],
      };
    },
  });

  // Danger zone — with permission tagging
  const { ref: deleteRef } = useLLMAction({
    name: 'Delete Account',
    description: 'Permanently delete the user account and all data',
    permission: 'dangerZone',
  });

  const { ref: confirmDeleteRef } = useLLMAction({
    name: 'Confirm Delete Account',
    description: 'Confirm the permanent deletion of the account',
    permission: 'dangerZone',
  });

  const { ref: cancelDeleteRef } = useLLMAction({
    name: 'Cancel Delete',
    description: 'Cancel the account deletion and go back',
  });

  const sectionStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    marginTop: '0.25rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '1rem',
    fontWeight: 500,
  };

  const toggleRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Settings</h1>

      <LLMScope name="Profile Section" description="User profile information">
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: '1rem' }}>Profile</h2>
          <label style={labelStyle}>
            Display Name
            <input
              ref={nameRef}
              style={inputStyle}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
              minLength={2}
              maxLength={50}
            />
          </label>
          <label style={labelStyle}>
            Email Address
            <input
              ref={emailRef}
              style={inputStyle}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
        </section>
      </LLMScope>

      <LLMScope name="Preferences Section" description="App preferences and toggles">
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: '1rem' }}>Preferences</h2>
          <div style={toggleRow}>
            <span>Dark Mode</span>
            <label>
              <input
                ref={darkModeRef}
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              {darkMode ? ' On' : ' Off'}
            </label>
          </div>
          <div style={toggleRow}>
            <span>Email Notifications</span>
            <label>
              <input
                ref={notifRef}
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              {notifications ? ' On' : ' Off'}
            </label>
          </div>
        </section>
      </LLMScope>

      <LLMScope name="Danger Zone" description="Irreversible account actions">
        <section style={{ ...sectionStyle, borderLeft: '4px solid #e74c3c' }}>
          <h2 style={{ marginBottom: '1rem', color: '#e74c3c' }}>Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              ref={deleteRef}
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{ padding: '1rem', background: '#fef0f0', borderRadius: '8px' }}>
              <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
                Are you sure? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  ref={confirmDeleteRef}
                  onClick={() => alert('Account deleted (demo)')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Yes, Delete My Account
                </button>
                <button
                  ref={cancelDeleteRef}
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ddd',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </LLMScope>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          ref={saveRef}
          onClick={handleSave}
          disabled={displayName.length === 0 || email.length === 0}
          style={{
            padding: '0.75rem 2rem',
            background: displayName.length > 0 && email.length > 0 ? '#4a4aff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: displayName.length > 0 && email.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
