'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faMoon, faSun, faWallet } from '@fortawesome/free-solid-svg-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:translate-y-px',
    secondary:
        'border border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent',
    ghost:
        'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
};

export function Button({
    variant = 'primary',
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring/40 ${buttonVariants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

interface HeadingProps {
    children: ReactNode;
    level?: 1 | 2 | 3;
    className?: string;
}

export function Heading({ children, level = 1, className = '' }: HeadingProps) {
    const classes = {
        1: 'text-4xl font-bold leading-tight tracking-normal text-foreground md:text-5xl',
        2: 'text-2xl font-bold leading-tight tracking-normal text-foreground',
        3: 'text-lg font-semibold leading-snug tracking-normal text-foreground',
    };

    if (level === 1) {
        return <h1 className={`${classes[level]} ${className}`}>{children}</h1>;
    }

    if (level === 2) {
        return <h2 className={`${classes[level]} ${className}`}>{children}</h2>;
    }

    return <h3 className={`${classes[level]} ${className}`}>{children}</h3>;
}

interface ParagraphProps {
    children: ReactNode;
    className?: string;
}

export function Paragraph({ children, className = '' }: ParagraphProps) {
    return <p className={`text-base font-medium leading-7 text-muted-foreground ${className}`}>{children}</p>;
}

interface PanelProps {
    children: ReactNode;
    className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
    return (
        <section className={`rounded-lg border border-border bg-card/80 shadow-sm transition duration-200 hover:border-primary/25 ${className}`}>
            {children}
        </section>
    );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function TextField({ label, className = '', ...props }: TextFieldProps) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <input
                className={`h-11 w-full rounded-md border border-input bg-background/40 px-3 text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-ring/30 ${className}`}
                {...props}
            />
        </label>
    );
}

interface LogoProps {
    href?: string;
    centered?: boolean;
}

export function Logo({ href, centered = false }: LogoProps) {
    const content = (
        <span className={`inline-flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
            <span className="grid h-10 w-10 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <FontAwesomeIcon icon={faWallet} className="h-5 w-5" />
            </span>
            <span className="text-2xl font-bold text-sidebar-primary">Splitmint</span>
        </span>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex rounded-lg outline-none focus:ring-2 focus:ring-ring/60">
                {content}
            </Link>
        );
    }

    return content;
}

interface AppShellProps {
    children: ReactNode;
    email?: string;
    onSignOut?: () => void;
}

export function AppShell({ children, email, onSignOut }: AppShellProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('splitmint-theme');
        const shouldUseDark = storedTheme === 'dark';
        document.documentElement.classList.toggle('dark', shouldUseDark);
        setIsDark(shouldUseDark);
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle('dark', nextIsDark);
        window.localStorage.setItem('splitmint-theme', nextIsDark ? 'dark' : 'light');
        setIsDark(nextIsDark);
    };

    return (
        <main className="min-h-screen overflow-hidden border border-border/50 bg-background/90 shadow-2xl">
            <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
                    <Logo href="/" />
                    {email && (
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="hidden truncate text-sm font-semibold text-sidebar-foreground/80 sm:block">
                                {email}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isDark}
                                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                title={isDark ? 'Light mode' : 'Dark mode'}
                                onClick={toggleTheme}
                                className="relative inline-flex h-10 w-20 items-center rounded-full border border-sidebar-border bg-sidebar-accent px-1.5 text-sidebar-accent-foreground shadow-xs transition hover:-translate-y-0.5 hover:border-sidebar-ring focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
                            >
                                <span className="grid h-7 w-7 place-items-center text-sidebar-accent-foreground/70">
                                    <FontAwesomeIcon icon={faSun} className="h-3.5 w-3.5" />
                                </span>
                                <span className="ml-auto grid h-7 w-7 place-items-center text-sidebar-accent-foreground/70">
                                    <FontAwesomeIcon icon={faMoon} className="h-3.5 w-3.5" />
                                </span>
                                <span
                                    className={`absolute top-1 grid h-8 w-8 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-9' : 'translate-x-0'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="h-3.5 w-3.5" />
                                </span>
                            </button>
                            <button
                                type="button"
                                aria-label="Sign out"
                                title="Sign out"
                                onClick={onSignOut}
                                className="grid h-10 w-10 place-items-center rounded-md border border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground shadow-xs transition hover:-translate-y-0.5 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
                            >
                                <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </header>
            {children}
        </main>
    );
}
