'use client';

import Link from 'next/link';
import { Group } from '@/store/appStore';

interface GroupCardProps {
    group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
    return (
        <Link href={`/group/${group._id}`}>
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>

                <div className="mt-4">
                    <p className="text-xs text-gray-500 font-semibold">Members:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {group.members.map((member) => (
                            <span
                                key={member.id}
                                className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                                {member.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Created: {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </Link>
    );
}