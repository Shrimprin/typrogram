'use client';

import { LoaderCircle, Trash } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { setToast } from '@/actions/toast';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { axiosDelete } from '@/utils/axios';

export default function DeleteAccountDialog() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  const deleteUser = async () => {
    const accessToken = session?.user?.accessToken;

    if (!accessToken) return;

    await axiosDelete('/api/users', accessToken);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Delete all data associated with your account. This action cannot be undone.\n\nAre you sure you want to delete your account?',
    );
    if (!confirmDelete) return;

    const finalConfirmation = window.confirm('Are you sure you want to delete your account?');
    if (!finalConfirmation) return;

    setIsDeleting(true);
    try {
      await deleteUser();
      await setToast({ message: 'Account deleted.', type: 'success' });
      await signOut({ redirectTo: '/' });
    } catch {
      await setToast({ message: 'Failed to delete account.', type: 'error' });
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenuItem
      onSelect={() => {
        handleDelete();
      }}
      disabled={isDeleting}
    >
      {isDeleting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
      Delete Account
    </DropdownMenuItem>
  );
}
