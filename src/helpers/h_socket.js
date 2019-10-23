import { Flatpack } from './flatpack.js';

const keys = {
	up: '',
	down: '',
	left: '',
	right: ''
};

const position = {
	x: '',
	y: '',
	a: '', // angle
	t: '' // timestamp
};

const state = {
	userID: '',
	name: '',
	team: '',
	score: '',
	position,
	velocity: {
		x: '',
		y: '',
	},
	keys
};

const fp = new Flatpack();
fp.add('addSelf', state);
fp.add('addNewUser', state);
fp.add('shareSelf', {
	to: '',
	user: state
});
fp.add('addUser', state);

fp.add('keyChange', {
	userID: '',
	keys,
	to: position,
});
fp.add('angleChange', {
	userID: '',
	angle: ''
});
fp.add('fire', {
	userID: '',
	team: '',
	position
});
fp.add('hit', {
	origin: {
		userID: '',
		team: '',
		newScore: ''
	},
	target: {
		userID: '',
		team: '',
		angle: ''
	}
});

const EVENTS = fp.list();
EVENTS.connection = 'connection';
EVENTS.disconnect = 'disconnect';
EVENTS.removeUser = 'removeUser';

export { fp, EVENTS };