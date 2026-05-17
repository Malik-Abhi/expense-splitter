'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderPlus,
  faLayerGroup,
  faPlus,
  faTrash,
  faUserPlus,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { GroupCard } from './components/GroupCard';
import { AppShell, Badge, BottomNav, Button, EmptyState, Heading, IconButton, ListItem, LoadingOverlay, Panel, Paragraph, SectionHeader, TextField } from './components/ui';

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Member[];
  createdAt: string;
}

interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  currency?: string;
  members: Member[];
  categories: string[];
}

const AUTH_STORAGE_KEY = 'splitmint-account-email';
const CONTACTS_STORAGE_KEY = 'splitmint-account-members';
const CATEGORIES_STORAGE_KEY = 'splitmint-categories';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities'];

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [contacts, setContacts] = useState<Member[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const storedContacts = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
    return storedContacts ? JSON.parse(storedContacts) : [];
  });
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_CATEGORIES;
    }

    const storedCategories = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES;
  });
  const [accountEmail, setAccountEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (accountEmail === null) {
      router.replace('/login');
    }
  }, [accountEmail, router]);

  const persistContacts = (nextContacts: Member[]) => {
    setContacts(nextContacts);
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
    if (accountEmail) {
      void axios.put('/api/profile', {
        email: accountEmail,
        name: profile?.name || accountEmail.split('@')[0],
        currency: profile?.currency || 'USD',
        members: nextContacts,
        categories,
      });
    }
  };

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accountEmail) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`/api/profile?email=${encodeURIComponent(accountEmail)}`);
          setProfile(response.data);
          const nextContacts = response.data.members || [];
          const nextCategories = response.data.categories?.length ? response.data.categories : DEFAULT_CATEGORIES;
          setContacts(nextContacts);
          setCategories(nextCategories);
          window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
          window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(nextCategories));
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };
      void fetchProfile();
      void Promise.resolve().then(fetchGroups);
    }
  }, [accountEmail, fetchGroups]);

  const addMemberToDraft = () => {
    if (!memberName.trim()) {
      return;
    }

    const member = {
      id: makeId('member'),
      name: memberName.trim(),
      email: memberEmail.trim() || undefined,
    };

    setSelectedMembers((current) => [...current, member]);
    if (!contacts.some((contact) => contact.email && contact.email === member.email)) {
      persistContacts([...contacts, member]);
    }
    setMemberName('');
    setMemberEmail('');
  };

  const removeDraftMember = (memberId: string) => {
    setSelectedMembers((current) => current.filter((member) => member.id !== memberId));
  };

  const addContactToDraft = (contact: Member) => {
    if (selectedMembers.some((member) => member.id === contact.id)) {
      return;
    }
    setSelectedMembers((current) => [...current, contact]);
  };

  const handleSignOut = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAccountEmail(null);
    setProfile(null);
    setGroups([]);
    setShowForm(false);
  };

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newGroupName || selectedMembers.length === 0) {
      alert('Add a group name and at least one member');
      return;
    }

    try {
      const response = await axios.post('/api/groups', {
        name: newGroupName,
        description: newGroupDescription,
        members: selectedMembers,
        createdBy: accountEmail || 'user-1',
      });

      setGroups((currentGroups) => [response.data, ...currentGroups]);
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedMembers([]);
      setShowForm(false);
    } catch (error) {
      alert('Failed to create group');
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find((item) => item._id === groupId);
    const confirmed = window.confirm(`Delete ${group?.name || 'this group'}? This also removes its expenses and activity.`);
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/groups/${groupId}`);
      setGroups((currentGroups) => currentGroups.filter((item) => item._id !== groupId));
    } catch (error) {
      alert('Failed to delete group');
      console.error(error);
    }
  };

  if (!accountEmail) {
    return null;
  }

  return (
    <AppShell email={accountEmail} onSignOut={handleSignOut}>
      <LoadingOverlay active={loading} text="Syncing your groups..." />
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading>Groups</Heading>
            <Paragraph className="mt-2">Manage shared expenses without messy follow-ups.</Paragraph>
          </div>
          <div className="hidden flex-wrap gap-2 md:flex">
            <Link href="/" className="inline-flex">
              <Button type="button" variant="primary">
                <FontAwesomeIcon icon={faLayerGroup} />
                Groups
              </Button>
            </Link>
            <Link href="/account" className="inline-flex">
              <Button type="button" variant="secondary">
                <FontAwesomeIcon icon={faWallet} />
                Account
              </Button>
            </Link>
          </div>
        </div>

        <>
          <div className="mb-6 flex justify-end">
            <Button type="button" onClick={() => setShowForm((current) => !current)}>
              <FontAwesomeIcon icon={faFolderPlus} />
              New group
            </Button>
          </div>

          {showForm && (
            <Panel className="p-6">
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Group name"
                    type="text"
                    value={newGroupName}
                    onChange={(event) => setNewGroupName(event.target.value)}
                    placeholder="Trip to Manali"
                  />
                  <TextField
                    label="Description"
                    type="text"
                    value={newGroupDescription}
                    onChange={(event) => setNewGroupDescription(event.target.value)}
                    placeholder="Optional note"
                  />
                </div>

                <div className="rounded-lg border border-border bg-background/25 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <SectionHeader
                      title="Members"
                      description="Add members one at a time or pick from saved contacts."
                      className="mb-0"
                      action={<Badge tone="accent">{selectedMembers.length} selected</Badge>}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <TextField label="Name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                    <TextField label="Email" type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                    <Button type="button" variant="secondary" onClick={addMemberToDraft}>
                      <FontAwesomeIcon icon={faUserPlus} />
                      Add member
                    </Button>
                  </div>

                  {contacts.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {contacts.map((contact) => (
                        <Button
                          key={contact.id}
                          type="button"
                          variant="secondary"
                          onClick={() => addContactToDraft(contact)}
                          className="h-9 rounded-full"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          {contact.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mt-5 grid gap-2 md:grid-cols-2">
                      {selectedMembers.map((member) => (
                        <ListItem
                          key={member.id}
                          title={member.name}
                          description={member.email || 'No email saved'}
                          className="bg-card"
                          trailing={
                            <IconButton
                              icon={faTrash}
                              label={`Remove ${member.name}`}
                              variant="danger"
                              onClick={() => removeDraftMember(member.id)}
                            />
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Create group</Button>
                </div>
              </form>
            </Panel>
          )}
          {!showForm ?
            <>
              {loading ? (
                <Panel className="grid min-h-80 place-items-center border-dashed p-10">
                  <Paragraph>Loading groups...</Paragraph>
                </Panel>
              ) : groups.length === 0 ? (
                <Panel className="grid min-h-96 place-items-center border-dashed p-10 text-center">
                  <EmptyState
                    icon={faUsers}
                    title="No groups yet"
                    description="Create one for a trip, apartment, project, or recurring dinner plan."
                    action={
                      <Button type="button" onClick={() => setShowForm(true)} icon={faFolderPlus}>
                        Create your first group
                      </Button>
                    }
                  />
                </Panel>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {groups.map((group) => (
                    <GroupCard key={group._id} group={group} onDelete={handleDeleteGroup} />
                  ))}
                </div>
              )}
            </> : null}
        </>
        <BottomNav
          activeHref="/"
          items={[
            { href: '/', label: 'Groups', icon: faLayerGroup },
            { href: '/account', label: 'Account', icon: faWallet },
          ]}
        />
      </div>
    </AppShell>
  );
}
