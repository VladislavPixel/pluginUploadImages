function bytesToSize(bytes) {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
	if (bytes === 0) return "0 Byte"
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
	return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i]
}

function createElement(type, classes = [], content) {
	const node = document.createElement(type)
	if (classes.length) {
		node.classList.add(...classes)
	}
	if (content) {
		node.textContent = content
	}

	return node
}
function noop() {}

export function upload(selector, options = {}) {
	let files = []
	const onUpload = options.onUpload ? options.onUpload : noop
	const input = document.querySelector(selector)
	const preview = createElement("div", ["preview"])
	const open = createElement("button", ["btn"], "Открыть")
	const upload = createElement("button", ["btn", "primary"], "Загрузить")
	upload.style.display = "none"
	
	if (options.multi) {
		input.setAttribute("multiple", "")
	}
	if (options.accept && Array.isArray(options.accept)) {
		input.setAttribute("accept", options.accept.join(","))
	}

	input.insertAdjacentElement("afterend", preview)
	input.insertAdjacentElement("afterend", upload)
	input.insertAdjacentElement("afterend", open)

	function triggerInput(event) {
		input.click()
	}
	function changeHandler({ target }) {
		if (!target.files.length) return
		upload.style.display = "inline-block"
		files = Array.from(target.files)

		preview.innerHTML = ""
		files.forEach(file => {
			if (!file.type.match("image")) return

			const reader = new FileReader()
			reader.onload = ({ target }) => {
				preview.insertAdjacentHTML("afterbegin", `
					<div class="preview-image">
						<div class="preview-remove" data-name="${file.name}"><span>&times;</span></div>
						<img src="${target.result}" alt="${file.name}" />
						<div class="preview-info">
							<div>${file.name}</div>
							<div>${bytesToSize(file.size)}</div>
						</div>
					</div>
				`)
			}
			reader.readAsDataURL(file)
		})
	}
	function removeHandler({ target }) {
		if (target.closest(".preview-remove")) {
			const element = target.dataset.name ? target : target.parentElement
			files = files.filter(item => item.name !== element.dataset.name)
			if (files.length === 0) {
				upload.style.display = "none"
			}
			element.closest(".preview-image").classList.add("removing")
			setTimeout(() => {
				element.closest(".preview-image").remove()
			}, 301)
		}
	}
	function clearPreview(el) {
		el.style.opacity = 1
		el.style.bottom = 0
		el.innerHTML = `<div class="preview-info-progress"></div>`
	}
	function uploadHandler() {
		preview.querySelectorAll(".preview-remove").forEach(el => el.remove())
		const previewInfo = preview.querySelectorAll(".preview-info")
		previewInfo.forEach(item => clearPreview(item))
		onUpload(files, previewInfo)
	}
	open.addEventListener("click", triggerInput)
	input.addEventListener("change", changeHandler)
	preview.addEventListener("click", removeHandler)
	upload.addEventListener("click", uploadHandler)
}