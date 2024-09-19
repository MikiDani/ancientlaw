export default class SoundClass {
	constructor({menu: menu, getUserInteraction: getUserInteraction}) {
		this.musicList = ['music1', 'music2', 'music3']
		this.getUserInteraction = getUserInteraction
		this.menu = menu
		this.maxSoundCount = 16
		this.soundsLoaded = false
		this.sounds = {}
		this.soundsPlaying = []
		this.menuMusic = null
		this.gameMusic = null
	}

	async loadSounds() {
		try {
			const response = await fetch('./data/sounds/sounds.JSON')
			const data = await response.json()

			for (const soundFile of data.sounds) {
				this.sounds[soundFile] = './sounds/' + soundFile + '.mp3'
			}

			this.soundsLoaded = true
			return this.sounds
		} catch (err) {
			console.error('Hiba a hangfájlok betöltésekor:', err)
		}
	}

	async playSound(fileName, volume = 1) {
		let calcVolume = ((volume / 100) * (this.menu.soundVolume * 10)).toFixed(2)
		
		if (this.soundsPlaying.length < this.maxSoundCount) {
			if (this.getUserInteraction()) {
				let audio = new Audio(this.sounds[fileName])
				audio.volume = calcVolume
				audio.addEventListener('canplay', () => {
					audio.play()
				});

				this.soundsPlaying.push(audio)

				audio.addEventListener('ended', () => {
					// DELETE SOUND
					this.soundsPlaying = this.soundsPlaying.filter(a => a != audio)
				});
			}
		} else {
			// console.log('Audio playback is full!')
		}
	}

	async playMusic(fileName, type) {		
		if (this.getUserInteraction()) {
			if (this[type]) {
				this[type].pause();
				this[type].currentTime = 0;
			}

			let calcVolume = this.menu.musicVolume / 10;	
			this[type] = new Audio(this.sounds[fileName])
			this[type].volume = calcVolume
			this[type].addEventListener('canplay', () => {
				this[type].play()
			});

			this[type].addEventListener('ended', () => {
				// REPLAY MUSIC
				this.playMusic(fileName, type)
			});
		}
	}

	replaceText(allText, what, why) {
		return allText.replace(what, why)
	}

	playSoundEvent(fileName, volume) {
		if (fileName.includes('ninja1')) fileName = this.replaceText(fileName, 'ninja1', 'ninja')
		if (fileName.includes('ninja2')) fileName = this.replaceText(fileName, 'ninja2', 'ninja')

		$('#sound-button').attr('data-sound', fileName)
		$('#sound-button').attr('data-volume', volume)
		$('#sound-button').click()
	}

	calculateDistance(getDistance) {
		let distance = getDistance
		let maxDistance = 1100

		distance = distance - 10 // min creature distance
		distance = (distance > maxDistance) ? maxDistance : distance;

		let precentageValume = (100 - ((distance / maxDistance) * 100)) * 0.01
		precentageValume = precentageValume.toFixed(2)
		
		return precentageValume;
	}
}
