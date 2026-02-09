'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, ConfirmationDialog } from '@/components/ui';
import type { OrganizationMember, MemberRole } from '@/types/api';
import { User, Crown, Shield, UserCheck, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface MemberListProps {
  members: OrganizationMember[];
  orgId: string;
  currentUserId?: string;
  currentUserRole?: MemberRole;
  onMemberRemoved?: () => void;
}

const roleIcons: Record<MemberRole, typeof User> = {
  owner: Crown,
  admin: Shield,
  member: UserCheck,
  viewer: Eye,
};

const roleColors: Record<MemberRole, string> = {
  owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function MemberList({ members, orgId, currentUserId, currentUserRole, onMemberRemoved }: MemberListProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  
  // Ensure members is always an array
  const membersList = Array.isArray(members) ? members : [];

  const handleRemoveClick = (userId: string, memberName: string) => {
    setMemberToRemove({ userId, name: memberName });
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    
    setRemoving(memberToRemove.userId);
    try {
      const response = await api.removeMember(orgId, memberToRemove.userId);
      if (response.success) {
        onMemberRemoved?.();
        setMemberToRemove(null);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleCancelRemove = () => {
    setMemberToRemove(null);
  };

  const handleRoleChange = async (userId: string, newRole: MemberRole) => {
    setUpdatingRole(userId);
    try {
      const response = await api.updateMemberRole(orgId, userId, { role: newRole });
      if (response.success) {
        onMemberRemoved?.(); // reuse callback to refetch
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdatingRole(null);
    }
  };

  // Determine if current user can remove members
  const canRemoveMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Members ({membersList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {membersList.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">
            No members found
          </div>
        ) : (
          <div className="space-y-3">
            {membersList.map((member) => {
            const Icon = roleIcons[member.role];
            const isCurrentUser = member.user_id === currentUserId;
            
            // Permission logic:
            // - Owners can remove anyone except themselves and other owners
            // - Admins can remove members and viewers (but not owners or other admins)
            // - Members and viewers cannot remove anyone
            const canRemove = canRemoveMembers && 
              !isCurrentUser && 
              (currentUserRole === 'owner' 
                ? member.role !== 'owner'  // Owners can remove anyone except other owners
                : member.role === 'member' || member.role === 'viewer'  // Admins can only remove members/viewers
              );

            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name || member.email}</span>
                      {isCurrentUser && (
                        <Badge variant="default" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUserRole === 'owner' && !isCurrentUser && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value as MemberRole)}
                      disabled={updatingRole === member.user_id}
                      className="text-xs px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                      <option value="viewer">viewer</option>
                    </select>
                  ) : (
                    <Badge className={roleColors[member.role]}>
                      {member.role}
                    </Badge>
                  )}
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveClick(member.user_id, member.full_name || member.email)}
                      disabled={removing === member.user_id}
                      aria-label={`Remove ${member.full_name || member.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        isOpen={!!memberToRemove}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this organization? This action cannot be undone.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!removing}
      />
    </Card>
  );
}
