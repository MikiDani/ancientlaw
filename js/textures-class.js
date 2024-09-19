export default class TexturesClass {
	constructor() {
		this.loadingInfo = []
		this.errorTexture = []
		this.weaponsTextures = []
		this.playerWeaponsTextures = []
		this.skyTexture = []
		this.floorTexture = []
		this.wallTextures = []
		this.spriteTextures = []
		this.cloudTexture = null
	}

	async loadTexturesPicture(data, dir, thisVariableArray) {

		let fileNames = data.textures
		let dirConstruction = []
		
		for (const nameDir of Object.keys(fileNames)) {
			//IF NOTHING OBJECTDIR MAKE			
			dirConstruction.push(nameDir)
			thisVariableArray[nameDir] = (typeof thisVariableArray[nameDir] !== 'undefined') ? thisVariableArray[nameDir] : [];

			for (const fileName of fileNames[nameDir]) {
				thisVariableArray[nameDir][fileName] = []

				const img = new Image();
				img.src = `./img/${dir}/${nameDir}/${fileName}.png`		
				img.onload = function () {
					const imgWidth = Math.floor(this.width)
					const imgHeight = Math.floor(this.height)
					const imgPic = document.createElement("img")
					imgPic.style.display = 'none'
					imgPic.setAttribute('id', fileName)
					imgPic.setAttribute('src', img.src)
					imgPic.setAttribute('width', imgWidth)
					imgPic.setAttribute('height', imgHeight)
					imgPic.setAttribute('texture-id', data['id'])

					thisVariableArray[nameDir][fileName] = fileName;
					thisVariableArray['element'] = imgPic;
					thisVariableArray['textureWidth'] = imgWidth;
					thisVariableArray['textureHeight'] = imgHeight;
				}
				// Ez a menyezet miatt kell
				if (typeof data['type'] != 'undefined') {
					thisVariableArray['type'] = data['type']
				}
			}
		}
	}

	async loadTextureToArray(fileNames, dir, thisVariableArray) {
		let dirConstruction = []
		for (const nameDir of Object.keys(fileNames)) {
			//IF NOTHING OBJECTDIR MAKE
			dirConstruction.push(nameDir)
			thisVariableArray[nameDir] = (typeof thisVariableArray[nameDir] !== 'undefined') ? thisVariableArray[nameDir] : [];
			for (const fileName of fileNames[nameDir]) {
				thisVariableArray[nameDir][fileName] = []
				
				let loadTexture = await this.loadTexture(dir, nameDir, fileName)
				thisVariableArray[nameDir][fileName] = loadTexture

				dirConstruction.push(fileName)
			}
		}
		return dirConstruction;
	}

	async loadTexture(dir, nameDir, filename) {
		return new Promise((good, fault) => {
			const img = new Image()
			img.src = `./img/${dir}/${nameDir}/${filename}.png`
			// Finder
			let $element = $('body').find("#" + filename)
			if ($element.length > 0) {
				console.log('Found a match for the item with ID ' + filename + '. It was already loaded : (');
			} else {
				// Loading texture
				img.onload = function() {
					const imgWidth = this.width
					const imgHeight = this.height
					const imgCanvas = document.createElement("canvas")
					imgCanvas.style.display = 'none'
					imgCanvas.setAttribute('id', filename)
					imgCanvas.setAttribute('width', imgWidth)
					imgCanvas.setAttribute('height', imgHeight)
					const imgContext = imgCanvas.getContext('2d')

					imgContext.drawImage(img, 0, 0, imgWidth, imgHeight)
					const pixel = imgContext.getImageData(0, 0, imgWidth, imgHeight).data

					var count = 0;
					var texture = new Array(imgHeight);
					for (let n = 0; n < imgHeight; n++) texture[n] = new Array(imgWidth);
					for (let h = 0; h < imgHeight; h++) {
						for (let w = 0; w < imgWidth; w++) {
							let rgbaColor = `rgba(${pixel[count]}, ${pixel[count + 1]}, ${pixel[count + 2]}, ${pixel[count + 3]})`
							texture[h][w] = rgbaColor
							count = count + 4
						}
					}
					good({name: filename, imgWidth: imgWidth, imgHeight: imgHeight, data: texture});
				};

				img.onerror = function(error) {
					fault(error);
				};
				this.loadingInfo.push(filename)
			}
		});
	}
}
