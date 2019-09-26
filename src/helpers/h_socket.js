import { Flatpack } from './flatpack.js';

const keys = {
	up: '',
	down: '',
	left: '',
	right: ''
}

const position = {
	x: '',
	y: '',
	a: ''
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
	position
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
		pointsAwarded: ''
	},
	target: {
		userID: '',
		team: ''
	}
});

const EVENTS = fp.list();
EVENTS.connection = 'connection';
EVENTS.disconnect = 'disconnect';

export { fp, EVENTS };