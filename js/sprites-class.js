export default class SpritesClass {
	lookDistance;
	sprites;
	nearSprites;
	weponsSprites;
	objectDataTypes;
	constructor({CELL_SIZE: CELL_SIZE, player: player, menu: menu, soundClass: soundClass, texturesClass: texturesClass, mapDataClass: mapDataClass, resetFov: resetFov}) {
		this.soundClass = soundClass
		this.texturesClass = texturesClass
		this.mapDataClass = mapDataClass
		this.player = player
		this.menu = menu
		this.CELL_SIZE = CELL_SIZE
		//--------------------------------
		this.lookDistance = 30	// 24
		this.sprites = []
		this.nearSprites = []
		this.weponsSprites = []

		this.loadObjectDataTypes()
		this.resetFov = resetFov
	}

	async loadObjectDataTypes() {
		const loadData = await fetch("./data/objectdatatypes.JSON")
		this.objectDataTypes = await loadData.json()
	}

	createSprite(spriteData, dirConstruction, thisArray) {
		let spriteArray = [];
		
		spriteArray.dirConstruction = dirConstruction
				
		for (let key in spriteData) {
			const isset = this.objectDataTypes.some(item => item.name == key);
			if (isset) {
				(key == "x" || key == "y") 
				? spriteArray[key] = this.CELL_SIZE * spriteData[key]
				: spriteArray[key] = spriteData[key]
			} 
		}

		thisArray.push(spriteArray)
	}

	selectNearSprites() {
		let pY = Math.floor(this.player.y / this.CELL_SIZE)
		let pX = Math.floor(this.player.x / this.CELL_SIZE)
		
		let checkYmin = (pY - this.lookDistance > 0)
		? pY - this.lookDistance
		: 0;

		let checkYmax = (pY + this.lookDistance < this.mapDataClass.map.length)
		? pY + this.lookDistance
		: this.mapDataClass.map[0].length;

		let checkXmin = (pX - this.lookDistance > 0)
		? pX - this.lookDistance
		: 0;
		
		let checkXmax = (pX + this.lookDistance < this.mapDataClass.map[0].length)
		? pX + this.lookDistance 
		: this.mapDataClass.map[0].length;

		this.nearSprites = []
		this.sprites.forEach((sprite, index) => {

			if (sprite.distance == null) sprite.distance = 5000
			
			let sY = Math.floor(sprite.y / this.CELL_SIZE)
			let sX = Math.floor(sprite.x / this.CELL_SIZE)

			if (sY >= checkYmin && sY <= checkYmax &&
				sX >= checkXmin && sX <= checkXmax) this.nearSprites.push(index)
		});
	}

	startShot() {
		if (this.player.weapon == 3) {
			this.player.ammoStar--
			$('#ammo-star-text').html(this.player.ammoStar)
		}

		if (this.player.weapon == 4) {
			this.player.ammoFire--
			$('#ammo-fire-text').html(this.player.ammoFire)
		}

		var findAmmo = this.weponsSprites.find(objektum => objektum.name == `ammo_weapon${this.player.weapon}`);

		if (findAmmo) {
			let ammo = { ...findAmmo };
			ammo.playerAmmo = true
			ammo.active = true
			ammo.x = this.player.x + Math.cos(this.player.angle);
			ammo.y = this.player.y + Math.sin(this.player.angle);
			ammo.angle = this.player.angle

			ammo.speed = this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] * 2
			
			this.sprites.push(ammo)
		}
	}

	startEnemyShot(creature) {
		var findAmmo = this.weponsSprites.find(objektum => objektum.name == `ammo_weapon3`);

		if (findAmmo) {
			let randSoundNum = Math.floor(Math.random() * 2) + 1
						
			this.soundClass.playSoundEvent(`weapon3-${randSoundNum}`, this.soundClass.calculateDistance(creature.distance))

			let ammo = { ...findAmmo };
			ammo.damage = creature.damage
			ammo.active = true

			let dx = this.player.x - creature.x
			let dy = this.player.y - creature.y
			let angle = Math.atan2(dy, dx)

			let distance = this.CELL_SIZE
			let newX = creature.x + (Math.cos(angle) * distance)
			let newY = creature.y + (Math.sin(angle) * distance)

			ammo.angle = angle
			ammo.x = newX
			ammo.y = newY

			this.sprites.push(ammo)
		}
	}

	checkSpriteData(y, x, attr, name, type = null) {
		if (type == 'position') {
			y = Math.floor(y / this.CELL_SIZE)
			x = Math.floor(x / this.CELL_SIZE)
		}
	
		let check = this.sprites.find(sprite => (sprite[attr] == name && y == Math.floor(sprite.y / this.CELL_SIZE) && x == Math.floor(sprite.x / this.CELL_SIZE)))
	
		let returnValue = (check) ? check : false;
		return returnValue;
	}

	damage(get, give, drawing) {
		if (typeof get.energy != 'undefined' && typeof give.damage != 'undefined') {
			if (typeof get.damage_function == 'undefined' || get.damage_function == null) {

				if (get.energy > 0) get.energy -= give.damage;

				if (drawing) {
					if (get.energy < 0) get.energy = 0
					$("#healt-percentage").text(get.energy + '%');
					$("#healt-percentage").css('color', 'red');
					this.playerHealtTimeOut(get.energy)
					// PLAYER DIE
					if (get.energy <= 0 && this.player.live) {
						this.player.live = false
						if (!get.playing_sound_die) {
							let randomNum = Math.floor(Math.random() * 2) + 1;
							this.soundClass.playSoundEvent(`player-die${randomNum}`, 1)
							get.playing_sound_die = setTimeout(() => {
								get.playing_sound_die = null
							}, 1000);
							if (!this.player.die_action) {
								var animCount = 0
								this.player.z = 0
								this.menu.mapSwitch = false
								this.player.poison = false
								this.resetFov()
								
								let sign = (Math.floor(Math.random() * 2)) ? 0.5 : -0.5;
								this.player.die_action = setInterval(() => {
									animCount++
									if (animCount >= 10) {
										clearInterval(this.player.die_action)
										this.player.die_action = null
									}
									this.player.angle = this.player.angle + sign
									this.player.z = this.player.z - 12
								}, 70);
							}
						}
					} else {
						// PLAYER DEMAGE SOUND
						if (!get.playing_sound_hurt) {
							let randomNum = Math.floor(Math.random() * 3) + 1;
							let name = `player-hurt${randomNum}`
							this.soundClass.playSoundEvent(name, 1)
							get.playing_sound_hurt = setTimeout(() => {
								get.playing_sound_hurt = null
							}, 1000);
						}
					}
				}

				get.damage_function = setTimeout(() => {
					get.damage_function = null;
				}, 500);
			}
		}
	}

	enemyHit(creature) {		
		creature.energy = creature.energy - this.player.weaponsDamage[this.player.weapon]
		creature.moveType = 'attack'

		if (creature.dirConstruction.some(name => name.includes('ninja1'))) {
			// SHOTING
			if (creature.speed > 0) creature.speed = -creature.speed
		} else {
			// FIGHTING
			// creature.speed += 2
		}

		if (!creature.anim_damage_function) {
			creature.anim_damage_actFrame = `${creature.dirConstruction[0]}_E3`
			
			// SOUND DAMAGE
			if (creature.energy > 0 && typeof creature.sound != 'undefined' && creature.sound[1]) {
				let randSoundNum = Math.floor(Math.random() * creature.sound[1].length)                
				this.soundClass.playSoundEvent(creature.sound[1][randSoundNum], this.soundClass.calculateDistance(creature.distance))
			}

			creature.anim_damage_function = setInterval(() => {
				clearInterval(creature.anim_damage_function)
				creature.anim_damage_function = null
				creature.anim_damage_actFrame = null
			},creature.anim_speed)
		}
	}

	playerHealtTimeOut(energy) {
		setTimeout(function () {
			if (energy > 70) $("#healt-percentage").css('color', 'white');
			else if (energy <= 70 && energy >=31) $("#healt-percentage").css('color', 'gold');
			else if (energy <= 30) $("#healt-percentage").css('color', 'red');
		}, 200);
	}
}
