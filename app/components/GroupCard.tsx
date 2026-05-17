'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Badge, Heading, IconButton, Paragraph, Panel } from './ui';

interface Group {
    _id: string;
    name: string;
    description?: string;
    members: Array<{ id: string; name: string }>;
    createdAt: string;
}

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
                            <IconButton
                                icon={faTrash}
                                label={`Delete ${group.name}`}
                                variant="danger"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onDelete(group._id);
                                }}
                            />
                        )}
                        <span className="grid h-10 w-10 place-items-center rounded-md bg-accent text-primary transition group-hover:translate-x-1">
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                    </div>
                </div>

                <div>
                    <Paragraph className="flex items-center gap-2 text-xs font-semibold uppercase">
                        <FontAwesomeIcon icon={faUsers} />
                        Members
                    </Paragraph>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {group.members.map((member) => (
                            <Badge key={member.id}>
                                {member.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                    <Paragraph className="text-xs font-bold">
                        Created: {new Date(group.createdAt).toLocaleDateString()}
                    </Paragraph>
                </div>
            </Panel>
        </Link>
    );
}
