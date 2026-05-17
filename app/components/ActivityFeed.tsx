'use client';

import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ListItem, Panel, Paragraph, SectionHeader } from './ui';

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
            <SectionHeader icon={faClockRotateLeft} title="Activity" />
            {activities.length === 0 ? (
                <Paragraph>No activity yet.</Paragraph>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <ListItem
                            key={activity._id}
                            title={activity.message}
                            description={new Date(activity.createdAt).toLocaleString()}
                        />
                    ))}
                </div>
            )}
        </Panel>
    );
}
