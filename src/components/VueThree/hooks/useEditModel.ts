import {
	CatmullRomCurve3,
	Euler,
	Matrix4,
	Object3D,
	Quaternion,
	Vector3
} from 'three'

export interface IMoveTexture {
	// 运动模型
	obj: Object3D
	// 运动路线
	curve: CatmullRomCurve3
	// 物体运动时在运动路径的初始位置，范围0~1
	counter: 0
	// 影响运动速率的一个值，范围0~1，需要和渲染频率结合计算才能得到真正的速率
	speed: number
}

const useEditModel = () => {
	// 自定义动画列表
	function customAnimation(funList: any[]) {
		for (let i = 0; i < funList.length; i++) {
			if (typeof funList[i] === 'function') {
				let animate = funList[i]
				animate()
			}
		}
	}

	// 物体沿路线移动
	function texturesUpdate(data: IMoveTexture) {
		if (data.counter <= 1 - data.speed) {
			const point = data.curve.getPointAt(data.counter) //获取样条曲线指定点坐标
			const pointBox = data.curve.getPointAt(data.counter + data.speed) //获取样条曲线指定点坐标

			if (point && pointBox) {
				data.obj.position.copy(point)

				let targetPos = pointBox //目标位置点
				let offsetAngle = 0 //目标移动时的朝向偏移

				//以下代码在多段路径时可重复执行
				let mtx = new Matrix4() //创建一个4维矩阵
				// .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
				mtx.lookAt(data.obj.position, targetPos, data.obj.up) //设置朝向
				mtx.multiply(new Matrix4().makeRotationFromEuler(new Euler(0, offsetAngle, 0)))
				let toRot = new Quaternion().setFromRotationMatrix(mtx) //计算出需要进行旋转的四元数值
				data.obj.quaternion.slerp(toRot, 0.2)
			}

			data.counter += data.speed
		} else {
			data.counter = 0
		}
	}


// 创建运动轨迹(三维样条曲线)
	function createMotionTrack(
		curvePoints: ICoordinates[],
		parameter = {
			curveType: 'catmullrom', //曲线类型
			closed: false, //设置是否闭环
			tension: 0, //设置线的张力，0为无弧度折线
		} as CatmullRomCurve3,
	) {
		let curveList = []
		for (let i = 0; i < curvePoints.length; i++) {
			const point = curvePoints[i]
			curveList.push(new Vector3(point.x, point.y, point.z))
		}
		let curve: CatmullRomCurve3 = new CatmullRomCurve3(
			curveList,
			parameter.closed,
			parameter.curveType,
			parameter.tension,
		)
		return { curve }
	}



	return {
		customAnimation,
		texturesUpdate,
		createMotionTrack,
	}
}

export default useEditModel
