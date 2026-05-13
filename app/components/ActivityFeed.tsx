'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Heading, Panel, Paragraph } from './ui';

interface Activity {
    _id: string;
    type: string;
    message: string;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3">
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-primary" />
                <Heading level={2}>Activity</Heading>
            </div>
            {activities.length === 0 ? (
                <Paragraph>No activity yet.</Paragraph>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div key={activity._id} className="rounded-md border border-border bg-background/25 p-3">
                            <p className="font-semibold text-foreground">{activity.message}</p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}
