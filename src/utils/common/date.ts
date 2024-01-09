export function convertToSqlDateTime(date, time) {
	if (!date || !time) return;
	if (date instanceof Date === false) {
		date = new Date(date);
	}
	if (time instanceof Date === false) {
		time = new Date(time);
	}
	return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${
		time.toTimeString().split(' ')[0]
	}`;
}
