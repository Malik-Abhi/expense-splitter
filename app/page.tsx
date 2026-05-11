'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { GroupCard } from './components/GroupCard';
import { AppShell, Button, Heading, Logo, Panel, Paragraph, TextField } from './components/ui';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ id: string; name: string }>;
  createdAt: string;
}

type AuthMode = 'sign-in' | 'create-account';

const AUTH_STORAGE_KEY = 'splitmint-account-email';

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

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
    const storedEmail = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedEmail) {
      setAccountEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (accountEmail) {
      fetchGroups();
    }
  }, [accountEmail, fetchGroups]);

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, email);
    setAccountEmail(email);
  };

  const handleSignOut = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAccountEmail(null);
    setGroups([]);
    setShowForm(false);
  };

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newGroupName || !newGroupMembers) {
      alert('Please fill all fields');
      return;
    }

    try {
      const members = newGroupMembers.split(',').map((name, index) => ({
        id: `member-${index}`,
        name: name.trim(),
      }));

      const response = await axios.post('/api/groups', {
        name: newGroupName,
        members,
        createdBy: accountEmail || 'user-1',
      });

      setGroups((currentGroups) => [response.data, ...currentGroups]);
      setNewGroupName('');
      setNewGroupMembers('');
      setShowForm(false);
    } catch (error) {
      alert('Failed to create group');
      console.error(error);
    }
  };

  if (!accountEmail) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-12 flex justify-center">
            <Logo centered />
          </div>

          <Panel className="p-8">
            <div className="mb-9 grid rounded-lg bg-accent p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('sign-in')}
                  className={`h-11 rounded-md text-sm font-extrabold transition ${authMode === 'sign-in'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('create-account')}
                  className={`h-11 rounded-md text-sm font-extrabold transition ${authMode === 'create-account'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Create account
                </button>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-7">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
              />
              <Button type="submit" className="w-full">
                {authMode === 'sign-in' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </Panel>
        </div>
      </main>
    );
  }

  return (
    <AppShell email={accountEmail} onSignOut={handleSignOut}>
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading>Your groups</Heading>
            <Paragraph className="mt-2 text-xl">Split bills with the people you spend with.</Paragraph>
          </div>
          <Button type="button" onClick={() => setShowForm((current) => !current)}>
            <span className="text-2xl leading-none">+</span>
            New group
          </Button>
        </div>

        {showForm && (
          <Panel className="mb-8 p-6">
            <form onSubmit={handleCreateGroup} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <TextField
                label="Group name"
                type="text"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="Trip to Manali"
              />
              <TextField
                label="Members"
                type="text"
                value={newGroupMembers}
                onChange={(event) => setNewGroupMembers(event.target.value)}
                placeholder="Aryan, Rupal, Gunjan"
              />
              <Button type="submit" className="w-full md:w-auto">
                Create
              </Button>
            </form>
          </Panel>
        )}

        {loading ? (
          <Panel className="grid min-h-80 place-items-center border-dashed p-10">
            <Paragraph>Loading groups...</Paragraph>
          </Panel>
        ) : groups.length === 0 ? (
          <Panel className="grid min-h-96 place-items-center border-dashed p-10 text-center">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-xl bg-accent text-primary">
                <span className="text-4xl">♧</span>
              </div>
              <Heading level={2}>No groups yet</Heading>
              <Paragraph className="mt-3 text-xl">
                Start one for your roommates, your trip, your dinner club.
              </Paragraph>
              <Button type="button" onClick={() => setShowForm(true)} className="mt-8">
                <span className="text-2xl leading-none">+</span>
                Create your first group
              </Button>
            </div>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
