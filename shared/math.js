const Math = Math || {};

Math.radians = function (degrees) {
	return degrees * Math.PI / 180; // Converts from degrees to radians
};

Math.PI_2 = 2 * Math.PI;

Math.toroidal = function (x, y) {
	v1 = Math.sin(x / W * Math.PI_2);
	v2 = Math.cos(x / W * Math.PI_2);
	v3 = Math.sin(y / H * Math.PI_2);
	v4 = Math.cos(y / H * Math.PI_2);
};

export { Math };