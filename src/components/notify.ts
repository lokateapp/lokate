import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export const notify = (message: string, type: string) => {
	Toastify({
		text: message,
		duration: 2000,
		// close: true,
		gravity: 'top',
		position: 'right',
		stopOnFocus: true,
		style: {
			background: type === 'success' ? '#00b09b' : '#ff5b5b',
			// background: type === 'success' ? "bg-teal-500" : "bg-red-500",
			color: '#fff'
		},
		offset: {
			x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
			y: 50 // vertical axis - can be a number or a string indicating unity. eg: '2em'
		},
		close: true
	}).showToast();
};
