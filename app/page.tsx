'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { GroupCard } from './components/GroupCard';
import { useAppStore } from '@/store/appStore';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ id: string; name: string }>;
  createdAt: string;
}

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName || !newGroupMembers) {
      alert('Please fill all fields');
      return;
    }

    try {
      const members = newGroupMembers.split(',').map((name, i) => ({
        id: `member-${i}`,
        name: name.trim(),
      }));

      const response = await axios.post('/api/groups', {
        name: newGroupName,
        members,
        createdBy: 'user-1',
      });

      setGroups([...groups, response.data]);
      setNewGroupName('');
      setNewGroupMembers('');
      setShowForm(false);
    } catch (error) {
      alert('Failed to create group');
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Split Bills Smartly</h1>
          <p className="text-lg text-gray-600">
            Upload receipts. AI splits fairly. Everyone pays their share. Done.
          </p>
        </div>

        {/* Create Group Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            ➕ Create New Group
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="max-w-md mx-auto mb-12 bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Vegas Trip"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Members (comma-separated)
                </label>
                <input
                  type="text"
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  placeholder="e.g., Alice, Bob, Carol"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {/* Groups Grid */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No groups yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}