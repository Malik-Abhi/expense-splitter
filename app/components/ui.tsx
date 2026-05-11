import Link from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-primary-foreground shadow-md hover:brightness-105 active:translate-y-px',
    secondary:
        'bg-accent text-accent-foreground hover:bg-secondary hover:text-secondary-foreground',
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
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-extrabold transition ${buttonVariants[variant]} ${className}`}
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
        1: 'text-4xl font-black leading-tight tracking-normal text-foreground md:text-5xl',
        2: 'text-2xl font-black leading-tight tracking-normal text-foreground',
        3: 'text-lg font-extrabold leading-snug tracking-normal text-foreground',
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
    return <p className={`text-base font-bold leading-7 text-muted-foreground ${className}`}>{children}</p>;
}

interface PanelProps {
    children: ReactNode;
    className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
    return (
        <section className={`rounded-xl border border-border bg-card/75 shadow-lg ${className}`}>
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
            <span className="text-sm font-extrabold text-foreground">{label}</span>
            <input
                className={`h-12 w-full rounded-lg border border-input bg-background/35 px-4 text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-ring/35 ${className}`}
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
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground shadow-md">
                <span className="relative h-5 w-6 rounded-sm border-2 border-current">
                    <span className="absolute -right-1 top-1.5 h-2.5 w-2.5 rounded-sm border-2 border-current bg-primary" />
                    <span className="absolute left-1 top-1 h-0.5 w-3 rounded-full bg-current" />
                </span>
            </span>
            <span className="text-2xl font-black text-primary">Splitmint</span>
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
    return (
        <main className="min-h-screen overflow-hidden rounded-xl border border-border/50 bg-background/85 shadow-2xl">
            <header className="border-b border-border/70">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
                    <Logo href="/" />
                    {email && (
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="hidden truncate text-sm font-extrabold text-muted-foreground sm:block">
                                {email}
                            </span>
                            <Button
                                type="button"
                                aria-label="Sign out"
                                onClick={onSignOut}
                                className="h-11 w-14 px-0 text-xl"
                            >
                                ↪
                            </Button>
                        </div>
                    )}
                </div>
            </header>
            {children}
        </main>
    );
}
