type Doc = {
	id: string;
	title: string;
	previewImage?: string;
	usersWithAccess: UserWithAccess[];
	content: string;
	docType: string;
	comments: Comment[];
};

interface UserWithAccess extends User {
	accessLevel: 'viewer' | 'editor' | 'owner';
}

interface FullDoc extends Doc {
	content: string;
}
