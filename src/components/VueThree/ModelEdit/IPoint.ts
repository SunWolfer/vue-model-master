import { Vector3 } from 'three'

type coordinate = ICoordinates | Vector3

const usePoint = () => {
	function toArray(v: coordinate) {
		return [v.x, v.y, v.z]
	}
	// 加
	function add(v1: coordinate, v2: coordinate) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y,
			z: v1.z + v2.z,
		} as coordinate
	}
	// 减
	function sub(v1: coordinate, v2: coordinate) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
			z: v1.z - v2.z,
		} as coordinate
	}
	// 平方根
	function getMod(v1: coordinate) {
		return Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z)
	}
	//乘 除
	function mulNum(v1: coordinate, num: number) {
		return {
			x: v1.x * num,
			y: v1.y * num,
			z: v1.z * num,
		} as coordinate
	}
	// 负向量
	function getNegative(v1: coordinate) {
		return {
			x: -v1.x,
			y: -v1.y,
			z: -v1.z,
		}
	}
	// 点积
	function dotMul(v1: coordinate, v2: coordinate) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
	}
	// 获取夹角,注意返回的是角度
	function getAngle(v1: coordinate, v2: coordinate) {
		return (Math.acos(dotMul(v1, v2) / (getMod(v1) * getMod(v2))) * 180) / Math.PI
	}
	// 获取夹角,返回的是弧度
	function getRadian(v1: coordinate, v2: coordinate) {
		let m1 = getMod(v1),
			m2 = getMod(v2)
		if (m1 == 0 || m2 == 0) {
			return 0
		}
		return Math.acos(dotMul(v1, v2) / (m1 * m2))
	}
	// 两点距离
	function distance(v1: coordinate, v2: coordinate) {
		return Math.sqrt(
			(v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y) + (v1.z - v2.z) * (v1.z - v2.z),
		)
	}
	function getUnitV(v1: coordinate, v2: coordinate) {
		return mulNum(v1, 1 / distance(v1, v2))
	}

	return {
		toArray,
		add,
		sub,
		getMod,
		mulNum,
		getNegative,
		dotMul,
		getAngle,
		getRadian,
		distance,
		getUnitV,
	}
}

export default usePoint
