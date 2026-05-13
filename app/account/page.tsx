'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faChartPie, faLayerGroup, faTrash, faUserPlus, faUsers, faWallet } from '@fortawesome/free-solid-svg-icons';
import { AppShell, Button, Heading, LoadingOverlay, Panel, Paragraph, TextField } from '../components/ui';

interface Member {
  id: string;
  name: string;
  email?: string;
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

export default function AccountPage() {
  const router = useRouter();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<Member[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (!storedEmail) {
      router.replace('/login');
      return;
    }

    setAccountEmail(storedEmail);
    const storedContacts = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
    const storedCategories = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);

    setContacts(storedContacts ? JSON.parse(storedContacts) : []);
    setCategories(storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES);
  }, [router]);

  useEffect(() => {
    if (!accountEmail) {
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/profile?email=${encodeURIComponent(accountEmail)}`);
        setProfile(response.data);
        setContacts(response.data.members || []);
        setCategories(response.data.categories?.length ? response.data.categories : DEFAULT_CATEGORIES);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [accountEmail]);

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

  const persistCategories = (nextCategories: string[]) => {
    setCategories(nextCategories);
    window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(nextCategories));
    if (accountEmail) {
      void axios.put('/api/profile', {
        email: accountEmail,
        name: profile?.name || accountEmail.split('@')[0],
        currency: profile?.currency || 'USD',
        members: contacts,
        categories: nextCategories,
      });
    }
  };

  const handleAddContact = () => {
    if (!memberName.trim()) {
      return;
    }

    const nextMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: memberName.trim(),
      email: memberEmail.trim() || undefined,
    };

    persistContacts([...contacts, nextMember]);
    setMemberName('');
    setMemberEmail('');
  };

  const handleAddCategory = () => {
    const nextCategory = categoryName.trim();
    if (!nextCategory || categories.includes(nextCategory)) {
      return;
    }

    persistCategories([...categories, nextCategory]);
    setCategoryName('');
  };

  const handleSignOut = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace('/login');
  };

  return (
    <AppShell email={accountEmail ?? undefined} onSignOut={handleSignOut}>
      <LoadingOverlay active={loading} text="Loading your account…" />
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading>Account</Heading>
            <Paragraph className="mt-2">Manage your saved members, categories, and account preferences.</Paragraph>
          </div>
          <div className="hidden md:flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push('/')}>Back to groups</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <FontAwesomeIcon icon={faUsers} className="text-primary" />
              <Heading level={2}>Saved members</Heading>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <TextField label="Name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
              <TextField label="Email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
              <Button type="button" variant="secondary" onClick={handleAddContact}>
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
                  style={{ borderColor: `rgba(0,0,0,0.08)` }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {category}
                  <button type="button" onClick={() => persistCategories(categories.filter((item) => item !== category))} className="text-muted-foreground hover:text-destructive">
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </Panel>
        </div>

        <div className="fixed inset-x-4 bottom-4 z-20 grid grid-cols-2 gap-2 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-lg md:hidden">
          <Button type="button" className="h-11 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" onClick={() => router.push('/')}>
            <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
            Groups
          </Button>
          <Button type="button" className="h-11 rounded-lg text-sm font-semibold text-sidebar-foreground" onClick={() => router.push('/account')}>
            <FontAwesomeIcon icon={faWallet} className="mr-2" />
            Account
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
