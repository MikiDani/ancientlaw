class Editor {
	objectDataTypes;
	skys;
	floors;
	walls;
	blocks;
	objects;
	selectedElementData;
	objectName;
	effects;
	objectDataTypes;
	constructor (mapList, musicList) {
		this.mapList = mapList
		this.musicList = musicList
		this.musicName = musicList[0]
		
		this.mapSize = 48
		this.mapContainerWidth = 2072
		this.levelDataBasic = {
			"shadow": 160,
			"player": {
				"y": 1.5,
				"x": 1.5,
				"angle": 0,
				"live": true,
			},
			"error": [
				{
					"textures": {
						"error": ["error"]
					},
					"type": "error"
				}
			],
			"sprites": [
			],
			"secrets": 0,
		}
		this.mapfileName = ''
		this.levelData = this.levelDataBasic
		this.map = []
		this.skys = []
		this.floors = []
		this.walls = []
		this.blocks = []
		this.objects = []
		this.creatures = []
		this.effects = []
		this.objectName = null
		// ---------------
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth)
		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth))
		this.mapIconSize()
		// ----------------
		this.loadDatas()
	}
	
	async loadDatas() {				
		await this.loadTextures()
		// LOAD MAP
		await this.loadMap(mapList[0])
		this.buttonOptions()
		this.mapMusic(this)
	}

	drawPlayer(y, x, angle, mode) {
		let mY = Math.floor(y)
		let mX = Math.floor(x)
		let mapBrick = $(".map-container").find(`[id^='map_'][map-y='${mY}'][map-x='${mX}']`);
		
		if (mode == 'draw') {
			mapBrick.css('background-image', `url(./img/editor/player-${angle}.png)`);
			mapBrick.css('background-size', 'cover')
			mapBrick.css('border', 'none')
		}

		if (mode == 'delete') {
			mapBrick.css("background-image","").css("background-size", "").css("border", "");
		}
	}

	insertedOptions(clone, y, x, id) {
		let data = {}
		let insertType = ''
		let insertObject = clone.walls.find(wall => parseInt(wall.id) == parseInt(id))
		if (insertObject) insertType = 'wall'
		if (!insertObject) {
			insertObject = clone.objects.find(object => parseInt(object.id) == parseInt(id))
			if (insertObject) {
				insertType = 'object'
				data.y = parseInt(y) + 0.5
				data.x = parseInt(x) + 0.5
			}
			if (!insertObject) {
				insertObject = clone.blocks.find(block => parseInt(block.id) == parseInt(id))
				if (insertObject) {
					insertType = 'block'
					data.y = parseInt(y) + 0.5
					data.x = parseInt(x) + 0.5
				}
			}
			if (!insertObject) {
				insertObject = clone.creatures.find(creature => parseInt(creature.id) == parseInt(id))
				if (insertObject) {
					insertType = 'creature'
					data.y = parseInt(y) + 0.5
					data.x = parseInt(x) + 0.5
				}
			}
			if (!insertObject) {
				insertObject = clone.effects.find(effect => parseInt(effect.id) == parseInt(id))
				if (insertObject) {
					insertType = 'effect'
					data.y = parseInt(y)
					data.x = parseInt(x)
				}
			}
		}

		// SELECTING IMPORTANT DATAS
		if(typeof insertObject != 'undefined') {
			data.id = clone.selectedElementData.id
			for(const [key, value] of Object.entries(insertObject)) {
				// If have modified options save the map array.
				if (key != 'textures' && key != 'anim_function' && key != 'sound' && key != 'rotate_frames' && key != 'anim_frames') {
					if (value != clone.selectedElementData[key]) {
						data[key] = clone.selectedElementData[key]
					}
				}
			}
		}
		return {
			insertType: insertType,
			data: data,
		};
	}

	clearMapCordinate(y, x) {
		let mY = Math.floor(y)
		let mX = Math.floor(x)
		// Map delete		
		this.map[mY][mX] = 0
		// Sprite delete
		let findSpriteIndex = this.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
		if (findSpriteIndex !== -1) this.levelData.sprites.splice(findSpriteIndex, 1)
	}

	clickedBgDrawing(element, time, color) {
		element.css({"background-image": "", "background-size": "" });
		element.css('background-color', color)
		setTimeout(function() {
			element.css('background-color', '#0a0a0a')
			element.addClass('brick')
		}, time);
	}

	drawMessage = function(message, color) {
		$("#filename-message").html(`<span class='p-0 m-0 text-${color}'>${message}</span>`)
		$("#filename-message").show()
		setTimeout(() => {
			$("#filename-message").text('')
			//$("#filename-message").hide()
			$("#filename-message").hide()
		}, 2000);
	}

	async clearMap(clone) {
		for (let y = 0; y < clone.mapSize; y++) {
			for (let x = 0; x < clone.mapSize; x++) {
				clone.map[y][x] = 0
				let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
				if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
									
				let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
				mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
			}
		}
		clone.levelData = []
		clone.levelData.sprites = []
		clone.levelData.player = clone.levelDataBasic.player
	}

	buttonOptions() {
		var clone = this

		$(document).on('click', ".textures-pic-container_blocks > img[class^='list-pic'], .textures-pic-container_walls > img[class^='list-pic'], .textures-pic-container_creatures > img[class^='list-pic'], .textures-pic-container_objects > img[class^='list-pic']", function() {
			$('.tools-container').animate({
				scrollTop: $("#textures-selected").offset().top + $('.tools-container').offset().top + $('.tools-container').scrollTop() + 2
			}, 200);
		});

		var removeBorders = function(targetLink) {
			$(document).find(targetLink).each(function() {
				$(this).removeClass('border-2').addClass('border-0')
			});
		}

		$(document).on('click', '.textures-pic-container_direction > [class^="list-pic-"]', function() {
			removeBorders('.textures-pic-container_direction > [class^="list-pic-"]')
			$(this).removeClass('border-0').addClass('border-2')
		});

		$(document).on('click', '.textures-pic-container_player > [class^="list-pic-"]', function() {
			removeBorders('.textures-pic-container_player > [class^="list-pic-"]')
			$(this).removeClass('border-0').addClass('border-2')
		});

		$("#shadow-input").on('input', {leveldata: this.levelData}, function (event) {
			var leveldata = event.data.leveldata			
			leveldata.shadow = $(this).val()
			$("#shadow-input-value").html($(this).val())
		});

		// LOAD DATAS IN VARIABLE WHEN CLICKED TEXTURE
		$("#textures-selected").on('input', () => this.loadElementsData(this.selectedElementData.textures))

		// CLICK MAP
		$("[id^='map_']").on('click', function() {

			removeBorders('.textures-pic-container_player > [class^="list-pic-"]')

			let y = $(this).attr('map-y')
			let x = $(this).attr('map-x')
			
			// PLAYER START POSITION
			if (clone.selectedElementData) {
				// IF PLAYER SELECTED
				if (clone.selectedElementData.player) {
					let newAngle = clone.selectedElementData.playerAngle
					
					// OLD PLACE
					clone.clearMapCordinate(clone.levelData.player.y, clone.levelData.player.x)
					clone.drawPlayer(clone.levelData.player.y, clone.levelData.player.x, null, 'delete')
					// NEW PLACE
					clone.clearMapCordinate(y, x)
					
					clone.levelData.player.y = parseInt(y) + 0.5
					clone.levelData.player.x = parseInt(x) + 0.5
					clone.levelData.player.angle = newAngle

					clone.drawPlayer(y, x, newAngle, 'draw')

					clone.selectedElementData = null
					return;
				}

				// THERE CAN ONLY BE ONE EXIT
				if (clone.selectedElementData.mode == 'exit') {
					let mapElement = $("div.brick[style*='direction-exit.png']");
					let searchExit = clone.levelData.sprites.filter(sprite => sprite.mode == 'exit');

					if (searchExit.length != 0 || mapElement.length > 0) {
						alert('The exit is already placed!')
						return;
					}
				}
			}

			// THE PLAYER CANNOT BE DELETED
			if (y == Math.floor(clone.levelData.player.y) && x == Math.floor(clone.levelData.player.x)) return;

			// SELECTED ELEMENT DATA
			if (clone.selectedElementData) {
				var creatureMod = false
				clone.clickedBgDrawing($(this), 200, '#00800077')
				
				if (clone.selectedElementData.type == 'effect') {
					let imgVal
					if (clone.selectedElementData.mode == 'direction') imgVal = clone.selectedElementData.angle
					if (clone.selectedElementData.mode == 'exit') imgVal = clone.selectedElementData.mode

					$(this).css('background-image', `url(./img/editor/direction-${imgVal}.png)`);
					$(this).css('background-size', 'cover')
				} else {
					for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
						let num = 0
						if (clone.selectedElementData.type == 'creature') {
							if (clone.selectedElementData.angle == 0) num = 12
							if (clone.selectedElementData.angle == 90) num = 0
							if (clone.selectedElementData.angle == 180) num = 8
							if (clone.selectedElementData.angle == 270) num = 4

							// CREATURE MOD
							let plusEnergy = $("input[name='plus-energy']").val()
							let plusDamamge = $("input[name='plus-damage']").val()
							let plusSpeed = $("input[name='plus-speed']").val()
							let plusAnimspeed = $("input[name='plus-animspeed']").val()
							if (plusEnergy != 0 || plusDamamge != 0 || plusSpeed != 0 || plusAnimspeed != 0) {
								creatureMod = true
								let defaultCreture = clone.creatures.find(creature => creature.id == clone.selectedElementData.id)
								if (defaultCreture) {
									if (plusEnergy != 0) clone.selectedElementData.energy = parseInt(defaultCreture.energy) + parseInt(plusEnergy)
									if (plusDamamge != 0) clone.selectedElementData.damage = parseInt(defaultCreture.damage) + parseInt(plusDamamge)
									if (plusSpeed != 0) clone.selectedElementData.speed = parseInt(defaultCreture.speed) + parseInt(plusSpeed)
									if (plusAnimspeed != 0) clone.selectedElementData.anim_speed = parseInt(defaultCreture.anim_speed) + parseInt(plusAnimspeed)
								}
							}
						}
						$(this).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[num]}.png)`);
						$(this).css('background-size', 'cover')
						$(this).css('border', 'none')						
						if (clone.selectedElementData.mode == 'secret') $(this).css('border', '3px solid white')
						if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(this).css('border', '3px solid gray')
						break;
					}
				}

				// INSERTED DATA (WRITE)
				let insertedData = clone.insertedOptions(clone, y, x, clone.selectedElementData.id)

				function insertBlockFrame(clone, y, x, angle) {
					function deleteMap(clone, y,x) {
						clone.map[y][x] = 0;
					}

					function deleteSprite(clone, y,x) {
						let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
						if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					}

					function drawTexture(clone, y, x, obj) {
						let loadingTexture = clone.walls.find(wall => wall.id == obj.id)						
						let mapBrick = $(".map-container").find(`[id^='map_'][map-y='${y}'][map-x='${x}']`);
						
						for(const [dir, filename] of Object.entries(loadingTexture.textures)) {
							mapBrick.css('background-image', `url(./img/walls/${dir}/${filename[0]}.png)`);
							mapBrick.css('background-size', 'cover')
							mapBrick.css('border', 'none')
							if (typeof loadingTexture.height != 'undefined' && loadingTexture.height == 'big') $(this).css('border', '3px solid gray')
							break;
						}
					}

					if (angle == 90) {
						if (typeof clone.map[y][x-1] != undefined)
							deleteMap(clone, y, x-1); deleteSprite(clone, y, x-1); clone.map[y][x-1] = {id:5}; drawTexture(clone, y, x-1, {id:5});
						
						if (typeof clone.map[y][x+1] != undefined)
							deleteMap(clone, y, x+1); deleteSprite(clone, y, x+1); clone.map[y][x+1] = {id:5}; drawTexture(clone, y, x+1, {id:5});
					}

					if (angle == 0) {
						if (typeof clone.map[y-1][x] != undefined)
							deleteMap(clone, y-1, x); deleteSprite(clone, y-1, x); clone.map[y-1][x] = {id:5}; drawTexture(clone, y-1, x, {id:5});
						
						if (typeof clone.map[y+1][x] != undefined)
							deleteMap(clone, y+1, x); deleteSprite(clone, y+1, x); clone.map[y+1][x] = {id:5}; drawTexture(clone, y+1, x, {id:5});
					}
				}

				if (insertedData && insertedData.insertType == 'wall') {
					delete insertedData.insertType
					delete insertedData.data.dirName
					// if have delete sprite
					let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
					if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					// insert wall
					clone.map[y][x] = insertedData.data;
				}

				if (insertedData && (insertedData.insertType == 'object' || insertedData.insertType == 'block' || insertedData.insertType == 'creature' || insertedData.insertType == 'effect')) {
					if (insertedData.insertType == 'block') insertBlockFrame(clone, Math.floor(insertedData.data.y), Math.floor(insertedData.data.x), clone.selectedElementData.angle);
					delete insertedData.insertType
					delete insertedData.data.dirName
					// if have delete sprite
					let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
					if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					// if have delete map
					clone.map[y][x] = 0;
					// insert sprite
					clone.levelData.sprites.push(insertedData.data);
				}
			} else {
				clone.drawMessage('No have selected anything!', 'warning')
			}
		});

		// RIGHT CLICK
		$(document).on('contextmenu', (event) => event.preventDefault())
				
		$(".map-container").find("[id^='map_']").on('mousedown', { levelData: this.levelData }, function(event) {	
			let levelData = event.data.levelData
			event.preventDefault()

			// RIGHT MOUSE CLICK
			if (event.which == 3) {
				let y = $(this).attr('map-y')
				let x = $(this).attr('map-x')
				
				// Map delete
				clone.map[y][x] = 0

				$(this).css("background-image","").css("background-size", "").css("border", "");
				clone.clickedBgDrawing($(this), 200, '#ff000077')

				// Sprite delete
				let findSpriteIndex = levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
				if (findSpriteIndex !== -1) levelData.sprites.splice(findSpriteIndex, 1)
				
				clone.drawPlayer(clone.levelData.player.y, clone.levelData.player.x, clone.levelData.player.angle, 'draw')
			}
		});
				
		// CLEARING MAP DATAS
		$("#clearing-button").on('click', async () => {

			const checkAction = (currentData, exceptions, wallsSwitch) => {
				var id = currentData.id
				var defaultData = null

				let list = ['blocks' ,'objects', 'creatures', 'effects']
				
				var stop = false

				// FIND DEFAULT DATA:
				list.forEach(element => {
					if (stop) return;
					for (const [key, value] of Object.entries(this[element])) {
						if (value.id == id) {
							defaultData = this[element][key]
							delete defaultData.textures
							delete defaultData.dirName
							stop = true
							break;
						}
					}
				});

				var data = {}
				data.id = id
				if (wallsSwitch) {
					if (currentData.x) delete currentData.x;
					if (currentData.y) delete currentData.y;
				} else {
					if (currentData.x) data.x = currentData.x;
					if (currentData.y) data.y = currentData.y;
				}
				
				if (defaultData) {
					// CHECK CURRENT AND DEFAULT DATA
					for(const [dKey, dValue] of Object.entries(defaultData)) {
						for(const [cKey, cValue] of Object.entries(currentData)) {
							stop = false
							exceptions.forEach(exception => {
								if (exception == dKey) {
									stop = true
									return;
								}
							});
							if (stop) break;

							if (dKey != 'id' && cKey != 'id') {	
								// NOT DEFAULT VALUE
								if (dKey == cKey && dValue != cValue) {
									data[cKey] = cValue
								}
							}
						}
					}
				}
				return data;
			}

			// START
			var exceptions = ['type', 'textures','anim_function','sound','rotate_frames','anim_frames']

			// MAP CLEARING
			for (let n = 0; n < this.map.length; n++) {
				for (let m = 0; m < this.map[0].length; m++) {
					if (this.map[n][m]) this.map[n][m] = checkAction(this.map[n][m], exceptions, true);
				}
			}

			// SPRITES CLEARING
			this.levelData.sprites.forEach((brick, index) => {
				this.levelData.sprites[index] = checkAction(brick, exceptions, false);
			});
		});

		// DELETE ALL MAP BRICK
		$("#delete-all-button").on('click', async function () {
			let result = confirm('Are you sure you want to delete all the bricks on the map?');
			if (result) await clone.clearMap(clone);
		});

		// FILL MAP BORDER BUTTON
		$("#fill-border-button").on('click', function () {
			if (clone.selectedElementData) {
				let result = confirm('Are you sure you want to draw border to map?');
				if (result) {
					let counter = 0;
					for (let y = 0; y < clone.mapSize; y++) {
						for (let x = 0; x < clone.mapSize; x++) {
							if (x == 0 || x==clone.mapSize-1 || y==0 || y==clone.mapSize-1) {
								let dataInMap = clone.insertedOptions(clone, y, x, clone.selectedElementData.id)
								// insert map
								if(dataInMap) clone.map[y][x] = dataInMap.data;
								// if have sprite delete
								let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
								if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)

								for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
									$(`#map_${counter}`).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
									$(`#map_${counter}`).css('background-size', 'cover')
									$(`#map_${counter}`).css('border', 'none')							
									if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(`#map_${counter}`).css('border', '3px solid gray')
									break;
								}
							}
							counter++;
						}
					}
				}
			} else {
				clone.drawMessage('No have data in cursor!', 'warning')
			}
		});

        $(document).on('change', "input[name='musicselector']", function () {
			clone.musicName = $(this).val()
        });

		// CLICK SAVE BUTTON
		$("#save-button").on('click', {levelData: this.levelData, musicname: this.musicName}, function (event) {
			event.data.levelData
			event.data.levelData['map'] = clone.map
			event.data.levelData.musicname = clone.musicName

			if (clone.map.length != 0) {
				let filename = $("input[name='filename']").val()
				// SECRETS COUNT
				event.data.levelData.secrets = clone.countSecrets(clone.map)

				if (filename.length > 0) {
					const mapdata = JSON.stringify(event.data.levelData)
					
					var removeAfterDot = function (str) {
						const dotIndex = str.indexOf('.');
						if (dotIndex !== -1) return str.substring(0, dotIndex);
						return str;
					}

					filename = removeAfterDot(filename)
					$("input[name='filename']").val(filename)
				
					var xhr = new XMLHttpRequest()
					xhr.open("POST", "./save.php", true)
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
					var dataToSend = "mapdata=" + encodeURIComponent(mapdata) + "&filename=" + encodeURIComponent(filename);
					xhr.send(dataToSend)
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4 && xhr.status == 200) {
							let color = (xhr.status == 200) ? 'success' : 'danger';
							clone.drawMessage(xhr.responseText, color)
						}
					};
				} else clone.drawMessage('No have filename!', 'danger')
			} else clone.drawMessage('The map is empty!', 'danger');
		});

		// CLICK LOAD BUTTON
		$("#load-button").on('click', async function () {

			await clone.clearMap(clone)
			clone.levelData = [];
						
			let filename = $("input[name='filename']").val()

			if (filename.length > 0) {
				clone.levelData = clone.levelDataBasic

				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {						
						let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
						mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
					}
				}

				clone.loadMap(filename)
				
			} else clone.drawMessage('No have filename!', 'danger')
		});
	}

	countSecrets(map) {
		let secretWallIds = this.walls.filter(wall => wall.mode == 'secret').map(wall => wall.id);
		var secrets = 0
		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[y].length; x++) {
				if (secretWallIds.includes(map[y][x].id)) secrets++;
			}
		}
		return secrets;
	}
	
	resizer(mapSize, mapContainerWidth) {
		this.bricksize = Math.floor(mapContainerWidth / mapSize)

		$(".map-row").css('width', mapContainerWidth)
		$(".map-row").css('height', this.bricksize)

		$(".brick").css('width', this.bricksize)
		$(".brick").css('height', this.bricksize)
	}

	mapUpload(mapSize) {
		let counter = 0;
		for (let y = 0; y < mapSize; y++) {
			this.map[y] = [];
			let elementRow = document.createElement('div');
			elementRow.className = 'map-row';
			for (let x = 0; x < mapSize; x++) {	
				let element = document.createElement('div')
				element.className = 'brick'
				// element.innerText= counter
				element.style.width = this.bricksize + 'px'
				element.style.height = this.bricksize + 'px'
				element.setAttribute('map-y', y)
				element.setAttribute('map-x', x)
				element.setAttribute('id', 'map_' + counter)
				
				elementRow.appendChild(element)
				this.map[y][x] = 0
				counter++
			}
			document.querySelector(".map-container").appendChild(elementRow)
		}
	}

	getObjectNames(obj) {
		let textures = Object.values(obj)
		let textureDir = String(Object.values(Object.keys(textures[0].textures)))
		let textureName = String(Object.values(Object.values(textures[0].textures)[0]))
		return { textureDir: textureDir, textureName: textureName }
	}

	async clickMapnameLoad(clone, filename) {
		await clone.clearMap(clone)
		clone.levelData = [];

		if (filename.length > 0) {
			clone.levelData = clone.levelDataBasic

			for (let y = 0; y < clone.mapSize; y++) {
				for (let x = 0; x < clone.mapSize; x++) {						
					let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
					mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
				}
			}
			clone.loadMap(filename)
			
		} else clone.drawMessage('No have filename!', 'danger')
	}

	async loadMap(mapfileName) {
		var clone = this

		const mapDataWait = await fetch(`./data/maps/${mapfileName}.JSON`)
		const mapData = await mapDataWait.json();

		$("input[name='filename']").val(mapfileName)
		$("#map-selector").html('')

		this.mapList.forEach((mapName, index) => {
			let ifChecked = (mapName == mapfileName) ? 'checked' : '';
			let element = 
			`<div class="form-check text-start">
				<input id="mapselector_${index}" class="form-check-input" name="mapselector" type="radio" value="${mapName}" ${ifChecked}>
				<label class="form-check-label">${mapName}</label>
			</div>`;
			$("#map-selector").append(element)
			$(`#mapselector_${index}`).on('click', function() {
				var loadMapName = $(this).val()
				let result = confirm('Are you sure you want to load the "' + loadMapName + '" map?');
				if (result) {
					clone.clickMapnameLoad(clone, loadMapName)
				} else {
					$("#map-selector").find('input').each(function() {
						if ($(this).val() == clone.mapfileName) $(this).prop('checked', true)
					});
				}
			});
		});

		// LOADING SUCCESS
		this.levelData.player.y = mapData.player.y
		this.levelData.player.x = mapData.player.x
		this.levelData.player.angle = mapData.player.angle
		this.levelData.shadow = mapData.shadow
		this.levelData.musicname = mapData.musicname

		$("#shadow-input-value").text(this.levelData.shadow)

		// MUSIC SELECT	
		var musicName = mapData.musicname
		if (!this.levelData.musicname) {
			$("input[name='musicselector']").first().prop('checked', true)
		} else {
			$("input[name='musicselector']").each(function() {
				if ($(this).val() == musicName) $(this).prop('checked', true);
			});
		}

		this.drawPlayer(this.levelData.player.y, this.levelData.player.x, this.levelData.player.angle, 'draw')

		// load sky and floor
		if (typeof mapData.skys != 'undefined') this.levelData.skys = mapData.skys
		if (typeof mapData.floors != 'undefined') this.levelData.floors = mapData.floors
		this.selectedElementsBorderDraw(this)
		// Load walls
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[0].length; x++) {
				let cellData = mapData.map[y][x]	// loaded data
				if(cellData) {
                    // Érték szerinti átadás
                    const wallValue = {...cellData}
                    this.map[y][x] = wallValue
					
                    let loadingTexture = this.walls.find(wall => wall !== null && wall.id == cellData.id);
					if (loadingTexture) {
						loadingTexture.dirName = 'walls'
						loadingTexture = {...loadingTexture, ...wallValue}
					}

					// Map container graphics
					if (loadingTexture) {
						for(const [dir, filename] of Object.entries(loadingTexture.textures)) {
							let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
							mapBrickElment.css('background-image', `url(./img/${loadingTexture.dirName}/${dir}/${filename[0]}.png)`)
							mapBrickElment.css('background-size', 'cover')
							// delete loadingTexture.dirName
							mapBrickElment.css('border', 'none')
							if (loadingTexture.mode == 'secret') mapBrickElment.css('border', '3px solid white')
							if (typeof loadingTexture.height != 'undefined' && loadingTexture.height == 'big') mapBrickElment.css('border', '3px solid gray')
							break;
						}
					}
				}
			}
		}

		// load Sprites
		mapData.sprites.forEach(sprite => {
			let insertSprite = this.objects.find(obj => parseInt(obj.id) == parseInt(sprite.id))
			if (insertSprite) {
				insertSprite.dirName = 'objects';
			} else {
				insertSprite = this.blocks.find(block => parseInt(block.id) == parseInt(sprite.id))
				if (insertSprite) {
					insertSprite.dirName = 'blocks';
				} else {
					insertSprite = this.creatures.find(creatures => parseInt(creatures.id) == parseInt(sprite.id))
					if (insertSprite) {
						insertSprite.dirName = 'creatures';
					} else {
						insertSprite = this.effects.find(effects => parseInt(effects.id) == parseInt(sprite.id))
						if (insertSprite) {
							insertSprite.dirName = 'effects';
						}
					}
				} 
			}
			
			var graphSprite = {}

			if (insertSprite) {
				let data = {}
				data.id = sprite.id

				for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
				this.levelData.sprites.push(sprite)
				graphSprite = {...data, ...sprite}
			}

			// Map container graphics
			let y = Math.floor(sprite.y)
			let x = Math.floor(sprite.x)

			if (sprite.type == 'effect') {
				let imgVal
				if (sprite.mode == 'direction') imgVal = sprite.angle
				if (sprite.mode == 'exit') imgVal = sprite.mode

				let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
				mapBrickElment.css('background-image', `url(./img/editor/direction-${imgVal}.png)`)
				mapBrickElment.css('background-size', 'cover')
			} else {
				for(const [dir, filename] of Object.entries(graphSprite.textures)) {
					let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
					let num = 0
					if (graphSprite.type == 'creature') {
						if (graphSprite.angle == 0) num = 12
						if (graphSprite.angle == 90) num = 0
						if (graphSprite.angle == 180) num = 8
						if (graphSprite.angle == 270) num = 4
					}
					mapBrickElment.css('background-image', `url(./img/${graphSprite.dirName}/${dir}/${filename[num]}.png)`)
					mapBrickElment.css('background-size', 'cover')
					break;
				}
			}
		});

		// Auto Scroll in PLayer		
		$('.map-container .brick').each(function() {
			var backgroundImage = $(this).css('background-image')
			if (backgroundImage.includes('player-')) {
				let container = $('.map-container')
				let halfContainerWidth = container.width() / 2.6
				let halfContainerHeight = container.height() / 2.6
				container.scrollTop($(this).offset().top - container.offset().top + container.scrollTop() - halfContainerWidth)
				container.scrollLeft($(this).offset().left - container.offset().left + container.scrollLeft() - halfContainerHeight)
			}
		});
	}

	mapIconSize() {
		var clone = this
		$("#map-icon-size-button").on('click', function() {
			let dataSize = $(this).attr('data-size')
			if (dataSize == 'big') {
				$(this).text('Big Icons')
				$(this).attr('data-size', 'small')
				clone.resizer(64, 2000)
			} else {
				$(this).text('Small Icons')
				$(this).attr('data-size', 'big')
				clone.resizer(64, 4000)
			}
		});
	}

	loadInput(fileKey, fileValue, elementName) {
		// Action function
		function elementCreator(objectData, fileKey, fileValue) {
			let returnElement;
			if (objectData.inputType == 'null') returnElement = ``;
			
			let warningColor = (fileKey == 'angle' || fileKey == 'material') ? 'text-warning' : '';

			if (objectData.inputType == 'hidden') {
				returnElement = `
				<input id="number_${fileKey}" name="${fileKey}" type="hidden" input-type="${objectData.inputType}" value="${fileValue}">`
			}

			if (objectData.inputType == 'number') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="number_${fileKey}" name="${fileKey}" type="number" input-type="${objectData.inputType}" value="${fileValue}" min="0" max="5000" step="1" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'text') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="text_${fileKey}" name="${fileKey}" type="text" input-type="${objectData.inputType}" value="${fileValue}" id="text_${fileKey}" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'array') {	// no modify
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle" input-type="${objectData.inputType}">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">${fileValue}</div>`;
			}

			if (objectData.inputType == 'boolean') {
				function checkChecked(value) {
					if (fileValue == value) return ' selected'; else return '';
				}
				
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="boolean_${fileKey}" name="${fileKey}" input-type="${objectData.inputType}" class="form-control form-control-sm align-middle">
						<option value="false" ${checkChecked(false)}>false</option>
						<option value="true" ${checkChecked(true)}>true</option>
					</select>
				</div>`;
			}

			if (objectData.inputType == 'select') {
				function checkChecked(value) {
					if (fileValue == value) return ' selected'; else return '';
				}
				
				let checkDisabled = (fileKey == 'type') ? 'disabled' : '';
				let checkBg = (fileKey == 'type') ? 'bg-disabled' : '';

				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle ${warningColor}">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="select_${fileKey}" name="${fileKey}" input-type="${objectData.inputType}" class="form-control form-control-sm align-middle ${checkBg}" ${checkDisabled}>`
						for (const optionValue of objectData[elementName]) {
							returnElement += `<option value="${optionValue}" ${checkChecked(optionValue)}>${optionValue}</option>`
						}
					returnElement += `
					</select>
				</div>`;
			}
			return returnElement;
		}

		for (const [objKey, object] of Object.entries(this.objectDataTypes)) {
			if(fileKey == object.name) {
				return elementCreator(object, fileKey, fileValue)
			}
		}
		return '';
	}

	loadElementsData(textures) {
		if (typeof this.selectedElementData != 'undefined' && this.selectedElementData != null
			&& typeof this.selectedElementData.player != 'undefined') return;

		let data = {}
		if (typeof textures !='undefined' || typeof textures != null) data.textures = textures
		$(`#selected-container`).find("input, select").each(function() {
			let name = $(this).attr('name')
			let value = $(this).val()
			let inputType = $(this).attr('input-type')
			
			// appropiate value format
			if (inputType == 'number') value = parseInt(value)
			else if (inputType == 'text') value = String(value)
			else if (inputType == 'boolean') if (value == 'true') value = true; else value = false;
			else if (inputType == 'array') value = toArray(value)
			
			data[name] = value
		});

		if (data.id) data.id = parseInt(data.id)
		
		this.selectedElementData = data
	}

	async mapMusic(clone) {
		$(".tools-container").append("<div id='music-container' class='row tools-title m-3'><h5>MAP MUSIC</h5><div class='music-selector'></div></div>")

		this.musicList.forEach((musicName, index) => {
			let checked = (musicName == clone.musicName) ? 'checked' : '';		
			let element = 
			`<div class="form-check text-start">
				<input id="musicselector_${index}" class="form-check-input" name="musicselector" type="radio" value="${musicName}" ${checked}>
				<label class="form-check-label">${musicName}</label>
			</div>`;
			$(".music-selector").append(element)
		});
	}

	async loadTextures() {
		var clone = this

		const loadData = await fetch("./data/objectdatatypes.JSON")
        this.objectDataTypes = await loadData.json()

		// Action function
		async function loadAction(name) {
			let connectFile = await fetch(`./data/${name}/${name}.JSON`)
			let fileData = await connectFile.json()		

			function checkPicType(fileName) {				
				if (fileName.includes('wall') || fileName.includes('door')) return '-wall';
				if (fileName.includes('sky')) return '-sky';
				if (fileName.includes('ceiling')) return '-ceiling';
				if (fileName.includes('floor')) return '-floor';
				if (fileName.includes('block')) return '-block';
				if (fileName.includes('object')) return '-object';
				if (fileName.includes('creature')) return '-creature';

				return '-' + fileName;
			}

			let elements = `
			<div class="tools-title p-0 m-0">
				<h5 class="p-0 m-0 mt-1 mb-2">${name.toUpperCase()}</h5>
			</div>
			<div class="p-0 px-1 m-0">
				<div class="textures-pic-container textures-pic-container_${name} p-0 m-0 mt-2">`;
					fileData.forEach((textureArray, index) => {
						if (textureArray.id != 250) {
							for(const[key, value] of Object.entries(textureArray.textures)) {	
								if (key == 'color') return;
								elements += `<img src="./img/${name}/${key}/${value[0]}.png" alt="${value[0]}" class="list-pic${checkPicType(value[0])} p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}" data-index="${index}" data-filename="${value[0]}" id="selected-${name}_${index}">`;
							}
						}
					});
				elements+= `</div>
			</div>`;
			$("#textures-list").append(elements)

			return fileData;
		}
		// Load Menu Elements
		this.loadMenuPlayer('Player orientation', 'player', false)
		
		// Load textures
		this.walls = await loadAction('walls')
		this.blocks = await loadAction('blocks')
		this.objects = await loadAction('objects')
		this.creatures = await loadAction('creatures')

		let effectsFile = await fetch(`./data/effects/effects.JSON`)
		clone.effects = await effectsFile.json()
		this.loadMenuPlayer('Creatures walking direction', 'direction', true)

		this.skys = await loadAction('skys')
		this.floors = await loadAction('floors')

		clone.clickTexture(clone)
	}

	loadMenuPlayer(title, name, exitOn) {
		let angles = (exitOn) ? [0, 90, 180, 270, 'exit'] : [0, 90, 180, 270];
		let newElement = `
		<div class="tools-title p-0 m-0">
			<h5 class="p-0 m-0 mt-1 mb-2 text-uppercase">${title}</h5>
		</div>
		<div class="p-0 px-1 m-0">
			<div class="textures-pic-container textures-pic-container_${name} p-0 m-0 mt-2">`
			angles.forEach(angle => {
				newElement += `
				<img src="./img/editor/${name}-${angle}.png" alt="${name}-${angle}" data-angle="${angle}" data-${name}="true" class="list-pic-${name} p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}-${angle}" data-filename="${name}-${angle}.png" id="selected-${name}">`;
			});
			newElement += `
			</div>
		</div>`;
		$("#textures-list").append(newElement);
	}

	clickTexture(clone) {
		// CLICK SELECTING TEXTURES
		var clone = this
		$("[id^='selected-']").on('click', function() {
			const elementName = $(this).attr('data-name')
			const elementFileName = $(this).attr('data-filename')
			const elementIndex = $(this).attr('data-index')

			clone.objectName = elementName

			// SKYS
			if(elementName == 'skys' || elementName == 'floors') {
				$(`.textures-pic-container_${elementName}`).find('img').addClass('border-0')
				$(this).removeClass('border-0').addClass('border-2')
				if (!clone.levelData[elementName]) clone.levelData[elementName]
				clone.levelData[elementName] = []
				clone.levelData[elementName].push(clone[elementName][elementIndex])
				return;
			}

			// Effects
			if (elementName.includes('direction-')) {				
				if (elementName.includes('-0')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2000'));
				else if (elementName.includes('-90')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2005'));
				else if (elementName.includes('-180')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2010'));
				else if (elementName.includes('-270')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2015'));
				else if (elementName.includes('-exit')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2020'));				
				clone.selectedElementData = clone.selectedElementData[0]
				return;
			}

			// PLAYER ORIENTATION
			if ($(this).attr('data-player') == 'true') {
				let playerAngle = $(this).attr('data-angle')
				clone.selectedElementData = {
					'player': true,
					'playerAngle': playerAngle
				}
				return;
			}

			// WALLS, OBJECTS
			$("[id^='selected-']").each(function() { $(this).addClass('border-0'); })
			$(this).removeClass('border-0').addClass('border-2');

			let fileData = []

			if (elementName == 'walls') fileData = clone.walls;
			if (elementName == 'objects') fileData = clone.objects;
			if (elementName == 'blocks') fileData = clone.blocks;
			if (elementName == 'creatures') fileData = clone.creatures;
			
			var selectedElements = `
			<div id="selected-container" class="p-0 m-0 px-1">
				<div class="p-2 m-0 texture-class_ border border-secondary">
					<span class="text-white text-start"><strong>Name: </strong>`;

					Object.values(fileData[elementIndex].textures)[0].forEach(name => {
						selectedElements += `<span>${name}, </span>`;
					});

					selectedElements += `</span>
					<hr class="p-0 my-2 border-white">
					<div class="textures-pic-container">
						<div id="" class="textures-pic">`;
						for(const[key, value] of Object.entries(fileData[elementIndex].textures)) {
							value.forEach(textureName => {
								selectedElements +=	`<img src="./img/${elementName}/${key}/${textureName}.png" alt="${textureName}" class="list-pic p-0 m-0 me-2 mb-2" data-name="${textureName}" data-index="${elementIndex}" data-key="${key}" data-texturename="${textureName}">`;
							});
						}
						selectedElements += `</div>
					</div>`;

					selectedElements += `
					<div class="texture-data text-white">
						<div class="row data-line p-0 m-0">`;
							for(const [fileKey, fileValue] of Object.entries(fileData[elementIndex])) {
								let loadInput = clone.loadInput(fileKey, fileValue, elementName)
								selectedElements += loadInput
							}
							selectedElements += `
						</div>
					</div>
				</div>
			</div>`;

			$(`#textures-selected`).html('')
			$(`#textures-selected`).append(selectedElements)
			clone.selectedElementsBorderDraw(clone)		
			clone.loadElementsData(fileData[elementIndex].textures)
		});
	}

	selectedElementsBorderDraw(clone) {
		if (typeof clone.levelData.skys != 'undefined') {
			let names = clone.getObjectNames(clone.levelData.skys)			
			$(`img[src*='${names.textureDir}/${names.textureName}']`).removeClass('border-0').addClass('border-2')
		}
		
		if (typeof clone.levelData.floors != 'undefined') {
			let names = clone.getObjectNames(clone.levelData.floors)			
			$(`img[src*='${names.textureDir}/${names.textureName}']`).removeClass('border-0').addClass('border-2')
		}
	}
}

import MapDataClass from './mapdata-class.js';
import SoundClass from './sound-class.js';

const mapdataClass = new MapDataClass({texturesClass: null})
const soundClass = new SoundClass({menu: null, getUserInteraction: false})
let mapList = mapdataClass.maps
let musicList = soundClass.musicList

const editor = new Editor(mapList, musicList)
