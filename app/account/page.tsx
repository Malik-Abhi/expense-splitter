'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faLayerGroup, faTrash, faUserPlus, faUsers, faWallet } from '@fortawesome/free-solid-svg-icons';
import { AppShell, Badge, BottomNav, Button, Heading, IconButton, ListItem, LoadingOverlay, Panel, Paragraph, SectionHeader, TextField } from '../components/ui';

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
  const [accountEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountEmail) {
      router.replace('/login');
    }
  }, [accountEmail, router]);

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
            <SectionHeader icon={faUsers} title="Saved members" />
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
                  <ListItem
                    key={contact.id}
                    title={contact.name}
                    description={contact.email || 'No email saved'}
                    trailing={
                      <IconButton
                        icon={faTrash}
                        label={`Delete ${contact.name}`}
                        variant="danger"
                        onClick={() => persistContacts(contacts.filter((item) => item.id !== contact.id))}
                      />
                    }
                  />
                ))
              )}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeader icon={faChartPie} title="Categories" />
            <div className="flex gap-2">
              <TextField label="New category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
              <Button type="button" className="mt-7" onClick={handleAddCategory}>
                Add
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  className="py-1.5"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {category}
                  <IconButton
                    icon={faTrash}
                    label={`Delete ${category}`}
                    variant="danger"
                    onClick={() => persistCategories(categories.filter((item) => item !== category))}
                    className="h-6 w-6 border-0 bg-transparent"
                  />
                </Badge>
              ))}
            </div>
          </Panel>
        </div>

        <BottomNav
          activeHref="/account"
          items={[
            { href: '/', label: 'Groups', icon: faLayerGroup },
            { href: '/account', label: 'Account', icon: faWallet },
          ]}
        />
      </div>
    </AppShell>
  );
}
