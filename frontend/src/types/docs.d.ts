type Doc = {
	id: string;
	title: string;
	previewImage?: string;
	usersWithAccess: UserWithAccess[];
	content: string;
};

interface UserWithAccess {
	isRequester: boolean;
	accessLevel: 'viewer' | 'editor' | 'owner';
	user: User;
}

interface FullDoc extends Doc {
	content: string;
}
