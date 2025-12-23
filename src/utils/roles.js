export const isAdminLike = (user) => user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
export const canEdit = (user) => user?.role === 'ADMIN';
