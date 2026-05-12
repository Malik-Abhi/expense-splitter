'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faChartPie,
  faFolderPlus,
  faLayerGroup,
  faPlus,
  faTrash,
  faUserPlus,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { GroupCard } from './components/GroupCard';
import { AppShell, Button, Heading, Logo, Panel, Paragraph, TextField } from './components/ui';

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

interface Expense {
  _id: string;
  groupId: string;
  amount: number;
  paidBy: { id: string; name: string };
  splits: Array<{ personId: string; name: string; amount: number }>;
}

type AuthMode = 'sign-in' | 'create-account';
type HomeView = 'groups' | 'account';

const AUTH_STORAGE_KEY = 'splitmint-account-email';
const CONTACTS_STORAGE_KEY = 'splitmint-account-members';
const CATEGORIES_STORAGE_KEY = 'splitmint-categories';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities'];
const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expensesByGroup, setExpensesByGroup] = useState<Record<string, Expense[]>>({});
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
  const [categoryName, setCategoryName] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [activeView, setActiveView] = useState<HomeView>('groups');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountEmail, setAccountEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  });

  const persistContacts = (nextContacts: Member[]) => {
    setContacts(nextContacts);
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
  };

  const persistCategories = (nextCategories: string[]) => {
    setCategories(nextCategories);
    window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(nextCategories));
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
      void Promise.resolve().then(fetchGroups);
    }
  }, [accountEmail, fetchGroups]);

  useEffect(() => {
    if (!groups.length) {
      return;
    }

    let cancelled = false;

    const fetchExpenses = async () => {
      const entries = await Promise.all(
        groups.map(async (group) => {
          try {
            const response = await axios.get(`/api/expenses?groupId=${group._id}`);
            return [group._id, response.data] as const;
          } catch {
            return [group._id, []] as const;
          }
        })
      );

      if (!cancelled) {
        setExpensesByGroup(Object.fromEntries(entries));
      }
    };

    void fetchExpenses();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  const accountSummary = useMemo(() => {
    return groups.map((group) => {
      const balances: Record<string, number> = {};
      group.members.forEach((member) => {
        balances[member.id] = 0;
      });

      (expensesByGroup[group._id] || []).forEach((expense) => {
        balances[expense.paidBy.id] = (balances[expense.paidBy.id] || 0) + expense.amount;
        expense.splits.forEach((split) => {
          balances[split.personId] = (balances[split.personId] || 0) - split.amount;
        });
      });

      const outstanding = Object.entries(balances)
        .filter(([, amount]) => Math.abs(amount) > 0.01)
        .map(([memberId, amount]) => ({
          member: group.members.find((member) => member.id === memberId)?.name || memberId,
          amount,
        }));

      return {
        groupId: group._id,
        groupName: group.name,
        members: group.members.length,
        totalSpend: (expensesByGroup[group._id] || []).reduce((sum, expense) => sum + expense.amount, 0),
        outstanding,
      };
    });
  }, [expensesByGroup, groups]);

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

  const saveAccountContact = () => {
    if (!memberName.trim()) {
      return;
    }

    persistContacts([
      ...contacts,
      {
        id: makeId('contact'),
        name: memberName.trim(),
        email: memberEmail.trim() || undefined,
      },
    ]);
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

  const handleAddCategory = () => {
    const nextCategory = categoryName.trim();
    if (!nextCategory || categories.includes(nextCategory)) {
      return;
    }

    persistCategories([...categories, nextCategory]);
    setCategoryName('');
  };

  const handleRemoveCategory = (category: string) => {
    persistCategories(categories.filter((item) => item !== category));
  };

  if (!accountEmail) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex justify-center">
            <Logo centered />
          </div>

          <Panel className="p-7">
            <div className="mb-8 grid rounded-md border border-border bg-background/30 p-1">
              <div className="grid grid-cols-2 gap-1">
                {(['sign-in', 'create-account'] as AuthMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAuthMode(mode)}
                    className={`h-10 rounded-sm text-sm font-semibold transition ${authMode === mode
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
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
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading>{activeView === 'groups' ? 'Groups' : 'My account'}</Heading>
            <Paragraph className="mt-2">
              {activeView === 'groups'
                ? 'Manage shared expenses without messy follow-ups.'
                : 'Contacts, categories, and pending balances across your groups.'}
            </Paragraph>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={activeView === 'groups' ? 'primary' : 'secondary'} onClick={() => setActiveView('groups')}>
              <FontAwesomeIcon icon={faLayerGroup} />
              Groups
            </Button>
            <Button type="button" variant={activeView === 'account' ? 'primary' : 'secondary'} onClick={() => setActiveView('account')}>
              <FontAwesomeIcon icon={faWallet} />
              Account
            </Button>
          </div>
        </div>

        {activeView === 'groups' ? (
          <>
            <div className="mb-6 flex justify-end">
              <Button type="button" onClick={() => setShowForm((current) => !current)}>
                <FontAwesomeIcon icon={faFolderPlus} />
                New group
              </Button>
            </div>

            {showForm && (
              <Panel className="mb-8 p-6">
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
                      <div>
                        <Heading level={3}>Members</Heading>
                        <Paragraph className="text-sm">Add members one at a time or pick from saved contacts.</Paragraph>
                      </div>
                      <span className="rounded-md bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                        {selectedMembers.length} selected
                      </span>
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
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => addContactToDraft(contact)}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground"
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            {contact.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedMembers.length > 0 && (
                      <div className="mt-5 grid gap-2 md:grid-cols-2">
                        {selectedMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                            <div>
                              <p className="font-semibold text-foreground">{member.name}</p>
                              {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDraftMember(member.id)}
                              className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                              aria-label={`Remove ${member.name}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
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

            {loading ? (
              <Panel className="grid min-h-80 place-items-center border-dashed p-10">
                <Paragraph>Loading groups...</Paragraph>
              </Panel>
            ) : groups.length === 0 ? (
              <Panel className="grid min-h-96 place-items-center border-dashed p-10 text-center">
                <div className="mx-auto max-w-xl">
                  <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-lg bg-accent text-primary">
                    <FontAwesomeIcon icon={faUsers} className="h-7 w-7" />
                  </div>
                  <Heading level={2}>No groups yet</Heading>
                  <Paragraph className="mt-3">Create one for a trip, apartment, project, or recurring dinner plan.</Paragraph>
                  <Button type="button" onClick={() => setShowForm(true)} className="mt-8">
                    <FontAwesomeIcon icon={faFolderPlus} />
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
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Panel className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <FontAwesomeIcon icon={faUsers} className="text-primary" />
                <Heading level={2}>Saved members</Heading>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <TextField label="Name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                <TextField label="Email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                <Button type="button" variant="secondary" onClick={saveAccountContact}>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Save
                </Button>
              </div>
              <div className="mt-5 grid gap-2">
                {contacts.length === 0 ? (
                  <Paragraph>No saved members yet.</Paragraph>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between rounded-md border border-border bg-background/25 p-3">
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email || 'No email saved'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => persistContacts(contacts.filter((item) => item.id !== contact.id))}
                        className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <FontAwesomeIcon icon={faChartPie} className="text-primary" />
                <Heading level={2}>Categories</Heading>
              </div>
              <div className="flex gap-2">
                <TextField label="New category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
                <Button type="button" className="mt-7" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 rounded-full border bg-background/30 px-3 py-1.5 text-sm font-semibold"
                    style={{ borderColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    {category}
                    <button type="button" onClick={() => handleRemoveCategory(category)} className="text-muted-foreground hover:text-destructive">
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </Panel>

            <Panel className="p-6 lg:col-span-2">
              <div className="mb-5 flex items-center gap-3">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-primary" />
                <Heading level={2}>Pending by group</Heading>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {accountSummary.length === 0 ? (
                  <Paragraph>No group activity yet.</Paragraph>
                ) : (
                  accountSummary.map((summary) => (
                    <div key={summary.groupId} className="rounded-lg border border-border bg-background/25 p-4 transition hover:-translate-y-1 hover:border-primary/40">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{summary.groupName}</p>
                          <p className="text-sm text-muted-foreground">{summary.members} members</p>
                        </div>
                        <span className="rounded-md bg-accent px-2.5 py-1 font-mono text-sm font-semibold">
                          ${summary.totalSpend.toFixed(2)}
                        </span>
                      </div>
                      {summary.outstanding.length === 0 ? (
                        <Paragraph className="text-sm">Everyone is settled.</Paragraph>
                      ) : (
                        <div className="space-y-2">
                          {summary.outstanding.map((item) => (
                            <div key={item.member} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.member}</span>
                              <span className={item.amount >= 0 ? 'font-mono font-semibold text-primary' : 'font-mono font-semibold text-destructive'}>
                                {item.amount >= 0 ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}
