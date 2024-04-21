import { toast } from 'svelte-sonner';
export const notify = (message: string, type: 'success' | 'error', description = '') => {
	if (type === 'success') {
		toast.success(message, { description });
	} else {
		toast.error(message, { description });
	}
};
