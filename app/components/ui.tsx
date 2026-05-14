'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
            className={`btn btn-${variant} ${className}`}
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
        1: 'heading-1',
        2: 'heading-2',
        3: 'heading-3',
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
    return <p className={`paragraph ${className}`}>{children}</p>;
}

interface PanelProps {
    children: ReactNode;
    className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className={`panel reveal ${visible ? 'reveal-visible' : ''}`}
        >
            <div className={`panel-inner ${className}`}>
                {children}
            </div>
        </section>
    );
}

interface LoadingOverlayProps {
    active: boolean;
    text?: string;
}

export function LoadingOverlay({ active, text = 'Loading...' }: LoadingOverlayProps) {
    if (!active) {
        return null;
    }

    return (
        <div className="loading-overlay">
            <div className="loading-card">
                <div className="loading-spinner" />
                <span className="paragraph">{text}</span>
            </div>
        </div>
    );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function TextField({ label, className = '', ...props }: TextFieldProps) {
    return (
        <label className="text-field">
            <span className="text-field-label">{label}</span>
            <input
                className={`input-field ${className}`}
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
        <span className={`logo ${centered ? 'justify-center' : ''}`}>
            <span className="logo-badge">
                <FontAwesomeIcon icon={faWallet} className="icon-small" />
            </span>
            <span className="logo-title">Splitmint</span>
        </span>
    );

    if (href) {
        return (
            <Link href={href} className="logo-link">
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
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.localStorage.getItem('splitmint-theme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle('dark', nextIsDark);
        window.localStorage.setItem('splitmint-theme', nextIsDark ? 'dark' : 'light');
        setIsDark(nextIsDark);
    };

    return (
        <main className="app-shell">
            <header className="app-shell-header">
                <div className="app-shell-header-inner">
                    <Logo href="/" />
                    {email && (
                        <div className="app-shell-actions">
                            <span className="account-email">
                                {email}
                            </span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={!isDark}
                                    onChange={toggleTheme}
                                    aria-label={!isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                />
                                <span className="slider" />
                            </label>
                            <button
                                type="button"
                                aria-label="Sign out"
                                title="Sign out"
                                onClick={onSignOut}
                                className="signout-button"
                            >
                                <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon-xs" />
                            </button>
                        </div>
                    )}
                </div>
            </header>
            {children}
        </main>
    );
}
