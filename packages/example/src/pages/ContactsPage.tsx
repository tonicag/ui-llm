import React, { useState, useMemo } from 'react';
import { useLLMAction, useLLMInput, LLMScope } from '@seam-ui/react';
import * as s from '../styles';

interface ContactsPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const initialContacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'PM', status: 'inactive' },
  { id: '4', name: 'Dan Wilson', email: 'dan@example.com', role: 'Engineer', status: 'active' },
];

export function ContactsPage({ onNotify }: ContactsPageProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('');

  const filtered = useMemo(() => {
    let result = contacts.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
      }
      return true;
    });
    result.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    return result;
  }, [contacts, searchQuery, statusFilter, sortBy]);

  // --- Search ---
  const { ref: searchRef } = useLLMInput({
    name: 'Contact Search',
    description: 'Filter contacts by name, email, or role',
    inputType: 'search',
    value: searchQuery,
  });

  // --- Status filter ---
  const { ref: filterAllRef } = useLLMAction({
    name: 'Show All Contacts',
    description: 'Remove status filter and show all contacts',
    group: 'contact-filters',
    dynamicState: { active: statusFilter === 'all' },
    onExecute: async () => { setStatusFilter('all'); return { status: 'success', message: 'Showing all contacts' }; },
  });

  const { ref: filterActiveRef } = useLLMAction({
    name: 'Show Active Contacts',
    description: 'Filter contacts to show only active ones',
    group: 'contact-filters',
    dynamicState: { active: statusFilter === 'active' },
    onExecute: async () => { setStatusFilter('active'); return { status: 'success', message: 'Showing active contacts' }; },
  });

  const { ref: filterInactiveRef } = useLLMAction({
    name: 'Show Inactive Contacts',
    description: 'Filter contacts to show only inactive ones',
    group: 'contact-filters',
    dynamicState: { active: statusFilter === 'inactive' },
    onExecute: async () => { setStatusFilter('inactive'); return { status: 'success', message: 'Showing inactive contacts' }; },
  });

  // --- Sort ---
  const { ref: sortRef } = useLLMAction({
    name: 'Change Sort Order',
    description: 'Change how contacts are sorted',
    params: {
      field: { type: 'string', description: 'Sort field', enum: ['name', 'email', 'role'], required: true },
    },
    dynamicState: { currentSort: sortBy },
    onExecute: async (req) => {
      const field = (req.params?.field as 'name' | 'email' | 'role') ?? 'name';
      setSortBy(field);
      return { status: 'success', message: `Sorted by ${field}` };
    },
  });

  // --- Add contact ---
  const { ref: addBtnRef, entryId: addBtnEntryId } = useLLMAction({
    name: 'Add New Contact',
    description: 'Open the form to add a new contact',
    onExecute: async () => {
      setShowAddForm(true);
      setFormName('');
      setFormEmail('');
      setFormRole('');
      return { status: 'success', message: 'Add form opened' };
    },
  });

  // --- Form inputs ---
  const { ref: formNameRef, entryId: formNameEntryId } = useLLMInput({
    name: 'New Contact Name',
    description: 'Full name of the new contact',
    inputType: 'text',
    value: formName,
  });

  const { ref: formEmailRef, entryId: formEmailEntryId } = useLLMInput({
    name: 'New Contact Email',
    description: 'Email address of the new contact',
    inputType: 'email',
    value: formEmail,
  });

  const { ref: formRoleRef, entryId: formRoleEntryId } = useLLMInput({
    name: 'New Contact Role',
    description: 'Job role of the new contact',
    inputType: 'text',
    value: formRole,
  });

  // --- Submit / Cancel ---
  const { ref: submitRef } = useLLMAction({
    name: 'Submit New Contact',
    description: 'Save the new contact to the contact list',
    enabled: formName.length > 0 && formEmail.length > 0,
    relations: [
      { type: 'submits', targetId: formNameEntryId, description: 'Saves the contact name' },
      { type: 'submits', targetId: formEmailEntryId, description: 'Saves the contact email' },
      { type: 'submits', targetId: formRoleEntryId, description: 'Saves the contact role' },
    ],
    onExecute: async () => {
      handleSubmit();
      return { status: 'success', message: `Contact ${formName} added`, sideEffects: ['Contact list updated', 'Form closed'] };
    },
  });

  const { ref: cancelRef } = useLLMAction({
    name: 'Cancel Add Contact',
    description: 'Close the add contact form without saving',
    onExecute: async () => {
      setShowAddForm(false);
      return { status: 'success', message: 'Form cancelled' };
    },
  });

  const handleSubmit = () => {
    if (!formName || !formEmail) return;
    const newContact: Contact = {
      id: Date.now().toString(36),
      name: formName,
      email: formEmail,
      role: formRole || 'Unknown',
      status: 'active',
    };
    setContacts(prev => [...prev, newContact]);
    setShowAddForm(false);
    onNotify(`Contact "${formName}" added`, 'success');
  };

  const handleDelete = (id: string) => {
    const c = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    onNotify(`Contact "${c?.name}" deleted`, 'info');
  };

  const handleToggleStatus = (id: string) => {
    setContacts(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  const filterBtn = (label: string, value: typeof statusFilter, ref: React.Ref<HTMLButtonElement>) => (
    <button
      ref={ref}
      onClick={() => setStatusFilter(value)}
      style={{
        ...s.btnSecondary,
        background: statusFilter === value ? '#4a4aff' : '#eee',
        color: statusFilter === value ? 'white' : '#333',
        fontSize: '0.85rem',
        padding: '0.35rem 0.75rem',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={s.spaceBetween}>
        <h1>Contacts ({filtered.length})</h1>
        <button ref={addBtnRef} onClick={() => { setShowAddForm(true); setFormName(''); setFormEmail(''); setFormRole(''); }} style={s.btnPrimary}>
          + Add Contact
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <LLMScope name="Add Contact Form" description="Form to create a new contact">
          <div style={{ ...s.card, marginTop: '1rem', border: '2px solid #4a4aff' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Contact</h3>
            <label style={s.label}>
              Name *
              <input ref={formNameRef} style={s.input} value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full name" required />
            </label>
            <label style={s.label}>
              Email *
              <input ref={formEmailRef} style={s.input} type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email address" required />
            </label>
            <label style={s.label}>
              Role
              <input ref={formRoleRef} style={s.input} value={formRole} onChange={e => setFormRole(e.target.value)} placeholder="Job title" />
            </label>
            <div style={{ ...s.row, justifyContent: 'flex-end' }}>
              <button ref={cancelRef} onClick={() => setShowAddForm(false)} style={s.btnSecondary}>Cancel</button>
              <button
                ref={submitRef}
                onClick={handleSubmit}
                disabled={!formName || !formEmail}
                style={formName && formEmail ? s.btnPrimary : s.btnDisabled}
              >
                Add Contact
              </button>
            </div>
          </div>
        </LLMScope>
      )}

      {/* Filters + Search */}
      <LLMScope name="Contact Filters" description="Search, filter, and sort controls for the contact list">
        <div style={{ ...s.card, marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              style={{ ...s.input, flex: 1, minWidth: 200, marginTop: 0 }}
            />
            {filterBtn('All', 'all', filterAllRef)}
            {filterBtn('Active', 'active', filterActiveRef)}
            {filterBtn('Inactive', 'inactive', filterInactiveRef)}
            <select
              ref={sortRef}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'email' | 'role')}
              style={{ ...s.input, width: 'auto', marginTop: 0 }}
            >
              <option value="name">Sort: Name</option>
              <option value="email">Sort: Email</option>
              <option value="role">Sort: Role</option>
            </select>
          </div>
        </div>
      </LLMScope>

      {/* Contact List */}
      <LLMScope name="Contact List" description="List of all contacts with actions">
        <div style={{ marginTop: '1rem' }}>
          {filtered.map(contact => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isEditing={editingId === contact.id}
              onToggleStatus={() => handleToggleStatus(contact.id)}
              onDelete={() => handleDelete(contact.id)}
              onEdit={() => setEditingId(editingId === contact.id ? null : contact.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', color: '#999' }}>
              No contacts match your filters.
            </div>
          )}
        </div>
      </LLMScope>
    </div>
  );
}

function ContactRow({ contact, isEditing, onToggleStatus, onDelete, onEdit }: {
  contact: Contact;
  isEditing: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { ref: toggleRef } = useLLMAction({
    name: `Toggle ${contact.name} Status`,
    description: `Toggle ${contact.name} between active and inactive (currently ${contact.status})`,
    dynamicState: { status: contact.status },
    onExecute: async () => {
      onToggleStatus();
      const newStatus = contact.status === 'active' ? 'inactive' : 'active';
      return { status: 'success', message: `${contact.name} set to ${newStatus}` };
    },
  });

  const { ref: deleteRef } = useLLMAction({
    name: `Delete ${contact.name}`,
    description: `Remove ${contact.name} from the contact list permanently`,
    permission: 'dangerZone',
    onExecute: async () => {
      onDelete();
      return { status: 'success', message: `${contact.name} deleted`, sideEffects: ['Contact list updated'] };
    },
  });

  const { ref: editRef } = useLLMAction({
    name: `Edit ${contact.name}`,
    description: `View details of ${contact.name} (${contact.email}, ${contact.role})`,
    dynamicState: { expanded: isEditing },
    onExecute: async () => {
      onEdit();
      return { status: 'success', message: `${isEditing ? 'Collapsed' : 'Expanded'} ${contact.name}` };
    },
  });

  return (
    <div style={{ ...s.card, padding: '1rem 1.5rem' }}>
      <div style={s.spaceBetween}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: contact.status === 'active' ? '#4a4aff' : '#ccc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            {contact.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contact.name}</div>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>{contact.email}</div>
          </div>
          <span style={s.badge(contact.status === 'active' ? '#2ecc71' : '#e74c3c')}>
            {contact.status}
          </span>
          <span style={s.badge('#3498db')}>{contact.role}</span>
        </div>
        <div style={s.row}>
          <button ref={editRef} onClick={onEdit} style={{ ...s.btnSecondary, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
            {isEditing ? 'Close' : 'Details'}
          </button>
          <button ref={toggleRef} onClick={onToggleStatus} style={{ ...s.btnSecondary, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
            {contact.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button ref={deleteRef} onClick={onDelete} style={{ ...s.btnDanger, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
            Delete
          </button>
        </div>
      </div>
      {isEditing && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8f8ff', borderRadius: '8px', fontSize: '0.85rem', color: '#666' }}>
          <div><strong>ID:</strong> {contact.id}</div>
          <div><strong>Email:</strong> {contact.email}</div>
          <div><strong>Role:</strong> {contact.role}</div>
          <div><strong>Status:</strong> {contact.status}</div>
        </div>
      )}
    </div>
  );
}
