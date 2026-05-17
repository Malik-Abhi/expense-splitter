'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRightFromBracket, faWallet, faXmark } from '@fortawesome/free-solid-svg-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    icon?: IconDefinition;
}

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

export function Button({
    variant = 'primary',
    className = '',
    icon,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={joinClasses('btn', `btn-${variant}`, className)}
            {...props}
        >
            {icon && <FontAwesomeIcon icon={icon} />}
            {children}
        </button>
    );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: IconDefinition;
    label: string;
    variant?: 'default' | 'danger' | 'ghost';
}

export function IconButton({ icon, label, variant = 'default', className = '', ...props }: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={joinClasses('icon-button', `icon-button-${variant}`, className)}
            {...props}
        >
            <FontAwesomeIcon icon={icon} />
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
        return <h1 className={joinClasses(classes[level], className)}>{children}</h1>;
    }

    if (level === 2) {
        return <h2 className={joinClasses(classes[level], className)}>{children}</h2>;
    }

    return <h3 className={joinClasses(classes[level], className)}>{children}</h3>;
}

interface ParagraphProps {
    children: ReactNode;
    className?: string;
}

export function Paragraph({ children, className = '' }: ParagraphProps) {
    return <p className={joinClasses('paragraph', className)}>{children}</p>;
}

interface PanelProps {
    children: ReactNode;
    className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
    return (
        <section className="panel">
            <div className={joinClasses('panel-inner', className)}>
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
                className={joinClasses('input-field', className)}
                {...props}
            />
        </label>
    );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: ReactNode;
}

export function SelectField({ label, children, className = '', ...props }: SelectFieldProps) {
    return (
        <label className="text-field">
            <span className="text-field-label">{label}</span>
            <select className={joinClasses('input-field', className)} {...props}>
                {children}
            </select>
        </label>
    );
}

interface BadgeProps {
    children: ReactNode;
    icon?: IconDefinition;
    className?: string;
    tone?: 'default' | 'accent' | 'danger';
}

export function Badge({ children, icon, tone = 'default', className = '' }: BadgeProps) {
    return (
        <span className={joinClasses('badge', `badge-${tone}`, className)}>
            {icon && <FontAwesomeIcon icon={icon} className="badge-icon" />}
            {children}
        </span>
    );
}

interface SectionHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    icon?: IconDefinition;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({ title, description, icon, action, className = '' }: SectionHeaderProps) {
    return (
        <div className={joinClasses('section-header', className)}>
            <div className="section-header-copy">
                <div className="section-header-title">
                    {icon && <FontAwesomeIcon icon={icon} className="text-primary" />}
                    <Heading level={2}>{title}</Heading>
                </div>
                {description && <Paragraph className="text-sm">{description}</Paragraph>}
            </div>
            {action && <div className="section-header-action">{action}</div>}
        </div>
    );
}

interface EmptyStateProps {
    icon?: IconDefinition;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={joinClasses('empty-state', className)}>
            {icon && (
                <span className="empty-state-icon">
                    <FontAwesomeIcon icon={icon} />
                </span>
            )}
            <Heading level={2}>{title}</Heading>
            {description && <Paragraph className="mt-3">{description}</Paragraph>}
            {action && <div className="mt-7">{action}</div>}
        </div>
    );
}

interface ListItemProps {
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    className?: string;
}

export function ListItem({ title, description, leading, trailing, className = '' }: ListItemProps) {
    return (
        <div className={joinClasses('list-item', className)}>
            {leading && <div className="list-item-leading">{leading}</div>}
            <div className="list-item-copy">
                <p className="list-item-title">{title}</p>
                {description && <p className="list-item-description">{description}</p>}
            </div>
            {trailing && <div className="list-item-trailing">{trailing}</div>}
        </div>
    );
}

interface SegmentedControlOption<T extends string> {
    value: T;
    label: string;
    icon?: IconDefinition;
}

interface SegmentedControlProps<T extends string> {
    options: Array<SegmentedControlOption<T>>;
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: SegmentedControlProps<T>) {
    return (
        <div className={joinClasses('segmented-control', className)}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={joinClasses('segmented-control-item', value === option.value && 'is-active')}
                >
                    {option.icon && <FontAwesomeIcon icon={option.icon} />}
                    {option.label}
                </button>
            ))}
        </div>
    );
}

interface BottomNavItem {
    href: string;
    label: string;
    icon: IconDefinition;
}

interface BottomNavProps {
    items: BottomNavItem[];
    activeHref: string;
}

export function BottomNav({ items, activeHref }: BottomNavProps) {
    return (
        <nav className="bottom-nav" aria-label="Primary">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={joinClasses('bottom-nav-link', activeHref === item.href && 'is-active')}
                >
                    <FontAwesomeIcon icon={item.icon} />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

interface ModalProps {
    title: ReactNode;
    children: ReactNode;
    onClose: () => void;
}

export function Modal({ title, children, onClose }: ModalProps) {
    return (
        <div className="modal-backdrop">
            <Panel className="modal-panel">
                <IconButton
                    icon={faXmark}
                    label="Close modal"
                    variant="ghost"
                    onClick={onClose}
                    className="modal-close"
                />
                <Heading level={2} className="mb-6">{title}</Heading>
                {children}
            </Panel>
        </div>
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
