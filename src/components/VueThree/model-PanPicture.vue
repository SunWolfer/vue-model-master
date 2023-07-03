<!--全景查看-->
<script setup lang="ts">
	import {
		PerspectiveCamera,
		Scene,
		WebGLRenderer,
		SphereGeometry,
		TextureLoader,
		MeshBasicMaterial,
		Mesh,
		MathUtils,
	} from 'three'
	import { ref, onMounted, onUnmounted } from 'vue'

	const props = defineProps({
		src: {
			type: String,
			default: '',
		},
	})

	const container = ref<HTMLDivElement>()

	onMounted(() => {
		init()
		animate()
	})

	interface DomSize {
		width: number
		height: number
	}

	let camera: PerspectiveCamera,
		scene: Scene,
		renderer: WebGLRenderer,
		material: MeshBasicMaterial,
		reqId: number,
		size: DomSize

	let isUserInteracting = false,
		onPointerDownMouseX = 0,
		onPointerDownMouseY = 0,
		lon = 0,
		onPointerDownLon = 0,
		lat = 0,
		onPointerDownLat = 0,
		phi = 0,
		theta = 0

	function init() {
		size = {
			width: (container.value as HTMLDivElement).offsetWidth,
			height: (container.value as HTMLDivElement).offsetHeight,
		}
		camera = new PerspectiveCamera(75, size.width / size.height, 1, 1100)

		scene = new Scene()

		const { mesh } = loadMaterial()

		scene.add(mesh)

		renderer = new WebGLRenderer()
		renderer.setPixelRatio(window.devicePixelRatio || 1)
		renderer.setSize(size.width, size.height)

		if (container.value) {
			container.value.appendChild(renderer.domElement)

			container.value.style.touchAction = 'none'
			container.value.addEventListener('pointerdown', onPointerDown)
			container.value.addEventListener('wheel', onDocumentMouseWheel)

			container.value.addEventListener('dragover', onDragover)
			container.value.addEventListener('dragenter', onDragenter)
			container.value.addEventListener('dragleave', onDragleave)
			container.value.addEventListener('drop', onDrop)
		}

		window.addEventListener('resize', onWindowResize)
	}

	onUnmounted(() => {
		if (container.value) {
			container.value.removeEventListener('pointerdown', onPointerDown)
			container.value.removeEventListener('wheel', onDocumentMouseWheel)
			container.value.removeEventListener('dragover', onDragover)
			container.value.removeEventListener('dragenter', onDragenter)
			container.value.removeEventListener('dragleave', onDragleave)
			container.value.removeEventListener('drop', onDrop)
		}
		cancelAnimationFrame(reqId)

		renderer!.dispose()
	})

	function loadMaterial() {
		const geometry = new SphereGeometry(500, 60, 40)
		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1)

		const texture = new TextureLoader().load(props.src)
		material = new MeshBasicMaterial({ map: texture })

		const mesh = new Mesh(geometry, material)

		return {
			mesh,
		}
	}

	function onDragover(event: DragEvent) {
		event.preventDefault()
		event.dataTransfer!.dropEffect = 'copy'
	}

	function onDragenter() {
		container.value!.style.opacity = 0.5 + ''
	}
	function onDragleave() {
		container.value!.style.opacity = 1 + ''
	}

	function onDrop(event: DragEvent) {
		event.preventDefault()

		const reader = new FileReader()
		reader.addEventListener('load', (event: any) => {
			material.map!.image.src = event.target.result
			material.map!.needsUpdate = true
		})
		reader.readAsDataURL(event.dataTransfer!.files[0])

		container.value!.style.opacity = 1 + ''
	}

	function onWindowResize() {
		camera.aspect = size.width / size.height
		camera.updateProjectionMatrix()

		renderer.setSize(size.width, size.height)
	}

	function onPointerDown(event: PointerEvent) {
		if (!event.isPrimary) return

		isUserInteracting = true

		onPointerDownMouseX = event.clientX
		onPointerDownMouseY = event.clientY

		onPointerDownLon = lon
		onPointerDownLat = lat

		if (container.value) {
			container.value.addEventListener('pointermove', onPointerMove)
			container.value.addEventListener('pointerup', onPointerUp)
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (!event.isPrimary) return

		lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon
		lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat
	}

	function onPointerUp(event: PointerEvent) {
		if (!event.isPrimary) return

		isUserInteracting = false
		if (container.value) {
			container.value.removeEventListener('pointermove', onPointerMove)
			container.value.removeEventListener('pointerup', onPointerUp)
		}
	}

	function onDocumentMouseWheel(event: WheelEvent) {
		const fov = camera.fov + event.deltaY * 0.05

		camera.fov = MathUtils.clamp(fov, 10, 75)

		camera.updateProjectionMatrix()
	}

	function animate() {
		reqId = requestAnimationFrame(animate)
		update()
	}

	function update() {
		lat = Math.max(-85, Math.min(85, lat))
		phi = MathUtils.degToRad(90 - lat)
		theta = MathUtils.degToRad(lon)

		const x = 500 * Math.sin(phi) * Math.cos(theta)
		const y = 500 * Math.cos(phi)
		const z = 500 * Math.sin(phi) * Math.sin(theta)

		camera.lookAt(x, y, z)

		renderer.render(scene, camera)
	}
</script>

<template>
	<div class="fullThree" ref="container"></div>
</template>

<style lang="scss" scoped>
	.fullThree {
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		padding: 0;
	}
</style>
