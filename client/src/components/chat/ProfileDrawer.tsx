import { User } from '../../types';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Button } from '../../ui/Button';

interface Props {
  user: User;
  onClose: () => void;
  isOpen: boolean;
}

export function ProfileDrawer({ user, onClose, isOpen }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white p-6 shadow-xl dark:bg-slate-900 overflow-y-auto animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
          ✕
        </button>
        
        <div className="flex flex-col items-center">
            <img 
               src={resolveAssetUrl(user.avatarUrl)} 
               alt={user.name} 
               className="h-24 w-24 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
        </div>
        
        <div className="mt-8 space-y-4">
            <div>
               <h3 className="font-medium text-slate-900 dark:text-slate-100">Organization</h3>
               <p className="text-slate-600 dark:text-slate-400">{user.organization || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-medium text-slate-900 dark:text-slate-100">Position</h3>
               <p className="text-slate-600 dark:text-slate-400">{user.position || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-medium text-slate-900 dark:text-slate-100">Bio</h3>
               <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{user.bio || 'No bio'}</p>
            </div>
        </div>
        
        <div className="mt-8">
            <Button className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
