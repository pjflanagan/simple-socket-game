

const gameEvents = [
	// admin
	'addSelf',
	'shareSelf',
	'addUser',
	'addNewUser',
	'stateUpdate',
	// gameplay
	'death',
	'keyChange',
	'angleChange',
  'fire',
  'hit'
];

const EVENTS = {
	connection: 'connection',
	disconnect: 'disconnect',
};

for (let i = 0; i < gameEvents.length; ++i) {
	EVENTS[gameEvents[i]] = i;
}

export { EVENTS };