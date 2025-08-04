// ZARGATES GAME - BASIC VERSION
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameState = {
    currentScreen: 'splash',
    selectedCharacter: null,
    score: 0,
    health: 100,
    hits: 0,
    abilityReady: false,
    abilityActive: false,
    abilityTimer: 0,
    currentLocation: 0,
    gameOver: false,
    transitioning: false
};

// Toxin attack animation variables
let toxinAttackAnimation = {
    active: false,
    timer: 0,
    blinkTimer: 0,
    visible: false
};

// Origami attack animation variables
let origamiAttackAnimation = {
    active: false,
    timer: 0,
    blinkTimer: 0,
    visible: false,
    burstCount: 0,
    burstTimer: 0,
    burstDelay: 10, // 0.167 seconds between shots
    maxBurstShots: 3
};

// Chameleon attack animation variables
let chameleonAttackAnimation = {
    active: false,
    timer: 0,
    blinkTimer: 0,
    visible: false,
    burstCount: 0,
    burstTimer: 0,
    burstDelay: 3, // 0.05 seconds between shots (very fast)
    maxBurstShots: 10 // More shots per burst
};

// Toxin special ability variables
let toxinSpecialAbility = {
    active: false,
    timer: 0,
    duration: 600 // 10 seconds at 60fps
};

// Sound variables
let machineGunSound = null;
let isMachineGunPlaying = false;

// Player
let player = {
    x: 100,
    y: 400,
    width: 32,
    height: 48,
    velocityX: 0,
    velocityY: 0,
    speed: 10,
    onGround: false,
    character: null,
    direction: 1,
    attacking: false,
    attackCooldown: 0,
    health: 100
};

// Characters
const characters = {
    origami: {
        name: 'Origami',
        color: '#ff6b6b',
        attackRange: 80,
        attackDamage: 25,
        specialAbility: 'dash',
        specialDescription: 'Dash forward with triple damage'
    },
    toxin: {
        name: 'Toxin',
        color: '#4ecdc4',
        attackRange: 200,
        attackDamage: 15,
        specialAbility: 'combo',
        specialDescription: '10 seconds of invincibility'
    },
    chameleon: {
        name: 'Chameleon',
        color: '#45b7d1',
        attackRange: 120,
        attackDamage: 20,
        specialAbility: 'instantKill',
        specialDescription: 'Instant kill with full health'
    },
    troub: {
        name: 'Troub',
        color: '#96ceb4',
        attackRange: 300,
        attackDamage: 18,
        specialAbility: 'convert',
        specialDescription: 'Convert 2 enemies to allies'
    }
};

// Background images
const backgroundImages = {
    home: null,
    forest: null,
    street: null,
    castle: null,
    island: null,
    portal: null,
    hyperspace: null
};

// Character sprites
const characterSprites = {
    origami: null
};

// Enemy sprites
const enemySprites = {
    fireEnemy: null
};

// Arrow sprite for Troub
let arrowSprite = null;

// Friendly enemies array
let friendlyEnemies = [];

// Blue sphere projectiles for friendly enemies
let blueSphereProjectiles = [];

// Portal sprite
const portalSprite = new Image();
portalSprite.crossOrigin = 'anonymous';
portalSprite.onload = function() {
    console.log('✅ Portal sprite loaded!');
};
portalSprite.onerror = function() {
    console.error('❌ Failed to load portal sprite!');
};
portalSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiamlxiktldu5biljkebu2xvrkaolbsvasmspsesvhscg44n5h6rae';

// Load forest background
function loadForestBackground() {
    backgroundImages.forest = new Image();
    backgroundImages.forest.crossOrigin = 'anonymous';
    backgroundImages.forest.onload = function() {
        console.log('✅ Forest background loaded successfully!');
    };
    backgroundImages.forest.onerror = function() {
        console.error('❌ Failed to load forest background!');
    };
    backgroundImages.forest.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load street background
function loadStreetBackground() {
    backgroundImages.street = new Image();
    backgroundImages.street.crossOrigin = 'anonymous';
    backgroundImages.street.onload = function() {
        console.log('✅ Street background loaded successfully!');
    };
    backgroundImages.street.onerror = function() {
        console.error('❌ Failed to load street background!');
    };
    backgroundImages.street.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load home background
function loadHomeBackground() {
    backgroundImages.home = new Image();
    backgroundImages.home.crossOrigin = 'anonymous';
    backgroundImages.home.onload = function() {
        console.log('✅ Home background loaded successfully!');
    };
    backgroundImages.home.onerror = function() {
        console.error('❌ Failed to load home background!');
    };
    backgroundImages.home.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load castle background
function loadCastleBackground() {
    backgroundImages.castle = new Image();
    backgroundImages.castle.crossOrigin = 'anonymous';
    backgroundImages.castle.onload = function() {
        console.log('✅ Castle background loaded successfully!');
    };
    backgroundImages.castle.onerror = function() {
        console.error('❌ Failed to load castle background!');
    };
    backgroundImages.castle.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load island background
function loadIslandBackground() {
    backgroundImages.island = new Image();
    backgroundImages.island.crossOrigin = 'anonymous';
    backgroundImages.island.onload = function() {
        console.log('✅ Island background loaded successfully!');
    };
    backgroundImages.island.onerror = function() {
        console.error('❌ Failed to load island background!');
    };
    backgroundImages.island.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load portal background
function loadPortalBackground() {
    backgroundImages.portal = new Image();
    backgroundImages.portal.crossOrigin = 'anonymous';
    backgroundImages.portal.onload = function() {
        console.log('✅ Portal background loaded successfully!');
    };
    backgroundImages.portal.onerror = function() {
        console.error('❌ Failed to load portal background!');
    };
    backgroundImages.portal.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load hyperspace background
function loadHyperspaceBackground() {
    backgroundImages.hyperspace = new Image();
    backgroundImages.hyperspace.crossOrigin = 'anonymous';
    backgroundImages.hyperspace.onload = function() {
        console.log('✅ Hyperspace background loaded successfully!');
    };
    backgroundImages.hyperspace.onerror = function() {
        console.error('❌ Failed to load hyperspace background!');
    };
    backgroundImages.hyperspace.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load industrial tiles for hyperspace location
let industrialTilesSprite = null;
function loadIndustrialTiles() {
    industrialTilesSprite = new Image();
    industrialTilesSprite.crossOrigin = 'anonymous';
    industrialTilesSprite.onload = function() {
        console.log('✅ Industrial tiles loaded successfully!');
        console.log('📏 Sprite dimensions:', industrialTilesSprite.width, 'x', industrialTilesSprite.height);
        console.log('🎯 Total tiles:', Math.floor(industrialTilesSprite.width / 32), 'x', Math.floor(industrialTilesSprite.height / 32));
    };
    industrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load industrial tiles!');
    };
    industrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/1e66bbb00de7f27e115296865195a2340a090165/industrial_tiles.png.png';
}

// Load new industrial tileset
let newIndustrialTilesSprite = null;
function loadNewIndustrialTiles() {
    newIndustrialTilesSprite = new Image();
    newIndustrialTilesSprite.crossOrigin = 'anonymous';
    newIndustrialTilesSprite.onload = function() {
        console.log('✅ New Industrial tileset loaded successfully!');
        console.log('📏 New Sprite dimensions:', newIndustrialTilesSprite.width, 'x', newIndustrialTilesSprite.height);
        console.log('🎯 New Total tiles:', Math.floor(newIndustrialTilesSprite.width / 32), 'x', Math.floor(newIndustrialTilesSprite.height / 32));
    };
    newIndustrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load new industrial tileset!');
    };
    newIndustrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/3d203a14819f1bb63998cc95f7c5125c7f530a7b/1_Industrial_Tileset_1.png';
}

// Load third industrial tileset
let thirdIndustrialTilesSprite = null;
function loadThirdIndustrialTiles() {
    thirdIndustrialTilesSprite = new Image();
    thirdIndustrialTilesSprite.crossOrigin = 'anonymous';
    thirdIndustrialTilesSprite.onload = function() {
        console.log('✅ Third Industrial tileset loaded successfully!');
        console.log('📏 Third Sprite dimensions:', thirdIndustrialTilesSprite.width, 'x', thirdIndustrialTilesSprite.height);
        console.log('🎯 Third Total tiles:', Math.floor(thirdIndustrialTilesSprite.width / 32), 'x', Math.floor(thirdIndustrialTilesSprite.height / 32));
        
        // Show all available sprites in console
        const tilesX = Math.floor(thirdIndustrialTilesSprite.width / 32);
        const tilesY = Math.floor(thirdIndustrialTilesSprite.height / 32);
        console.log('🔍 Available sprites in T pack:');
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                console.log(`Sprite ${x}.${y} (column ${x}, row ${y})`);
            }
        }
    };
    thirdIndustrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load third industrial tileset!');
    };
    thirdIndustrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/40f3ac58a8081c4cb2a8505384bd4768586a425d/industrial_tiles.png.png';
}

// Load fourth industrial tileset (U pack)
let fourthIndustrialTilesSprite = null;

// Load splash screen background image
let splashBackgroundImage = null;

// Load character selection background image
let characterSelectionBackgroundImage = null;

// Load start button image
let startButtonImage = null;

// Load ZARGATES logo image
let zargatesLogoImage = null;

// Load Origami character image
let origamiCharacterImage = null;

// Load Troub character image
let troubCharacterImage = null;

// Load Toxin character image
let toxinCharacterImage = null;

// Load Chameleon character image
let chameleonCharacterImage = null;
function loadFourthIndustrialTiles() {
    fourthIndustrialTilesSprite = new Image();
    fourthIndustrialTilesSprite.crossOrigin = 'anonymous';
    fourthIndustrialTilesSprite.onload = function() {
        console.log('✅ Fourth Industrial tileset (U) loaded successfully!');
        console.log('📏 Fourth Sprite dimensions:', fourthIndustrialTilesSprite.width, 'x', fourthIndustrialTilesSprite.height);
        console.log('🎯 Fourth Total tiles:', Math.floor(fourthIndustrialTilesSprite.width / 32), 'x', Math.floor(fourthIndustrialTilesSprite.height / 32));
        
        // Show all available sprites in console
        const tilesX = Math.floor(fourthIndustrialTilesSprite.width / 32);
        const tilesY = Math.floor(fourthIndustrialTilesSprite.height / 32);
        console.log('🔍 Available sprites in U pack:');
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                console.log(`Sprite ${x}.${y} (column ${x}, row ${y})`);
            }
        }
        console.log('🎮 U pack ready for use!');
    };
    fourthIndustrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load fourth industrial tileset (U)!');
        console.error('🔗 URL:', fourthIndustrialTilesSprite.src);
    };
    fourthIndustrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/40f3ac58a8081c4cb2a8505384bd4768586a425d/1_Industrial_Tileset_1C.png';
}

// Load splash screen background image
function loadSplashBackground() {
    splashBackgroundImage = new Image();
    splashBackgroundImage.crossOrigin = 'anonymous';
    splashBackgroundImage.onload = function() {
        console.log('✅ Splash background image loaded successfully!');
        console.log('📏 Splash background dimensions:', splashBackgroundImage.width, 'x', splashBackgroundImage.height);
    };
    splashBackgroundImage.onerror = function() {
        console.error('❌ Failed to load splash background image!');
        console.error('🔗 URL:', splashBackgroundImage.src);
    };
    splashBackgroundImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiecu6i7wsyinswlrcwq7wqgkv2wtgbftvkkxur37xly6lzkk5vioi';
}

// Load character selection background image
function loadCharacterSelectionBackground() {
    characterSelectionBackgroundImage = new Image();
    characterSelectionBackgroundImage.crossOrigin = 'anonymous';
    characterSelectionBackgroundImage.onload = function() {
        console.log('✅ Character selection background image loaded successfully!');
        console.log('📏 Character selection background dimensions:', characterSelectionBackgroundImage.width, 'x', characterSelectionBackgroundImage.height);
    };
    characterSelectionBackgroundImage.onerror = function() {
        console.error('❌ Failed to load character selection background image!');
        console.error('🔗 URL:', characterSelectionBackgroundImage.src);
    };
    characterSelectionBackgroundImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load start button image
function loadStartButton() {
    startButtonImage = new Image();
    startButtonImage.crossOrigin = 'anonymous';
    startButtonImage.onload = function() {
        console.log('✅ Start button image loaded successfully!');
        console.log('📏 Start button dimensions:', startButtonImage.width, 'x', startButtonImage.height);
    };
    startButtonImage.onerror = function() {
        console.error('❌ Failed to load start button image!');
        console.error('🔗 URL:', startButtonImage.src);
    };
    startButtonImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiefgxgxrkgczne52lepzd6ikpdwjtmpere426turuf5p6gqjw3bhi';
}

// Load ZARGATES logo image
function loadZargatesLogo() {
    zargatesLogoImage = new Image();
    zargatesLogoImage.crossOrigin = 'anonymous';
    zargatesLogoImage.onload = function() {
        console.log('✅ ZARGATES logo image loaded successfully!');
        console.log('📏 ZARGATES logo dimensions:', zargatesLogoImage.width, 'x', zargatesLogoImage.height);
    };
    zargatesLogoImage.onerror = function() {
        console.error('❌ Failed to load ZARGATES logo image!');
        console.error('🔗 URL:', zargatesLogoImage.src);
    };
    zargatesLogoImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeieyqvrg4cpzvj66z2fkbvhiipdn45ezsaojjoueke6kmaqt5r6s3q';
}

// Load Origami character image
function loadOrigamiCharacter() {
    origamiCharacterImage = new Image();
    origamiCharacterImage.crossOrigin = 'anonymous';
    origamiCharacterImage.onload = function() {
        console.log('✅ Origami character image loaded successfully!');
        console.log('📏 Origami character dimensions:', origamiCharacterImage.width, 'x', origamiCharacterImage.height);
    };
    origamiCharacterImage.onerror = function() {
        console.error('❌ Failed to load Origami character image!');
        console.error('🔗 URL:', origamiCharacterImage.src);
    };
    origamiCharacterImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeiexcznwao3bk66lwdpupmvgnlbqwfc6j2qqegwfwyo74ownrjwvey';
}

// Load Troub character image
function loadTroubCharacter() {
    troubCharacterImage = new Image();
    troubCharacterImage.crossOrigin = 'anonymous';
    troubCharacterImage.onload = function() {
        console.log('✅ Troub character image loaded successfully!');
        console.log('📏 Troub character dimensions:', troubCharacterImage.width, 'x', troubCharacterImage.height);
    };
    troubCharacterImage.onerror = function() {
        console.error('❌ Failed to load Troub character image!');
        console.error('🔗 URL:', troubCharacterImage.src);
    };
    troubCharacterImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeigynqkchgip6vipkibbyugdzuoo66reyngffuwmy4gjai3ksomijm';
}

// Load Toxin character image
function loadToxinCharacter() {
    toxinCharacterImage = new Image();
    toxinCharacterImage.crossOrigin = 'anonymous';
    toxinCharacterImage.onload = function() {
        console.log('✅ Toxin character image loaded successfully!');
        console.log('📏 Toxin character dimensions:', toxinCharacterImage.width, 'x', toxinCharacterImage.height);
    };
    toxinCharacterImage.onerror = function() {
        console.error('❌ Failed to load Toxin character image!');
        console.error('🔗 URL:', toxinCharacterImage.src);
    };
    toxinCharacterImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeid6cbdavearktbmsw7i3k6fdr3gxcknhhe4rseafxwlvkz35caep4';
}

// Load Chameleon character image
function loadChameleonCharacter() {
    chameleonCharacterImage = new Image();
    chameleonCharacterImage.crossOrigin = 'anonymous';
    chameleonCharacterImage.onload = function() {
        console.log('✅ Chameleon character image loaded successfully!');
        console.log('📏 Chameleon character dimensions:', chameleonCharacterImage.width, 'x', chameleonCharacterImage.height);
    };
    chameleonCharacterImage.onerror = function() {
        console.error('❌ Failed to load Chameleon character image!');
        console.error('🔗 URL:', chameleonCharacterImage.src);
    };
    chameleonCharacterImage.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeigssfz7ksllby2cerjfhsc5cvm3eodlnau6yjwmajn2tsukx4e7jm';
}

// Function to draw grid overlay on all locations
function drawGridOverlay(screenX) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.font = '8px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    // Draw vertical grid lines
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const smallLetters = 'abcdefghijklmnopqrstuvwxyz';
    for (let x = 0; x < LOCATION_WIDTH; x += 32) {
        const screenGridX = screenX + x;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.beginPath();
            ctx.moveTo(screenGridX, 0);
            ctx.lineTo(screenGridX, canvas.height);
            ctx.stroke();
        }
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(screenX, y);
        ctx.lineTo(screenX + LOCATION_WIDTH, y);
        ctx.stroke();
    }
    
    // Draw coordinates for each cell
    for (let y = 0; y < canvas.height; y += 32) {
        for (let x = 0; x < LOCATION_WIDTH; x += 32) {
            const screenGridX = screenX + x;
            if (screenGridX >= 0 && screenGridX <= canvas.width) {
                const letterIndex = Math.floor(x / 32);
                const number = Math.floor(y / 32);
                
                let coordinate;
                if (letterIndex < letters.length) {
                    coordinate = letters[letterIndex] + number;
                } else if (letterIndex < letters.length + smallLetters.length) {
                    const smallLetterIndex = letterIndex - letters.length;
                    coordinate = smallLetters[smallLetterIndex] + number;
                }
                
                if (coordinate) {
                    ctx.fillText(coordinate, screenGridX + 16, y + 20);
                }
            }
        }
    }
}

// Function to draw sprite 1.1 from first pack on A0-A18 coordinates
function drawSprite1_1OnA0A18(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // Sprite 1.1 = column 1, row 1
    const spriteY = 1;
    
    // Draw sprite 1.1 on A0-A18 coordinates (first column, all rows)
    for (let y = 0; y < 19; y++) { // A0 to A18 = 19 tiles
        const screenY = y * tileSize;
        const screenGridX = screenX + 0; // A column = x = 0
        
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to show all tiles from sprite sheet
function drawAllTiles() {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const tilesX = Math.floor(industrialTilesSprite.width / tileSize);
    const tilesY = Math.floor(industrialTilesSprite.height / tileSize);
    
    console.log('🎮 Drawing all tiles:', tilesX, 'x', tilesY);
    
    // Calculate center position
    const totalWidth = tilesX * (tileSize + 10);
    const totalHeight = tilesY * (tileSize + 10);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Industrial Tiles Sprite Sheet', canvas.width / 2, 50);
    
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const screenX = startX + x * (tileSize + 10);
            const screenY = startY + y * (tileSize + 10);
            
            ctx.drawImage(
                industrialTilesSprite,
                x * tileSize, y * tileSize, tileSize, tileSize,
                screenX, screenY, tileSize, tileSize
            );
            
            // Draw tile coordinates
            ctx.fillStyle = 'red';
            ctx.font = '10px Arial';
            ctx.fillText(`${x},${y}`, screenX, screenY + tileSize + 10);
        }
    }
    
    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Press any key to close', canvas.width / 2, canvas.height - 30);
}

// Function to show new industrial tileset
function drawNewIndustrialTiles() {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const tilesX = Math.floor(newIndustrialTilesSprite.width / tileSize);
    const tilesY = Math.floor(newIndustrialTilesSprite.height / tileSize);
    
    console.log('🎮 Drawing new industrial tiles:', tilesX, 'x', tilesY);
    
    // Calculate center position
    const totalWidth = tilesX * (tileSize + 10);
    const totalHeight = tilesY * (tileSize + 10);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('New Industrial Tileset 1', canvas.width / 2, 50);
    
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const screenX = startX + x * (tileSize + 10);
            const screenY = startY + y * (tileSize + 10);
            
            ctx.drawImage(
                newIndustrialTilesSprite,
                x * tileSize, y * tileSize, tileSize, tileSize,
                screenX, screenY, tileSize, tileSize
            );
            
            // Draw tile coordinates
            ctx.fillStyle = 'red';
            ctx.font = '10px Arial';
            ctx.fillText(`${x},${y}`, screenX, screenY + tileSize + 10);
        }
    }
    
    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Press any key to close', canvas.width / 2, canvas.height - 30);
}

// Function to show third industrial tileset
function drawThirdIndustrialTiles() {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const tilesX = Math.floor(thirdIndustrialTilesSprite.width / tileSize);
    const tilesY = Math.floor(thirdIndustrialTilesSprite.height / tileSize);
    
    console.log('🎮 Drawing third industrial tiles:', tilesX, 'x', tilesY);
    
    // Calculate center position
    const totalWidth = tilesX * (tileSize + 10);
    const totalHeight = tilesY * (tileSize + 10);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Third Industrial Tileset 1C', canvas.width / 2, 50);
    
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const screenX = startX + x * (tileSize + 10);
            const screenY = startY + y * (tileSize + 10);
            
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                x * tileSize, y * tileSize, tileSize, tileSize,
                screenX, screenY, tileSize, tileSize
            );
            
            // Draw tile coordinates
            ctx.fillStyle = 'red';
            ctx.font = '10px Arial';
            ctx.fillText(`${x},${y}`, screenX, screenY + tileSize + 10);
        }
    }
    
    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Press any key to close', canvas.width / 2, canvas.height - 30);
}

// Function to show fourth industrial tileset (U pack)
function drawFourthIndustrialTiles() {
    if (!fourthIndustrialTilesSprite || !fourthIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const tilesX = Math.floor(fourthIndustrialTilesSprite.width / tileSize);
    const tilesY = Math.floor(fourthIndustrialTilesSprite.height / tileSize);
    
    console.log('🎮 Drawing fourth industrial tileset sprites (U pack):', tilesX, 'x', tilesY);
    
    // Calculate center position
    const totalWidth = tilesX * (tileSize + 10);
    const totalHeight = tilesY * (tileSize + 10);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fourth Industrial Tileset (U Pack) - All Sprites', canvas.width / 2, 50);
    
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const screenX = startX + x * (tileSize + 10);
            const screenY = startY + y * (tileSize + 10);
            
            ctx.drawImage(
                fourthIndustrialTilesSprite,
                x * tileSize, y * tileSize, tileSize, tileSize,
                screenX, screenY, tileSize, tileSize
            );
            
            // Draw tile coordinates
            ctx.fillStyle = 'red';
            ctx.font = '10px Arial';
            ctx.fillText(`${x},${y}`, screenX, screenY + tileSize + 10);
        }
    }
    
    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Press any key to close', canvas.width / 2, canvas.height - 30);
}

// Load Origami sprite
function loadOrigamiSprite() {
    characterSprites.origami = new Image();
    characterSprites.origami.crossOrigin = 'anonymous';
    characterSprites.origami.onload = function() {
        console.log('✅ Origami sprite loaded successfully!');
    };
    characterSprites.origami.onerror = function() {
        console.error('❌ Failed to load Origami sprite!');
    };
         characterSprites.origami.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeibmpq5fjwhweyuoxr3ki7wj5ss4usv4x7nplbai7xc4m5ylzjlpiq';
    
    // Load Toxin sprite
    characterSprites.toxin = new Image();
    characterSprites.toxin.crossOrigin = 'anonymous';
    characterSprites.toxin.onload = function() {
        console.log('✅ Toxin sprite loaded successfully!');
    };
    characterSprites.toxin.onerror = function() {
        console.error('❌ Failed to load Toxin sprite!');
    };
    characterSprites.toxin.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeifb3pet4ecuz3okn4qodvkppz5ts46frbxaipiyo6cuw26kfh7zwi';
    
    // Load Chameleon sprite
    characterSprites.chameleon = new Image();
    characterSprites.chameleon.crossOrigin = 'anonymous';
    characterSprites.chameleon.onload = function() {
        console.log('✅ Chameleon sprite loaded successfully!');
    };
    characterSprites.chameleon.onerror = function() {
        console.error('❌ Failed to load Chameleon sprite!');
    };
    characterSprites.chameleon.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeibbkig57q2ud53qacnbbybnnjhgsoljhgkzz765ggwj3eosrca3eu';
    
    // Load Troub sprite
    characterSprites.troub = new Image();
    characterSprites.troub.crossOrigin = 'anonymous';
    characterSprites.troub.onload = function() {
        console.log('✅ Troub sprite loaded successfully!');
    };
    characterSprites.troub.onerror = function() {
        console.error('❌ Failed to load Troub sprite!');
    };
    characterSprites.troub.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeifkdtew3jfvjqc7otpsjt5jdywe7ouem43yyird7hhkchsbbiw57q';
     

}

// Load fire enemy sprite
function loadFireEnemySprite() {
    enemySprites.fireEnemy = new Image();
    enemySprites.fireEnemy.crossOrigin = 'anonymous';
    enemySprites.fireEnemy.onload = function() {
        console.log('✅ Fire enemy sprite loaded successfully!');
    };
    enemySprites.fireEnemy.onerror = function() {
        console.error('❌ Failed to load fire enemy sprite!');
    };
    enemySprites.fireEnemy.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeidrxvgd47fxr4x275tgj2q6lxboovbobd6hjejrdedolrr444gzpa';
}

// Load arrow sprite for Troub
function loadArrowSprite() {
    arrowSprite = new Image();
    arrowSprite.crossOrigin = 'anonymous';
    arrowSprite.onload = function() {
        console.log('✅ Arrow sprite loaded successfully!');
    };
    arrowSprite.onerror = function() {
        console.error('❌ Failed to load Arrow sprite!');
    };
    arrowSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreibrxc3vvsn6wnjwx2dzwi7rtlr42p53253ve6ad45i4c54lafc7s4';
}

// Load Toxin attack animation sprite
let toxinAttackSprite = null;
function loadToxinAttackSprite() {
    console.log('🔄 Starting to load Toxin attack sprite...');
    toxinAttackSprite = new Image();
    toxinAttackSprite.crossOrigin = 'anonymous';
    toxinAttackSprite.onload = function() {
        console.log('✅ Toxin attack sprite loaded successfully!');
        console.log('Sprite dimensions:', toxinAttackSprite.width, 'x', toxinAttackSprite.height);
        console.log('Sprite complete status:', toxinAttackSprite.complete);
    };
    toxinAttackSprite.onerror = function() {
        console.error('❌ Failed to load Toxin attack sprite!');
        console.error('Error details:', toxinAttackSprite.src);
    };
    toxinAttackSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreidqafobnux4uyqp3yhi7j5qpa74krpwvqy7jkkz6kvrupevhlx7lu';
    console.log('🔄 Loading Toxin attack sprite from:', toxinAttackSprite.src);
    console.log('🔄 Initial complete status:', toxinAttackSprite.complete);
}

// Load Origami attack sprite
let origamiAttackSprite = null;
function loadOrigamiAttackSprite() {
    console.log('🔄 Starting to load Origami attack sprite...');
    origamiAttackSprite = new Image();
    origamiAttackSprite.crossOrigin = 'anonymous';
    origamiAttackSprite.onload = function() {
        console.log('✅ Origami attack sprite loaded successfully!');
        console.log('Sprite dimensions:', origamiAttackSprite.width, 'x', origamiAttackSprite.height);
        console.log('Sprite complete status:', origamiAttackSprite.complete);
    };
    origamiAttackSprite.onerror = function() {
        console.error('❌ Failed to load Origami attack sprite!');
        console.error('Error details:', origamiAttackSprite.src);
    };
    origamiAttackSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreibriqoyyftazbdlcvlaoa7xw6owxe7ppvr2qb7ge5nq3jo44nukqu';
    console.log('🔄 Loading Origami attack sprite from:', origamiAttackSprite.src);
    console.log('🔄 Initial complete status:', origamiAttackSprite.complete);
}

// Load Toxin bullet sprite
let toxinBulletSprite = null;
function loadToxinBulletSprite() {
    toxinBulletSprite = new Image();
    toxinBulletSprite.crossOrigin = 'anonymous';
    toxinBulletSprite.onload = function() {
        console.log('✅ Toxin bullet sprite loaded successfully!');
    };
    toxinBulletSprite.onerror = function() {
        console.error('❌ Failed to load Toxin bullet sprite!');
    };
    toxinBulletSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiccmzsystm4q3sxxkieul3mvsxq7bgr4e27o6qapxyvh4cocw7aze';
}

function loadMachineGunSound() {
    machineGunSound = new Audio();
    
    // Загружаем твой звук выстрела
    machineGunSound.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreig2td5p4mjp5jje6fop6cz7xgxln2zzbfhk77aeylrqadeuoumnl4';
    
    machineGunSound.volume = 0.7;
    machineGunSound.preload = 'auto';
    machineGunSound.loop = true; // Зацикливаем звук
    
    // Добавляем обработчики
    machineGunSound.addEventListener('canplaythrough', function() {
        console.log('✅ Звук автомата загружен успешно!');
    });
    
    machineGunSound.addEventListener('error', function(e) {
        console.log('❌ Ошибка загрузки звука:', e);
        createBeepSound(); // Fallback если не загрузился
    });
    
    // Загружаем звук
    machineGunSound.load();
}

function createBeepSound() {
    console.log('🔄 Creating fallback beep sound...');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    console.log('🔊 Fallback beep sound created!');
}

// Enemy class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type;
        this.health = 30;
        this.attackCooldown = 0;
        this.attackRange = 200;
        this.damage = 5;
        this.speed = 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = 0;
        this.aimAtPlayer = false;
        this.friendly = false;
        this.glowTimer = 0;
    }
    
    update(player) {
        // Change direction randomly
        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > 120) { // Every 2 seconds
            this.changeDirectionTimer = 0;
            this.aimAtPlayer = Math.random() < 0.3; // 30% chance to aim at player
            
            if (this.aimAtPlayer) {
                // Aim at player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.velocityX = (dx / distance) * this.speed;
                    this.velocityY = (dy / distance) * this.speed;
                }
            } else {
                // Random movement
                this.targetX = 1200 + Math.random() * 800; // Forest area
                this.targetY = 100 + Math.random() * 300;
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.velocityX = (dx / distance) * this.speed;
                    this.velocityY = (dy / distance) * this.speed;
                }
            }
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
            // Keep within current location bounds
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
    if (this.x < locationStart + 50) this.x = locationStart + 50;
    if (this.x > locationEnd - 50) this.x = locationEnd - 50;
    if (this.y < 50) this.y = 50;
    if (this.y > 400) this.y = 400;
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    attack(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attackRange && this.attackCooldown === 0) {
            this.attackCooldown = 90; // 1.5 seconds at 60fps
            
            // Calculate direction to player for projectile
            const direction = dx > 0 ? 1 : -1;
            return { damage: this.damage, direction: direction };
        }
        return { damage: 0, direction: 1 };
    }
}

// Fire projectile class
class FireProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 5;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class ArrowProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 40; // Increased from 20
        this.height = 16; // Increased from 8
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 18;
        this.speed = 8; // Moderate speed for interesting gameplay
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class BlueSphereProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 8;
        this.speed = 6;
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class ToxinProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 8;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 9; // Half of Troub's arrow damage (18/2)
        this.speed = 10; // Faster than Troub's arrows (8)
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class OrigamiProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 12;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 12; // Origami projectile damage
        this.speed = 12; // Faster than Toxin projectiles
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class ChameleonProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 8;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 3; // Очень маленький урон
        this.speed = 16; // Очень высокая скорость
    }
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

// Global arrays for enemies and projectiles
let enemies = [];
let fireProjectiles = [];
let arrowProjectiles = [];
let toxinProjectiles = [];
let origamiProjectiles = [];
let chameleonProjectiles = [];

// Locations with smooth transitions
const locations = [
    { name: 'Дом', background: '#8B4513', enemies: [], width: 1200, hasImage: true },
    { name: 'Лес', background: '#228B22', enemies: [], width: 1200, hasImage: true },
    { name: 'Долина', background: '#696969', enemies: [], width: 1200 }
];

// World dimensions
const WORLD_WIDTH = 3600; // 3 locations × 1200px each
const LOCATION_WIDTH = 1200;

// Fade transition state
let fadeAlpha = 0;
let fading = false;
let fadeCallback = null;

function startFade(callback) {
    fading = true;
    fadeAlpha = 0;
    fadeCallback = callback;
}

function updateFade() {
    if (fading) {
        fadeAlpha += 0.04;
        if (fadeAlpha >= 1) {
            fadeAlpha = 1;
            fading = false;
            if (fadeCallback) fadeCallback();
            setTimeout(() => { fadeAlpha = 0; }, 200);
        }
    }
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') attack();
    if (e.code === 'KeyE') useSpecialAbility();
    if (e.code === 'KeyR') restartGame();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    // Stop machine gun sound when spacebar is released
    if (e.code === 'Space' && player.character && player.character.name === 'Toxin' && isMachineGunPlaying) {
        if (machineGunSound) {
            machineGunSound.pause();
            machineGunSound.currentTime = 0;
        }
        isMachineGunPlaying = false;
        console.log('🔇 Machine gun sound stopped!');
    }
});



// Character selection click handling
document.addEventListener('click', (e) => {
    if (gameState.currentScreen === 'characterSelect') {
        const charOptions = document.querySelectorAll('.character-option');
        charOptions.forEach((option) => {
            const rect = option.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && 
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const characterKey = option.dataset.character;
                selectCharacter(characterKey);
            }
        });
    }
});

// Character selection
function selectCharacter(characterKey) {
    if (characters[characterKey]) {
        // Stop machine gun sound if switching from Toxin
        if (player.character && player.character.name === 'Toxin' && isMachineGunPlaying) {
            if (machineGunSound) {
                machineGunSound.pause();
                machineGunSound.currentTime = 0;
            }
            isMachineGunPlaying = false;
            console.log('🔇 Machine gun sound stopped on character switch!');
        }
        
        player.character = characters[characterKey];
        gameState.currentScreen = 'game';
        document.getElementById('characterSelect').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
    }
}

// Attack function
function attack() {
    if (!player.character || player.attackCooldown > 0 || gameState.gameOver) return;

                    player.attacking = true;
                    
                    // Different cooldown for ranged vs melee characters
                    if (player.character.name === 'Toxin') {
                        player.attackCooldown = 15; // 0.25 seconds (15 frames at 60 FPS) - twice as fast as Troub
                    } else if (player.character.name === 'Troub') {
                        player.attackCooldown = 30; // 0.5 seconds (30 frames at 60 FPS) for Troub
                    } else {
                        player.attackCooldown = 15; // Normal cooldown for melee characters
                    }
    
    // Check if special ability is active
    if (gameState.abilityActive) {
        if (player.character.name === 'Troub') {
            // Troub's special ability: convert closest enemy to friendly
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            enemies.forEach(enemy => {
                if (!enemy.friendly) {
                    const dx = player.x - enemy.x;
                    const dy = player.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            });
            
            if (closestEnemy) {
                closestEnemy.friendly = true;
                friendlyEnemies.push(closestEnemy);
                
                // Remove from enemies array
                const index = enemies.indexOf(closestEnemy);
                if (index > -1) {
                    enemies.splice(index, 1);
                }
            }
            
            gameState.abilityActive = false;
            gameState.abilityTimer = 0;
        } else {
            // Default dash ability for other characters
            const dashDistance = 100;
            const dashDirection = player.direction;
            player.x += dashDistance * dashDirection;
            
            // Keep player within world bounds
            if (player.x < 0) player.x = 0;
            if (player.x > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
            
            gameState.score += 30; // Triple damage
            gameState.abilityActive = false; // Deactivate after use
            gameState.abilityTimer = 0;
        }
    } else {
        gameState.score += 10;
    }
    
    // Create arrow projectile for Troub
    if (player.character.name === 'Troub') {
        const arrowX = player.x + (player.direction > 0 ? player.width : 0);
        const arrowY = player.y + player.height / 2;
        const arrowVelocityX = player.direction;
        const arrowVelocityY = 0;
        
        arrowProjectiles.push(new ArrowProjectile(arrowX, arrowY, arrowVelocityX, arrowVelocityY));
    }
    
                    // Create toxin projectile for Toxin
                if (player.character.name === 'Toxin') {
                    console.log('🎯 Toxin attack triggered - Direction:', player.direction);
                    // Position bullet to come from the center of the fire animation - higher position
                    const toxinX = player.x + (player.direction > 0 ? player.width : 0);
                    const toxinY = player.y + player.height / 2 + 6.5; // Raised by 3.5 pixels higher
                    const toxinVelocityX = player.direction;
                    const toxinVelocityY = 0;
                    
                    toxinProjectiles.push(new ToxinProjectile(toxinX, toxinY, toxinVelocityX, toxinVelocityY));
                    console.log('💥 Toxin projectile created at:', toxinX, toxinY, 'Velocity:', toxinVelocityX);
                    
                    // Start machine gun sound (if not already playing)
                    if (machineGunSound && machineGunSound.readyState >= 2 && !isMachineGunPlaying) {
                        machineGunSound.currentTime = 0;
                        machineGunSound.play().catch(e => {
                            console.log('Sound play failed:', e);
                            createBeepSound(); // Use fallback if main sound fails
                        });
                        isMachineGunPlaying = true;
                        console.log('🔫 Machine gun sound started!');
                    } else if (!machineGunSound || machineGunSound.readyState < 2) {
                        console.log('⚠️ Machine gun sound not ready, using fallback');
                        createBeepSound(); // Use fallback beep sound
                    }
                    
                    // Activate attack animation
                    toxinAttackAnimation.active = true;
                    toxinAttackAnimation.timer = 15; // 0.25 seconds at 60fps
                    toxinAttackAnimation.blinkTimer = 0;
                    toxinAttackAnimation.visible = true;
                    console.log('🎯 Toxin attack animation activated - Direction:', player.direction, 'Active:', toxinAttackAnimation.active, 'Visible:', toxinAttackAnimation.visible);
                }
                
                // Create chameleon projectile for Chameleon
                if (player.character.name === 'Chameleon') {
                    console.log('🎯 Chameleon attack triggered - Direction:', player.direction);
                    
                    // Start burst fire for Chameleon
                    if (!chameleonAttackAnimation.active) {
                        chameleonAttackAnimation.active = true;
                        chameleonAttackAnimation.burstCount = 0;
                        chameleonAttackAnimation.burstTimer = 0;
                        chameleonAttackAnimation.visible = true;
                        console.log('🎯 Chameleon burst fire started!');
                    }
                    
                    // Create projectile if burst count allows
                    if (chameleonAttackAnimation.burstCount < chameleonAttackAnimation.maxBurstShots) {
                        const chameleonX = player.x + (player.direction > 0 ? player.width : 0);
                        const chameleonY = player.y + player.height / 2;
                        const chameleonVelocityX = player.direction;
                        const chameleonVelocityY = 0;
                        
                        chameleonProjectiles.push(new ChameleonProjectile(chameleonX, chameleonY, chameleonVelocityX, chameleonVelocityY));
                        console.log('💥 Chameleon projectile created at:', chameleonX, chameleonY, 'Velocity:', chameleonVelocityX, 'Burst:', chameleonAttackAnimation.burstCount + 1);
                        
                        chameleonAttackAnimation.burstCount++;
                        chameleonAttackAnimation.burstTimer = chameleonAttackAnimation.burstDelay;
                    }
                }
                
                // Create origami projectile for Origami
                if (player.character.name === 'Origami') {
                    console.log('🎯 Origami attack triggered - Direction:', player.direction);
                    
                    // Start burst fire for Origami
                    if (!origamiAttackAnimation.active) {
                        origamiAttackAnimation.active = true;
                        origamiAttackAnimation.burstCount = 0;
                        origamiAttackAnimation.burstTimer = 0;
                        origamiAttackAnimation.visible = true;
                        console.log('🎯 Origami burst fire started!');
                    }
                    
                    // Create projectile if burst count allows
                    if (origamiAttackAnimation.burstCount < origamiAttackAnimation.maxBurstShots) {
                        const origamiX = player.x + (player.direction > 0 ? player.width : 0);
                        const origamiY = player.y + player.height / 2;
                        const origamiVelocityX = player.direction;
                        const origamiVelocityY = 0;
                        
                        origamiProjectiles.push(new OrigamiProjectile(origamiX, origamiY, origamiVelocityX, origamiVelocityY));
                        console.log('💥 Origami projectile created at:', origamiX, origamiY, 'Velocity:', origamiVelocityX, 'Burst:', origamiAttackAnimation.burstCount + 1);
                        
                        origamiAttackAnimation.burstCount++;
                        origamiAttackAnimation.burstTimer = origamiAttackAnimation.burstDelay;
                    }
                }
    
    // Check for enemy hits based on character type
    if (gameState.currentLocation === 1) { // Only on Forest location (second location)
        enemies.forEach(enemy => {
            const dx = Math.abs(player.x - enemy.x);
            const dy = Math.abs(player.y - enemy.y);
            
            // Chameleon damage is now handled by projectiles in updatePlayer()
            // Troub, Toxin, and Origami damage is handled by projectiles in updatePlayer()
        });
    }
    
    gameState.hits++;
    if (gameState.hits >= 10 && !gameState.abilityReady) {
        gameState.abilityReady = true;
    }
}

// Special ability
function useSpecialAbility() {
    if (!gameState.abilityReady || !player.character) return;
    
    if (player.character.name === 'Troub') {
        // Troub's special ability: convert enemy to friendly
        gameState.abilityReady = false;
        gameState.abilityActive = true;
        gameState.hits = 0;
        gameState.abilityTimer = 120; // 2 seconds at 60fps
    } else if (player.character.name === 'Toxin') {
        // Toxin's special ability: 10 seconds of invincibility
        gameState.abilityReady = false;
        gameState.hits = 0;
        toxinSpecialAbility.active = true;
        toxinSpecialAbility.timer = toxinSpecialAbility.duration;
    } else {
        // Default dash ability for other characters
        gameState.abilityReady = false;
        gameState.abilityActive = true;
        gameState.hits = 0;
        gameState.abilityTimer = 120; // 2 seconds at 60fps
    }
}

// Initialize enemies for Forest location
function initializeForestEnemies() {
    enemies = [
        new Enemy(1250, 150, 'fire'),
        new Enemy(1450, 200, 'fire'),
        new Enemy(1650, 180, 'fire'),
        new Enemy(1850, 120, 'fire')
    ];
}

// Restart game
function restartGame() {
    player.x = 100;
    player.y = 400;
    gameState.health = 100;
    gameState.score = 0;
    gameState.hits = 0;
    gameState.abilityReady = false;
    gameState.abilityActive = false;
    gameState.abilityTimer = 0;
    gameState.gameOver = false;
    gameState.currentLocation = 0;
    gameState.transitioning = false;
    fireProjectiles = [];
    arrowProjectiles = [];
    toxinProjectiles = [];
    origamiProjectiles = [];
    blueSphereProjectiles = [];
    enemies = [];
    friendlyEnemies = [];
    
    // Reset toxin attack animation
    toxinAttackAnimation.active = false;
    toxinAttackAnimation.timer = 0;
    toxinAttackAnimation.blinkTimer = 0;
    toxinAttackAnimation.visible = false;
    
    // Reset origami attack animation
    origamiAttackAnimation.active = false;
    origamiAttackAnimation.timer = 0;
    origamiAttackAnimation.blinkTimer = 0;
    origamiAttackAnimation.visible = false;
    origamiAttackAnimation.burstCount = 0;
    origamiAttackAnimation.burstTimer = 0;
    
    // Reset toxin special ability
    toxinSpecialAbility.active = false;
    toxinSpecialAbility.timer = 0;
    
    // Stop machine gun sound
    if (machineGunSound && isMachineGunPlaying) {
        machineGunSound.pause();
        machineGunSound.currentTime = 0;
        isMachineGunPlaying = false;
        console.log('🔇 Machine gun sound stopped on restart!');
    }
    // Reset chameleon attack animation
    chameleonAttackAnimation.active = false;
    chameleonAttackAnimation.timer = 0;
    chameleonAttackAnimation.blinkTimer = 0;
    chameleonAttackAnimation.visible = false;
    // Clear chameleon projectiles
    chameleonProjectiles = [];
}

// Camera system
let cameraX = 0;

// Update player
function updatePlayer() {
    if (gameState.currentScreen !== 'game') return;
    
    // Don't update if game is over or transitioning
    if (gameState.gameOver || gameState.transitioning) return;
    
    // Get current location bounds
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
    
    // Keep player within current location bounds
    if (player.x < locationStart) player.x = locationStart;
    if (player.x + player.width > locationEnd) player.x = locationEnd - player.width;
    
             // Check portal collision (portal is between columns j and k)
    if (gameState.currentLocation < locations.length - 1) {
        const portalX = locationStart + (36.5 * 32) - 40; // Shifted right, more towards column k
        const portalHeight = 120;
                 const portalY = 2 * 32 - 11; // Position at row 2 (middle position) - moved up by 11 pixels
         
         if (
             player.x + player.width > portalX &&
             player.x < portalX + 80 &&
             player.y + player.height > portalY &&
             player.y < portalY + portalHeight
         ) {
            // Start transition to next location
            gameState.transitioning = true;
            startFade(() => {
                gameState.currentLocation++;
                player.x = (gameState.currentLocation * LOCATION_WIDTH) + 50;
                gameState.transitioning = false;
                                 // Initialize enemies for new location if needed
                 if (gameState.currentLocation === 1) { // Лес location
                     initializeForestEnemies();
                 } else {
                     // Clear enemies for other locations
                     enemies = [];
                 }
            });
        }
    }
    
    // Movement
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.direction = -1;
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.direction = 1;
    } else {
        player.velocityX *= 0.8;
    }
    
    // Jumping
    if ((keys['KeyW'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = -12; // Максимальный прыжок 4 клетки (128 пикселей)
        player.onGround = false;
    }
    

    
    // Gravity
    player.velocityY += 0.8;
    
    // Update position
    let newX = player.x + player.velocityX;
    let newY = player.y + player.velocityY;
    

    
    // Tile-based collision for B1-B16 wall
    const tileSize = 32;
    const wallLocationStart = gameState.currentLocation * LOCATION_WIDTH;
    
    // Check each tile of the wall individually
    for (let row = 1; row <= 16; row++) { // B1 to B16
        const tileX = wallLocationStart + 1 * tileSize; // B column
        const tileY = row * tileSize;
        
        // Check if player is crossing the wall boundary (ultra minimal radius)
        const playerLeft = newX;
        const playerRight = newX + player.width;
        const wallLeft = tileX;
        const wallRight = tileX + tileSize;
        
        // Simple wall blocking - block any intersection with wall
        if (newX < wallRight && newX + player.width > wallLeft &&
            newY < tileY + tileSize && newY + player.height > tileY) {
            
            console.log('🚫 TILE COLLISION! Blocked horizontal movement at B' + row);
            // Only stop horizontal velocity and block X movement
            player.velocityX = 0;
            newX = player.x; // Keep current X position, don't move horizontally
            // Allow Y movement for jumping - don't block vertical movement
        }
    }
    
    // Check sprite collisions BEFORE updating position
    const collisionResult = checkSpriteCollisions(newX, newY, player.width, player.height, gameState.currentLocation);
    
    // Debug: log player position
    console.log('🎮 Player position:', {
        x: newX,
        y: newY,
        currentLocation: gameState.currentLocation,
        locationStart: gameState.currentLocation * LOCATION_WIDTH
    });
    
    // World bounds - full world width
    if (newX < 0) player.x = 0;
    else if (newX > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
    else player.x = newX;
    
    // Handle sprite collisions
    if (collisionResult.collision) {
        console.log('🛑 PLAYER BLOCKED!', collisionResult);
        if (collisionResult.type === 'platform') {
            // Platform collision - player can stand on it
            player.y = collisionResult.y;
            player.velocityY = 0;
            player.onGround = true;
        } else {
            // ALL other sprites are completely blocked - no movement allowed
            player.velocityX = 0;
            player.velocityY = 0;
            // DON'T update position - keep player in current position
            return; // Exit early, don't update position
        }
    } else {
        // No sprite collision, update Y position
        player.y = newY;
        
        // Check for platform collisions when falling
        if (player.velocityY > 0) { // Only check when falling down
            // Check multiple points along the fall path
            let landedOnPlatform = false;
            for (let checkY = player.y; checkY <= player.y + player.velocityY; checkY += 2) {
                const fallCollisionResult = checkSpriteCollisions(player.x, checkY, player.width, player.height, gameState.currentLocation);
                if (fallCollisionResult.collision) {
                    // Hit a sprite - stop falling
                    player.velocityY = 0;
                    player.onGround = true;
                    landedOnPlatform = true;
                    break;
                }
            }
            
            if (!landedOnPlatform) {
                // No ground level - player should fall through
                player.onGround = false;
            }
        } else {
            // No ground level - player should fall through
            player.onGround = false;
        }
    }
    
    // Update cooldowns
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (gameState.abilityTimer > 0) gameState.abilityTimer--;
    
                    // Update toxin attack animation
                if (toxinAttackAnimation.active) {
                    toxinAttackAnimation.timer--;
                    toxinAttackAnimation.blinkTimer++;
                    
                    // Blink every 5 frames (0.083 seconds)
                    if (toxinAttackAnimation.blinkTimer >= 5) {
                        toxinAttackAnimation.visible = !toxinAttackAnimation.visible;
                        toxinAttackAnimation.blinkTimer = 0;
                        console.log('💫 Toxin animation blink - Visible:', toxinAttackAnimation.visible, 'Timer:', toxinAttackAnimation.timer);
                    }
                    
                    // Deactivate animation when timer expires
                    if (toxinAttackAnimation.timer <= 0) {
                        toxinAttackAnimation.active = false;
                        toxinAttackAnimation.visible = false;
                        console.log('⏰ Toxin animation expired');
                    }
                    
                    console.log('🔄 Toxin animation update - Timer:', toxinAttackAnimation.timer, 'BlinkTimer:', toxinAttackAnimation.blinkTimer, 'Visible:', toxinAttackAnimation.visible);
                }
                
                // Update origami attack animation
                if (origamiAttackAnimation.active) {
                    origamiAttackAnimation.burstTimer--;
                    
                    // Create additional projectiles during burst
                    if (origamiAttackAnimation.burstTimer <= 0 && origamiAttackAnimation.burstCount < origamiAttackAnimation.maxBurstShots) {
                        const origamiX = player.x + (player.direction > 0 ? player.width : 0);
                        const origamiY = player.y + player.height / 2;
                        const origamiVelocityX = player.direction;
                        const origamiVelocityY = 0;
                        
                        origamiProjectiles.push(new OrigamiProjectile(origamiX, origamiY, origamiVelocityX, origamiVelocityY));
                        console.log('💥 Origami burst projectile created - Burst:', origamiAttackAnimation.burstCount + 1);
                        
                        origamiAttackAnimation.burstCount++;
                        origamiAttackAnimation.burstTimer = origamiAttackAnimation.burstDelay;
                    }
                    
                    // End burst after all shots or 2 seconds (120 frames)
                    if (origamiAttackAnimation.burstCount >= origamiAttackAnimation.maxBurstShots || origamiAttackAnimation.burstTimer <= -120) {
                        origamiAttackAnimation.active = false;
                        origamiAttackAnimation.visible = false;
                        origamiAttackAnimation.burstCount = 0;
                        origamiAttackAnimation.burstTimer = 0;
                        console.log('⏰ Origami burst fire ended');
                    }
                }
                
                // Update toxin special ability
                if (toxinSpecialAbility.active) {
                    toxinSpecialAbility.timer--;
                    if (toxinSpecialAbility.timer <= 0) {
                        toxinSpecialAbility.active = false;
                    }
                }
    
    // Update current location
    gameState.currentLocation = Math.floor(player.x / LOCATION_WIDTH);
    
    // Check for enemy attacks and fire projectiles
    enemies.forEach(enemy => {
        const attackResult = enemy.attack(player);
        if (attackResult.damage > 0) {
            // Check if Toxin is in special ability mode (invincible)
            if (!(player.character.name === 'Toxin' && toxinSpecialAbility.active)) {
                gameState.health -= attackResult.damage;
                
                // Check if player is dead
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    gameState.gameOver = true;
                }
            }
            
            // Create fire projectile aimed at player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                const projectileSpeed = 4;
                const velocityX = (dx / distance) * projectileSpeed;
                const velocityY = (dy / distance) * projectileSpeed;
                fireProjectiles.push(new FireProjectile(enemy.x, enemy.y, velocityX, velocityY));
            }
        }
    });
    
    // Update fire projectiles
    fireProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with player
        if (projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y) {
            // Check if Toxin is in special ability mode (invincible)
            if (!(player.character.name === 'Toxin' && toxinSpecialAbility.active)) {
                gameState.health -= projectile.damage;
                
                // Check if player is dead
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    gameState.gameOver = true;
                }
            }
            
            fireProjectiles.splice(index, 1);
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            fireProjectiles.splice(index, 1);
        }
    });
    
    // Update arrow projectiles
    arrowProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    arrowProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            arrowProjectiles.splice(index, 1);
        }
    });
    
    // Update toxin projectiles
    toxinProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    toxinProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            toxinProjectiles.splice(index, 1);
        }
    });
    
    // Update origami projectiles
    origamiProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    origamiProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            origamiProjectiles.splice(index, 1);
        }
    });
    
    // Update chameleon projectiles
    chameleonProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    chameleonProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            chameleonProjectiles.splice(index, 1);
        }
    });
    
    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(player);
    });
    
    // Update friendly enemies
    friendlyEnemies.forEach(friendlyEnemy => {
        friendlyEnemy.update(player);
        friendlyEnemy.glowTimer++;
        
        // Friendly enemies attack other enemies
        enemies.forEach(enemy => {
            const dx = enemy.x - friendlyEnemy.x;
            const dy = enemy.y - friendlyEnemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < friendlyEnemy.attackRange && friendlyEnemy.attackCooldown === 0) {
                friendlyEnemy.attackCooldown = 60; // 1 second at 60fps
                
                // Create blue sphere projectile
                const projectileSpeed = 5;
                const velocityX = (dx / distance) * projectileSpeed;
                const velocityY = (dy / distance) * projectileSpeed;
                blueSphereProjectiles.push(new BlueSphereProjectile(friendlyEnemy.x, friendlyEnemy.y, velocityX, velocityY));
            }
        });
    });
    
    // Update blue sphere projectiles
    blueSphereProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            if (projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y) {
                enemy.health -= projectile.damage;
                if (enemy.health <= 0) {
                    const enemyIndex = enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1);
                    }
                }
                blueSphereProjectiles.splice(index, 1);
            }
        });
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            blueSphereProjectiles.splice(index, 1);
        }
    });

    // Update chameleon attack animation
    if (chameleonAttackAnimation.active) {
        chameleonAttackAnimation.burstTimer--;
        if (chameleonAttackAnimation.burstTimer <= 0 && chameleonAttackAnimation.burstCount < chameleonAttackAnimation.maxBurstShots) {
            const chamX = player.x + (player.direction > 0 ? player.width : 0);
            const chamY = player.y + player.height / 2;
            const chamVelocityX = player.direction;
            const chamVelocityY = 0;
            chameleonProjectiles.push(new ChameleonProjectile(chamX, chamY, chamVelocityX, chamVelocityY));
            chameleonAttackAnimation.burstCount++;
            chameleonAttackAnimation.burstTimer = chameleonAttackAnimation.burstDelay;
        }
        // End burst after max shots or 0.5 секунды (30 кадров)
        if (chameleonAttackAnimation.burstCount >= chameleonAttackAnimation.maxBurstShots || chameleonAttackAnimation.burstTimer <= -30) {
            chameleonAttackAnimation.active = false;
            chameleonAttackAnimation.visible = false;
            chameleonAttackAnimation.burstCount = 0;
            chameleonAttackAnimation.burstTimer = 0;
        }
    }
}

// Update camera
function updateCamera() {
    // Camera is fixed to current location
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    cameraX = locationStart;
}

// Update UI
function updateUI() {
    const healthText = document.getElementById('healthText');
    const healthFill = document.getElementById('healthFill');
    const abilityInfo = document.getElementById('abilityInfo');
    const abilityFill = document.getElementById('abilityFill');
    
    if (healthText) healthText.textContent = `Health: ${gameState.health}`;
    if (healthFill) healthFill.style.width = `${(gameState.health / 100) * 100}%`;
    
    // Update ability bar
    if (abilityFill) {
        if (gameState.abilityReady) {
            abilityFill.style.width = '100%';
        } else {
            const abilityProgress = (gameState.hits / 10) * 100;
            abilityFill.style.width = `${abilityProgress}%`;
        }
    }
    
    if (abilityInfo) {
        if (gameState.gameOver) {
            abilityInfo.textContent = 'GAME OVER';
            abilityInfo.style.color = '#ff0000';
        } else if (gameState.abilityReady) {
            if (player.character && player.character.name === 'Troub') {
                abilityInfo.textContent = 'CONVERT READY!';
            } else {
                abilityInfo.textContent = 'SPECIAL READY!';
            }
            abilityInfo.style.color = '#ffff00';
        } else if (gameState.abilityActive) {
            if (player.character && player.character.name === 'Troub') {
                abilityInfo.textContent = 'CONVERT ACTIVE!';
            } else {
                abilityInfo.textContent = 'DASH READY!';
            }
            abilityInfo.style.color = '#00ffff';
        } else {
            abilityInfo.textContent = 'Ability: Ready';
            abilityInfo.style.color = '#ffffff';
        }
    }
}

// Draw functions
function drawBackground() {
    // Draw only current location
    const currentLocation = locations[gameState.currentLocation];
    const locationX = gameState.currentLocation * LOCATION_WIDTH;
    const screenX = locationX - cameraX;
    
    // Draw current location background
    if (currentLocation) {
        // Draw background images for specific locations
        if (currentLocation.name === 'Дом' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on l0-l17 coordinates
                drawBlackSprite1_2OnL0L17(screenX);
                
                // Draw black sprite 1.2 from first pack on B0-k0 coordinates
                drawBlackSprite1_2OnB0K0(screenX);
                
                // Draw sprite 4.0 from new industrial tileset on B1 coordinates
                drawSprite4_0OnB1(screenX);
                
                // Draw sprite 1.3 from new industrial tileset on C1-j1 coordinates
                drawSprite1_3OnC1J1(screenX);
                
                // Draw sprite 5.0 from new industrial tileset on k1 coordinates
                drawSprite5_0OnK1(screenX);
                
                // Draw sprite 4.1 from new industrial tileset on B2-B14 coordinates
                drawSprite4_1OnB2B14(screenX);
                
                // Draw sprite 1.2 from new industrial tileset on B16-F16 coordinates
                drawSprite1_2OnB16F16(screenX);
                
                // Draw sprite 1.2 from new industrial tileset on B17-F17 coordinates
                drawSprite1_2OnB17F17(screenX);
                
                // Draw sprite 4.3 from new industrial tileset on B1-B14 coordinates
                drawSprite4_3OnB1B14(screenX);
                
                // Draw sprite 4.1 from new industrial tileset on B15 coordinates

                
                // Draw sprite 0.3 from new industrial tileset on G17 coordinates

                
                // Draw sprite 1.3 from new industrial tileset on H17-j17 coordinates
                drawSprite1_3OnH17J17(screenX);
                
                // Draw sprite 0.0 from new industrial tileset on G16 coordinates

                
                // Draw sprite 1.0 from new industrial tileset on H16-j16 coordinates
                drawSprite1_0OnH16J16(screenX);
                
                // Draw sprite 1.1 from new industrial tileset on C15 coordinates

                
                // Draw sprite 1.1 from new industrial tileset on D15-E15 coordinates

                
                // Draw sprite 2.1 from new industrial tileset on F15 coordinates

                
                // Draw sprite 2.2 from new industrial tileset on B15 coordinates
                drawSprite2_2OnB15(screenX);
                
                // Draw sprite 4.1 from new industrial tileset on B16 coordinates
                drawSprite4_1OnB16(screenX);
                
                // Draw sprite 1.1 from new industrial tileset on C16 coordinates
                drawSprite1_1OnC16(screenX);
                
                // Draw sprite 1.0 from new industrial tileset on D16-G16 coordinates
                drawSprite1_0OnD16G16(screenX);
                
                // Draw sprite 1.3 from new industrial tileset on C17-G17 coordinates
                drawSprite1_3OnC17G17(screenX);
                
                // Draw sprite 0.0 from new industrial tileset on M12 coordinates
                drawSprite0_0OnM12(screenX);
                
                // Draw sprite 1.0 from new industrial tileset on N12 coordinates
                drawSprite1_0OnN12(screenX);
                
                // Draw sprite 2.0 from new industrial tileset on O12 coordinates
                drawSprite2_0OnO12(screenX);
                
                // Draw sprite 0.0 from new industrial tileset on I14 coordinates
                drawSprite0_0OnI14(screenX);
                
                // Draw sprite 1.0 from new industrial tileset on J14 coordinates
                drawSprite1_0OnJ14(screenX);
                
                // Draw sprite 2.0 from new industrial tileset on K14 coordinates
                drawSprite2_0OnK14(screenX);
                
                // Draw sprite 0.0 from new industrial tileset on C7 coordinates
                drawSprite0_0OnC7(screenX);
                
                // Draw sprite 1.0 from new industrial tileset on D7-N7 coordinates
                drawSprite1_0OnD7N7(screenX);
                
                // Draw sprite 2.0 from new industrial tileset on O7 coordinates
                drawSprite2_0OnO7(screenX);
                
                // Draw sprite 0.0 from third industrial tileset on b7 coordinates
                drawSprite0_0OnB7(screenX);
                
                // Draw sprite 2.0 from third industrial tileset on c7 coordinates
                drawSprite2_0OnC7(screenX);
                
                // Draw sprite 0.3 from new industrial tileset on B17 coordinates
                drawSprite0_3OnB17(screenX);
                
                // Draw sprite 2.3 from new industrial tileset on k17 coordinates (около портала)
                drawSprite2_3OnK17(screenX);
                
                // Draw sprite 2.0 from new industrial tileset on k16 coordinates
                drawSprite2_0OnK16(screenX);
                
                // Draw sprite 4.0 from new industrial tileset on B1 coordinates
                drawSprite4_0OnB1(screenX);
                
                // Draw sprite 1.3 from new industrial tileset on M1-W1 coordinates
                drawSprite1_3OnM1W1(screenX);
                

                
                // Draw sprite 3.2 from third industrial tileset (T) on Y16 coordinates
                drawSprite3_2OnY16(screenX);
                
                // Draw sprite 3.2 from third industrial tileset (T) on Y15 coordinates
                drawSprite3_2OnY15(screenX);
                
                // Draw sprite 3.1 from third industrial tileset (T) on Y14 coordinates
                drawSprite3_1OnY14(screenX);
                
                // Draw sprite 5.1 from third industrial tileset (T) on k15 coordinates
                drawSprite5_1OnK15(screenX);
                
                // Draw sprite 3.3 from third industrial tileset (T) on Y17 coordinates
                drawSprite3_3OnY17(screenX);
                
                // Draw sprite 0.0 from third industrial tileset (T) on Z15 coordinates
                drawSprite0_0OnZ15(screenX);
                
                // Draw sprite 1.0 from third industrial tileset (T) on a15 coordinates
                drawSprite1_0OnA15(screenX);
                
                // Draw sprite 2.0 from third industrial tileset (T) on b15 coordinates
                drawSprite2_0OnB15(screenX);
                
                // Draw sprite 1.1 from third industrial tileset (T) on d15-j15 coordinates
                drawSprite1_1OnD15J15(screenX);
                
                // Draw sprite 0.2 from third industrial tileset (T) on k14 coordinates
                drawSprite0_2OnK14(screenX);
                
                // Draw sprite 0.1 from third industrial tileset (T) on k13 coordinates
                drawSprite0_1OnK13(screenX);
                
                // Draw sprite 0.1 from third industrial tileset (T) on c15 coordinates
                drawSprite0_1OnC15(screenX);
                
                // Draw sprite 0.1 from third industrial tileset (T) on e5 coordinates
                drawSprite0_1OnE5(screenX);
                
                // Draw sprite 0.3 from third industrial tileset (T) on e6 coordinates
                drawSprite0_3OnE6(screenX);
                
                // Draw sprite 1.3 from third industrial tileset (T) on f6-j6 coordinates
                drawSprite1_3OnF6J6(screenX);
                
                // Draw sprite 2.3 from third industrial tileset (T) on k6 coordinates
                drawSprite2_3OnK6(screenX);
                
                // Draw sprite 1.1 from third industrial tileset (T) on f5-j5 coordinates
                drawSprite1_1OnF5J5(screenX);
                
                // Draw sprite 2.1 from third industrial tileset (T) on k5 coordinates
                drawSprite2_1OnK5(screenX);
                
                // Draw sprite 0.2 from third industrial tileset (T) on O2 coordinates
                drawSprite0_2OnO2(screenX);
                
                // Draw sprite 0.3 from third industrial tileset (T) on O3 coordinates
                drawSprite0_3OnO3(screenX);
                
                // Draw sprite 1.3 from third industrial tileset (T) on P3-Y3 coordinates
                drawSprite1_3OnP3Y3(screenX);
                
                // Draw sprite 1.2 from third industrial tileset (T) on P2-Y2 coordinates
                drawSprite1_3OnP2Y2(screenX);
                
                // Draw sprite 2.2 from third industrial tileset (T) on Z2 coordinates
                drawSprite2_2OnZ2(screenX);
                
                // Draw sprite 2.3 from third industrial tileset (T) on Z3 coordinates
                drawSprite2_3OnZ3(screenX);
                
                // Draw sprite 5.3 from third industrial tileset (T) on W3 coordinates
                drawSprite5_3OnW3(screenX);
                
                // Draw sprite 3.2 from third industrial tileset (T) on W4-W8 coordinates
                drawSprite3_2OnW4W8(screenX);
                
                // Draw sprite 3.2 from third industrial tileset (T) on W9 coordinates
                drawSprite3_2OnW9(screenX);
                
                // Draw sprite 5.2 from third industrial tileset (T) on W10 coordinates
                drawSprite5_2OnW10(screenX);
                
                // Draw sprite 1.0 from third industrial tileset (T) on X10-b10 coordinates
                drawSprite1_0OnX10B10(screenX);
                
                // Draw sprite 2.0 from third industrial tileset (T) on c10 coordinates
                drawSprite2_0OnC10(screenX);
                
                // Draw sprite 1.0 from third industrial tileset (T) on R10-V10 coordinates
                drawSprite1_0OnR10V10(screenX);
                
                // Draw sprite 0.0 from third industrial tileset (T) on Q10 coordinates
                drawSprite0_0OnQ10(screenX);
                
                // Draw sprite 0.1 from third industrial tileset (T) on f11 coordinates
                drawSprite0_1OnF11(screenX);
                
                // Draw sprite 0.3 from third industrial tileset (T) on f12 coordinates
                drawSprite0_3OnF12(screenX);
                
                // Draw sprite 1.1 from third industrial tileset (T) on g11 coordinates
                drawSprite1_1OnG11(screenX);
                
                // Draw sprite 1.3 from third industrial tileset (T) on g12 coordinates
                drawSprite1_3OnG12(screenX);
                
                // Draw sprite 2.1 from third industrial tileset (T) on h11 coordinates
                drawSprite2_1OnH11(screenX);
                
                // Draw sprite 2.3 from third industrial tileset (T) on h12 coordinates
                drawSprite2_3OnH12(screenX);
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Sprite removed from A0-A18 coordinates
            }
        } else if (currentLocation.name === 'Лес' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Grid overlay removed
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on l0-l17 coordinates
                drawBlackSprite1_2OnL0L17(screenX);
                
                // Draw black sprite 1.2 from first pack on B0-k0 coordinates
                drawBlackSprite1_2OnB0K0(screenX);
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Sprite removed from A0-A18 coordinates
            }
        } else if (currentLocation.name === 'Долина' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on l0-l17 coordinates
                drawBlackSprite1_2OnL0L17(screenX);
                
                // Draw black sprite 1.2 from first pack on B0-k0 coordinates
                drawBlackSprite1_2OnB0K0(screenX);
                
                // Sprite removed from A0-A18 coordinates
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Sprite removed from A0-A18 coordinates
            }

        } else if (currentLocation.name === 'Замок' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
                
                // Sprite removed from A0-A18 coordinates
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Sprite removed from A0-A18 coordinates
            }
        } else if (currentLocation.name === 'Остров' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
                
                // Sprite removed from A0-A18 coordinates
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Sprite removed from A0-A18 coordinates
            }
        } else if (currentLocation.name === 'Портал' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
                
                // Draw black sprite 1.2 from first pack on A0-A18 coordinates
                drawBlackSprite1_2OnA0A18(screenX);
                
                // Draw black sprite 1.2 from first pack on B18-L18 coordinates
                drawBlackSprite1_2OnB18_L18(screenX);
                
                // Draw black sprite 1.2 from first pack on M18-L18 coordinates
                drawBlackSprite1_2OnM18_L18(screenX);
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
                // Draw grid overlay for level design
                drawGridOverlay(screenX);
            }

        } else {
            // Draw solid color background
            ctx.fillStyle = currentLocation.background;
            ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            
            // Draw grid overlay for all locations
            drawGridOverlay(screenX);
            
            // Draw black sprite 1.2 from first pack on A0-A18 coordinates
            drawBlackSprite1_2OnA0A18(screenX);
            
            // Draw black sprite 1.2 from first pack on B18-L18 coordinates
            drawBlackSprite1_2OnB18_L18(screenX);
            
            // Draw black sprite 1.2 from first pack on M18-L18 coordinates
            drawBlackSprite1_2OnM18_L18(screenX);
            
            // Draw sprite 1.1 on A0-A18 coordinates
            drawSprite1_1OnA0A18(screenX);
        }
        
        // Ground hidden
        
        // Draw portal between columns j and k (around rows 2-4)
        if (gameState.currentLocation < locations.length - 1) {
            // Position portal to the right, more towards column k
            const portalX = locationX + (36.5 * 32) - 40; // Shifted right, more towards column k
            const portalScreenX = portalX - cameraX;
                 
                 // Portal animation
                 const portalPulse = Math.sin(Date.now() * 0.005) * 0.2 + 1;
                 const portalGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                 
                                 // Portal should be at the top of the grid (around rows 2-4)
                const portalHeight = 120;
                const portalY = 2 * 32 - 11; // Position at row 2 (middle position) - moved up by 11 pixels
                 
                 if (portalSprite.complete) {
                     // Draw main portal
                     ctx.drawImage(portalSprite, portalScreenX, portalY, 80, 120);
                     
                     // Draw soft portal glow effect only on front side
                     ctx.save();
                     ctx.globalAlpha = portalGlow * 0.3; // Much softer glow
                     ctx.drawImage(portalSprite, portalScreenX - 3, portalY - 3, 86, 126);
                     ctx.restore();
                     
                     // Draw soft portal particles only on front side
                     for (let i = 0; i < 6; i++) {
                         const angle = (Date.now() * 0.001 + i * 60) * Math.PI / 180; // Slower rotation
                         const particleX = portalScreenX + 40 + Math.cos(angle) * (25 + Math.sin(Date.now() * 0.005) * 5); // Smaller radius
                         const particleY = portalY + 60 + Math.sin(angle) * (25 + Math.sin(Date.now() * 0.005) * 5);
                         
                         ctx.fillStyle = `rgba(255, 100, 255, ${0.4 - i * 0.05})`; // Much softer particles
                         ctx.beginPath();
                         ctx.arc(particleX, particleY, 1.5 + Math.sin(Date.now() * 0.01 + i) * 0.5, 0, Math.PI * 2); // Smaller particles
                         ctx.fill();
                     }
                 } else {
                     // Fallback portal with animation
                     ctx.fillStyle = `rgba(0, 0, 255, ${portalGlow})`;
                     ctx.fillRect(portalScreenX, portalY, 80, 120);
                     
                     // Animated border
                     ctx.strokeStyle = `rgba(255, 100, 255, ${portalGlow})`;
                     ctx.lineWidth = 3;
                     ctx.strokeRect(portalScreenX, portalY, 80, 120);
                 }
             }
         }
     }
     
                       // Draw fade overlay
      if (fadeAlpha > 0) {
          ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
          ctx.fillRect(0,0,canvas.width,canvas.height);
      }


function drawPlayer() {
    if (player.character) {
        // Draw player relative to camera
        const screenX = player.x - cameraX;
        
                 // Draw character sprites if available
         if (player.character.name === 'Origami' && characterSprites.origami && characterSprites.origami.complete) {
            try {
                ctx.save();
                                if (player.direction === -1) {
                    ctx.scale(-1, 1);
                    ctx.drawImage(characterSprites.origami, -(screenX + 80), player.y, 80, player.height);
                } else {
                    ctx.drawImage(characterSprites.origami, screenX, player.y, 80, player.height);
                }
                ctx.restore();
            } catch (error) {
                console.error('Error drawing Origami sprite:', error);
                // Fallback to colored rectangle
                ctx.fillStyle = player.character.color;
                ctx.fillRect(screenX, player.y, player.width, player.height);
            }
         } else if (player.character.name === 'Toxin' && characterSprites.toxin && characterSprites.toxin.complete) {
             try {
                 ctx.save();
                 
                 // Apply black and white effect if special ability is active
                 if (toxinSpecialAbility.active) {
                     ctx.filter = 'grayscale(100%)';
                 }
                 
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.toxin, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.toxin, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Toxin sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = toxinSpecialAbility.active ? '#808080' : player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else if (player.character.name === 'Chameleon' && characterSprites.chameleon && characterSprites.chameleon.complete) {
             try {
                 ctx.save();
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.chameleon, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.chameleon, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Chameleon sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else if (player.character.name === 'Troub' && characterSprites.troub && characterSprites.troub.complete) {
             try {
                 ctx.save();
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.troub, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.troub, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Troub sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else {
             // Draw colored rectangle for other characters
             ctx.fillStyle = player.character.color;
             ctx.fillRect(screenX, player.y, player.width, player.height);
         }
        
                 // Character name hidden
        
        // Draw attack animation
        if (player.attacking) {
            if (gameState.abilityActive) {
                // Draw dash attack effect
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 5;
                const dashX = screenX + (player.direction > 0 ? player.width + 100 : -100);
                ctx.beginPath();
                ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                ctx.lineTo(dashX, player.y + player.height/2);
                ctx.stroke();
                
                // Draw dash trail effect
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.lineWidth = 3;
                for (let i = 1; i <= 3; i++) {
                    const trailX = screenX - (player.direction * i * 20);
                    ctx.beginPath();
                    ctx.moveTo(trailX + player.width/2, player.y + player.height/2);
                    ctx.lineTo(trailX + player.width/2 + (player.direction * 50), player.y + player.height/2);
                    ctx.stroke();
                }
            } else {
                // Draw different attack effects based on character
                            if (player.character.name === 'Origami' || player.character.name === 'Chameleon') {
                // Мelee attack - solid line (удалено для Origami и Chameleon)
                // Белая линия атаки удалена для обоих персонажей
            } else if (player.character.name === 'Toxin' || player.character.name === 'Troub') {
                    // Ranged attack - no visual effect (removed dashed line)
                    // Attack logic is handled in the attack() function for arrow creation
                } else {
                    // Default attack
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    const attackX = screenX + (player.direction > 0 ? player.width : -player.character.attackRange);
                    ctx.beginPath();
                    ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                    ctx.lineTo(attackX, player.y + player.height/2);
                    ctx.stroke();
                }
            }
            player.attacking = false;
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const screenX = enemy.x - cameraX;
        
        // Only draw if enemy is visible on screen
        if (screenX > -enemy.width && screenX < canvas.width) {
            // Determine enemy direction based on player position
            const enemyDirection = player.x > enemy.x ? 1 : -1;
            
            // Draw fire enemy sprite if available
            if (enemy.type === 'fire' && enemySprites.fireEnemy && enemySprites.fireEnemy.complete) {
                try {
                    ctx.save();
                                         if (enemyDirection === -1) {
                         // Flip enemy horizontally when facing left
                         ctx.scale(-1, 1);
                         ctx.drawImage(enemySprites.fireEnemy, -(screenX + 80), enemy.y, 80, 60);
                     } else {
                         // Draw normally when facing right
                         ctx.drawImage(enemySprites.fireEnemy, screenX, enemy.y, 80, 60);
                     }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing fire enemy sprite:', error);
                    // Fallback to animated fire ball
                    drawAnimatedFireBall(screenX, enemy.y, enemy.width, enemy.height);
                }
            } else {
                // Fallback to animated fire ball
                drawAnimatedFireBall(screenX, enemy.y, enemy.width, enemy.height);
            }
            
            // Draw enemy health bar (only on Forest location)
            if (gameState.currentLocation === 1) {
                const healthBarWidth = 60;
                const healthBarHeight = 4;
                const healthBarX = screenX + 10;
                const healthBarY = enemy.y - 10;
                
                // Health bar background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
                
                // Health bar fill
                const healthPercentage = enemy.health / 30; // 30 is max health
                ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
                ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
            }
        }
    });
}

        function drawFriendlyEnemies() {
            friendlyEnemies.forEach(friendlyEnemy => {
                const screenX = friendlyEnemy.x - cameraX;
                
                // Only draw if friendly enemy is visible on screen
                if (screenX > -friendlyEnemy.width && screenX < canvas.width) {
                    // Determine enemy direction based on player position
                    const enemyDirection = player.x > friendlyEnemy.x ? 1 : -1;
                    
                    // Draw friendly enemy sprite (same as regular enemy but with blue tint)
                    if (friendlyEnemy.type === 'fire' && enemySprites.fireEnemy && enemySprites.fireEnemy.complete) {
                        try {
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            ctx.filter = 'hue-rotate(180deg)'; // Blue tint
                            
                            if (enemyDirection === -1) {
                                // Flip enemy horizontally when facing left
                                ctx.scale(-1, 1);
                                ctx.drawImage(enemySprites.fireEnemy, -(screenX + 80), friendlyEnemy.y, 80, 60);
                            } else {
                                // Draw normally when facing right
                                ctx.drawImage(enemySprites.fireEnemy, screenX, friendlyEnemy.y, 80, 60);
                            }
                            ctx.restore();
                        } catch (error) {
                            console.error('Error drawing friendly enemy sprite:', error);
                            // Fallback to blue fire ball
                            drawBlueFireBall(screenX, friendlyEnemy.y, friendlyEnemy.width, friendlyEnemy.height);
                        }
                    } else {
                        // Fallback to blue fire ball
                        drawBlueFireBall(screenX, friendlyEnemy.y, friendlyEnemy.width, friendlyEnemy.height);
                    }
                }
            });
        }

function drawBlueFireBall(screenX, y, width, height) {
    // Outer glow
    ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main blue fire ball
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner blue core
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Blue particles effect
    for (let i = 0; i < 3; i++) {
        const angle = (Date.now() / 100 + i * 120) * Math.PI / 180;
        const particleX = screenX + width/2 + Math.cos(angle) * (width/2 + 3);
        const particleY = y + height/2 + Math.sin(angle) * (width/2 + 3);
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAnimatedFireBall(screenX, y, width, height) {
    // Outer glow
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main fire ball
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner fire core
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Fire particles effect
    for (let i = 0; i < 3; i++) {
        const angle = (Date.now() / 100 + i * 120) * Math.PI / 180;
        const particleX = screenX + width/2 + Math.cos(angle) * (width/2 + 3);
        const particleY = y + height/2 + Math.sin(angle) * (width/2 + 3);
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFireProjectiles() {
    fireProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw fire projectile with trail effect
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2 + 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Main projectile
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire trail particles
            for (let i = 0; i < 2; i++) {
                const trailX = screenX - projectile.velocityX * (i + 1) * 0.5;
                const trailY = projectile.y - projectile.velocityY * (i + 1) * 0.5;
                ctx.fillStyle = `rgba(255, 170, 0, ${0.6 - i * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, 3 - i, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function drawArrowProjectiles() {
    arrowProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw arrow sprite if available
            if (arrowSprite && arrowSprite.complete) {
                try {
                    ctx.save();
                    // Flip arrow based on direction
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(arrowSprite, -(screenX + projectile.width), projectile.y, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(arrowSprite, screenX, projectile.y, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing arrow sprite:', error);
                    // Fallback to colored rectangle
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
                }
            } else {
                // Fallback to colored rectangle
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
            }
        }
    });
}

function drawToxinProjectiles() {
    toxinProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw toxin bullet sprite if available
            if (toxinBulletSprite && toxinBulletSprite.complete) {
                try {
                    ctx.save();
                    // Flip bullet based on direction
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(toxinBulletSprite, -(screenX + projectile.width), projectile.y, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(toxinBulletSprite, screenX, projectile.y, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing toxin bullet sprite:', error);
                    // Fallback to colored rectangle
                    ctx.fillStyle = '#4ecdc4';
                    ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
                }
            } else {
                // Fallback to colored rectangle
                ctx.fillStyle = '#4ecdc4';
                ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
            }
        }
    });
}

function drawOrigamiProjectiles() {
    origamiProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            if (origamiAttackSprite && origamiAttackSprite.complete) {
                try {
                    ctx.save();
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(origamiAttackSprite, -(screenX + projectile.width), projectile.y - 1, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(origamiAttackSprite, screenX, projectile.y - 1, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    ctx.fillStyle = '#ff6b6b';
                    ctx.fillRect(screenX, projectile.y - 1, projectile.width, projectile.height);
                }
            } else {
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(screenX, projectile.y - 1, projectile.width, projectile.height);
            }
        }
    });
}

function drawToxinAttackAnimation() {
    // RADICAL DEBUG: Always draw fire animation for Toxin character
    if (player.character && player.character.name === 'Toxin') {
        const screenX = player.x - cameraX;
        const testY = player.y + player.height / 2 + 5;
        const testX = player.direction > 0 ? screenX + player.width + 25 : screenX - 15;
        
        // Draw fire animation instead of lime rectangle with blinking
        if (toxinAttackSprite && toxinAttackSprite.complete && toxinAttackAnimation.visible) {
            const fireWidth = player.direction > 0 ? 30 : 30; // 30 pixels for both sides
            if (player.direction > 0) {
                // Facing right - flip the sprite horizontally
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(toxinAttackSprite, -testX - fireWidth, testY, fireWidth, 15);
                ctx.restore();
            } else {
                // Facing left - normal sprite
                ctx.drawImage(toxinAttackSprite, testX, testY, fireWidth, 15);
            }
        } else if (!toxinAttackSprite || !toxinAttackSprite.complete) {
            const fireWidth = player.direction > 0 ? 30 : 30; // 30 pixels for both sides
            ctx.fillStyle = 'lime';
            ctx.fillRect(testX, testY, fireWidth, 15);
        }
    }
}

function drawBlueSphereProjectiles() {
    blueSphereProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw blue sphere projectile with glow effect
            ctx.fillStyle = 'rgba(0, 100, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2 + 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Main blue sphere
            ctx.fillStyle = '#0066ff';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner blue core
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Blue trail particles
            for (let i = 0; i < 2; i++) {
                const trailX = screenX - projectile.velocityX * (i + 1) * 0.5;
                const trailY = projectile.y - projectile.velocityY * (i + 1) * 0.5;
                ctx.fillStyle = `rgba(0, 170, 255, ${0.6 - i * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, 3 - i, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function drawSplashScreen() {
    // Always start with black background to avoid green flash
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if loaded
    if (characterSelectionBackgroundImage && characterSelectionBackgroundImage.complete) {
        // Stretch image to cover entire canvas (may distort but covers all green areas)
        ctx.drawImage(characterSelectionBackgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Add a semi-transparent overlay to make text more readable
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw start button image if loaded, otherwise show text
    if (startButtonImage && startButtonImage.complete) {
        // Calculate button position and size - center of screen
        const buttonWidth = 200;
        const buttonHeight = 80;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 - buttonHeight / 2;
        
        // Draw the button image
        ctx.drawImage(startButtonImage, buttonX, buttonY, buttonWidth, buttonHeight);
    } else {
        // Fallback to text if image not loaded
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('START', canvas.width / 2, canvas.height / 2);
    }
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState.currentScreen === 'splash') {
        drawSplashScreen();
    } else if (gameState.currentScreen === 'characterSelect') {
        drawCharacterSelection();
    } else if (gameState.currentScreen === 'game') {
        updatePlayer();
        updateCamera();
        updateUI();
        drawBackground();
        drawEnemies();
        drawFriendlyEnemies();
        drawFireProjectiles();
        drawArrowProjectiles();
        drawToxinProjectiles();
        drawOrigamiProjectiles();
        drawChameleonProjectiles();
        console.log('🎮 About to call drawToxinAttackAnimation');
        drawToxinAttackAnimation();
        console.log('🎮 drawToxinAttackAnimation called');
        drawBlueSphereProjectiles();
        drawPlayer();
        
        // Draw platform indicators for first location
        drawPlatformIndicators(cameraX);
        
        // Draw game over screen if player is dead
        if (gameState.gameOver) {
            drawGameOverScreen();
        }
        updateFade();
        
        // Press T to show all tiles
        if (keys['KeyT']) {
            drawAllTiles();
        }
        
        // Press Y to show new industrial tileset
        if (keys['KeyY']) {
            drawNewIndustrialTiles();
        }
        
        // Press U to show third industrial tileset
        if (keys['KeyU']) {
            drawThirdIndustrialTiles();
        }
        
        // Press O to show fourth industrial tileset (U pack)
        if (keys['KeyO']) {
            drawFourthIndustrialTiles();
        }
        

        
        // Press Y to show sprite 0.3 on B17
        if (keys['KeyY']) {
            drawSprite0_3OnB17(cameraX);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Add canvas click event listener
canvas.addEventListener('click', function(e) {
    console.log('🎯 Canvas clicked! Current screen:', gameState.currentScreen);
    
    if (gameState.currentScreen === 'splash') {
        // Get canvas coordinates
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log('🎯 Splash screen clicked at:', x, y);
        console.log('🎯 Canvas size:', canvas.width, canvas.height);
        console.log('🎯 Click coordinates relative to canvas:', x, y);
        
        // Calculate button area (same as in drawSplashScreen)
        const buttonWidth = 200;
        const buttonHeight = 80;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 - buttonHeight / 2;
        
        // Check if click is within button area
        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            console.log('✅ Click is within button area');
            gameState.currentScreen = 'characterSelect';
            document.getElementById('characterSelect').style.display = 'block';
        } else {
            console.log('❌ Click is outside button area');
        }
    }
});

// Start the game
loadHomeBackground(); // Load home background image
loadForestBackground(); // Load forest background image
loadStreetBackground(); // Load street background image
loadCastleBackground(); // Load castle background image
loadIslandBackground(); // Load island background image
loadPortalBackground(); // Load portal background image
    loadHyperspaceBackground(); // Load hyperspace background image
    loadIndustrialTiles(); // Load industrial tiles for hyperspace
    loadNewIndustrialTiles(); // Load new industrial tileset
    loadThirdIndustrialTiles(); // Load third industrial tileset
    loadFourthIndustrialTiles(); // Load fourth industrial tileset (U pack)
    loadSplashBackground(); // Load splash screen background image
    loadCharacterSelectionBackground(); // Load character selection background image
    loadStartButton(); // Load start button image
    loadZargatesLogo(); // Load ZARGATES logo image
    loadOrigamiCharacter(); // Load Origami character image
    loadTroubCharacter(); // Load Troub character image
    loadToxinCharacter(); // Load Toxin character image
    loadChameleonCharacter(); // Load Chameleon character image
loadOrigamiSprite(); // Load Origami sprite
loadFireEnemySprite(); // Load fire enemy sprite
loadArrowSprite(); // Load arrow sprite for Troub
loadToxinAttackSprite(); // Load Toxin attack animation sprite
loadOrigamiAttackSprite(); // Load Origami attack animation sprite
loadToxinBulletSprite(); // Load Toxin bullet sprite
loadMachineGunSound(); // Load machine gun sound
loadChameleonAttackSprite(); // Load Chameleon attack animation sprite
// Don't initialize enemies at start - they will be added when entering Forest location
gameLoop();

// Character selection screen
function drawCharacterSelection() {
    // Always start with black background to avoid green flash
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if loaded
    if (characterSelectionBackgroundImage && characterSelectionBackgroundImage.complete) {
        // Stretch image to cover entire canvas (may distort but covers all green areas)
        ctx.drawImage(characterSelectionBackgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Add a semi-transparent overlay to make text more readable
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update Origami character image in HTML if loaded
    if (origamiCharacterImage && origamiCharacterImage.complete) {
        const origamiImageElement = document.getElementById('origami-image');
        if (origamiImageElement) {
            origamiImageElement.style.backgroundImage = `url(${origamiCharacterImage.src})`;
        }
    }
    
    // Update Troub character image in HTML if loaded
    if (troubCharacterImage && troubCharacterImage.complete) {
        const troubImageElement = document.getElementById('troub-image');
        if (troubImageElement) {
            troubImageElement.style.backgroundImage = `url(${troubCharacterImage.src})`;
        }
    }
    
    // Update Toxin character image in HTML if loaded
    if (toxinCharacterImage && toxinCharacterImage.complete) {
        const toxinImageElement = document.getElementById('toxin-image');
        if (toxinImageElement) {
            toxinImageElement.style.backgroundImage = `url(${toxinCharacterImage.src})`;
        }
    }
    
    // Update Chameleon character image in HTML if loaded
    if (chameleonCharacterImage && chameleonCharacterImage.complete) {
        const chameleonImageElement = document.getElementById('chameleon-image');
        if (chameleonImageElement) {
            chameleonImageElement.style.backgroundImage = `url(${chameleonCharacterImage.src})`;
        }
    }
}

// Function to draw black sprite 1.2 from first pack on A0-A18 coordinates
function drawBlackSprite1_2OnA0A18(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1; // column 1
    const spriteY = 2; // row 2 (1.2)
    for (let y = 0; y < 19; y++) {
        const screenY = y * tileSize;
        const screenGridX = screenX + 0;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw black sprite 1.2 from first pack on B18-l18 coordinates (включая l18)
function drawBlackSprite1_2OnB18_L18(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1; // column 1
    const spriteY = 2; // row 2 (1.2)
    // B-l = columns 1-37 (B=1, l=37) - покрываем до l18
    for (let col = 1; col <= 37; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 18 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw black sprite 1.2 from first pack on M18 до конца локации
function drawBlackSprite1_2OnM18_L18(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1
    const spriteY = 2; // row 2 (1.2)
    
    // M18 до конца локации (M=12, конец=37)
    const maxCols = Math.floor(1200 / tileSize); // 37 колонок
    for (let col = 12; col < maxCols; col++) { // M=12 до конца
        const screenGridX = screenX + col * tileSize;
        const screenY = 18 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw black sprite 1.2 from first pack on l0-l17 coordinates
function drawBlackSprite1_2OnL0L17(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1
    const spriteY = 2; // row 2 (1.2)
    
    // l0-l17 (l=37, строки 0-17)
    for (let y = 0; y <= 17; y++) {
        const screenY = y * tileSize;
        const screenGridX = screenX + 37 * tileSize; // l = колонка 37
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw black sprite 1.2 from first pack on B0-k0 coordinates
function drawBlackSprite1_2OnB0K0(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1
    const spriteY = 2; // row 2 (1.2)
    
    // B0-k0 (B=1, k=36, строка 0)
    for (let col = 1; col <= 36; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 0 * tileSize; // строка 0
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                industrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 4.0 from new industrial tileset on B1 coordinates
function drawSprite4_0OnB1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 4; // column 4 (спрайт 4.0)
    const spriteY = 0; // row 0 (спрайт 4.0)
    
    // B1 (B=1, 1=1) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 1 * tileSize; // строка 1
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.3 from new industrial tileset on C1-j1 coordinates
function drawSprite1_3OnC1J1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // C1-j1 (C=2, j=35, строка 1)
    for (let col = 2; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 1 * tileSize; // строка 1
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 5.0 from new industrial tileset on k1 coordinates
function drawSprite5_0OnK1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 5; // column 5 (спрайт 5.0)
    const spriteY = 0; // row 0 (спрайт 5.0)
    
    // k1 (k=36, 1=1) - одна клетка
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 1 * tileSize; // строка 1
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 4.1 from new industrial tileset on B2-B14 coordinates
function drawSprite4_1OnB2B14(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 4; // column 4 (спрайт 4.1)
    const spriteY = 1; // row 1 (спрайт 4.1)
    
    // B2-B14 (B=1, строки 2-14) - вертикальный столбец
    for (let row = 2; row <= 14; row++) {
        const screenGridX = screenX + 1 * tileSize; // B = колонка 1
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.2 from new industrial tileset on B16-F16 coordinates
function drawSprite1_2OnB16F16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.2)
    const spriteY = 2; // row 2 (спрайт 1.2)
    
    // B16-F16 (B=1, F=5, строка 16) - горизонтальная линия
    for (let col = 1; col <= 5; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 16 * tileSize; // строка 16
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.2 from new industrial tileset on B17-F17 coordinates
function drawSprite1_2OnB17F17(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.2)
    const spriteY = 2; // row 2 (спрайт 1.2)
    
    // B17-F17 (B=1, F=5, строка 17) - горизонтальная линия
    for (let col = 1; col <= 5; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 17 * tileSize; // строка 17
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 4.3 from new industrial tileset on B1-B14 coordinates
function drawSprite4_3OnB1B14(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 4; // column 4 (спрайт 4.3)
    const spriteY = 3; // row 3 (спрайт 4.3)
    
    // B1-B14 (B=1, строки 1-14) - вертикальный столбец
    for (let row = 1; row <= 14; row++) {
        const screenGridX = screenX + 1 * tileSize; // B = колонка 1
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}





// Function to draw sprite 1.3 from new industrial tileset on H17-j17 coordinates
function drawSprite1_3OnH17J17(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // H17-j17 (H=7, j=35, строка 17) - горизонтальная линия
    for (let col = 7; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 17 * tileSize; // строка 17
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}



// Function to draw sprite 1.0 from new industrial tileset on H16-j16 coordinates
function drawSprite1_0OnH16J16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // H16-j16 (H=7, j=35, строка 16) - горизонтальная линия
    for (let col = 7; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 16 * tileSize; // строка 16
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}







// Function to draw sprite 2.2 from new industrial tileset on B15 coordinates
function drawSprite2_2OnB15(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.2)
    const spriteY = 2; // row 2 (спрайт 2.2)
    
    // B15 (B=1, 15=15) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 4.1 from new industrial tileset on B16 coordinates
function drawSprite4_1OnB16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 4; // column 4 (спрайт 4.1)
    const spriteY = 1; // row 1 (спрайт 4.1)
    
    // B16 (B=1, 16=16) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 16 * tileSize; // строка 16
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.1 from new industrial tileset on C16 coordinates
function drawSprite1_1OnC16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.1)
    const spriteY = 1; // row 1 (спрайт 1.1)
    
    // C16 (C=2, 16=16) - одна клетка
    const screenGridX = screenX + 2 * tileSize; // C = колонка 2
    const screenY = 16 * tileSize; // строка 16
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from new industrial tileset on D16-G16 coordinates
function drawSprite1_0OnD16G16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // D16-G16 (D=3, G=6, строка 16) - горизонтальная линия
    for (let col = 3; col <= 6; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 16 * tileSize; // строка 16
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.3 from new industrial tileset on C17-G17 coordinates
function drawSprite1_3OnC17G17(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // C17-G17 (C=2, G=6, строка 17) - горизонтальная линия
    for (let col = 2; col <= 6; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 17 * tileSize; // строка 17
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}















// Function to draw sprite 0.3 from new industrial tileset on B17 coordinates
function drawSprite0_3OnB17(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.3)
    const spriteY = 3; // row 3 (спрайт 0.3)
    
    // B17 (B=1, 17=17) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.3 from new industrial tileset on k17 coordinates
function drawSprite2_3OnK17(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.3)
    const spriteY = 3; // row 3 (спрайт 2.3)
    
    // k17 (k=36, 17=17) - одна клетка около портала
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from new industrial tileset on k16 coordinates
function drawSprite2_0OnK16(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // k16 (k=36, 16=16) - одна клетка
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 16 * tileSize; // строка 16
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 4.0 from new industrial tileset on B1 coordinates
function drawSprite4_0OnB1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 4; // column 4 (спрайт 4.0)
    const spriteY = 0; // row 0 (спрайт 4.0)
    
    // B1 (B=1, 1=1) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 1 * tileSize; // строка 1
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.2 from new industrial tileset on M1-W1 coordinates
function drawSprite1_2OnM1W1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.2)
    const spriteY = 2; // row 2 (спрайт 1.2)
    
    // M1-W1 (M=12, W=22, строка 1) - горизонтальная линия
    for (let col = 12; col <= 22; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 1 * tileSize; // строка 1
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.3 from new industrial tileset on M1-W1 coordinates
function drawSprite1_3OnM1W1(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // M1-W1 (M=12, W=22, строка 1) - горизонтальная линия
    for (let col = 12; col <= 22; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 1 * tileSize; // строка 1
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.2 from new industrial tileset on M2-W2 coordinates


// Function to draw sprite 3.2 from third industrial tileset (T) on Y16 coordinates
function drawSprite3_2OnY16(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // Y16 (Y=24, 16=16) - одна клетка
    const screenGridX = screenX + 24 * tileSize; // Y = колонка 24
    const screenY = 16 * tileSize; // строка 16
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.2 from third industrial tileset (T) on Y15 coordinates
function drawSprite3_2OnY15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // Y15 (Y=24, 15=15) - одна клетка
    const screenGridX = screenX + 24 * tileSize; // Y = колонка 24
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.1 from third industrial tileset (T) on Y14 coordinates
function drawSprite3_1OnY14(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.1)
    const spriteY = 1; // row 1 (спрайт 3.1)
    
    // Y14 (Y=24, 14=14) - одна клетка
    const screenGridX = screenX + 24 * tileSize; // Y = колонка 24
    const screenY = 14 * tileSize; // строка 14
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 5.1 from third industrial tileset (T) on k15 coordinates
function drawSprite5_1OnK15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 5; // column 5 (спрайт 5.1)
    const spriteY = 1; // row 1 (спрайт 5.1)
    
    // k15 (k=36, 15=15) - одна клетка (маленькая k)
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.3 from third industrial tileset (T) on Y17 coordinates
function drawSprite3_3OnY17(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.3)
    const spriteY = 3; // row 3 (спрайт 3.3)
    
    // Y17 (Y=24, 17=17) - одна клетка
    const screenGridX = screenX + 24 * tileSize; // Y = колонка 24
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.0 from third industrial tileset (T) on Z15 coordinates
function drawSprite0_0OnZ15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // Z15 (Z=25, 15=15) - одна клетка
    const screenGridX = screenX + 25 * tileSize; // Z = колонка 25
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from third industrial tileset (T) on a15 coordinates
function drawSprite1_0OnA15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // a15 (a=26, 15=15) - одна клетка (маленькая a)
    const screenGridX = screenX + 26 * tileSize; // a = колонка 26
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from third industrial tileset (T) on b15 coordinates
function drawSprite2_0OnB15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // b15 (b=27, 15=15) - одна клетка (маленькая b)
    const screenGridX = screenX + 27 * tileSize; // b = колонка 27
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.1 from third industrial tileset (T) on d15-j15 coordinates
function drawSprite1_1OnD15J15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.1)
    const spriteY = 1; // row 1 (спрайт 1.1)
    
    // d15-j15 (d=29, j=35, строка 15) - горизонтальная линия
    for (let col = 29; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 15 * tileSize; // строка 15
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 0.2 from third industrial tileset (T) on k14 coordinates
function drawSprite0_2OnK14(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.2)
    const spriteY = 2; // row 2 (спрайт 0.2)
    
    // k14 (k=36, 14=14) - одна клетка (маленькая k)
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 14 * tileSize; // строка 14
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.1 from third industrial tileset (T) on k13 coordinates
function drawSprite0_1OnK13(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.1)
    const spriteY = 1; // row 1 (спрайт 0.1)
    
    // k13 (k=36, 13=13) - одна клетка (маленькая k)
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 13 * tileSize; // строка 13
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.1 from third industrial tileset (T) on c15 coordinates
function drawSprite0_1OnC15(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.1)
    const spriteY = 1; // row 1 (спрайт 0.1)
    
    // c15 (c=28, 15=15) - одна клетка (маленькая c)
    const screenGridX = screenX + 28 * tileSize; // c = колонка 28
    const screenY = 15 * tileSize; // строка 15
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.1 from third industrial tileset (T) on e5 coordinates
function drawSprite0_1OnE5(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.1)
    const spriteY = 1; // row 1 (спрайт 0.1)
    
    // e5 (e=30, 5=5) - одна клетка (маленькая e)
    const screenGridX = screenX + 30 * tileSize; // e = колонка 30
    const screenY = 5 * tileSize; // строка 5
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.3 from third industrial tileset (T) on e6 coordinates
function drawSprite0_3OnE6(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.3)
    const spriteY = 3; // row 3 (спрайт 0.3)
    
    // e6 (e=30, 6=6) - одна клетка (маленькая e)
    const screenGridX = screenX + 30 * tileSize; // e = колонка 30
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.3 from third industrial tileset (T) on f6-j6 coordinates
function drawSprite1_3OnF6J6(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // f6-j6 (f=31, j=35, строка 6) - горизонтальная линия
    for (let col = 31; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 6 * tileSize; // строка 6
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.3 from third industrial tileset (T) on k6 coordinates
function drawSprite2_3OnK6(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.3)
    const spriteY = 3; // row 3 (спрайт 2.3)
    
    // k6 (k=36, 6=6) - одна клетка (маленькая k)
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.1 from third industrial tileset (T) on f5-j5 coordinates
function drawSprite1_1OnF5J5(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.1)
    const spriteY = 1; // row 1 (спрайт 1.1)
    
    // f5-j5 (f=31, j=35, строка 5) - горизонтальная линия
    for (let col = 31; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 5 * tileSize; // строка 5
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.1 from third industrial tileset (T) on k5 coordinates
function drawSprite2_1OnK5(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.1)
    const spriteY = 1; // row 1 (спрайт 2.1)
    
    // k5 (k=36, 5=5) - одна клетка (маленькая k)
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 5 * tileSize; // строка 5
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.2 from third industrial tileset (T) on O2 coordinates
function drawSprite0_2OnO2(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.2)
    const spriteY = 2; // row 2 (спрайт 0.2)
    
    // O2 (O=14, 2=2) - одна клетка
    const screenGridX = screenX + 14 * tileSize; // O = колонка 14
    const screenY = 2 * tileSize; // строка 2
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.3 from third industrial tileset (T) on O3 coordinates
function drawSprite0_3OnO3(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.3)
    const spriteY = 3; // row 3 (спрайт 0.3)
    
    // O3 (O=14, 3=3) - одна клетка
    const screenGridX = screenX + 14 * tileSize; // O = колонка 14
    const screenY = 3 * tileSize; // строка 3
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.1 from third industrial tileset (T) on P3-Y3 coordinates
function drawSprite1_3OnP3Y3(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // P3-Y3 (P=15, Y=24, строка 3) - горизонтальная линия
    for (let col = 15; col <= 24; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 3 * tileSize; // строка 3
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.2 from third industrial tileset (T) on P2-Y2 coordinates
function drawSprite1_3OnP2Y2(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // P2-Y2 (P=15, Y=24, строка 2) - горизонтальная линия
    for (let col = 15; col <= 24; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 2 * tileSize; // строка 2
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.2 from third industrial tileset (T) on Z2 coordinates
function drawSprite2_2OnZ2(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.2)
    const spriteY = 2; // row 2 (спрайт 2.2)
    
    // Z2 (Z=25, 2=2) - одна клетка
    const screenGridX = screenX + 25 * tileSize; // Z = колонка 25
    const screenY = 2 * tileSize; // строка 2
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.3 from third industrial tileset (T) on Z3 coordinates
function drawSprite2_3OnZ3(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.3)
    const spriteY = 3; // row 3 (спрайт 2.3)
    
    // Z3 (Z=25, 3=3) - одна клетка
    const screenGridX = screenX + 25 * tileSize; // Z = колонка 25
    const screenY = 3 * tileSize; // строка 3
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 5.3 from third industrial tileset (T) on W3 coordinates
function drawSprite5_3OnW3(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 5; // column 5 (спрайт 5.3)
    const spriteY = 3; // row 3 (спрайт 5.3)
    
    // W3 (W=22, 3=3) - одна клетка
    const screenGridX = screenX + 22 * tileSize; // W = колонка 22
    const screenY = 3 * tileSize; // строка 3
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.2 from third industrial tileset (T) on W4-W8 coordinates
function drawSprite3_2OnW4W8(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // W4-W8 (W=22, строки 4-8) - вертикальная линия
    for (let row = 4; row <= 8; row++) {
        const screenGridX = screenX + 22 * tileSize; // W = колонка 22
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 3.2 from third industrial tileset (T) on W9 coordinates
function drawSprite3_2OnW9(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // W9 (W=22, 9=9) - одна клетка
    const screenGridX = screenX + 22 * tileSize; // W = колонка 22
    const screenY = 9 * tileSize; // строка 9
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 5.2 from third industrial tileset (T) on W10 coordinates
function drawSprite5_2OnW10(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 5; // column 5 (спрайт 5.2)
    const spriteY = 2; // row 2 (спрайт 5.2)
    
    // W10 (W=22, 10=10) - одна клетка
    const screenGridX = screenX + 22 * tileSize; // W = колонка 22
    const screenY = 10 * tileSize; // строка 10
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from third industrial tileset (T) on X10-b10 coordinates
function drawSprite1_0OnX10B10(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // X10-b10 (X=23, b=27, строка 10) - горизонтальная линия
    for (let col = 23; col <= 27; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 10 * tileSize; // строка 10
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.0 from third industrial tileset (T) on c10 coordinates
function drawSprite2_0OnC10(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // c10 (c=28, 10=10) - одна клетка (маленькая c)
    const screenGridX = screenX + 28 * tileSize; // c = колонка 28
    const screenY = 10 * tileSize; // строка 10
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from third industrial tileset (T) on R10-V10 coordinates
function drawSprite1_0OnR10V10(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // R10-V10 (R=17, V=21, строка 10) - горизонтальная линия
    for (let col = 17; col <= 21; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 10 * tileSize; // строка 10
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                thirdIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 0.0 from third industrial tileset (T) on Q10 coordinates
function drawSprite0_0OnQ10(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // Q10 (Q=16, 10=10) - одна клетка
    const screenGridX = screenX + 16 * tileSize; // Q = колонка 16
    const screenY = 10 * tileSize; // строка 10
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.1 from third industrial tileset (T) on f11 coordinates
function drawSprite0_1OnF11(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.1)
    const spriteY = 1; // row 1 (спрайт 0.1)
    
    // f11 (f=31, 11=11) - одна клетка (маленькая f)
    const screenGridX = screenX + 31 * tileSize; // f = колонка 31
    const screenY = 11 * tileSize; // строка 11
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.3 from third industrial tileset (T) on f12 coordinates
function drawSprite0_3OnF12(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.3)
    const spriteY = 3; // row 3 (спрайт 0.3)
    
    // f12 (f=31, 12=12) - одна клетка (маленькая f)
    const screenGridX = screenX + 31 * tileSize; // f = колонка 31
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.1 from third industrial tileset (T) on g11 coordinates
function drawSprite1_1OnG11(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.1)
    const spriteY = 1; // row 1 (спрайт 1.1)
    
    // g11 (g=32, 11=11) - одна клетка (маленькая g)
    const screenGridX = screenX + 32 * tileSize; // g = колонка 32
    const screenY = 11 * tileSize; // строка 11
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.3 from third industrial tileset (T) on g12 coordinates
function drawSprite1_3OnG12(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.3)
    const spriteY = 3; // row 3 (спрайт 1.3)
    
    // g12 (g=32, 12=12) - одна клетка (маленькая g)
    const screenGridX = screenX + 32 * tileSize; // g = колонка 32
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.1 from third industrial tileset (T) on h11 coordinates
function drawSprite2_1OnH11(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.1)
    const spriteY = 1; // row 1 (спрайт 2.1)
    
    // h11 (h=33, 11=11) - одна клетка (маленькая h)
    const screenGridX = screenX + 33 * tileSize; // h = колонка 33
    const screenY = 11 * tileSize; // строка 11
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.3 from third industrial tileset (T) on h12 coordinates
function drawSprite2_3OnH12(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.3)
    const spriteY = 3; // row 3 (спрайт 2.3)
    
    // h12 (h=33, 12=12) - одна клетка (маленькая h)
    const screenGridX = screenX + 33 * tileSize; // h = колонка 33
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to check sprite 1.2 collisions
function checkSprite1_2Collisions(playerX, playerY, playerWidth, playerHeight, currentLocation) {
    // DISABLED - This function was creating hidden platforms
    // Now using the new collision system instead
    return false; // No collision
}

// Function to check sprite collisions for player
function checkSpriteCollisions(playerX, playerY, playerWidth, playerHeight, currentLocation) {
    const tileSize = 32;
    const locationStart = currentLocation * LOCATION_WIDTH;
    
    // Only check collisions for "Дом" location (first location)
    if (currentLocation === 0) {
        // Define collision areas
        const collisionAreas = [
            // B1-B16 wall - completely blocked
            { x: 1, y: 1, width: 1, height: 16, type: 'wall' },
            // B1 to end of map wall - completely blocked
            { x: 1, y: 1, width: 36, height: 1, type: 'wall' },
            // W4-W10 vertical wall - completely blocked
            { x: 22, y: 4, width: 1, height: 7, type: 'wall' },

            // C16-X16 platform - player can stand on this
            { x: 2, y: 16, width: 22, height: 1, type: 'platform' },
            // Z15-j15 platform - player can stand on this
            { x: 25, y: 15, width: 10, height: 1, type: 'platform' },
            // Y14 platform - player can stand on this
            { x: 24, y: 14, width: 1, height: 1, type: 'platform' },
            // Q10-V10 platform - player can stand on this
            { x: 16, y: 10, width: 6, height: 1, type: 'platform' },
            // a10-c10 platform - player can stand on this
            { x: 26, y: 10, width: 3, height: 1, type: 'platform' },
            // X10-Z10 platform - player can stand on this
            { x: 23, y: 10, width: 3, height: 1, type: 'platform' },
            // f11 platform - player can stand on this
            { x: 31, y: 11, width: 1, height: 1, type: 'platform' },
            // g11 platform - player can stand on this
            { x: 32, y: 11, width: 1, height: 1, type: 'platform' },
            // h11 platform - player can stand on this
            { x: 33, y: 11, width: 1, height: 1, type: 'platform' },
            // e5 platform - player can stand on this
            { x: 30, y: 5, width: 1, height: 1, type: 'platform' },
            // f5 platform - player can stand on this
            { x: 31, y: 5, width: 1, height: 1, type: 'platform' },
            // g5 platform - player can stand on this
            { x: 32, y: 5, width: 1, height: 1, type: 'platform' },
            // h5 platform - player can stand on this
            { x: 33, y: 5, width: 1, height: 1, type: 'platform' },
            // i5 platform - player can stand on this
            { x: 34, y: 5, width: 1, height: 1, type: 'platform' },
            // j5 platform - player can stand on this
            { x: 35, y: 5, width: 1, height: 1, type: 'platform' },
            // k5 platform - player can stand on this
            { x: 36, y: 5, width: 1, height: 1, type: 'platform' },
            // Y15 platform - player can stand on this
            { x: 24, y: 15, width: 1, height: 1, type: 'platform' },
            // M12 platform - player can stand on this
            { x: 12, y: 12, width: 1, height: 1, type: 'platform' },
            // N12 platform - player can stand on this
            { x: 13, y: 12, width: 1, height: 1, type: 'platform' },
            // O12 platform - player can stand on this
            { x: 14, y: 12, width: 1, height: 1, type: 'platform' },
            // I14 platform - player can stand on this
            { x: 8, y: 14, width: 1, height: 1, type: 'platform' },
            // J14 platform - player can stand on this
            { x: 9, y: 14, width: 1, height: 1, type: 'platform' },
            // K14 platform - player can stand on this
            { x: 10, y: 14, width: 1, height: 1, type: 'platform' },
            // C7 platform - player can stand on this
            { x: 2, y: 7, width: 1, height: 1, type: 'platform' },
            // D7-N7 platform - player can stand on this
            { x: 3, y: 7, width: 11, height: 1, type: 'platform' },
            // O7 platform - player can stand on this
            { x: 14, y: 7, width: 1, height: 1, type: 'platform' },
            // b7 platform - player can stand on this
            { x: 27, y: 7, width: 1, height: 1, type: 'platform' },
            // c7 platform - player can stand on this
            { x: 28, y: 7, width: 1, height: 1, type: 'platform' },
                        // k13 platform - player can stand on this
            { x: 36, y: 13, width: 1, height: 1, type: 'platform' },
            // k14 platform - player can stand on this
            { x: 36, y: 14, width: 1, height: 1, type: 'platform' },
            // k14 platform - player can stand on this
            { x: 36, y: 15, width: 1, height: 1, type: 'platform' },
            // j15 platform - player can stand on this
            { x: 35, y: 15, width: 1, height: 1, type: 'platform' },
            // k15 platform - player can stand on this
            { x: 36, y: 15, width: 1, height: 1, type: 'platform' }
        ];
        
        // Check each collision area
        for (const area of collisionAreas) {
            const areaX = locationStart + area.x * tileSize;
            const areaY = area.y * tileSize;
            const areaWidth = area.width * tileSize;
            const areaHeight = area.height * tileSize;
            
            // Simple AABB collision detection
            if (playerX < areaX + areaWidth &&
                playerX + playerWidth > areaX &&
                playerY < areaY + areaHeight &&
                playerY + playerHeight > areaY) {
                
                console.log('🚫 COLLISION DETECTED!', {
                    playerX, playerY, playerWidth, playerHeight,
                    areaX, areaY, areaWidth, areaHeight,
                    area: area
                });
                
                if (area.type === 'platform') {
                    // Platform collision - player can stand on it
                    return { collision: true, type: 'platform', y: areaY - playerHeight };
                } else if (area.type === 'wall') {
                    // Wall collision - completely blocked
                    return { collision: true, type: 'blocked' };
                }
            }
        }
    }
    
    return { collision: false };
} 

// Function to draw platform indicators for the first location
function drawPlatformIndicators(screenX) {
    if (gameState.currentLocation !== 0) return; // Only for "Дом" location
    
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    
    // Save current context state
    ctx.save();
    
    // Set semi-transparent green color for platforms
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    
    // Define all platforms where player can stand
    const platforms = [
        // C16-X16 platform (horizontal) - player can stand on this
        { x: 2, y: 16, width: 22, height: 1 },
        // Z15-j15 platform - player can stand on this
        { x: 25, y: 15, width: 10, height: 1 },
        // Y14 platform - player can stand on this
        { x: 24, y: 14, width: 1, height: 1 },
        // Q10-V10 platform - player can stand on this
        { x: 16, y: 10, width: 6, height: 1 },
        // a10-c10 platform - player can stand on this
        { x: 26, y: 10, width: 3, height: 1 },
        // X10-Z10 platform - player can stand on this
        { x: 23, y: 10, width: 3, height: 1 },
        // f11 platform - player can stand on this
        { x: 31, y: 11, width: 1, height: 1 },
        // g11 platform - player can stand on this
        { x: 32, y: 11, width: 1, height: 1 },
        // h11 platform - player can stand on this
        { x: 33, y: 11, width: 1, height: 1 },
        // e5 platform - player can stand on this
        { x: 30, y: 5, width: 1, height: 1 },
        // f5 platform - player can stand on this
        { x: 31, y: 5, width: 1, height: 1 },
        // g5 platform - player can stand on this
        { x: 32, y: 5, width: 1, height: 1 },
        // h5 platform - player can stand on this
        { x: 33, y: 5, width: 1, height: 1 },
        // i5 platform - player can stand on this
        { x: 34, y: 5, width: 1, height: 1 },
        // j5 platform - player can stand on this
        { x: 35, y: 5, width: 1, height: 1 },
        // k5 platform - player can stand on this
        { x: 36, y: 5, width: 1, height: 1 },
        // Y15 platform - player can stand on this
        { x: 24, y: 15, width: 1, height: 1 },
        // M12 platform - player can stand on this
        { x: 12, y: 12, width: 1, height: 1 },
        // N12 platform - player can stand on this
        { x: 13, y: 12, width: 1, height: 1 },
        // O12 platform - player can stand on this
        { x: 14, y: 12, width: 1, height: 1 },
        // I14 platform - player can stand on this
        { x: 8, y: 14, width: 1, height: 1 },
        // J14 platform - player can stand on this
        { x: 9, y: 14, width: 1, height: 1 },
        // K14 platform - player can stand on this
        { x: 10, y: 14, width: 1, height: 1 },
        // C7 platform - player can stand on this
        { x: 2, y: 7, width: 1, height: 1 },
        // D7-N7 platform - player can stand on this
        { x: 3, y: 7, width: 11, height: 1 },
        // O7 platform - player can stand on this
        { x: 14, y: 7, width: 1, height: 1 },
        // b7 platform - player can stand on this
        { x: 27, y: 7, width: 1, height: 1 },
        // c7 platform - player can stand on this
        { x: 28, y: 7, width: 1, height: 1 },
                // k13 platform - player can stand on this
        { x: 36, y: 13, width: 1, height: 1 },
        // k14 platform - player can stand on this
        { x: 36, y: 14, width: 1, height: 1 },
        // k14 platform - player can stand on this
        { x: 36, y: 15, width: 1, height: 1 },
        // j15 platform - player can stand on this
        { x: 35, y: 15, width: 1, height: 1 },
        // k15 platform - player can stand on this
        { x: 36, y: 15, width: 1, height: 1 }
    ];
    
    // Draw each platform
    for (const platform of platforms) {
        const x = screenX + platform.x * tileSize;
        const y = platform.y * tileSize;
        const width = platform.width * tileSize;
        const height = platform.height * tileSize;
        
        ctx.fillRect(x, y, width, height);
        
        // Debug: log platform positions
        console.log('🟢 Platform drawn:', { x, y, width, height, screenX, platform });
    }
    
    // Draw wall blocks in red to show they are blocked
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    const wallBlocks = [
        // B1-B16 wall blocks
        { x: 1, y: 1, width: 1, height: 1 },
        { x: 1, y: 2, width: 1, height: 1 },
        { x: 1, y: 3, width: 1, height: 1 },
        { x: 1, y: 4, width: 1, height: 1 },
        { x: 1, y: 5, width: 1, height: 1 },
        { x: 1, y: 6, width: 1, height: 1 },
        { x: 1, y: 7, width: 1, height: 1 },
        { x: 1, y: 8, width: 1, height: 1 },
        { x: 1, y: 9, width: 1, height: 1 },
        { x: 1, y: 10, width: 1, height: 1 },
        { x: 1, y: 11, width: 1, height: 1 },
        { x: 1, y: 12, width: 1, height: 1 },
        { x: 1, y: 13, width: 1, height: 1 },
        { x: 1, y: 14, width: 1, height: 1 },
        { x: 1, y: 15, width: 1, height: 1 },
        { x: 1, y: 16, width: 1, height: 1 },
        // B1 to end of map wall blocks
        { x: 1, y: 1, width: 1, height: 1 },
        { x: 2, y: 1, width: 1, height: 1 },
        { x: 3, y: 1, width: 1, height: 1 },
        { x: 4, y: 1, width: 1, height: 1 },
        { x: 5, y: 1, width: 1, height: 1 },
        { x: 6, y: 1, width: 1, height: 1 },
        { x: 7, y: 1, width: 1, height: 1 },
        { x: 8, y: 1, width: 1, height: 1 },
        { x: 9, y: 1, width: 1, height: 1 },
        { x: 10, y: 1, width: 1, height: 1 },
        { x: 11, y: 1, width: 1, height: 1 },
        { x: 12, y: 1, width: 1, height: 1 },
        { x: 13, y: 1, width: 1, height: 1 },
        { x: 14, y: 1, width: 1, height: 1 },
        { x: 15, y: 1, width: 1, height: 1 },
        { x: 16, y: 1, width: 1, height: 1 },
        { x: 17, y: 1, width: 1, height: 1 },
        { x: 18, y: 1, width: 1, height: 1 },
        { x: 19, y: 1, width: 1, height: 1 },
        { x: 20, y: 1, width: 1, height: 1 },
        { x: 21, y: 1, width: 1, height: 1 },
        { x: 22, y: 1, width: 1, height: 1 },
        { x: 23, y: 1, width: 1, height: 1 },
        { x: 24, y: 1, width: 1, height: 1 },
        { x: 25, y: 1, width: 1, height: 1 },
        { x: 26, y: 1, width: 1, height: 1 },
        { x: 27, y: 1, width: 1, height: 1 },
        { x: 28, y: 1, width: 1, height: 1 },
        { x: 29, y: 1, width: 1, height: 1 },
        { x: 30, y: 1, width: 1, height: 1 },
        { x: 31, y: 1, width: 1, height: 1 },
        { x: 32, y: 1, width: 1, height: 1 },
        { x: 33, y: 1, width: 1, height: 1 },
        { x: 34, y: 1, width: 1, height: 1 },
        { x: 35, y: 1, width: 1, height: 1 },
        { x: 36, y: 1, width: 1, height: 1 },
        // W4-W10 vertical wall blocks
        { x: 22, y: 4, width: 1, height: 1 },
        { x: 22, y: 5, width: 1, height: 1 },
        { x: 22, y: 6, width: 1, height: 1 },
        { x: 22, y: 7, width: 1, height: 1 },
        { x: 22, y: 8, width: 1, height: 1 },
        { x: 22, y: 9, width: 1, height: 1 },
        { x: 22, y: 10, width: 1, height: 1 }
    ];
    
    for (const block of wallBlocks) {
        const x = screenX + block.x * tileSize;
        const y = block.y * tileSize;
        const width = block.width * tileSize;
        const height = block.height * tileSize;
        
        ctx.fillRect(x, y, width, height);
    }
    
    // Restore context state
    ctx.restore();
}

function loadChameleonAttackSprite() {
    console.log('🔄 Starting to load Chameleon attack sprite...');
    chameleonAttackSprite = new Image();
    chameleonAttackSprite.crossOrigin = 'anonymous';
    chameleonAttackSprite.onload = function() {
        console.log('✅ Chameleon attack sprite loaded successfully!');
        console.log('Sprite dimensions:', chameleonAttackSprite.width, 'x', chameleonAttackSprite.height);
        console.log('Sprite complete status:', chameleonAttackSprite.complete);
    };
    chameleonAttackSprite.onerror = function() {
        console.error('❌ Failed to load Chameleon attack sprite!');
        console.error('Error details:', chameleonAttackSprite.src);
    };
    chameleonAttackSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreies4udpli5erj45fylfmnhoyr7nsbzbvlpu2pqs77lh2vl6vpqtqu';
    console.log('🔄 Loading Chameleon attack sprite from:', chameleonAttackSprite.src);
    console.log('🔄 Initial complete status:', chameleonAttackSprite.complete);
}

function drawChameleonProjectiles() {
    chameleonProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        if (screenX > -projectile.width && screenX < canvas.width) {
            if (chameleonAttackSprite && chameleonAttackSprite.complete) {
                try {
                    ctx.save();
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(chameleonAttackSprite, -(screenX + projectile.width), projectile.y + 1.5, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(chameleonAttackSprite, screenX, projectile.y + 1.5, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    ctx.fillStyle = '#00e6e6';
                    ctx.fillRect(screenX, projectile.y + 1.5, projectile.width, projectile.height);
                }
            } else {
                ctx.fillStyle = '#00e6e6';
                ctx.fillRect(screenX, projectile.y + 1.5, projectile.width, projectile.height);
            }
        }
    });
}

// Function to draw sprite 0.0 from new industrial tileset on M12 coordinates
function drawSprite0_0OnM12(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // M12 (M=12, 12=12) - одна клетка
    const screenGridX = screenX + 12 * tileSize; // M = колонка 12
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from new industrial tileset on N12 coordinates
function drawSprite1_0OnN12(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // N12 (N=13, 12=12) - одна клетка
    const screenGridX = screenX + 13 * tileSize; // N = колонка 13
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from new industrial tileset on O12 coordinates
function drawSprite2_0OnO12(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // O12 (O=14, 12=12) - одна клетка
    const screenGridX = screenX + 14 * tileSize; // O = колонка 14
    const screenY = 12 * tileSize; // строка 12
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.0 from new industrial tileset on I14 coordinates
function drawSprite0_0OnI14(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // I14 (I=8, 14=14) - одна клетка
    const screenGridX = screenX + 8 * tileSize; // I = колонка 8
    const screenY = 14 * tileSize; // строка 14
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from new industrial tileset on J14 coordinates
function drawSprite1_0OnJ14(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // J14 (J=9, 14=14) - одна клетка
    const screenGridX = screenX + 9 * tileSize; // J = колонка 9
    const screenY = 14 * tileSize; // строка 14
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from new industrial tileset on K14 coordinates
function drawSprite2_0OnK14(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // K14 (K=10, 14=14) - одна клетка
    const screenGridX = screenX + 10 * tileSize; // K = колонка 10
    const screenY = 14 * tileSize; // строка 14
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.0 from new industrial tileset on C7 coordinates
function drawSprite0_0OnC7(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // C7 (C=2, 7=7) - одна клетка
    const screenGridX = screenX + 2 * tileSize; // C = колонка 2
    const screenY = 7 * tileSize; // строка 7
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from new industrial tileset on D7-N7 coordinates
function drawSprite1_0OnD7N7(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // D7-N7 (D=3, N=13, 7=7) - горизонтальная линия
    for (let col = 3; col <= 13; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 7 * tileSize; // строка 7
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                newIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.0 from new industrial tileset on O7 coordinates
function drawSprite2_0OnO7(screenX) {
    if (!newIndustrialTilesSprite || !newIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // O7 (O=14, 7=7) - одна клетка
    const screenGridX = screenX + 14 * tileSize; // O = колонка 14
    const screenY = 7 * tileSize; // строка 7
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            newIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 0.0 from third industrial tileset on b7 coordinates
function drawSprite0_0OnB7(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // b7 (b=27, 7=7) - одна клетка
    const screenGridX = screenX + 27 * tileSize; // b = колонка 27
    const screenY = 7 * tileSize; // строка 7
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from third industrial tileset on c7 coordinates
function drawSprite2_0OnC7(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // c7 (c=28, 7=7) - одна клетка
    const screenGridX = screenX + 28 * tileSize; // c = колонка 28
    const screenY = 7 * tileSize; // строка 7
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

