/**
 * 火焰特效类
 */

import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	Group,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	LinearFilter,
	Mesh,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Points,
	Quaternion,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three'
import flame from '../image/flame.png'
import ember from '../image/ember.png'
import haze from '../image/haze.png'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import {
	fireVertexShader,
	fireFragmentShader,
	embersVertexShader,
	embersFragmentShader,
	hazeVertexShader,
	hazeFragmentShader,
} from './fireShader'

type ISize = {
	width: number
	height: number
}

export class IFires {
	// 火焰图层
	_scene!: Object3D
	_renderer!: WebGLRenderer
	_camera!: PerspectiveCamera
	_controls!: OrbitControls
	_rtt!: WebGLRenderTarget
	_width: number
	_height: number
	objs: any[]
	_isShow: boolean
	loop!: any[]
	loop2!: any[]
	loop3!: any[]
	positionList: IFiresPosition[]
	animateList: any[]
	fireId: number | undefined
	constructor(size: ISize) {
		this._isShow = false
		this._scene = new Object3D()
		this.objs = []
		this._width = size.width
		this._height = size.height
		this.loop = []
		this.loop2 = []
		this.loop3 = []
		this.positionList = []
		this.animateList = []
		this.renderRoute()
	}
	// 配置参数
	config(
		scene_: Object3D | Scene,
		renderer_: WebGLRenderer,
		camera_: PerspectiveCamera,
		controls_: OrbitControls,
	) {
		this._renderer = renderer_
		scene_.add(this._scene)
		this._camera = camera_
		this._controls = controls_
		let _parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false,
		}
		if (this._rtt) this._rtt.dispose()
		this._rtt = new WebGLRenderTarget(this._width * 0.5, this._height * 0.5, _parameters)
	}
	// 设置火焰位置
	setPosition(positionList: IFiresPosition[]) {
		this.positionList = positionList
	}
	// 显示火焰
	showFire() {
		for (let i = 0; i < this.positionList.length; i++) {
			let pos = this.positionList[i]
			this.addOneFire(pos)
		}
		this._isShow = true
	}
	// 添加单个
	addOneFire(pos: IFiresPosition) {
		this.initFire(pos)
		this.initEmbers(pos)
		this.initHaze(pos)

		//点光源
		let point = new PointLight(0x961800, 10, pos.size * 3)
		point.position.set(pos.x, pos.y, pos.z) //点光源位置
		this.objs.push(point)
		this._scene.add(point) //点光源添加到场景中
	}
	refresh() {
		if (!this._isShow) return
		this.loop.forEach((i) => {
			i()
		})
		this.loop2.forEach((i) => {
			i()
		})
		this.loop3.forEach((i) => {
			i()
		})
	}
	isShow() {
		return this._isShow
	}
	hide() {
		this._scene.remove(...this.objs)
		this._isShow = false
	}
	show() {
		this._scene.add(...this.objs)
		this._isShow = true
	}
	// 重置火焰
	resetFires() {
		this._scene.remove(...this.objs)
		this.objs = []
		this.loop = []
		this.loop2 = []
		this.loop3 = []
		this.showFire()
	}
	random(min: number, max: number, precision: number) {
		let p = Math.pow(10, precision)
		return Math.round((min + Math.random() * (max - min)) * p) / p
	}
	initFire(pos: IFiresPosition) {
		const { _x, _y, _z, _tipTarget, _geometry, _shader, _group, _num, _tip, _diff, _quat, _quat2 } =
			useFire(this._scene, this.objs, pos.size)

		this.loop.push(() => {
			let e = 100
			_shader!.uniforms.uTime.value = e * 0.001

			let life = _geometry?.attributes.life
			let orientation = _geometry?.attributes.orientation
			let scale = _geometry?.attributes.scale
			let randoms = _geometry?.attributes.random
			for (let i = 0; i < _num; i++) {
				let value = life!.array[i]
				value += 0.04

				if (value > 1) {
					value -= 1

					_quat.setFromAxisAngle(_y, this.random(0, 3.14, 3))
					_quat2.setFromAxisAngle(_x, this.random(-1, 1, 2) * 0.1)
					_quat.multiply(_quat2)
					_quat2.setFromAxisAngle(_z, this.random(-1, 1, 2) * 0.3)
					_quat.multiply(_quat2)
					orientation?.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w)

					scale?.setXY(i, this.random(0.8, 1.2, 3), this.random(0.8, 1.2, 3))
					randoms?.setX(i, this.random(0, 1, 3))
				}

				life!.setX(i, value)
			}
			life!.needsUpdate = true
			orientation!.needsUpdate = true
			scale!.needsUpdate = true
			randoms!.needsUpdate = true

			_group!.position.x = pos.x ?? 0 //Math.sin(e * 0.002) * 1.4;
			_group!.position.y = (pos.y ?? 0) + (pos.size ?? 0) / 2 //Math.cos(e * 0.0014) * 0.2;
			_group!.position.z = pos.z ?? 0 //Math.cos(e * 0.0014) * 0.5;

			let tipOffset = 0.4
			_tipTarget.copy(_group!.position)
			_tipTarget.y += tipOffset
			_tip.lerp(_tipTarget, 0.1)

			_diff.copy(_tip)
			_diff.sub(_group!.position)
			_group!.quaternion.setFromUnitVectors(_y, _diff.normalize())
		})
	}
	// 粒子
	initEmbers(pos: IFiresPosition) {
		const { _geometry, _num } = useEmbers(this._scene, this.objs, pos.size, this.random)

		this.loop2.push(() => {
			{
				if (!_geometry || !pos.size) return
				let life = _geometry.attributes.life
				let position = _geometry.attributes.position
				let size = _geometry.attributes.size
				let offset = _geometry.attributes.offset
				for (let i = 0; i < _num; i++) {
					let value = life.array[i]
					value += 0.02

					if (value > 1) {
						value -= 1

						position.setXYZ(i, pos.x, pos.y + pos.size / 2, pos.z)
						offset.setXYZ(
							i,
							this.random(-0.2 * pos.size, 0.2 * pos.size, 3),
							this.random(0.7 * pos.size, 1.2 * pos.size, 3),
							this.random(-0.2 * pos.size, 0.2 * pos.size, 3),
						)
						size.setX(i, this.random(0.2 * pos.size, 0.5 * pos.size, 3))
					}

					life.setX(i, value)
				}

				life.needsUpdate = true
				position.needsUpdate = true
				size.needsUpdate = true
				offset.needsUpdate = true
			}
		})
	}
	// 灰烬
	initHaze(pos: IFiresPosition) {
		const { _geometry, _mesh, _num, _z, _quat, _quat2 } = useHaze(
			this._scene,
			this.objs,
			pos.size,
			this._renderer,
			this._width,
			this._height,
			this._rtt,
		)
		this.loop3.push(() => {
			if (!_mesh || !_geometry || !pos.size || !this._camera) return
			_mesh.visible = false
			this._renderer.setRenderTarget(this._rtt)
			_mesh.visible = true

			let life = _geometry.attributes.life
			let base = _geometry.attributes.base
			let offset = _geometry.attributes.offset
			let scale = _geometry.attributes.scale
			let orientation = _geometry.attributes.orientation
			let rotation = _geometry.attributes.rotation
			for (let i = 0; i < _num; i++) {
				let value = life.array[i]
				value += 0.008

				if (value > 1) {
					value -= 1

					rotation.setX(i, this.random(0, 3.14 * pos.size, 3))

					base.setXYZ(i, pos.x, pos.y + 0.1, pos.z)
					offset.setXYZ(
						i,
						this.random(-0.2 * pos.size, 0.2 * pos.size, 3),
						this.random(2.5 * pos.size, 3.0 * pos.size, 3),
						0,
					)
					scale.setXY(
						i,
						this.random(0.6 * pos.size, 1.2 * pos.size, 3),
						this.random(0.6 * pos.size, 1.2 * pos.size, 3),
					)
				}

				_quat.copy(this._camera.quaternion)
				_quat2.setFromAxisAngle(_z, rotation.array[i])
				_quat.multiply(_quat2)
				orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w)

				life.setX(i, value)
			}

			life.needsUpdate = true
			base.needsUpdate = true
			scale.needsUpdate = true
			offset.needsUpdate = true
			orientation.needsUpdate = true
		})
	}

	renderRoute() {
		this.fireId = requestAnimationFrame(this.renderRoute.bind(this))
		this.refresh()
	}
	unMountClass() {
		this.hide()
		this.objs = []
		this.loop = []
		this.loop2 = []
		this.loop3 = []
		cancelAnimationFrame(this.fireId!)
	}
}

const useFire = (_scene: Object3D, objs: any[], _size: number) => {
	let _geometry: InstancedBufferGeometry | undefined,
		_shader: ShaderMaterial | undefined,
		_mesh: Mesh | undefined,
		_group: Group | undefined
	let _num = 50

	let _x = new Vector3(1, 0, 0)
	let _y = new Vector3(0, 1, 0)
	let _z = new Vector3(0, 0, 1)

	let _tipTarget = new Vector3()
	let _tip = new Vector3()
	let _diff = new Vector3()

	let _quat = new Quaternion()
	let _quat2 = new Quaternion()

	function initGeometry() {
		_geometry = useGeometry(_size as number)
	}

	function initInstances() {
		let orientation = new InstancedBufferAttribute(new Float32Array(_num * 4), 4)
		let randoms = new InstancedBufferAttribute(new Float32Array(_num), 1)
		let scale = new InstancedBufferAttribute(new Float32Array(_num * 2), 2)
		let life = new InstancedBufferAttribute(new Float32Array(_num), 1)

		for (let i = 0; i < _num; i++) {
			orientation.setXYZW(i, 0, 0, 0, 1)
			life.setX(i, i / _num + 1)
		}

		_geometry?.setAttribute('orientation', orientation)
		_geometry?.setAttribute('scale', scale)
		_geometry?.setAttribute('life', life)
		_geometry?.setAttribute('random', randoms)
	}

	function initShader() {
		let uniforms = {
			uMap: {
				type: 't',
				value: null,
			},
			uColor1: {
				type: 'c',
				value: new Color(0x961800),
			}, // red
			uColor2: {
				type: 'c',
				value: new Color(0x4b5828),
			}, // yellow
			uTime: {
				type: 'f',
				value: 0,
			},
		}

		_shader = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: fireVertexShader,
			fragmentShader: fireFragmentShader,
			blending: AdditiveBlending,
			transparent: true,
			depthTest: false,
			side: DoubleSide,
		})

		let textureLoader = new TextureLoader()
		textureLoader.load(flame, (t) => (_shader!.uniforms.uMap.value = t))
	}

	function initMesh() {
		_group = new Group()
		_mesh = new Mesh(_geometry, _shader)
		_mesh.frustumCulled = false
		_group.add(_mesh)
		_scene.add(_group)
		objs.push(_group)
	}
	;(function () {
		initGeometry()
		initInstances()
		initShader()
		initMesh()
	})()
	return {
		_x,
		_y,
		_z,
		_tipTarget,
		_geometry,
		_shader,
		_mesh,
		_group,
		_num,
		_tip,
		_diff,
		_quat,
		_quat2,
	}
}

const useEmbers = (_scene: Object3D, objs: any[], _size: number, random: Function) => {
	let _geometry: BufferGeometry | undefined,
		_shader: ShaderMaterial | undefined,
		_points: Points | undefined
	let _num = 8

	;(function () {
		initGeometry()
		initShader()
		initMesh()
	})()

	function initGeometry() {
		_geometry = new BufferGeometry()
		_geometry.setAttribute('position', new BufferAttribute(new Float32Array(_num * 3), 3))
		_geometry.setAttribute('offset', new BufferAttribute(new Float32Array(_num * 3), 3))
		_geometry.setAttribute('size', new BufferAttribute(new Float32Array(_num), 1))
		_geometry.setAttribute('life', new BufferAttribute(new Float32Array(_num), 1))
		// let scale = new InstancedBufferAttribute(new Float32Array(_num * 2), 2)
		// _geometry.setAttribute('scale', scale)

		for (let i = 0; i < _num; i++) {
			_geometry.attributes.life.setX(i, random(0, 1, 3) + 1)
		}
	}

	function initShader() {
		let uniforms = {
			uMap: {
				type: 't',
				value: null,
			},
			uColor: {
				type: 'c',
				value: new Color(0xffe61e),
			},
		}

		_shader = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: embersVertexShader,
			fragmentShader: embersFragmentShader,
			blending: AdditiveBlending,
			transparent: true,
			depthTest: false,
		})

		let textureLoader = new TextureLoader()
		textureLoader.load(ember, (t) => (_shader!.uniforms.uMap.value = t))
	}

	function initMesh() {
		_points = new Points(_geometry, _shader)
		_points.frustumCulled = false
		_scene.add(_points)
		objs.push(_points)
	}

	return {
		_geometry,
		_shader,
		_points,
		_num,
	}
}

const useHaze = (
	_scene: Object3D,
	objs: any[],
	_size: number,
	_renderer: WebGLRenderer,
	_width: number,
	_height: number,
	_rtt: WebGLRenderTarget,
) => {
	let _geometry: InstancedBufferGeometry | undefined,
		_shader: ShaderMaterial | undefined,
		_mesh: Mesh | undefined

	let _num = 4

	let _z = new Vector3(0, 0, 1)
	let _quat = new Quaternion()
	let _quat2 = new Quaternion()

	;(function () {
		initGeometry()
		initInstances()
		initShader()
		initMesh()
	})()

	function initGeometry() {
		_geometry = useGeometry(_size / 20)
	}

	function initInstances() {
		let base = new InstancedBufferAttribute(new Float32Array(_num * 3), 3)
		let offset = new InstancedBufferAttribute(new Float32Array(_num * 3), 3)
		let orientation = new InstancedBufferAttribute(new Float32Array(_num * 4), 4)
		let scale = new InstancedBufferAttribute(new Float32Array(_num * 2), 2)
		let rotation = new InstancedBufferAttribute(new Float32Array(_num), 1)
		let life = new InstancedBufferAttribute(new Float32Array(_num), 1)

		for (let i = 0; i < _num; i++) {
			orientation.setXYZW(i, 0, 0, 0, 1)
			life.setX(i, i / _num + 1)
		}

		_geometry?.setAttribute('base', base)
		_geometry?.setAttribute('offset', offset)
		_geometry?.setAttribute('orientation', orientation)
		_geometry?.setAttribute('scale', scale)
		_geometry?.setAttribute('rotation', rotation)
		_geometry?.setAttribute('life', life)
	}

	function initShader() {
		let dpr = _renderer.getPixelRatio()
		let uniforms = {
			uMap: {
				type: 't',
				value: _rtt.texture,
			},
			uMask: {
				type: 't',
				value: null,
			},
			uResolution: {
				type: 'v2',
				value: new Vector2(_width * dpr, _height * dpr),
			},
		}

		_shader = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: hazeVertexShader,
			fragmentShader: hazeFragmentShader,
			transparent: true,
			depthTest: false,
		})

		let textureLoader = new TextureLoader()
		textureLoader.load(haze, (t) => (_shader!.uniforms.uMask.value = t))
	}

	function initMesh() {
		_mesh = new Mesh(_geometry, _shader)
		_mesh.frustumCulled = false
		_scene.add(_mesh)
		objs.push(_mesh)
	}

	return {
		_geometry,
		_shader,
		_mesh,
		_num,
		_z,
		_quat,
		_quat2,
	}
}

const useGeometry = (_size: number) => {
	let _geometry = new InstancedBufferGeometry()

	let shape = new PlaneGeometry(_size, _size)
	let data = shape.attributes
	_geometry.setAttribute('position', new BufferAttribute(new Float32Array(data.position.array), 3))
	_geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uv.array), 2))
	_geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normal.array), 3))
	_geometry.setIndex(new BufferAttribute(new Uint16Array(shape.index?.array as any), 1))
	shape.dispose()

	return _geometry
}
