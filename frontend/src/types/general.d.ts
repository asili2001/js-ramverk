type APIResponseMessage = {
	type: 'success' | 'error';
	title: string;
	details?: string;
};
type APIResponse = {
	type: 'success' | 'error';
	messages: APIResponseMessage[];
	data?: unknown;
};
