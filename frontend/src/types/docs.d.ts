type Doc = {
	id: string;
	title: string;
	previewImage?: string;
	usersWithAccess: UserWithAccess[];
};

interface UserWithAccess extends User {
	accessLevel: 'viewer' | 'editor' | 'owner';
}

interface FullDoc extends Doc {
	content: string;
}
