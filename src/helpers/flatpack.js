
import * as msgpack from 'msgpack-lite'

// TODO: more descriptive error when provided a value that doesn't exist in the model

export class Flatpack {

	constructor(debug = false) {
		this._models = [];
		this._modelsEnum = {}
		this._debug = debug;
		this._savedData = 0;
	}

  // adds a model to the pack with a timestamp
	add(name, userModel) {
    userModel.timestamp = '';
		const format = this._makeModel(userModel);
		this._modelsEnum[name] = this._models.length;
		this._models.push(format.model);
	}

	list() {
		return this._modelsEnum;
	}

  // encodes the data with a timestamp
	encode(modelType, data) {
    data.timestamp = new Date().getTime();
		const model = this._getModel(modelType);
		const packet = this._pack(model, data);
		const buffer = msgpack.encode(packet);
		if (this._debug) {
			const originalLength = msgpack.encode(data).length;
			console.log('[DEBUG] transmission data saved:', originalLength - buffer.length);
			this._savedData += originalLength - buffer.length;
			console.log('[DEBUG] total data saved:', this._savedData);
		}
		return buffer;
	}

	decode(modelType, buffer) {
		const model = this._getModel(modelType);
		const packet = msgpack.decode(new Uint8Array(buffer));
		return this._unpack(model, packet);
	}

	_getModel(modelType) {
		if (typeof modelType === 'number') {
			return this._models[modelType];
		} else if (typeof modelType === 'string') {
			return this._models[this._modelsEnum[modelType]];
		}
	}

	_makeModel(userModel, count = 0) {
		const newModel = {}
		for (const [key, value] of Object.entries(userModel)) {
			if (value instanceof Object) {
				const format = this._makeModel(value, count);
				newModel[key] = format.model;
				count = format.count;
			} else {
				count = this._incrementCount(count);
				newModel[key] = this._getCharacter(count);
			}
		}
		return { model: newModel, count };
	}

	_getCharacter(i) {
		return String.fromCharCode('a'.charCodeAt() - 1 + i);
	}

	_incrementCount(i) {
		return i + 1;
	}

	_pack(model, data) {
		let packet = {};
		for (const [key, value] of Object.entries(data)) {
			if (value instanceof Object) {
				const subModel = model[key];
				const subPacket = this._pack(subModel, value);
				for (const [key, value] of Object.entries(subPacket)) {
					packet[key] = value;
				}
				// packet = { ...packet, ...subPacket };
			} else {
        if (!!model[key]) {
          const modelValue = model[key];
          packet[modelValue] = value;
          
        } else if (this._debug) {
          console.log(`[DEBUG] Key '${ key }' not found in model.`);
        }
			}
		}
		return packet;
	}

	_unpack(model, packet) {
		const data = {};
		for (const [key, value] of Object.entries(model)) {
			if (value instanceof Object) {
				data[key] = this._unpack(value, packet);
			} else {
        if(!!packet[value]) {
          data[key] = packet[value];
          
        } else if (this._debug) {
          console.log(`[DEBUG] Key '${ key }' not found in packet data.`);
        }
			}
		}
		return data;
	}
}

