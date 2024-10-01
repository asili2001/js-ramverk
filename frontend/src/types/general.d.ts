// type APIResponseMessage = {
// 	type: 'success' | 'error';
// 	title: string;
// 	details?: string;
// };
type APIResponse = {
	type: 'success' | 'error';
	message: string;
	data?: unknown;
};
