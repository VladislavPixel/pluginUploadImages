import { upload } from "./upload"
import config from "./config.json"
import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import "firebase/storage"

const firebaseConfig = {
	apiKey: config.FIREBASE_API_KEY,
	authDomain: "plugin-upload.firebaseapp.com",
	projectId: "plugin-upload",
	storageBucket: "plugin-upload.appspot.com",
	messagingSenderId: "456575202725",
	appId: "1:456575202725:web:c93858b8635d15b881244c"
}

console.log(process.env);
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

upload("#file", {
	multi: true,
	accept: [".png", ".jpg", ".jpeg", ".gif"],
	onUpload(files, blocks) {
		files.forEach((file, index) => {
			const storageRef = ref(storage, `images/${file.name}`)
			const uploadTask = uploadBytesResumable(storageRef, file)

			uploadTask.on("state_changed",
			(snapshot) => {
				const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100) + "%"
				const blockProgress = blocks[index].querySelector(".preview-info-progress")
				blockProgress.textContent = progress
				blockProgress.style.width = progress
			},
			(err) => {
				console.log("Ошибка при загрузке image.", err)
			},
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
					console.log("Status complete: ", downloadURL)
				})
			})
		})
	}
})
