export function isValidObjectId(id: string) {
	// Check if the id is a string and matches the 24-character hexadecimal pattern
	return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
}
