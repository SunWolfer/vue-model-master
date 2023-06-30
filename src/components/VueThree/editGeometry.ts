import {
	BufferAttribute,
	BufferGeometry,
	MeshBasicMaterial,
	Mesh,
	DoubleSide,
	RepeatWrapping,
	TextureLoader,
	BackSide,
	CatmullRomCurve3,
	Vector3,
	Object3D,
} from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { TubeGeometry } from 'three/src/geometries/TubeGeometry'
import material1 from './image/01.jpg'
import wall1 from './image/0002.jpg'

export interface Point {
	points: number[][]
	color?: string
	type: number
}

//生成平面
function createPlaneGeometry(points: Point[], scene: Object3D) {
	let IMeshes = []
	for (let i = 0; i < points.length; i++) {
		const c1 = points[i].points
		const color = points[i].color
		const material = points[i].type === 1 ? '' : 1
		// 生成两个三角形的顶点集合
		const p1 = [c1[0], c1[1], c1[2]]
		const p2 = [c1[0], c1[2], c1[3]]
		IMeshes.push(createdMesh(p1, color, material))
		IMeshes.push(createdMesh(p2, color, material))
	}
	scene.add(...IMeshes)
}

function createdMesh(points: number[][], color?: string, IMaterial?: any) {
	// 每一个三角形，需要三个顶点，每个顶点需要3个值
	const geometry = new BufferGeometry()
	const vertices = new Float32Array(9)
	for (let j = 0; j < 9; j++) {
		if (j < 3) {
			vertices[j] = points[0][j]
		} else if (j < 6) {
			vertices[j] = points[1][j - 3]
		} else if (j < 9) {
			vertices[j] = points[2][j - 6]
		}
	}

	geometry.setAttribute('position', new BufferAttribute(vertices, 3))

	let material, texture
	if (IMaterial) {
		texture = new TextureLoader().load(material1)
	} else {
		// material = new MeshBasicMaterial({ color: color, side: DoubleSide })
		texture = new TextureLoader().load(wall1)
	}
	if (texture) {
		material = new MeshBasicMaterial({ map: texture, side: DoubleSide })
	}

	//初始化存放颜色信息的序列化数组
	const colors = new Float32Array([0.5, 0.3, 0.6, 0.5, 0.3, 0.6, 0.5, 0.3, 0.6])
	geometry.setAttribute('color', new BufferAttribute(colors, 3))

	const indexs = new Uint16Array([0, 1, 2])
	geometry.index = new BufferAttribute(indexs, 1)
	const uvs = new Uint16Array([0, 1, 1, 1, 1, 0, 0, 0])
	geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
	const mesh = new Mesh(geometry, material)
	return mesh
}
// 创建三维字体
interface fontType {
	text: string
	position: any
	rotation: any
	size: number
	color: string
}
function created3DFont(fontData: fontType, scene: Object3D) {
	const loader = new FontLoader()
	let geometry
	loader.load(import.meta.env.BASE_URL + 'file/FangSong_Regular.json', function (font) {
		geometry = new TextGeometry(fontData.text, {
			font: font,
			size: fontData.size,
			height: 1,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 1, //斜角的深度
			bevelSize: 8, // 斜角的大小
			bevelSegments: 5, //斜角段数
		})
		//创建法向量材质
		let meshMaterial = new MeshBasicMaterial({
			color: fontData.color,
		})
		let mesh = new Mesh(geometry, meshMaterial)
		mesh.position.set(fontData.position.x, fontData.position.y + 1, fontData.position.z)
		mesh.rotation.set(fontData.rotation.x, fontData.rotation.y, fontData.rotation.z)
		scene.add(mesh)
	}) //end load function
}

import __assets_images_three_line_jpg from './image/line.jpg'

function createdLine(points: ICoordinates[], radius: number) {
	// 	创建纹理和材质
	let texture = new TextureLoader().load(__assets_images_three_line_jpg)
	texture.wrapS = texture.wrapT = RepeatWrapping //每个都重复
	texture.repeat.set(1, 1)
	texture.needsUpdate = true
	let material = new MeshBasicMaterial({
		map: texture,
		// side: BackSide,
		transparent: false,
	})
	// 创建顶点数组
	let Vector3Points = []
	for (let i = 0; i < points.length; i++) {
		Vector3Points.push(new Vector3(points[i].x, points[i].y, points[i].z))
	}
	// 创建一条平滑的三维样条曲线
	let curve: any = new CatmullRomCurve3(Vector3Points)
	curve.curveType = 'catmullrom'
	curve.closed = false //设置是否闭环
	curve.tension = 0 //设置线的张力，0为无弧度折线
	// 创建管道
	let tubeGeometry = new TubeGeometry(curve, 400, radius)
	let mesh = new Mesh(tubeGeometry, material)

	return {
		texture,
		mesh,
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

export { createPlaneGeometry, created3DFont, createdLine, createMotionTrack }
