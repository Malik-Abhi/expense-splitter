'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Group } from '@/store/appStore';
import { Heading, Paragraph, Panel } from './ui';

interface GroupCardProps {
    group: Group;
    onDelete?: (groupId: string) => void;
}

export function GroupCard({ group, onDelete }: GroupCardProps) {
    return (
        <Link href={`/group/${group._id}`} className="group block rounded-xl outline-none focus:ring-2 focus:ring-ring/60">
            <Panel className="h-full p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <Heading level={3}>{group.name}</Heading>
                        <Paragraph className="mt-1 text-sm">
                            {group.description || `${group.members.length} members`}
                        </Paragraph>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onDelete(group._id);
                                }}
                                className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Delete ${group.name}`}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                        <span className="grid h-10 w-10 place-items-center rounded-md bg-accent text-primary transition group-hover:translate-x-1">
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                    </div>
                </div>

                <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                        <FontAwesomeIcon icon={faUsers} />
                        Members
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {group.members.map((member) => (
                            <span
                                key={member.id}
                                className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-extrabold text-muted-foreground"
                            >
                                {member.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs font-bold text-muted-foreground">
                        Created: {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </Panel>
        </Link>
    );
}
