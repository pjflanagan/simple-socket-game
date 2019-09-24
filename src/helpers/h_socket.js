
import * as msgpack from 'msgpack-lite'

const keys = {
  up: 'ka',
  down: 'kb',
  left: 'kl',
  right: 'kr'
}

const position = {
  x: 'px',
  y: 'py',
  a: 'pa'
};

const state = {
  userID: 'su',
  name: 'sn',
  team: 'st',
  score: 'ss',
  position,
  velocity: {
    x: 'vx',
    y: 'vy',
  },
  keys
};

const MODEL = {
  addSelf: state,
  addNewUser: state, // same as addSelf
	shareSelf: {
    to: 't',
    user: state
  },
  addUser: state,
  removeUser: {},

  keyChange: {
    userID: 'u',
    keys
  },

	angleChange: {
    userID: 'u',
    angle: 'a'
  },

  fire: {
    userID: 'u',
    team: 't',
    position
  },

  hit: {
    origin: {
      userID: 'ou',
      team: 'ot',
      pointsAwarded: 'op'
    },
    target: {
      userID: 'tu',
      team: 'tt'
    }
  }
};

const EVENTS = {
	connection: 'connection',
	disconnect: 'disconnect',
};

const EVENT_MODELS = [];

let i = 0;
for (const [key, value] of Object.entries(MODEL)) {
  EVENTS[key] = i++;
  EVENT_MODELS.push(MODEL[key]);
}

// PACK AND ENCODE

const pack = function(data, model) {
  const packet = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Object) {
      const subModel = model[key];
      const subPacket = pack(value, subModel);
      for (const [key, value] of Object.entries(subPacket)) {
        packet[key] = value;
      }
    } else {
      const modelValue = model[key];
      packet[modelValue] = value;
    }
  }
  return packet;
}

const unpack = function(packet, model) {
  const data = {};
  for (const [key, value] of Object.entries(model)) {
    if (value instanceof Object) {
      data[key] = unpack(packet, value);
    } else {
      data[key] = packet[value];
    }
  }
  return data;
}

const encode = function(event, data) {
  const packet = pack(data, EVENT_MODELS[event]);
  return msgpack.encode(packet);
}

const decode = function(event, buffer) {
  const packet = msgpack.decode(new Uint8Array(buffer));
  return unpack(packet, EVENT_MODELS[event]);
}

// EXPORT

export { EVENTS, encode, decode };