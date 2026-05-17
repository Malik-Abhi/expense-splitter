'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button, Logo, Panel, Paragraph, TextField, LoadingOverlay, SegmentedControl } from '../components/ui';

const AUTH_STORAGE_KEY = 'splitmint-account-email';
const CONTACTS_STORAGE_KEY = 'splitmint-account-members';
const CATEGORIES_STORAGE_KEY = 'splitmint-categories';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities'];

type AuthMode = 'sign-in' | 'create-account';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (storedEmail) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth', { email, password, mode });
      const nextProfile = response.data.user;

      window.localStorage.setItem(AUTH_STORAGE_KEY, nextProfile.email);
      window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextProfile.members || []));
      window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(nextProfile.categories || DEFAULT_CATEGORIES));

      router.replace('/');
    } catch (error) {
      setError('Could not sign in. Check your credentials or create an account.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12">
      <LoadingOverlay active={loading} text={mode === 'sign-in' ? 'Signing in…' : 'Creating account…'} />
      <div className="w-full max-w-lg">
        <div className="mb-10 flex justify-center">
          <Logo centered />
        </div>

        <Panel className="p-7">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            className="mb-8 grid-cols-2"
            options={[
              { value: 'sign-in', label: 'Sign in' },
              { value: 'create-account', label: 'Create account' },
            ]}
          />

          {error && <Paragraph className="mb-4 text-destructive">{error}</Paragraph>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            />
            <Button type="submit" className="w-full">
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </Panel>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? Use the same email and password to sign in.
        </div>
      </div>
    </main>
  );
}
