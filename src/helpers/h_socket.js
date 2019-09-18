
import * as msgpack from 'msgpack-lite'

const state = {
  userID: 'q',
  name: 'r',
  team: 's',
  score: 't',
  position: {
    x: 'u',
    y: 'v',
    a: 'w'
  },
  velocity: {
    x: 'x',
    y: 'y',
  },
  keys: 'z'
};

const MODEL = {
  addSelf: state,
  addNewUser: state, // same as addSelf
	shareSelf: {
    to: 'a',
    user: state
  },
  addUser: state,
  removeUser: {},

  keyChange: {
    up: 'a',
    down: 'b',
    left: 'c',
    right: 'd'
  },

	angleChange: {
    userID: 'a',
    angle: 'b'
  },

  fire: {
    userID: 'a',
    team: 'b',
    position: {
      x: 'c',
      y: 'd',
      a: 'e'
    }
  },

  hit: {
    origin: {
      userID: 'a',
      team: 'b',
      pointsAwarded: 'c'
    },
    target: {
      userID: 'd',
      team: 'e'
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

function roughSizeOfObject( object ) {

  var objectList = [];
  var stack = [ object ];
  var bytes = 0;

  while ( stack.length ) {
      var value = stack.pop();

      if ( typeof value === 'boolean' ) {
          bytes += 4;
      }
      else if ( typeof value === 'string' ) {
          bytes += value.length * 2;
      }
      else if ( typeof value === 'number' ) {
          bytes += 8;
      }
      else if
      (
          typeof value === 'object'
          && objectList.indexOf( value ) === -1
      )
      {
          objectList.push( value );

          for( var i in value ) {
              stack.push( value[ i ] );
          }
      }
  }
  return bytes;
}

// EXPORT

export { EVENTS, encode, decode };