import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { AnimationClip, Object3D } from 'three'
import { Group } from 'three/src/Three'
import { ref } from 'vue'
const useThreeExport = () => {
	const GLTFParams = ref({
		trs: false, //导出位置、旋转和缩放，而不是每个节点的矩阵 默认是false
		onlyVisible: true, //只导出可见的对象 默认是true
		binary: true, //binary==true 导出glb | binary==false 导出gltf
	})
	const animations = ref<AnimationClip[]>([])
	function exportGLTF(input: any, resultName = '3DModel.glb') {
		const gltfExporter = new GLTFExporter()

		const options = {
			trs: GLTFParams.value.trs,
			onlyVisible: GLTFParams.value.onlyVisible,
			binary: GLTFParams.value.binary,
			animations: animations.value,
		}
		gltfExporter.parse(
			input,
			function (result) {
				if (result instanceof ArrayBuffer) {
					saveArrayBuffer(result, resultName)
				} else {
					const output = JSON.stringify(result, null, 2)
					saveString(output, resultName)
				}
			},
			function (error) {
				console.log('An error happened during parsing', error)
			},
			options,
		)
	}

	const link = document.createElement('a')
	link.style.display = 'none'
	document.body.appendChild(link) // Firefox workaround, see #6594

	function save(blob: Blob, filename: string) {
		link.href = URL.createObjectURL(blob)
		link.download = filename
		link.click()
	}
	function saveString(text: string, filename: string) {
		save(new Blob([text], { type: 'text/plain' }), filename)
	}
	function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
		save(new Blob([buffer], { type: 'application/octet-stream' }), filename)
	}

	// 加载FBX模型输出GLTF
	function directOutput(src: string) {
		if (!src) return
		const loader = new FBXLoader()

		loader.load(src, (args: Group) => {
			const object = getObject(args)
			exportGLTF([object], 'default.glb')
		})

		const getObject = (geometry: Group) => {
			animations.value = geometry.animations
			return geometry
		}
	}

	return {
		GLTFParams,
		exportGLTF,
		directOutput,
	}
}

export default useThreeExport
