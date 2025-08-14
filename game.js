// ZARGATES GAME - BASIC VERSION
let canvas, ctx;

// Initialize canvas and context safely
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return false;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Unable to get 2D context!');
        return false;
    }
    return true;
}

// Game variables
let gameState = {
    currentScreen: 'splash',
    selectedCharacter: null,
    score: 0,
    health: 100,
    hits: 0,
    // Special abilities removed
    currentLocation: 0,
    gameOver: false,
    gameWon: false,
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

// Chameleon camouflage ability variables
let chameleonCamouflage = {
    active: false,
    timer: 0,
    duration: 180, // 3 seconds at 60fps
    usedThisLocation: false, // Track if used in current location
    transparency: 0.3, // 30% opacity when camouflaged
    keyPressed: false // To prevent continuous activation
};

// Troub critical strike ability variables
let troubCriticalStrike = {
    attackCount: 0,
    criticalReady: false,
    criticalActive: false,
    timer: 0,
    duration: 30, // 0.5 seconds at 60fps
    glowIntensity: 0
};



// Toxin rage ability variables
let toxinRage = {
    active: true, // Always active - no need to activate
    baseAttackRate: 25, // Normal attack rate (increased for faster base shooting)
    currentAttackRate: 25,
    rageMultiplier: 2, // Attack speed multiplier when health is low
    // Auto-fire system like Chameleon
    autoFireActive: false,
    autoFireTimer: 0,
    autoFireDelay: 25 // Will be updated by updateToxinRage()
};

// Origami bleeding ability variables
let origamiBleeding = {
    active: true, // Always active
    baseDamage: 5, // Base projectile damage (increased to 5)
    bleedingDamage: 1, // Damage per bleeding tick (back to original)
    bleedingDuration: 120, // 6 seconds (120 frames at 20 FPS)
    bleedingInterval: 40, // 2 seconds (40 frames at 20 FPS)
    bleedingTicks: 3 // Number of bleeding ticks (6 seconds / 2 seconds = 3 ticks)
};

// Global array for active bleeding effects (independent of projectiles)
let activeBleedingEffects = [];

// Bleeding effect class (independent of projectiles)
class BleedingEffect {
    constructor(target) {
        this.target = target;
        this.timer = 0;
        this.tickCount = 0;
    }
    
    update() {
        this.timer++;
        
        // Apply bleeding damage every interval
        if (this.timer >= origamiBleeding.bleedingInterval) {
            if (this.tickCount < origamiBleeding.bleedingTicks) {
                // Apply bleeding damage
                this.target.health -= origamiBleeding.bleedingDamage;
                this.tickCount++;
                this.timer = 0;
                
                // Check if enemy is dead
                if (this.target.health <= 0) {
                    // Remove enemy from enemies array
                    const enemyIndex = enemies.indexOf(this.target);
                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1);
                    }
                    return false; // Remove this bleeding effect
                }
            } else {
                // Bleeding effect finished
                return false; // Remove this bleeding effect
            }
        }
        return true; // Keep this bleeding effect
    }
}

// Sound variables - Toxin sounds removed

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
        attackDamage: 25
        // Special abilities removed
    },
    toxin: {
        name: 'Toxin',
        color: '#4ecdc4',
        attackRange: 200,
        attackDamage: 15
        // Special abilities removed
    },
    chameleon: {
        name: 'Chameleon',
        color: '#45b7d1',
        attackRange: 120,
        attackDamage: 20
        // Special abilities removed
    },
    troub: {
        name: 'Troub',
        color: '#96ceb4',
        attackRange: 300,
        attackDamage: 18
        // Special abilities removed
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
    fireEnemy: null,
    pngEnemy: null,  // PNG enemy for first location
    forestEnemy: null,  // New PNG enemy for Forest location only
    dragon: null  // Dragon enemy sprite
};

// Arrow sprite for Troub
let arrowSprite = null;



// Portal sprite
const portalSprite = new Image();
portalSprite.crossOrigin = 'anonymous';
portalSprite.onload = function() {
    console.log('✅ Portal sprite loaded!');
};
portalSprite.onerror = function() {
    console.error('❌ Failed to load portal sprite!');
};
portalSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreiamlxiktldu5biljkebu2xvrkaolbsvasmspsesvhscg44n5h6rae';

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
    backgroundImages.forest.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.street.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.home.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.castle.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.island.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.portal.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    backgroundImages.hyperspace.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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

// Load O industrial tileset (O pack)
let oIndustrialTilesSprite = null;

// Load T industrial tileset (T pack)
let tIndustrialTilesSprite = null;

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

// Load O industrial tileset (O pack)
function loadOIndustrialTiles() {
    oIndustrialTilesSprite = new Image();
    oIndustrialTilesSprite.crossOrigin = 'anonymous';
    oIndustrialTilesSprite.onload = function() {
        console.log('✅ O Industrial tileset (O) loaded successfully!');
        console.log('📏 O Sprite dimensions:', oIndustrialTilesSprite.width, 'x', oIndustrialTilesSprite.height);
        console.log('🎯 O Total tiles:', Math.floor(oIndustrialTilesSprite.width / 32), 'x', Math.floor(oIndustrialTilesSprite.height / 32));
        
        // Show all available sprites in console
        const tilesX = Math.floor(oIndustrialTilesSprite.width / 32);
        const tilesY = Math.floor(oIndustrialTilesSprite.height / 32);
        console.log('🔍 Available sprites in O pack:');
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                console.log(`Sprite ${x}.${y} (column ${x}, row ${y})`);
            }
        }
        console.log('🎮 O pack ready for use!');
    };
    oIndustrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load O industrial tileset (O)!');
        console.error('🔗 URL:', oIndustrialTilesSprite.src);
    };
    oIndustrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/40f3ac58a8081c4cb2a8505384bd4768586a425d/1_Industrial_Tileset_1C.png';
}

// Load T industrial tileset (T pack) - NEW industrial_tiles.png.png from main branch
function loadTIndustrialTiles() {
    tIndustrialTilesSprite = new Image();
    tIndustrialTilesSprite.crossOrigin = 'anonymous';
    tIndustrialTilesSprite.onload = function() {
        console.log('✅ T Industrial tileset (NEW industrial_tiles.png.png) loaded successfully!');
        console.log('📏 T Sprite dimensions:', tIndustrialTilesSprite.width, 'x', tIndustrialTilesSprite.height);
        console.log('🎯 T Total tiles:', Math.floor(tIndustrialTilesSprite.width / 32), 'x', Math.floor(tIndustrialTilesSprite.height / 32));
        
        // Show all available sprites in console
        const tilesX = Math.floor(tIndustrialTilesSprite.width / 32);
        const tilesY = Math.floor(tIndustrialTilesSprite.height / 32);
        console.log('🔍 Available sprites in T pack:');
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                console.log(`Sprite ${x}.${y} (column ${x}, row ${y})`);
            }
        }
        console.log('🎮 T pack ready for use!');
    };
    tIndustrialTilesSprite.onerror = function() {
        console.error('❌ Failed to load T industrial tileset (T)!');
        console.error('🔗 URL:', tIndustrialTilesSprite.src);
    };
    tIndustrialTilesSprite.src = 'https://raw.githubusercontent.com/AlexOvchi635/Zar/main/industrial_tiles.png.png';
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
    splashBackgroundImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    characterSelectionBackgroundImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
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
    startButtonImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreiefgxgxrkgczne52lepzd6ikpdwjtmpere426turuf5p6gqjw3bhi';
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
    origamiCharacterImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibmpq5fjwhweyuoxr3ki7wj5ss4usv4x7nplbai7xc4m5ylzjlpiq';
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
    troubCharacterImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeifkdtew3jfvjqc7otpsjt5jdywe7ouem43yyird7hhkchsbbiw57q';
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
    toxinCharacterImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeifb3pet4ecuz3okn4qodvkppz5ts46frbxaipiyo6cuw26kfh7zwi';
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
    chameleonCharacterImage.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibbkig57q2ud53qacnbbybnnjhgsoljhgkzz765ggwj3eosrca3eu';
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

// Function to activate chameleon camouflage ability
function activateChameleonCamouflage() {
    if (gameState.selectedCharacter === 'chameleon' && 
        !chameleonCamouflage.active && 
        !chameleonCamouflage.usedThisLocation &&
        !chameleonCamouflage.keyPressed) {
        
        chameleonCamouflage.active = true;
        chameleonCamouflage.timer = chameleonCamouflage.duration;
        chameleonCamouflage.usedThisLocation = true;
        chameleonCamouflage.keyPressed = true;
        
        console.log('🦎 Chameleon camouflage activated! (One use per location)');
    }
}

// Function to handle Troub critical strike
function handleTroubCriticalStrike() {
    if (gameState.selectedCharacter === 'troub') {
        troubCriticalStrike.attackCount++;
        
        // Every 3rd attack is critical
        if (troubCriticalStrike.attackCount % 3 === 0) {
            // This is a critical attack
            troubCriticalStrike.criticalActive = true;
            troubCriticalStrike.timer = 1;
            troubCriticalStrike.criticalReady = false;
            troubCriticalStrike.glowIntensity = 0;
        } else if (troubCriticalStrike.attackCount % 3 === 2) {
            // Next attack will be critical, show glow
            troubCriticalStrike.criticalReady = true;
            troubCriticalStrike.glowIntensity = 1.0;
        } else {
            // Normal attack, no special effects
            troubCriticalStrike.criticalReady = false;
            troubCriticalStrike.glowIntensity = 0;
        }
    }
}



// Function to update Toxin rage mode
function updateToxinRage() {
    if (gameState.selectedCharacter === 'toxin') {
        // Adjust attack rate based on health (3 health total)
        if (gameState.health <= 1) {
            // 1 health or less - maximum rage (8x speed = 4x * 2x)
            toxinRage.currentAttackRate = Math.max(3, Math.floor(toxinRage.baseAttackRate / 8));
            toxinRage.autoFireDelay = toxinRage.currentAttackRate;
        } else if (gameState.health <= 2) {
            // 2 health - high rage (4x speed)
            toxinRage.currentAttackRate = Math.max(5, Math.floor(toxinRage.baseAttackRate / 4));
            toxinRage.autoFireDelay = toxinRage.currentAttackRate;
        } else {
            // 3 health - normal attack rate
            toxinRage.currentAttackRate = toxinRage.baseAttackRate;
            toxinRage.autoFireDelay = toxinRage.currentAttackRate;
        }
        
        // Don't force immediate attack cooldown reset - let it use the new rage rate naturally
        // if (player.character && player.character.name === 'Toxin') {
        //     player.attackCooldown = 0;
        // }
    } else {
        // Reset to normal attack rate when not active
        toxinRage.currentAttackRate = toxinRage.baseAttackRate;
    }
}



// Function to draw sprite 1.1 from first pack on A0-A18 coordinates
function drawSprite1_1OnA0A18(screenX) {
    if (!industrialTilesSprite || !industrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // Sprite 1.1 = column 1, row 1
    const spriteY = 1;
    
    // Calculate visible area to optimize rendering
    const visibleStartY = Math.max(0, Math.floor(-screenX / tileSize));
    const visibleEndY = Math.min(19, Math.ceil((canvas.width - screenX) / tileSize));
    
    // Only draw tiles that are visible on screen
    for (let y = visibleStartY; y < visibleEndY; y++) {
        const screenY = y * tileSize;
        const screenGridX = screenX + 0; // A column = x = 0
        
        // Additional visibility check
        if (screenGridX >= -tileSize && screenGridX <= canvas.width) {
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
         characterSprites.origami.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibmpq5fjwhweyuoxr3ki7wj5ss4usv4x7nplbai7xc4m5ylzjlpiq';
    
    // Load Toxin sprite
    characterSprites.toxin = new Image();
    characterSprites.toxin.crossOrigin = 'anonymous';
    characterSprites.toxin.onload = function() {
        console.log('✅ Toxin sprite loaded successfully!');
    };
    characterSprites.toxin.onerror = function() {
        console.error('❌ Failed to load Toxin sprite!');
    };
    characterSprites.toxin.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeifb3pet4ecuz3okn4qodvkppz5ts46frbxaipiyo6cuw26kfh7zwi';
    
    // Load Chameleon sprite
    characterSprites.chameleon = new Image();
    characterSprites.chameleon.crossOrigin = 'anonymous';
    characterSprites.chameleon.onload = function() {
        console.log('✅ Chameleon sprite loaded successfully!');
    };
    characterSprites.chameleon.onerror = function() {
        console.error('❌ Failed to load Chameleon sprite!');
    };
    characterSprites.chameleon.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibbkig57q2ud53qacnbbybnnjhgsoljhgkzz765ggwj3eosrca3eu';
    
    // Load Troub sprite
    characterSprites.troub = new Image();
    characterSprites.troub.crossOrigin = 'anonymous';
    characterSprites.troub.onload = function() {
        console.log('✅ Troub sprite loaded successfully!');
    };
    characterSprites.troub.onerror = function() {
        console.error('❌ Failed to load Troub sprite!');
    };
    characterSprites.troub.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeifkdtew3jfvjqc7otpsjt5jdywe7ouem43yyird7hhkchsbbiw57q';
     

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
    enemySprites.fireEnemy.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreigssk2uxavmfi67zmcgfjfb47qhsjuwjg4avoq446tsr2qmhzzarq';
}

// Load PNG enemy sprite (for first location)
function loadPngEnemySprite() {
    enemySprites.pngEnemy = new Image();
    enemySprites.pngEnemy.crossOrigin = 'anonymous';
    enemySprites.pngEnemy.onload = function() {
        console.log('✅ PNG enemy sprite loaded successfully!');
    };
    enemySprites.pngEnemy.onerror = function() {
        console.error('❌ Failed to load PNG enemy sprite!');
    };
    enemySprites.pngEnemy.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibrqslzrlvjqiahds5u2xfvfjau6uwk2cgu5sh6m4tjx2o2i7ufru';
}

// Load Forest enemy sprite (for second location only)
function loadForestEnemySprite() {
    enemySprites.forestEnemy = new Image();
    enemySprites.forestEnemy.crossOrigin = 'anonymous';
    enemySprites.forestEnemy.onload = function() {
        console.log('✅ Forest enemy sprite loaded successfully!');
    };
    enemySprites.forestEnemy.onerror = function() {
        console.error('❌ Failed to load Forest enemy sprite!');
    };
    enemySprites.forestEnemy.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeibrqslzrlvjqiahds5u2xfvfjau6uwk2cgu5sh6m4tjx2o2i7ufru';
}

// Load Dragon enemy sprite
function loadDragonEnemySprite() {
    enemySprites.dragon = new Image();
    enemySprites.dragon.crossOrigin = 'anonymous';
    enemySprites.dragon.onload = function() {
        console.log('✅ Dragon enemy sprite loaded successfully!');
    };
    enemySprites.dragon.onerror = function() {
        console.error('❌ Failed to load Dragon enemy sprite!');
    };
    enemySprites.dragon.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafybeib5v5iq66fnklvloajn542vtc3e4moh6qtteifb5w2ouabbezq4ny';
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
    arrowSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreibrxc3vvsn6wnjwx2dzwi7rtlr42p53253ve6ad45i4c54lafc7s4';
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
    toxinAttackSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreidqafobnux4uyqp3yhi7j5qpa74krpwvqy7jkkz6kvrupevhlx7lu';
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
    origamiAttackSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreibriqoyyftazbdlcvlaoa7xw6owxe7ppvr2qb7ge5nq3jo44nukqu';
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
    toxinBulletSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreiccmzsystm4q3sxxkieul3mvsxq7bgr4e27o6qapxyvh4cocw7aze';
}

// loadMachineGunSound function removed - Toxin sounds disabled

// createBeepSound function removed - Toxin sounds disabled

// Enemy class


class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 48;
        this.type = type;
        this.health = type === 'platform_walker' ? 108 : (type === 'dragon' ? 30 : 30); // Dragon: 30 HP, platform_walker: 108 HP (6 hits from Troub), others: 30 HP
        this.attackCooldown = 0;
        this.attackRange = 200;
        this.damage = 5;
        this.speed = this.type === 'platform_walker' ? 0.8 : (this.type === 'dragon' ? 1.0 : 2); // Dragon: medium speed
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = 0;
        this.aimAtPlayer = false;
        this.friendly = false;
        this.glowTimer = 0;
        this.direction = -1; // -1 = left (start facing left)
        this.defaultDirection = -1; // Default direction when idle
        this.lastDirection = -1; // Track last direction for turn detection
        this.activated = this.type !== 'platform_walker' && this.type !== 'dragon'; // platform_walker and dragon start inactive
        this.shooting = false; // New property for shooting
        
        // Add spawn point for platform_walker and dragon enemies
        if (this.type === 'platform_walker' || this.type === 'dragon') {
            this.spawnX = x;
            this.spawnY = y;
            this.returningToSpawn = false;
            this.lastDirection = -1; // Track last direction for turn detection
            this.turnDelay = 0; // Delay shooting after turning
        }
    }
    
    update(player) {
        // Add gravity for platform_walker and dragon enemies (same as player)
        if (this.type === 'platform_walker' || this.type === 'dragon') {
            this.velocityY += 0.8; // Same gravity as player
        }
        
        // Change direction randomly
        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > 120) { // Every 2 seconds
            this.changeDirectionTimer = 0;
            this.aimAtPlayer = Math.random() < 0.3; // 30% chance to aim at player
            
            if (this.type === 'horizontal') {
                // Horizontal movement only
                this.velocityY = 0; // No vertical movement
                if (this.aimAtPlayer) {
                    // Move towards player horizontally
                    const dx = player.x - this.x;
                    this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                    this.direction = dx > 0 ? 1 : -1; // Update direction based on movement
                } else {
                    // Random horizontal movement
                    this.velocityX = (Math.random() > 0.5 ? 1 : -1) * this.speed;
                    this.direction = this.velocityX > 0 ? 1 : -1; // Update direction based on movement
                }
            } else if (this.type === 'platform_walker' || this.type === 'dragon') {
                // Platform walker - moves horizontally on platform
                this.velocityY = 0; // No vertical movement for platform walker
                
                // Check if player is on the same platform
                let platformStart, platformEnd, platformY;
                
                if (gameState.currentLocation === 0) {
                    // Check if this is the Z15-j15 platform enemy
                    const isZ15j15Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (35 * 32))) < 5;
                    
                    if (isZ15j15Enemy) {
                        // Z15-j15 platform enemy (columns 25-35, row 15)
                        platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
                        platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column + 1 tile width
                        platformY = 15 * 32; // Platform Y (row 15)
                    } else {
                        // Fallback (should not happen)
                        platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32);
                        platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (29 * 32);
                        platformY = 10 * 32;
                    }
                            } else if (gameState.currentLocation === 1) {
                // Check if this is the blue zone enemy (R6-b6 platform)
                const isBlueZoneEnemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (20 * 32))) < 5;
                
                // Check if this is the e10 dragon
                const isU10e10Dragon = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (30 * 32))) < 5;
                
                // Check if this is the C15-R15 platform enemy
                const isC15R15Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (3 * 32))) < 5;
                
                if (isBlueZoneEnemy) {
                    // Blue zone enemy on R6-b6 platform (columns 17-27, row 6)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (17 * 32); // R column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (28 * 32); // b column + 1 tile width
                    platformY = 6 * 32; // Platform Y (row 6)
                } else if (isU10e10Dragon) {
                    // e10 dragon platform (fixed position at e10)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (30 * 32); // e column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (31 * 32); // e column + 1 tile width
                    platformY = 10 * 32; // Platform Y (row 10)
                } else if (isC15R15Enemy) {
                    // C15-R15 platform enemy (columns 2-17, row 15)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // C column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // R column + 1 tile width
                    platformY = 15 * 32; // Platform Y (row 15)
                } else {
                    // Original enemy on S16-i16 platform (columns 18-34, row 16)
                platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // S column
                platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32); // i column + 1 tile width
                platformY = 16 * 32; // Platform Y (row 16)
            }
            }
                
                // This logic is now handled in the second block below
                // to properly check shooting zones S12+, S13+, S14+, S15+
                
                // Movement logic is now handled in the second block below
                // to properly check shooting zones S12+, S13+, S14+, S15+
            } else {
                // Normal movement for fire enemies
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
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check sprite collisions for platform_walker and dragon enemies (same as player)
        if (this.type === 'platform_walker' || this.type === 'dragon') {
            const collisionResult = checkSpriteCollisions(this.x, this.y, this.width, this.height, gameState.currentLocation, this.velocityY);
            if (collisionResult.collision && collisionResult.type === 'platform') {
                // Platform collision - enemy can stand on it
                this.y = collisionResult.y;
                this.velocityY = 0;
            }
        }
        
        // Keep within current location bounds
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        
        // Special bounds for horizontal enemies (C6-L6 area)
        if (this.type === 'horizontal') {
            // C column = 2 * 32 = 64, L column = 11 * 32 = 352
            if (this.x < 64) this.x = 64;
            if (this.x > 352 - this.width) this.x = 352 - this.width;
            if (this.y < 50) this.y = 50;
            if (this.y > 400) this.y = 400;
        } else if (this.type === 'platform_walker' || this.type === 'dragon') {
            // Platform walker bounds for platform
            const locationOffset = gameState.currentLocation * LOCATION_WIDTH;
            let platformStart, platformEnd, platformY;
            
            if (gameState.currentLocation === 0) {
                // Check if this is the Z15-j15 platform enemy
                const isZ15j15Enemy = Math.abs(this.spawnX - (locationOffset + (35 * 32))) < 5;
                // Check if this is the X10-c10 dragon
                const isX10c10Dragon = Math.abs(this.spawnX - (locationOffset + (23 * 32))) < 5;
                
                if (isZ15j15Enemy) {
                    // Z15-j15 platform enemy (columns 25-35, row 15)
                    platformStart = locationOffset + (25 * 32); // Z column start
                    platformEnd = locationOffset + (36 * 32); // j column + 1 tile width
                    platformY = 15 * 32; // Platform Y (row 15)
                } else if (isX10c10Dragon) {
                    // X10-c10 platform dragon (columns 23-28, row 10)
                    platformStart = locationOffset + (23 * 32); // X column start
                    platformEnd = locationOffset + (29 * 32); // c column + 1 tile width
                    platformY = 10 * 32; // Platform Y (row 10)
                } else {
                    // Check if this is the D7 dragon
                    const isD7Dragon = Math.abs(this.spawnX - (locationOffset + (3 * 32))) < 5;
                    if (isD7Dragon) {
                        // D7 platform dragon (columns 3-14, row 7)
                        platformStart = locationOffset + (3 * 32); // D column start
                        platformEnd = locationOffset + (15 * 32); // N column + 1 tile width
                        platformY = 7 * 32; // Platform Y (row 7)
                    } else {
                        // Check if this is the W16 dragon
                        const isW16Dragon = Math.abs(this.spawnX - (locationOffset + (22 * 32))) < 5;
                        if (isW16Dragon) {
                            // W16 platform dragon (column 22, row 16)
                            platformStart = locationOffset + (22 * 32); // W column start
                            platformEnd = locationOffset + (23 * 32); // W column + 1 tile width
                            platformY = 16 * 32; // Platform Y (row 16)
                        } else {
                            // Fallback (should not happen)
                            platformStart = locationOffset + (23 * 32);
                            platformEnd = locationOffset + (29 * 32);
                            platformY = 10 * 32;
                        }
                    }
                }
            } else if (gameState.currentLocation === 1) {
                // Check if this is the blue zone enemy (R6-b6 platform)
                const isBlueZoneEnemy = Math.abs(this.spawnX - (locationOffset + (20 * 32))) < 5;
                
                // Check if this is the e10 dragon
                const isU10e10Dragon = Math.abs(this.spawnX - (locationOffset + (30 * 32))) < 5;
                
                // Check if this is the C15-R15 platform enemy
                const isC15R15Enemy = Math.abs(this.spawnX - (locationOffset + (3 * 32))) < 5;
                
                if (isBlueZoneEnemy) {
                    // Blue zone enemy on R6-b6 platform (columns 17-27, row 6)
                    platformStart = locationOffset + (17 * 32); // R column start
                    platformEnd = locationOffset + (28 * 32); // b column + 1 tile width
                    platformY = 6 * 32; // Platform Y (row 6)
                } else if (isU10e10Dragon) {
                    // U10-e10 dragon platform (columns 20-30, row 10)
                    platformStart = locationOffset + (20 * 32); // U column start
                    platformEnd = locationOffset + (31 * 32); // e column + 1 tile width
                    platformY = 10 * 32; // Platform Y (row 10)
                } else if (isC15R15Enemy) {
                    // C15-R15 platform enemy (columns 2-17, row 15)
                    platformStart = locationOffset + (2 * 32); // C column start
                    platformEnd = locationOffset + (18 * 32); // R column + 1 tile width
                    platformY = 15 * 32; // Platform Y (row 15)
                } else {
                    // Original enemy on S16-i16 platform (columns 18-34, row 16)
                platformStart = locationOffset + (18 * 32); // S column start
                platformEnd = locationOffset + (35 * 32); // i column + 1 tile width
                platformY = 16 * 32; // Platform Y (row 16)
                }
            }
            
            if (this.x < platformStart) this.x = platformStart;
            if (this.x > platformEnd - this.width) this.x = platformEnd - this.width;
            // Keep Y fixed on platform - use same collision logic as player
            this.y = platformY - 48; // Platform Y minus enemy height (same as player)
        } else if (this.type === 'png') {
            // PNG enemies stay at their initial positions
            // Don't change x and y - let them stay where they were created
        } else {
            // Regular bounds for other enemies
            if (this.x < locationStart + 50) this.x = locationStart + 50;
            if (this.x > locationEnd - 50) this.x = locationEnd - 50;
            if (this.y < 50) this.y = 50;
            if (this.y > 400) this.y = 400;
        }
        
        // Update shooting state for platform_walker and dragon enemies
        if (this.type === 'platform_walker' || this.type === 'dragon') {
            // Check if player is on the same platform
            let platformStart, platformEnd, platformY;
            
            if (gameState.currentLocation === 0) {
                // Check which platform this enemy is on
                const isZ15j15Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (35 * 32))) < 5;
                const isX10c10Dragon = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (23 * 32))) < 5;
                
                if (isZ15j15Enemy) {
                    // Z15-j15 platform (columns 25-35, row 15)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column + 1 tile width
                    platformY = 15 * 32; // Platform Y (row 15)
                } else if (isX10c10Dragon) {
                    // X10-c10 platform (columns 23-28, row 10)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // X column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (29 * 32); // c column + 1 tile width
                    platformY = 10 * 32; // Platform Y (row 10)
                } else {
                    // Check if this is the D7 dragon
                    const isD7Dragon = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (3 * 32))) < 5;
                    if (isD7Dragon) {
                        // D7 platform (columns 3-14, row 7)
                        platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (3 * 32); // D column
                        platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (15 * 32); // N column + 1 tile width
                        platformY = 7 * 32; // Platform Y (row 7)
                    } else {
                        // Check if this is the W16 dragon
                        const isW16Dragon = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (22 * 32))) < 5;
                        if (isW16Dragon) {
                            // W16 platform (column 22, row 16)
                            platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (22 * 32); // W column
                            platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // W column + 1 tile width
                            platformY = 16 * 32; // Platform Y (row 16)
                        } else {
                            // Fallback
                            platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32);
                            platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (29 * 32);
                            platformY = 10 * 32;
                        }
                    }
                }
                                        } else if (gameState.currentLocation === 1) {
                // Check which platform this enemy is on for second location
                const isS16i16Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (33 * 32))) < 5;
                const isR6b6Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (20 * 32))) < 5;
                const isU10e10Dragon = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (30 * 32))) < 5;
                const isC15R15Enemy = Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (3 * 32))) < 5;
                
                if (isS16i16Enemy) {
                    // S16-i16 platform (columns 18-34, row 16)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // S column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32); // i column + 1 tile width
                    platformY = 16 * 32; // Platform Y
                } else if (isR6b6Enemy) {
                    // R6-b6 platform (columns 17-27, row 6)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (17 * 32); // R column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (28 * 32); // b column + 1 tile width
                    platformY = 6 * 32; // Platform Y
                } else if (isU10e10Dragon) {
                    // U10-e10 platform (columns 20-30, row 10)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (20 * 32); // U column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (31 * 32); // e column + 1 tile width
                    platformY = 10 * 32; // Platform Y
                } else if (isC15R15Enemy) {
                    // C15-R15 platform (columns 2-17, row 15)
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // C column
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // R column + 1 tile width
                    platformY = 15 * 32; // Platform Y
                } else {
                    // Fallback to S16-i16 platform
                    platformStart = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32);
                    platformEnd = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32);
                    platformY = 16 * 32;
                }
            }
            
            // Check if player is on the platform (horizontal position only, ignore Y position for jumping)
            const playerOnPlatform = player.x >= platformStart && player.x <= platformEnd;
            
            // Check if player is in shooting zones S12+17, S13+17, S14+17, S15+17 (rows 12-32, columns 18-35)
            const shootingZoneStart = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // S column
            const shootingZoneEnd = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32); // j column (end of map)
            
            // Check if player is in any of the shooting zones (S12+17, S13+17, S14+17, S15+17)
            // Shoot if player is in the yellow zone (rows 12-32, columns 18-35)
            const zoneStartY = 12 * 32; // Row 12
            const zoneEndY = 32 * 32; // Row 32 (S15+17)
            const playerInShootingZone = player.x >= shootingZoneStart && player.x <= shootingZoneEnd && 
                                       player.y >= zoneStartY && player.y <= zoneEndY;
            
            // Special logic for blue zone enemy (T6-b6 platform)
            const blueZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (19 * 32); // T column
            const blueZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (33 * 32); // g column
            const blueZoneStartY = 2 * 32; // Row 2
            const blueZoneEndY = 6 * 32; // Row 5
            const playerInBlueZone = player.x >= blueZoneStartX && player.x <= blueZoneEndX && 
                                   player.y >= blueZoneStartY && player.y <= blueZoneEndY;
            
            // Check if this is the blue zone enemy (R6-b6 platform) - only for location 1
            const isBlueZoneEnemy = gameState.currentLocation === 1 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (20 * 32))) < 5;
            
            // Check if this is the U10-e10 dragon - only for location 1
            const isU10e10Dragon = gameState.currentLocation === 1 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (30 * 32))) < 5;
            
            // Check if this is the C15-R15 platform enemy - only for location 1
            const isC15R15Enemy = gameState.currentLocation === 1 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (3 * 32))) < 5;
            
            

            
            // Check if this is the Z15-j15 platform enemy - only for location 0
            const isZ15j15Enemy = gameState.currentLocation === 0 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (35 * 32))) < 5;
            
            // Check if this is the X10-c10 dragon - only for location 0
            const isX10c10Dragon = gameState.currentLocation === 0 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (23 * 32))) < 5;
            // Check if this is the D7 dragon - only for location 0
            const isD7Dragon = gameState.currentLocation === 0 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (3 * 32))) < 5;
            // Check if this is the W16 dragon - only for location 0
            const isW16Dragon = gameState.currentLocation === 0 && Math.abs(this.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (22 * 32))) < 5;

            

            
            if (isBlueZoneEnemy) {
                // Blue zone enemy logic
                if (playerInBlueZone) {
                this.activated = true;
                this.shooting = true;
                this.returningToSpawn = false;
                    
                    // Tactical movement: maintain optimal distance from player
                    const dx = player.x - this.x;
                    const distance = Math.abs(dx);
                    const optimalDistance = 150; // Optimal shooting distance
                    const minDistance = 80; // Too close - back away
                    const maxDistance = 200; // Too far - approach
                    
                    // Check if direction changed
                    if (this.direction !== this.lastDirection) {
                        this.turnDelay = 30; // 0.5 seconds delay after turning
                        this.lastDirection = this.direction;
                    }
                    
                    // Reduce turn delay
                    if (this.turnDelay > 0) {
                        this.turnDelay--;
                    }
                    
                    if (distance < minDistance) {
                        // Player too close - back away but still face player
                        this.velocityX = (dx > 0 ? -1 : 1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Always face player when shooting
                    } else if (distance > maxDistance) {
                        // Player too far - approach
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Face player
                    } else {
                        // Optimal distance - stop and shoot
                        this.velocityX = 0;
                        this.direction = dx > 0 ? 1 : -1; // Face player
                    }
                } else {
                    this.activated = false;
                    this.shooting = false;
                    this.returningToSpawn = true;
                    this.direction = -1; // Face left when not activated
                    
                    // Return to spawn point
                    const dx = this.spawnX - this.x;
                    if (Math.abs(dx) > 2) { // If not close enough to spawn
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Face spawn direction
                    } else {
                        // Reached spawn point
                        this.velocityX = 0;
                        this.returningToSpawn = false;
                        this.direction = -1; // Face left when idle at spawn
                        this.lastDirection = -1; // Reset last direction
                    }
                }
            } else if (isU10e10Dragon) {
                // e10 dragon logic - activate when player is in R8-e8 and R9-e9 zones, shoot only left, no movement
                const dragonZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (17 * 32); // R column
                const dragonZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (31 * 32); // e column + 1 tile width
                const dragonZoneStartY = 8 * 32; // Row 8
                const dragonZoneEndY = 10 * 32; // Row 9 (включая R9-e9)
                const playerInDragonZone = player.x >= dragonZoneStartX && player.x <= dragonZoneEndX && 
                                         player.y >= dragonZoneStartY && player.y <= dragonZoneEndY;
                
                // Also activate when player is in shooting zones S12+17, S13+17, S14+17, S15+17
                const playerInShootingZoneForDragon = playerInShootingZone;
                
                if (playerInDragonZone || playerInShootingZoneForDragon) {
                    this.activated = true;
                    this.shooting = true;
                    this.returningToSpawn = false;
                    
                    // Fixed position dragon - no movement, always face left and shoot
                    this.velocityX = 0; // No movement
                    this.direction = -1; // Always face left
                    this.lastDirection = -1; // Keep facing left
                } else {
                    this.activated = false;
                    this.shooting = false;
                    this.returningToSpawn = false; // No need to return, already at fixed position
                    this.velocityX = 0; // No movement
                    this.direction = -1; // Always face left
                    this.lastDirection = -1; // Keep facing left
                }
            } else if (isC15R15Enemy) {
                // C15-R15 platform enemy logic - activate when player is in C12-N12, C13-N13, C14-N14 zones
                const c12n12ZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // C column
                const c12n12ZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (14 * 32); // N column + 1 tile width
                const c12n12ZoneStartY = 12 * 32; // Row 12
                const c12n12ZoneEndY = 13 * 32; // Row 12 (включая C12-N12)
                const playerInC12N12Zone = player.x >= c12n12ZoneStartX && player.x <= c12n12ZoneEndX && 
                                         player.y >= c12n12ZoneStartY && player.y <= c12n12ZoneEndY;
                
                const c13n13ZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // C column
                const c13n13ZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (14 * 32); // N column + 1 tile width
                const c13n13ZoneStartY = 13 * 32; // Row 13
                const c13n13ZoneEndY = 14 * 32; // Row 13 (включая C13-N13)
                const playerInC13N13Zone = player.x >= c13n13ZoneStartX && player.x <= c13n13ZoneEndX && 
                                         player.y >= c13n13ZoneStartY && player.y <= c13n13ZoneEndY;
                
                const c14n14ZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // C column
                const c14n14ZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (14 * 32); // N column + 1 tile width
                const c14n14ZoneStartY = 14 * 32; // Row 14
                const c14n14ZoneEndY = 15 * 32; // Row 14 (включая C14-N14)
                const playerInC14N14Zone = player.x >= c14n14ZoneStartX && player.x <= c14n14ZoneEndX && 
                                         player.y >= c14n14ZoneStartY && player.y <= c14n14ZoneEndY;
                
                // Activate if player is in any of the three zones
                const playerInActivationZone = playerInC12N12Zone || playerInC13N13Zone || playerInC14N14Zone;
                
                if (playerInActivationZone) {
                    this.activated = true;
                    this.shooting = true;
                    this.returningToSpawn = false;
                    
                    // Tactical movement: maintain optimal distance from player
                    const dx = player.x - this.x;
                    const distance = Math.abs(dx);
                    const optimalDistance = 150; // Optimal shooting distance
                    const minDistance = 80; // Too close - back away
                    const maxDistance = 200; // Too far - approach
                    
                    // Check if direction changed
                    if (this.direction !== this.lastDirection) {
                        this.turnDelay = 30; // 0.5 seconds delay after turning
                        this.lastDirection = this.direction;
                    }
                    
                    // Reduce turn delay
                    if (this.turnDelay > 0) {
                        this.turnDelay--;
                    }
                    
                    if (distance < minDistance) {
                        // Player too close - back away but still face player
                        this.velocityX = (dx > 0 ? -1 : 1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Always face player when shooting
                    } else if (distance > maxDistance) {
                        // Player too far - approach
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Always face player when shooting
                    } else {
                        // Optimal distance - stop and shoot
                        this.velocityX = 0;
                        this.direction = dx > 0 ? 1 : -1; // Face player
                    }
                } else {
                    this.activated = false;
                    this.shooting = false;
                    this.returningToSpawn = true;
                    this.direction = -1; // Face left when not activated
                    
                    // Return to spawn point
                    const dx = this.spawnX - this.x;
                    if (Math.abs(dx) > 2) { // If not close enough to spawn
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Face spawn direction
                    } else {
                        // Reached spawn point
                        this.velocityX = 0;
                        this.returningToSpawn = false;
                        this.direction = -1; // Face left when idle at spawn
                        this.lastDirection = -1; // Reset last direction
                    }
                }
            } else if (isZ15j15Enemy) {
                // Z15-j15 platform enemy logic - activate when player is in purple zone (Z13-j13, Z14-j14) OR new zone (Z11-j11, Z12-j12)
                const purpleZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
                const purpleZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column
                const purpleZoneStartY = 13 * 32; // Row 13
                const purpleZoneEndY = 15 * 32; // Row 14 (включая Z14-j14)
                const playerInPurpleZone = player.x >= purpleZoneStartX && player.x <= purpleZoneEndX && 
                                         player.y >= purpleZoneStartY && player.y <= purpleZoneEndY;
                
                const newZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
                const newZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column
                const newZoneStartY = 11 * 32; // Row 11
                const newZoneEndY = 13 * 32; // Row 12 (включая Z12-j12)
                const playerInNewZone = player.x >= newZoneStartX && player.x <= newZoneEndX && 
                                      player.y >= newZoneStartY && player.y <= newZoneEndY;
                
                // Activate if player is in either zone
                const playerInActivationZone = playerInPurpleZone || playerInNewZone;
                
                if (playerInActivationZone) {
                this.activated = true;
                this.shooting = true;
                this.returningToSpawn = false;
                    
                    // Tactical movement: maintain optimal distance from player
                    const dx = player.x - this.x;
                    const distance = Math.abs(dx);
                    const optimalDistance = 150; // Optimal shooting distance
                    const minDistance = 80; // Too close - back away
                    const maxDistance = 200; // Too far - approach
                    
                    // Check if direction changed
                    if (this.direction !== this.lastDirection) {
                        this.turnDelay = 30; // 0.5 seconds delay after turning
                        this.lastDirection = this.direction;
                    }
                    
                    // Reduce turn delay
                    if (this.turnDelay > 0) {
                        this.turnDelay--;
                    }
                    
                    if (distance < minDistance) {
                        // Player too close - back away but still face player
                        this.velocityX = (dx > 0 ? -1 : 1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Always face player when shooting
                    } else if (distance > maxDistance) {
                        // Player too far - approach
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Face player
                    } else {
                        // Optimal distance - stop and shoot
                        this.velocityX = 0;
                        this.direction = dx > 0 ? 1 : -1; // Face player
                    }
            } else {
                this.activated = false;
                this.shooting = false;
                this.returningToSpawn = true;
                    this.direction = -1; // Face left when not activated
                    
                    // Return to spawn point
                    const dx = this.spawnX - this.x;
                    if (Math.abs(dx) > 2) { // If not close enough to spawn
                        this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                        this.direction = dx > 0 ? 1 : -1; // Face spawn direction
                    } else {
                        // Reached spawn point
                        this.velocityX = 0;
                        this.returningToSpawn = false;
                        this.direction = -1; // Face left when idle at spawn
                        this.lastDirection = -1; // Reset last direction
                    }
                }
            } else if (isX10c10Dragon || isD7Dragon || isW16Dragon) {
                // Dragon logic - activate when player is on the same platform or nearby
                let dragonZoneStartX, dragonZoneEndX, dragonZoneStartY, dragonZoneEndY;
                let playerInDragonZone;
                
                if (isX10c10Dragon) {
                    // X10-c10 dragon zone
                    dragonZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // From X column (23)
                    dragonZoneEndX = (gameState.currentLocation + 1) * LOCATION_WIDTH; // Until end of location
                    dragonZoneStartY = 7 * 32; // From row 7
                    dragonZoneEndY = 12 * 32; // To row 12
                    
                    // Exclude i11-j11-k11 area from dragon zone
                    const excludedZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (34 * 32); // i column
                    const excludedZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (37 * 32); // k column + 1 tile
                    const excludedZoneY = 11 * 32; // Row 11
                    
                    // Exclude robot zone (Z13-j13, rows 13-14) from dragon zone
                    const robotZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
                    const robotZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column
                    const robotZoneStartY = 13 * 32; // Row 13
                    const robotZoneEndY = 14 * 32; // Row 14
                    
                    // Exclude X11 Y11 Z11 area from dragon zone
                    const x11y11z11ZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // X column
                    const x11y11z11ZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (26 * 32); // Z column + 1 tile
                    const x11y11z11ZoneY = 11 * 32; // Row 11
                    
                    const playerInExcludedZone = player.x >= excludedZoneStartX && player.x <= excludedZoneEndX && 
                                               player.y >= excludedZoneY && player.y <= excludedZoneY + 32;
                    
                    const playerInRobotZone = player.x >= robotZoneStartX && player.x <= robotZoneEndX && 
                                            player.y >= robotZoneStartY && player.y <= robotZoneEndY;
                    
                    const playerInX11Y11Z11Zone = player.x >= x11y11z11ZoneStartX && player.x <= x11y11z11ZoneEndX && 
                                                 player.y >= x11y11z11ZoneY && player.y <= x11y11z11ZoneY + 32;
                    
                    playerInDragonZone = player.x >= dragonZoneStartX && player.x <= dragonZoneEndX && 
                                       player.y >= dragonZoneStartY && player.y <= dragonZoneEndY &&
                                       !playerInExcludedZone && !playerInRobotZone && !playerInX11Y11Z11Zone; // Exclude i11-j11-k11, robot zone, and X11 Y11 Z11
                } else if (isD7Dragon) {
                    // D7 dragon zone - activate when player is in C3-M6 area OR N4-R7 area
                    const originalZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (2 * 32); // From C column (2)
                    const originalZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (12 * 32); // To M column (12)
                    const originalZoneStartY = 3 * 32; // From row 3
                    const originalZoneEndY = 6 * 32; // To row 6
                    
                    // New extended zone: N4-R7 area
                    const extendedZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (13 * 32); // From N column (13)
                    const extendedZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (17 * 32); // To R column (17)
                    const extendedZoneStartY = 4 * 32; // From row 4
                    const extendedZoneEndY = 7 * 32; // To row 7
                    
                    const playerInOriginalZone = player.x >= originalZoneStartX && player.x <= originalZoneEndX && 
                                               player.y >= originalZoneStartY && player.y <= originalZoneEndY;
                    
                    const playerInExtendedZone = player.x >= extendedZoneStartX && player.x <= extendedZoneEndX && 
                                                player.y >= extendedZoneStartY && player.y <= extendedZoneEndY;
                    
                    playerInDragonZone = playerInOriginalZone || playerInExtendedZone;
                } else if (isW16Dragon) {
                    // W16 dragon zone - activate when player is in L12-X15 area OR F12-K15 area
                    const originalZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (11 * 32); // From L column (11)
                    const originalZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // To X column (23)
                    const originalZoneStartY = 12 * 32; // From row 12
                    const originalZoneEndY = 15 * 32; // To row 15
                    
                    // New extended zone: F12-K15 area
                    const extendedZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (5 * 32); // From F column (5)
                    const extendedZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (10 * 32); // To K column (10)
                    const extendedZoneStartY = 12 * 32; // From row 12
                    const extendedZoneEndY = 15 * 32; // To row 15
                    
                    const playerInOriginalZone = player.x >= originalZoneStartX && player.x <= originalZoneEndX && 
                                               player.y >= originalZoneStartY && player.y <= originalZoneEndY;
                    
                    const playerInExtendedZone = player.x >= extendedZoneStartX && player.x <= extendedZoneEndX && 
                                                player.y >= extendedZoneStartY && player.y <= extendedZoneEndY;
                    
                    playerInDragonZone = playerInOriginalZone || playerInExtendedZone;
                }
                

                
                if (playerInDragonZone) {
                    this.activated = true;
                    this.shooting = true;
                    this.returningToSpawn = false;
                    
                    // Dragon is fixed in place - doesn't turn, always faces left
                    this.direction = -1; // Always face left
                    
                    // Dragon stays fixed - no movement
                    this.velocityX = 0;
                } else {
                    this.activated = false;
                    this.shooting = false;
                    this.returningToSpawn = false; // Dragon doesn't move
                    this.direction = -1; // Face left when not activated
                    
                    // Dragon stays fixed - no movement
                    this.velocityX = 0;
                }
            } else {
                // Original yellow zone enemy logic
                if (playerInShootingZone) {
                this.activated = true;
                this.shooting = true;
                this.returningToSpawn = false;
                
                // Tactical movement: maintain optimal distance from player
                const dx = player.x - this.x;
                const distance = Math.abs(dx);
                const optimalDistance = 150; // Optimal shooting distance
                const minDistance = 80; // Too close - back away
                const maxDistance = 200; // Too far - approach
                
                // Check if direction changed
                if (this.direction !== this.lastDirection) {
                    this.turnDelay = 30; // 0.5 seconds delay after turning
                    this.lastDirection = this.direction;
                }
                
                // Reduce turn delay
                if (this.turnDelay > 0) {
                    this.turnDelay--;
                }
                
                if (distance < minDistance) {
                    // Player too close - back away but still face player
                    this.velocityX = (dx > 0 ? -1 : 1) * this.speed;
                    this.direction = dx > 0 ? 1 : -1; // Always face player when shooting
                } else if (distance > maxDistance) {
                    // Player too far - approach
                    this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                    this.direction = dx > 0 ? 1 : -1; // Face player
                } else {
                    // Optimal distance - stop and shoot
                    this.velocityX = 0;
                    this.direction = dx > 0 ? 1 : -1; // Face player
                }
                
                // Enemy can move naturally within the zone
            } else {
                this.activated = false;
                this.shooting = false;
                this.returningToSpawn = true;
                this.direction = -1; // Face left when not activated
                
                // Return to spawn point
                const dx = this.spawnX - this.x;
                if (Math.abs(dx) > 2) { // If not close enough to spawn
                    this.velocityX = (dx > 0 ? 1 : -1) * this.speed;
                    this.direction = dx > 0 ? 1 : -1; // Face spawn direction
                } else {
                    // Reached spawn point
                    this.velocityX = 0;
                    this.returningToSpawn = false;
                    this.direction = -1; // Face left when idle at spawn
                    this.lastDirection = -1; // Reset last direction
                }
            }
            }
        }
        
        // Direction is now handled in tactical movement logic above
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    attack(player) {
        // platform_walker and dragon enemies shoot when activated and not returning to spawn
        if (this.type === 'platform_walker' || this.type === 'dragon') {
            if (this.shooting && this.attackCooldown === 0 && !this.returningToSpawn && this.turnDelay === 0) {
                // Dragon shoots at same rate as other enemies (doubled frequency)
                this.attackCooldown = this.type === 'dragon' ? 120 : 120; // 2 seconds for dragon, 2 seconds for others
            
                // Calculate direction to player for projectile
                const dx = player.x - this.x;
                const direction = dx > 0 ? 1 : -1;
                return { damage: this.damage, direction: direction };
            }
            return { damage: 0, direction: 1 };
        }
        
        // PNG enemies shoot when activated
        if (this.type === 'png') {
            if (this.shooting && this.attackCooldown === 0) {
                this.attackCooldown = 120; // 2 seconds at 60fps
            
                // Calculate direction to player for projectile
                const dx = player.x - this.x;
                const direction = dx > 0 ? 1 : -1;
                return { damage: this.damage, direction: direction };
            }
            return { damage: 0, direction: 1 };
        }
        
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
        this.width = 30; // Doubled from 15
        this.height = 30; // Doubled from 15
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 5;
    }
    
    update() {
        // Dragon fireballs have constant speed regardless of location or any other factors
        if (this.owner === 'enemy') {
            this.x += 3.0; // Fixed speed for dragon, always right
            this.y += 0; // No vertical movement for dragon fireballs
        } else {
            this.x += this.velocityX; // Use velocityX directly for player (no speed multiplier)
        this.y += this.velocityY;
        }
    }
    
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
    }
}

// Separate class for dragon fireballs - completely independent with time-based movement
class DragonFireball {
    constructor(x, y, direction = 1) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 16; // Same height as enemy blue projectiles
        this.damage = 5;
        this.owner = 'enemy';
        this.baseSpeed = 3.0; // Store base speed (pixels per frame at 60fps)
        this.lastUpdateTime = performance.now(); // Use high-precision timer
        this.pixelsPerMs = this.baseSpeed / (1000/60); // Convert to pixels per millisecond
        this.direction = direction; // 1 for right, -1 for left
    }
    
    update() {
        // Time-based movement completely independent of frame rate
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        
        // Move based on actual time elapsed, not frame count
        this.x += this.pixelsPerMs * deltaTime * this.direction;
        
        this.lastUpdateTime = currentTime;
        // Absolutely no Y movement - keep Y exactly the same
    }
    
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
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
        this.damage = 15; // Reduced base damage
        this.speed = 8; // Moderate speed for interesting gameplay
    }
    
    update() {
        // Use time-based movement for consistent speed independent of frame rate
        const currentTime = performance.now();
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
        }
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Convert speed to pixels per millisecond for time-based movement
        const pixelsPerMs = this.speed / 16.67; // 16.67ms = 60fps
        
        this.x += this.velocityX * pixelsPerMs * deltaTime;
        this.y += this.velocityY * pixelsPerMs * deltaTime;
    }
    
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
    }
}



class ToxinProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 17; // Increased by 1 pixel
        this.height = 9; // Increased by 1 pixel
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 7.5; // Toxin damage for dragons (60/7.5 = 8 hits)
        this.speed = 9; // Slightly slower than before (was 10)
    }
    
    update() {
        // Use time-based movement for consistent speed independent of frame rate
        const currentTime = performance.now();
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
        }
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Convert speed to pixels per millisecond for time-based movement
        const pixelsPerMs = this.speed / 16.67; // 16.67ms = 60fps
        
        this.x += this.velocityX * pixelsPerMs * deltaTime;
        this.y += this.velocityY * pixelsPerMs * deltaTime;
    }
    
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
    }
}

class OrigamiProjectile {
    constructor(x, y, velocityX, velocityY, owner = null) {
        this.x = x;
        this.y = y;
        this.width = 30; // Smaller sprite
        this.height = 16; // Smaller sprite
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = origamiBleeding.baseDamage; // Use bleeding system damage
        this.speed = 12; // Original speed for Origami
        this.owner = owner; // 'player' or 'enemy' or null
    }
    
    update() {
        // Use time-based movement for consistent speed independent of frame rate
        const currentTime = performance.now();
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
        }
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Convert speed to pixels per millisecond for time-based movement
        const pixelsPerMs = this.speed / 16.67; // 16.67ms = 60fps
        
        this.x += this.velocityX * pixelsPerMs * deltaTime;
        this.y += this.velocityY * pixelsPerMs * deltaTime;
    }
    
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
    }
    
    // Activate bleeding effect on target

}

class ChameleonProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 24; // Увеличенная ширина пули
        this.height = 12; // Увеличенная высота пули
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 3.6; // Chameleon damage for platform_walker (108/3.6 = 30 hits)
        this.speed = 16; // Очень высокая скорость
    }
    update() {
        // Use time-based movement for consistent speed independent of frame rate
        const currentTime = performance.now();
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
        }
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Convert speed to pixels per millisecond for time-based movement
        const pixelsPerMs = this.speed / 16.67; // 16.67ms = 60fps
        
        this.x += this.velocityX * pixelsPerMs * deltaTime;
        this.y += this.velocityY * pixelsPerMs * deltaTime;
    }
    isOffScreen() {
        const locationStart = gameState.currentLocation * LOCATION_WIDTH;
        const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
        return this.x < locationStart || this.x > locationEnd || this.y < 0 || this.y > canvas.height;
    }
}

// Global arrays for enemies and projectiles
let enemies = [];
let fireProjectiles = [];
let dragonFireballs = []; // Separate array for dragon fireballs
let arrowProjectiles = [];
let toxinProjectiles = [];
let origamiProjectiles = [];
let chameleonProjectiles = [];

// Locations with smooth transitions
const locations = [
    { name: 'Дом', background: '#8B4513', enemies: [], width: 1200, hasImage: true },
    { name: 'Лес', background: '#228B22', enemies: [], width: 1200, hasImage: true }
];

// World dimensions
const WORLD_WIDTH = 2400; // 2 locations × 1200px each
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
    
    // Only handle game-specific keys when in game screen
    if (gameState.currentScreen === 'game') {
        if (e.code === 'Space') {
            if (gameState.gameWon || gameState.gameOver) {
                // Return to character selection if won or game over
                gameState.currentScreen = 'characterSelect';
                gameState.gameWon = false;
                gameState.gameOver = false;
                document.getElementById('characterSelect').style.display = 'block';
                document.getElementById('gameUI').style.display = 'none';
            } else {
                // Normal attack if not won or game over
                attack();
            }
        }
        // Special abilities removed - E key disabled
        if (e.code === 'KeyR') restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    // Only handle game-specific keys when in game screen
    if (gameState.currentScreen === 'game') {
        // Stop Toxin auto-fire when Space is released
        if (e.code === 'Space' && player.character && player.character.name === 'Toxin') {
            toxinRage.autoFireActive = false;
            toxinRage.autoFireTimer = 0;
        }
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
        // Toxin sounds removed from character switch
        
        player.character = characters[characterKey];
        gameState.selectedCharacter = characterKey; // Set the selected character
        gameState.currentScreen = 'game';
        document.getElementById('characterSelect').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        
        // Initialize game state
        restartGame();
    }
}

// Attack function - optimized
function attack() {
    if (!player.character || player.attackCooldown > 0 || gameState.gameOver || gameState.currentScreen !== 'game') return;

    player.attacking = true;
    
    // Cache character name to avoid repeated property access
    const characterName = player.character.name;
    
    // Optimized cooldown setting
    if (characterName === 'Toxin') {
        player.attackCooldown = toxinRage.currentAttackRate;
    } else if (characterName === 'Troub') {
        player.attackCooldown = 30;
    } else {
        player.attackCooldown = 15;
    }
    
    // Check if special ability is active
    // Special abilities removed from attack function
        gameState.score += 10;
    
    // Create arrow projectile for Troub
    if (characterName === 'Troub') {
        // Handle critical strike
        handleTroubCriticalStrike();
        
        // Optimized position calculation
        const arrowX = player.x + (player.direction > 0 ? player.width : 0);
        const arrowY = player.y + player.height / 2;
        
        const newArrowProjectile = new ArrowProjectile(arrowX, arrowY, player.direction, 0);
        newArrowProjectile.speed = 8;
        
        // Apply critical damage if active
        if (troubCriticalStrike.criticalActive) {
            newArrowProjectile.damage = 45;
        }
        
        arrowProjectiles.push(newArrowProjectile);
    }
    
                // Create toxin projectile for Toxin
                if (characterName === 'Toxin') {
                    // Start auto-fire system like Chameleon
                    if (!toxinRage.autoFireActive) {
                        toxinRage.autoFireActive = true;
                        toxinRage.autoFireTimer = 0;
                    }
                    
                    // Optimized position calculation
                    const toxinX = player.x + (player.direction > 0 ? player.width : 0);
                    const toxinY = player.y + player.height / 2 + 6.5;
                    
                    const newToxinProjectile = new ToxinProjectile(toxinX, toxinY, player.direction, 0);
                    newToxinProjectile.speed = 9;
                    toxinProjectiles.push(newToxinProjectile);
                    
                    // Activate attack animation
                    toxinAttackAnimation.active = true;
                    toxinAttackAnimation.timer = 15;
                    toxinAttackAnimation.blinkTimer = 0;
                    toxinAttackAnimation.visible = true;
                }
                
                // Create chameleon projectile for Chameleon
                if (characterName === 'Chameleon') {
                    // Start burst fire for Chameleon
                    if (!chameleonAttackAnimation.active) {
                        chameleonAttackAnimation.active = true;
                        chameleonAttackAnimation.burstCount = 0;
                        chameleonAttackAnimation.burstTimer = 0;
                        chameleonAttackAnimation.visible = true;
                    }
                    
                    // Create projectile if burst count allows
                    if (chameleonAttackAnimation.burstCount < chameleonAttackAnimation.maxBurstShots) {
                        // Optimized position calculation
                        const chameleonX = player.x + (player.direction > 0 ? player.width : 0);
                        const chameleonY = player.y + player.height / 2;
                        
                        const newChameleonProjectile = new ChameleonProjectile(chameleonX, chameleonY, player.direction, 0);
                        newChameleonProjectile.speed = 16;
                        chameleonProjectiles.push(newChameleonProjectile);
                        
                        chameleonAttackAnimation.burstCount++;
                        chameleonAttackAnimation.burstTimer = chameleonAttackAnimation.burstDelay;
                    }
                }
                
                // Create origami projectile for Origami
                if (characterName === 'Origami') {
                    // Start burst fire for Origami
                    if (!origamiAttackAnimation.active) {
                        origamiAttackAnimation.active = true;
                        origamiAttackAnimation.burstCount = 0;
                        origamiAttackAnimation.burstTimer = 0;
                        origamiAttackAnimation.visible = true;
                    }
                    
                    // Create projectile if burst count allows
                    if (origamiAttackAnimation.burstCount < origamiAttackAnimation.maxBurstShots) {
                        // Optimized position calculation
                        const origamiX = player.x + (player.direction > 0 ? player.width : -20);
                        const origamiY = player.y + player.height / 2;
                        
                        const newProjectile = new OrigamiProjectile(origamiX, origamiY, player.direction, 0, 'player');
                        newProjectile.speed = 12;
                        origamiProjectiles.push(newProjectile);
                        
                        origamiAttackAnimation.burstCount++;
                        origamiAttackAnimation.burstTimer = origamiAttackAnimation.burstDelay;
                    }
                }
    
    // Enemy hits are now handled by projectiles in updatePlayer()
    // No need for additional checks here
    
    gameState.hits++;
    // Special abilities removed - no ability ready checks
}

// useSpecialAbility function removed - special abilities disabled

// Initialize enemies for Forest location
function initializeForestEnemies() {
    // S16-i16 platform coordinates: x: 18-34, y: 16
    // Place enemy on h16 (column 33, row 16)
    const platformX = (gameState.currentLocation * LOCATION_WIDTH) + (33 * 32); // h column position
    const platformY = (16 * 32) - 48; // Platform Y minus enemy height (row 16)
    
    // R6-b6 platform spawn position for blue zone enemy (existing platform)
    const blueZoneEnemyX = (gameState.currentLocation * LOCATION_WIDTH) + (20 * 32); // U column on R6-b6 platform
    const blueZoneEnemyY = (6 * 32) - 48; // Row 6 minus enemy height (R6-b6 platform)
    
    // e10 platform dragon with spawn at e10 (point of attachment) - fixed position
    const dragonX = (gameState.currentLocation * LOCATION_WIDTH) + (30 * 32); // e column (e10 spawn)
    const dragonY = (10 * 32) - 48; // Row 10 minus enemy height (e10 platform)
    
    // C15-R15 platform enemy with spawn at D15 (point of attachment)
    const c15r15EnemyX = (gameState.currentLocation * LOCATION_WIDTH) + (3 * 32); // D column (D15 spawn)
    const c15r15EnemyY = (15 * 32) - 48; // Row 15 minus enemy height (C15-R15 platform)
    
    enemies = [
        new Enemy(platformX, platformY, 'platform_walker'),  // Enemy on h16 platform
        new Enemy(blueZoneEnemyX, blueZoneEnemyY, 'platform_walker'),  // Enemy in blue zone on T6-b6 platform
        new Enemy(dragonX, dragonY, 'dragon'),  // Dragon on U10-e10 platform at e10
        new Enemy(c15r15EnemyX, c15r15EnemyY, 'platform_walker')  // Enemy on C15-R15 platform at D15
    ]; 
}

// Initialize enemies for first location
function initializeDragon() {
    // Z15-j15 platform enemy with spawn at j15
    const z15j15EnemyX = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32); // j column (j15 spawn)
    const z15j15EnemyY = (15 * 32) - 48; // Row 15 minus enemy height (Z15-j15 platform)
    
    // X10-c10 platform dragon with spawn at X10
    const dragonX = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // X column (X10 spawn)
    const dragonY = (10 * 32) - 48; // Row 10 minus enemy height (X10-c10 platform)
    
    // D7 platform dragon with spawn at D7
    const dragon2X = (gameState.currentLocation * LOCATION_WIDTH) + (3 * 32); // D column (D7 spawn)
    const dragon2Y = (7 * 32) - 48; // Row 7 minus enemy height (D7 platform)
    
    // W16 platform dragon with spawn at W16
    const dragon3X = (gameState.currentLocation * LOCATION_WIDTH) + (22 * 32); // W column (W16 spawn)
    const dragon3Y = (16 * 32) - 48; // Row 16 minus enemy height (W16 platform)
    
    enemies = [
        new Enemy(z15j15EnemyX, z15j15EnemyY, 'platform_walker'),  // Enemy on Z15-j15 platform at j15
        new Enemy(dragonX, dragonY, 'dragon'),  // Dragon on X10-c10 platform at X10
        new Enemy(dragon2X, dragon2Y, 'dragon'),  // Second dragon on D7 platform at D7
        new Enemy(dragon3X, dragon3Y, 'dragon')  // Third dragon on W16 platform at W16
    ];
    

}
// Restart game
function restartGame() {
    player.x = 100;
    player.y = 400;
    gameState.health = 3; // 3 hits to die
    gameState.score = 0;
    gameState.hits = 0;
    gameState.abilityReady = false;
    gameState.abilityActive = false;
    gameState.abilityTimer = 0;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.currentLocation = 0;
    gameState.transitioning = false;
    fireProjectiles = [];
    dragonFireballs = []; // Clear dragon fireballs
    arrowProjectiles = [];
    toxinProjectiles = [];
    origamiProjectiles = [];
    // Clear chameleon projectiles
    chameleonProjectiles = [];
    
    // Clear bleeding effects
    activeBleedingEffects = [];
    
    // Initialize dragon for first location
    initializeDragon();
    

    
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
    
    // Toxin special ability removed
    
    // Toxin sounds removed from restart
    // Reset chameleon attack animation
    chameleonAttackAnimation.active = false;
    chameleonAttackAnimation.timer = 0;
    chameleonAttackAnimation.blinkTimer = 0;
    chameleonAttackAnimation.visible = false;
    
    // Reset chameleon camouflage
    chameleonCamouflage.active = false;
    chameleonCamouflage.timer = 0;
    chameleonCamouflage.usedThisLocation = false;
    chameleonCamouflage.keyPressed = false;
    
    // Reset Troub critical strike
    troubCriticalStrike.attackCount = 0;
    troubCriticalStrike.criticalReady = false;
    troubCriticalStrike.criticalActive = false;
    troubCriticalStrike.timer = 0;
    troubCriticalStrike.glowIntensity = 0;
    
    // Reset Toxin rage mode
    toxinRage.currentAttackRate = toxinRage.baseAttackRate;
    

}

// Camera system
let cameraX = 0;

// Update player
function updatePlayer() {
    if (gameState.currentScreen !== 'game') return;
    
    // Don't update if game is over or transitioning
    if (gameState.gameOver || gameState.transitioning) return;
    
    // Clear keys if not in game screen to prevent lag
    if (gameState.currentScreen !== 'game') {
        // Optimized key clearing - only clear if there are keys to clear
        if (Object.keys(keys).length > 0) {
            for (let key in keys) {
                keys[key] = false;
            }
        }
        return;
    }
    
    // Get current location bounds - optimized with caching
    const currentLocation = gameState.currentLocation;
    const locationStart = currentLocation * LOCATION_WIDTH;
    const locationEnd = locationStart + LOCATION_WIDTH;
    const playerWidth = player.width;
    
    // Keep player within current location bounds
    if (player.x < locationStart) player.x = locationStart;
    if (player.x + playerWidth > locationEnd) player.x = locationEnd - playerWidth;
    
             // Check portal collision (portal is between columns j and k) - only for first location
    if (currentLocation === 0) {
        const portalX = locationStart + (36.5 * 32) - 40; // Shifted right, more towards column k
        const portalHeight = 120;
        const portalY = 2 * 32 - 11; // Position at row 2 (middle position) - moved up by 11 pixels
        
        // Check if all enemies are dead - optimized
        const allEnemiesDead = enemies.length === 0 || enemies.every(enemy => enemy.health <= 0);
        
         if (
             player.x + playerWidth > portalX &&
             player.x < portalX + 80 &&
             player.y + player.height > portalY &&
             player.y < portalY + portalHeight &&
             allEnemiesDead // Only allow transition if all enemies are dead
         ) {
            // Start transition to next location
            gameState.transitioning = true;
            startFade(() => {
                gameState.currentLocation++;
                player.x = (gameState.currentLocation * LOCATION_WIDTH) + 100;
                gameState.transitioning = false;
                
                // Reset chameleon camouflage for new location
                chameleonCamouflage.usedThisLocation = false;
                
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
    
    // Keys are working properly
    
    // Movement
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.direction = -1;
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.direction = 1;
    } else {
        player.velocityX *= 0.8;
        // Fix tiny floating point numbers
        if (Math.abs(player.velocityX) < 0.01) {
            player.velocityX = 0;
        }
        // Keep direction even when not moving (for shooting)
        // Direction is already set from previous movement
    }
    
    // Jumping
    if ((keys['KeyW'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = -11; // Увеличенный прыжок
        player.onGround = false;
    }
    

    
    // Gravity
    player.velocityY += 0.8;
    
    // Update position
    let newX = player.x + player.velocityX;
    let newY = player.y + player.velocityY;
    

    
    // Tile-based collision for B1-B16 wall - ONLY FOR FIRST LOCATION
    const tileSize = 32;
    const wallLocationStart = gameState.currentLocation * LOCATION_WIDTH;
    
    // Check walls only for first location (Дом)
    if (gameState.currentLocation === 0) {
    // Check each tile of the wall individually
    for (let row = 1; row <= 16; row++) { // B1 to B16
        const tileX = wallLocationStart + 1 * tileSize; // B column
        const tileY = row * tileSize;
        
        // Check if player is crossing the wall boundary
        const playerLeft = newX;
        const playerRight = newX + player.width;
        const wallLeft = tileX;
        const wallRight = tileX + tileSize;
        
        // Block any intersection with wall (both horizontal and vertical)
        if (newX < wallRight && newX + player.width > wallLeft &&
            newY < tileY + tileSize && newY + player.height > tileY) {
            

            // Block only horizontal movement, allow vertical movement for jumping
            newX = player.x; // Keep current X position
            // Don't block Y movement - allow jumping
            }
        }
    }
    
    // Tile-based collision for l1-l16 wall - ONLY FOR FIRST LOCATION
    if (gameState.currentLocation === 0) {
    for (let row = 1; row <= 16; row++) { // l1 to l16
        const tileX = wallLocationStart + 37 * tileSize; // l column
        const tileY = row * tileSize;
        
        // Check if player is crossing the wall boundary
        const playerLeft = newX;
        const playerRight = newX + player.width;
        const wallLeft = tileX;
        const wallRight = tileX + tileSize;
        
        // Block any intersection with wall (both horizontal and vertical)
        if (newX < wallRight && newX + player.width > wallLeft &&
            newY < tileY + tileSize && newY + player.height > tileY) {
            

            // Block only horizontal movement, allow vertical movement for jumping
            newX = player.x; // Keep current X position
            // Don't block Y movement - allow jumping
            }
        }
    }
    
    // Optimized wall collision checks for first location - ONLY FOR FIRST LOCATION
    if (gameState.currentLocation === 0) {
        // Pre-calculate wall boundaries for better performance
        const lWallX = wallLocationStart + 37 * tileSize; // l column
        const wWallX = wallLocationStart + 22 * tileSize; // W column
        const kWallX = wallLocationStart + 36 * tileSize; // k column
        const yWallX = wallLocationStart + 24 * tileSize; // Y column
        
        const playerLeft = newX;
        const playerRight = newX + player.width;
        const playerTop = newY;
        const playerBottom = newY + player.height;
        
        // Check l1-l16 wall (simplified)
        if (playerRight >= lWallX && playerLeft <= lWallX + tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // Check W4-W10 wall (simplified)
        if (playerRight >= wWallX && playerLeft <= wWallX + tileSize &&
            playerBottom > 4 * tileSize && playerTop < 11 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // Check k14-k15 wall (simplified)
        if (playerRight >= kWallX && playerLeft <= kWallX + tileSize &&
            playerBottom > 14 * tileSize && playerTop < 16 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // Check Y15 wall (simplified)
        if (playerRight >= yWallX && playerLeft <= yWallX + tileSize &&
            playerBottom > 15 * tileSize && playerTop < 16 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
    }
    

    
    // ========================================
    // WALL LOGIC FOR SECOND LOCATION (ЛЕС)
    // ========================================
    
    // Optimized wall collision checks for second location (Лес)
    if (gameState.currentLocation === 1) {
        
        // Pre-calculate wall boundaries for better performance
        const bWallX = wallLocationStart + 1 * tileSize; // B column
        const kWallX = wallLocationStart + 36 * tileSize; // k column
        const sWallX = wallLocationStart + 18 * tileSize; // S column
        
        const playerLeft = newX;
        const playerRight = newX + player.width;
        const playerTop = newY;
        const playerBottom = newY + player.height;
        
        // B1-B16 vertical wall - left edge (simplified)
        if (playerRight >= bWallX && playerLeft <= bWallX + tileSize &&
            playerBottom > tileSize && playerTop < 17 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // C1 horizontal wall - top edge (simplified)
        if (playerBottom > tileSize && playerTop < 2 * tileSize &&
            playerRight > (wallLocationStart + 2 * tileSize) && playerLeft < (wallLocationStart + 37 * tileSize)) {
            newY = player.y; // Block vertical movement
        }
        
        // k1-k16 vertical wall - right edge (simplified)
        if (playerRight >= kWallX && playerLeft <= kWallX + tileSize &&
            playerBottom > tileSize && playerTop < 17 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // S2-S7 vertical wall (simplified)
        if (playerRight >= sWallX && playerLeft <= sWallX + tileSize &&
            playerBottom > 2 * tileSize && playerTop < 8 * tileSize) {
            newX = player.x; // Block horizontal movement
        }
        
        // G5 single pipe - now handled by checkSpriteCollisions (pipe logic)
        
        // f9-g9 pipes - now handled by checkSpriteCollisions (pipe logic)
        // h9 wall removed completely
        
        // h2-j4 wall area completely removed - all tiles now passable
        
        // Z12-b13 pipes - now handled by checkSpriteCollisions (pipe logic)
        
        // INDIVIDUAL PIPE WALLS (like Y15 in first location)
        
        // G5 pipe collision
        const g5TileX = wallLocationStart + 6 * tileSize; // G column
        const g5TileY = 5 * tileSize; // row 5
        if (newX < g5TileX + tileSize && newX + player.width > g5TileX &&
            newY < g5TileY + tileSize && newY + player.height > g5TileY) {
            
            // Block only horizontal movement, allow vertical movement for jumping
            newX = player.x; // Keep current X position
            // Don't block Y movement - allow jumping
        }
        
        // Z12-b13 removed - now passable areas
        
        // f9 pipe collision
        const f9TileX = wallLocationStart + 31 * tileSize; // f column
        const f9TileY = 9 * tileSize; // row 9
        if (newX < f9TileX + tileSize && newX + player.width > f9TileX &&
            newY < f9TileY + tileSize && newY + player.height > f9TileY) {
            
            newX = player.x; // Keep current X position
        }
        
        // g9 pipe collision
        const g9TileX = wallLocationStart + 32 * tileSize; // g column
        const g9TileY = 9 * tileSize; // row 9
        if (newX < g9TileX + tileSize && newX + player.width > g9TileX &&
            newY < g9TileY + tileSize && newY + player.height > g9TileY) {
            
            newX = player.x; // Keep current X position
        }
    }
    
    // Check sprite collisions BEFORE updating position - optimized with caching
    let collisionResult;
    if (Math.abs(newX - player.x) > 0.1 || Math.abs(newY - player.y) > 0.1 || player.velocityY > 0) {
        collisionResult = checkSpriteCollisions(newX, newY, player.width, player.height, gameState.currentLocation, player.velocityY);
    } else {
        // Player didn't move significantly, use cached result
        collisionResult = { collision: false };
    }

    

    
    // World bounds - full world width
    if (newX < 0) player.x = 0;
    else if (newX > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
    else player.x = newX;
    
    // Handle sprite collisions
    if (collisionResult.collision) {

        
        if (collisionResult.type === 'platform') {
            // Platform collision - player can stand on it
            player.y = collisionResult.y;
            player.velocityY = 0;
            player.onGround = true;
        } else if (collisionResult.type === 'pipe') {
            // Pipe collision - block movement but keep velocities for jumping

            return; // Exit early, don't update position
        } else if (collisionResult.type === 'blocked') {
            // Blocked by wall or platform - block movement but keep velocities for jumping

            return; // Exit early, don't update position
        }
    } else {
        // No sprite collision, update Y position

        player.y = newY;
        
        // Check for platform collisions when falling - use existing collision result
        if (player.velocityY > 0) { // Only check when falling down
            // Use the collision result from above if it was a platform collision
            if (collisionResult.collision && collisionResult.type === 'platform') {
                // Hit a platform - stop falling
                player.velocityY = 0;
                player.onGround = true;
            } else {
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
    
    // Chameleon camouflage ability input
    if (keys['KeyQ']) {
        activateChameleonCamouflage();
    } else {
        chameleonCamouflage.keyPressed = false;
    }
    

    

    
    // Update chameleon camouflage
    if (chameleonCamouflage.active) {
        chameleonCamouflage.timer--;
        if (chameleonCamouflage.timer <= 0) {
            chameleonCamouflage.active = false;
        }
    }
    
    // Chameleon camouflage cooldown removed - now one use per location
    
    // Update Troub critical strike
    if (troubCriticalStrike.criticalActive) {
        troubCriticalStrike.timer--;
        
        if (troubCriticalStrike.timer <= 0) {
            troubCriticalStrike.criticalActive = false;
            troubCriticalStrike.criticalReady = false;
            troubCriticalStrike.glowIntensity = 0;
        }
    }
    
    // Update Toxin rage mode
    updateToxinRage();
    

    
                    // Update toxin attack animation
                if (toxinAttackAnimation.active) {
                    toxinAttackAnimation.timer--;
                    toxinAttackAnimation.blinkTimer++;
                    
                    // Blink every 5 frames (0.083 seconds)
                    if (toxinAttackAnimation.blinkTimer >= 5) {
                        toxinAttackAnimation.visible = !toxinAttackAnimation.visible;
                        toxinAttackAnimation.blinkTimer = 0;
                    }
                    
                    // Deactivate animation when timer expires
                    if (toxinAttackAnimation.timer <= 0) {
                        toxinAttackAnimation.active = false;
                        toxinAttackAnimation.visible = false;
                    }
                    
                    // Update toxin animation
                    if (toxinAttackAnimation.active) {
                        toxinAttackAnimation.timer--;
                        toxinAttackAnimation.blinkTimer++;
                        
                        // Blink every 5 frames (0.083 seconds)
                        if (toxinAttackAnimation.blinkTimer >= 5) {
                            toxinAttackAnimation.visible = !toxinAttackAnimation.visible;
                            toxinAttackAnimation.blinkTimer = 0;
                        }
                    }
                }
                
                // Update origami attack animation
                if (origamiAttackAnimation.active) {
                    origamiAttackAnimation.burstTimer--;
                    
                    // Create additional projectiles during burst
                    if (origamiAttackAnimation.burstTimer <= 0 && origamiAttackAnimation.burstCount < origamiAttackAnimation.maxBurstShots) {
                        const origamiX = player.x + (player.direction > 0 ? player.width : -20); // Fix position for left direction
                        const origamiY = player.y + player.height / 2;
                        const origamiVelocityX = player.direction;
                        const origamiVelocityY = 0;
                        
                        origamiProjectiles.push(new OrigamiProjectile(origamiX, origamiY, origamiVelocityX, origamiVelocityY, 'player'));
                        
                        origamiAttackAnimation.burstCount++;
                        origamiAttackAnimation.burstTimer = origamiAttackAnimation.burstDelay;
                    }
                    
                    // End burst after all shots or 2 seconds (120 frames)
                    if (origamiAttackAnimation.burstCount >= origamiAttackAnimation.maxBurstShots || origamiAttackAnimation.burstTimer <= -120) {
                        origamiAttackAnimation.active = false;
                        origamiAttackAnimation.visible = false;
                        origamiAttackAnimation.burstCount = 0;
                        origamiAttackAnimation.burstTimer = 0;
                    }
                }
                
                // Toxin special ability removed
    
    // Update current location
    gameState.currentLocation = Math.floor(player.x / LOCATION_WIDTH);
    
    // Check for enemy attacks and fire projectiles
    enemies.forEach(enemy => {
        // Skip enemy attacks if player is camouflaged
        if (chameleonCamouflage.active) {
            return; // Enemies can't see camouflaged player
        }
        
        const attackResult = enemy.attack(player);
        if (attackResult.damage > 0) {
            // Only create projectiles, no direct damage from enemy touch
            
            // Create fire projectile aimed at player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                const projectileSpeed = 4;
                let velocityX, velocityY;
                
                // Platform walker enemies shoot horizontally only
                if (enemy.type === 'platform_walker') {
                    // Use enemy's actual direction (where it's facing)
                    velocityX = enemy.direction * 0.67; // 3x slower (was 2, now 2/3)
                    velocityY = 0; // No vertical movement for platform walker
                    // Use Origami projectile for enemy (same sprite as Origami)
                    const enemyProjectile = new OrigamiProjectile(enemy.x + enemy.width/2, enemy.y + enemy.height - 23, velocityX, velocityY, 'enemy');
                    enemyProjectile.owner = 'enemy'; // Mark projectile as enemy's
                    origamiProjectiles.push(enemyProjectile);
                    return; // Skip fire projectile creation
                } else if (enemy.type === 'dragon') {
                    // Dragon shoots completely independent fireballs
                    // Check if this is the W16 dragon (should shoot left)
                    const isW16Dragon = Math.abs(enemy.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (22 * 32))) < 5;
                    // Check if this is the e10 dragon (should shoot left)
                    const isE10Dragon = Math.abs(enemy.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (30 * 32))) < 5;
                    const direction = (isW16Dragon || isE10Dragon) ? -1 : 1; // W16 and e10 shoot left, others shoot right
                    const dragonFireball = new DragonFireball(enemy.x + enemy.width/2, enemy.y + enemy.height - 28, direction);
                    dragonFireballs.push(dragonFireball);
                    return; // Skip normal fire projectile creation
                } else if (enemy.type === 'horizontal') {
                    velocityX = (dx > 0 ? 1 : -1) * projectileSpeed;
                    velocityY = 0; // No vertical movement for horizontal enemies
                } else {
                    // Regular enemies attack in all directions
                    velocityX = (dx / distance) * projectileSpeed;
                    velocityY = (dy / distance) * projectileSpeed;
                }
                
                fireProjectiles.push(new FireProjectile(enemy.x + enemy.width/2, enemy.y + enemy.height - 16, velocityX, velocityY));
            }
        }
    });
    
    // Function to check if player is on the same platform as platform_walker enemy
    function isPlayerOnEnemyPlatform(enemy) {
        if (enemy.type !== 'platform_walker' && enemy.type !== 'dragon') return true; // Other enemies can be damaged from anywhere
        
        // Allow damage on first location
        if (gameState.currentLocation === 0) {
            return true; // Allow damage on first location for now
        }
        
        // For second location, allow damage to all enemies regardless of player position
        // This allows projectiles to damage enemies even if player has left the zone
        if (gameState.currentLocation === 1) {
            return true; // Allow damage to all enemies on second location
        }
        
        // For other locations, use original logic
        const locationOffset = gameState.currentLocation * LOCATION_WIDTH;
        let platformStart, platformEnd, platformY;
        
        // Check if this is the blue zone enemy (R6-b6 platform)
        const isBlueZoneEnemy = Math.abs(enemy.spawnX - (locationOffset + (20 * 32))) < 5;
        
        if (isBlueZoneEnemy) {
            // Blue zone enemy on R6-b6 platform (columns 17-27, row 6)
            platformStart = locationOffset + (17 * 32); // R column start
            platformEnd = locationOffset + (28 * 32); // b column + 1 tile width
            platformY = 6 * 32; // Platform Y (row 6)
        } else {
            // Original enemy on S16-i16 platform (columns 18-34, row 16)
            platformStart = locationOffset + (18 * 32); // S column start
            platformEnd = locationOffset + (35 * 32); // i column + 1 tile width
            platformY = 16 * 32; // Platform Y (row 16)
        }
        
        // Check if player is in the same horizontal area as the platform
        // Allow damage when player is above or on the platform (for jumping)
        const playerInPlatformArea = player.x + player.width > platformStart && 
                                   player.x < platformEnd && 
                                   player.y + player.height <= platformY + 50; // Allow 50px above platform
        
        return playerInPlatformArea;
    }

    // Update fire projectiles
    for (let i = fireProjectiles.length - 1; i >= 0; i--) {
        const projectile = fireProjectiles[i];
        projectile.update();
        
        let shouldRemove = false;
        
        // Check collision with player
        if (projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y) {
            // Toxin invincibility removed - all characters take damage
            {
                gameState.health -= 1; // Each hit takes 1 health point
                
                // Instantly update Toxin rage mode if player is Toxin
                if (player.character && player.character.name === 'Toxin') {
                    updateToxinRage();
                    // Reset auto-fire timer for instant rage activation
                    toxinRage.autoFireTimer = 0;
                }
                
                // Check if player is dead
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    gameState.gameOver = true;
                }
            }
            
            shouldRemove = true;
        }
        
        // Check collision with enemies (only for player projectiles, not enemy projectiles)
        if (!shouldRemove && (gameState.currentLocation === 0 || gameState.currentLocation === 1) && !projectile.owner) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    
                    // Check if player is on the same platform as platform_walker enemy
                    if (isPlayerOnEnemyPlatform(enemy)) {
                        enemy.health -= projectile.damage;
                        if (enemy.health <= 0) {
                            enemies.splice(j, 1);
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        }
        
        // Remove off-screen projectiles
        if (!shouldRemove && projectile.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            fireProjectiles.splice(i, 1);
        }
    }
    
    // Update dragon fireballs (completely independent)
    for (let i = dragonFireballs.length - 1; i >= 0; i--) {
        const fireball = dragonFireballs[i];
        fireball.update();
        
        let shouldRemove = false;
        
        // Check collision with player - only when fireball reaches hero sprite (not when flying above)
        if (fireball.x < player.x + player.width &&
            fireball.x + fireball.width > player.x &&
            fireball.y >= player.y && // Fireball must be at or below player's top edge
            fireball.y + fireball.height <= player.y + player.height) { // Fireball must be at or above player's bottom edge
            // Player hit by dragon fireball
            gameState.health -= 1; // Each hit takes 1 health point
            
            // Instantly update Toxin rage mode if player is Toxin
            if (player.character && player.character.name === 'Toxin') {
                updateToxinRage();
                // Reset auto-fire timer for instant rage activation
                toxinRage.autoFireTimer = 0;
            }
            
            // Check if player is dead
            if (gameState.health <= 0) {
                gameState.health = 0;
                gameState.gameOver = true;
            }
            
            shouldRemove = true;
        }
        
        // Remove if off screen
        if (!shouldRemove && fireball.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            dragonFireballs.splice(i, 1);
        }
    }
    
    // Update arrow projectiles
    for (let i = arrowProjectiles.length - 1; i >= 0; i--) {
        const projectile = arrowProjectiles[i];
        projectile.update();
        
        let shouldRemove = false;
        
        // Check collision with enemies (both locations)
        if ((gameState.currentLocation === 0 || gameState.currentLocation === 1)) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    
                    // Check if player is on the same platform as platform_walker enemy
                    if (isPlayerOnEnemyPlatform(enemy)) {
                        enemy.health -= projectile.damage;
                        if (enemy.health <= 0) {
                            enemies.splice(j, 1);
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        }
        
        // Remove off-screen projectiles
        if (!shouldRemove && projectile.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            arrowProjectiles.splice(i, 1);
        }
    }
    
    // Update toxin projectiles
    for (let i = toxinProjectiles.length - 1; i >= 0; i--) {
        const projectile = toxinProjectiles[i];
        projectile.update();
        
        let shouldRemove = false;
        
        // Check collision with enemies (both locations)
        if ((gameState.currentLocation === 0 || gameState.currentLocation === 1)) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    
                    // Check if player is on the same platform as platform_walker enemy
                    if (isPlayerOnEnemyPlatform(enemy)) {
                        enemy.health -= projectile.damage;
                        if (enemy.health <= 0) {
                            enemies.splice(j, 1);
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        }
        
        // Remove off-screen projectiles
        if (!shouldRemove && projectile.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            toxinProjectiles.splice(i, 1);
        }
    }
    
    // Update origami projectiles
    for (let i = origamiProjectiles.length - 1; i >= 0; i--) {
        const projectile = origamiProjectiles[i];
        projectile.update();
        

        
        let shouldRemove = false;
        
        // Check collision with player (only enemy projectiles should damage player)
        if (projectile.owner !== 'player' && projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y) {
            gameState.health -= 1; // Each hit takes 1 health point
            
            // Instantly update Toxin rage mode if player is Toxin
            if (player.character && player.character.name === 'Toxin') {
                updateToxinRage();
                // Force immediate attack cooldown update
                player.attackCooldown = Math.min(player.attackCooldown, toxinRage.currentAttackRate);
            }
            
            // Check if player is dead
            if (gameState.health <= 0) {
                gameState.health = 0;
                gameState.gameOver = true;
            }
            
            shouldRemove = true;
        }
        
        // Check collision with enemies (only for player projectiles, not enemy projectiles)
        if (!shouldRemove && (gameState.currentLocation === 0 || gameState.currentLocation === 1) && projectile.owner === 'player') {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    
                    // Check if player is on the same platform as platform_walker enemy
                    if (isPlayerOnEnemyPlatform(enemy)) {
                        enemy.health -= projectile.damage;
                        
                        // Activate bleeding effect for Origami projectiles
                        if (player.character && player.character.name === 'Origami') {
                            // Create independent bleeding effect
                            activeBleedingEffects.push(new BleedingEffect(enemy));
                            // Remove projectile immediately
                            shouldRemove = true;
                        } else {
                            shouldRemove = true;
                        }
                        
                        if (enemy.health <= 0) {
                            enemies.splice(j, 1);
                        }
                        break;
                    }
                }
            }
        }
        
        // Remove off-screen projectiles
        if (!shouldRemove && projectile.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            origamiProjectiles.splice(i, 1);
        }
    }
    
    // Update chameleon projectiles
    for (let i = chameleonProjectiles.length - 1; i >= 0; i--) {
        const projectile = chameleonProjectiles[i];
        projectile.update();
        
        let shouldRemove = false;
        
        // Check collision with enemies (both locations)
        if ((gameState.currentLocation === 0 || gameState.currentLocation === 1)) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    
                    // Check if player is on the same platform as platform_walker enemy
                    if (isPlayerOnEnemyPlatform(enemy)) {
                        enemy.health -= projectile.damage;
                        if (enemy.health <= 0) {
                            enemies.splice(j, 1);
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        }
        
        // Remove off-screen projectiles
        if (!shouldRemove && projectile.isOffScreen()) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            chameleonProjectiles.splice(i, 1);
        }
    }
    
            // Update enemies
        enemies.forEach(enemy => enemy.update(player));
        
        // Update bleeding effects - optimized with visibility check
        for (let i = activeBleedingEffects.length - 1; i >= 0; i--) {
            const bleedingEffect = activeBleedingEffects[i];
            // Only update bleeding effects for visible enemies
            if (bleedingEffect.target) {
                const enemyScreenX = bleedingEffect.target.x - cameraX;
                if (enemyScreenX > -100 && enemyScreenX < canvas.width + 100) {
                    const shouldKeep = bleedingEffect.update();
                    if (!shouldKeep) {
                        activeBleedingEffects.splice(i, 1);
                    }
                }
            } else {
                // Remove invalid bleeding effects
                activeBleedingEffects.splice(i, 1);
            }
        }
    

    


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
    
    // Update Toxin auto-fire system
    if (toxinRage.autoFireActive && player.character && player.character.name === 'Toxin') {
        toxinRage.autoFireTimer++;
        if (toxinRage.autoFireTimer >= toxinRage.autoFireDelay) {
            // Create additional projectile
            const toxinX = player.x + (player.direction > 0 ? player.width : 0);
            const toxinY = player.y + player.height / 2 + 6.5;
            const toxinVelocityX = player.direction;
            const toxinVelocityY = 0;
            
            const newToxinProjectile = new ToxinProjectile(toxinX, toxinY, toxinVelocityX, toxinVelocityY);
            newToxinProjectile.speed = 9;
            toxinProjectiles.push(newToxinProjectile);
            
            toxinRage.autoFireTimer = 0; // Reset timer
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
    
            if (healthText) healthText.textContent = `Health: ${gameState.health}/3`;
        if (healthFill) healthFill.style.width = `${(gameState.health / 3) * 100}%`;
    
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
        } else if (chameleonCamouflage.active && gameState.selectedCharacter === 'chameleon') {
            abilityInfo.textContent = 'CAMOUFLAGE ACTIVE!';
            abilityInfo.style.color = '#00ff00';
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
        } else if (gameState.selectedCharacter === 'chameleon' && !chameleonCamouflage.usedThisLocation) {
            abilityInfo.textContent = 'CAMOUFLAGE READY! (Q)';
            abilityInfo.style.color = '#00ff00';
        } else if (gameState.selectedCharacter === 'chameleon' && chameleonCamouflage.usedThisLocation) {
            abilityInfo.textContent = 'CAMOUFLAGE USED!';
            abilityInfo.style.color = '#ff8800';
        } else if (gameState.selectedCharacter === 'troub' && troubCriticalStrike.criticalReady) {
            abilityInfo.textContent = 'SUPER SHOT READY!';
            abilityInfo.style.color = '#ffaa00';
        } else if (gameState.selectedCharacter === 'troub' && troubCriticalStrike.criticalActive) {
            abilityInfo.textContent = 'SUPER SHOT FIRED!';
            abilityInfo.style.color = '#ff6600';
        } else if (gameState.selectedCharacter === 'toxin') {
            // Show current rage level based on health (3 health total)
            if (gameState.health <= 1) {
                abilityInfo.textContent = 'MAXIMUM RAGE! (8x SPEED)';
                abilityInfo.style.color = '#ff0000';
            } else if (gameState.health <= 2) {
                abilityInfo.textContent = 'HIGH RAGE! (4x SPEED)';
                abilityInfo.style.color = '#ff4400';
            } else {
                abilityInfo.textContent = 'RAGE MODE: READY';
                abilityInfo.style.color = '#ffaa00';
            }
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
                
                // Draw grid overlay for level design (HIDDEN)
                // if (gameState.currentLocation === 0) {
                //     drawGridOverlay(screenX);
                // }
                
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
                
                // Draw sprite 4.1 from new industrial tileset on B16 coordinates

                
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
                
                // I14 platform removed - no longer needed
                
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
                
                // Draw sprite 0.0 from third industrial tileset (T) on I14 coordinates
                drawSprite0_0OnI14(screenX);
                
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
                
                // Grid overlay removed for second location
                
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
                
                // Draw sprite 0.0 from O industrial tileset on B1 coordinates
                drawSprite0_0OnB1(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on C1-Z1 coordinates
                drawSprite1_0OnC1Z1(screenX);
                
                // Draw sprite 2.0 from O industrial tileset on k1 coordinates
                drawSprite2_0OnK1(screenX);
                
                // Draw sprite 0.1 from O industrial tileset on B2-B16 coordinates
                drawSprite0_1OnB2B16(screenX);
                
                // Draw sprite 2.1 from O industrial tileset on k2-k16 coordinates
                drawSprite2_1OnK2K16(screenX);
                
                // Draw sprite 1.1 from O industrial tileset on C6 coordinates
                drawSprite1_1OnC6(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on D6 coordinates
                drawSprite1_0OnD6(screenX);
                
                // Draw sprite 2.0 from O industrial tileset on R15 coordinates
                drawSprite2_0OnR15(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on S16+ (16 cells horizontal)
                drawSprite1_0OnS16Plus(screenX);
                
                // Draw sprite 2.0 from O industrial tileset on j16 coordinates
                drawSprite2_0OnJ16(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on i16 coordinates
                drawSprite1_0OnI16(screenX);
                
                // Draw sprites from T industrial tileset - K4-L4 row
                drawTSprite1_0OnK4(screenX);
                drawTSprite2_0OnL4(screenX);
                
                // Draw sprites from T industrial tileset - H4-J4 row
                drawTSprite0_0OnH4(screenX);
                console.log('🎯 Drawing I4 sprite at location:', gameState.currentLocation);
                drawTSprite1_0OnI4(screenX);
                drawTSprite1_0OnJ4(screenX);
                
                // Draw sprites from T industrial tileset - 3x3 grid M4-O6
                drawTSprite0_1OnM4(screenX);
                drawTSprite1_1OnN4(screenX);
                drawTSprite2_1OnO4(screenX);
                drawTSprite0_2OnM5(screenX);
                drawTSprite1_2OnN5(screenX);
                drawTSprite2_2OnO5(screenX);
                drawTSprite0_3OnM6(screenX);
                drawTSprite1_3OnN6(screenX);
                drawTSprite2_3OnO6(screenX);
                
                // Draw sprites from T industrial tileset - S column
                drawTSprite5_3OnS1(screenX);
                drawTSprite3_2OnS2S5(screenX);
                drawTSprite5_2OnS6(screenX);
                
                // Draw sprites from T industrial tileset - rows 6-7
                drawTSprite0_1OnR6(screenX);
                drawTSprite1_1OnT6Plus(screenX);
                drawTSprite0_3OnR7(screenX);
                drawTSprite1_3OnS7(screenX);
                drawTSprite1_3OnT7Plus(screenX);
                drawTSprite2_1Onb6(screenX);
                drawTSprite2_3Onb7(screenX);
                
                // Draw sprites from T industrial tileset - rows 8-10
                drawTSprite0_1Onf8(screenX);
                drawTSprite1_1Ong8(screenX);
                drawTSprite2_1Onh8(screenX);
                drawTSprite0_2Onf9(screenX);
                drawTSprite1_2Ong9(screenX);
                drawTSprite2_2Onh9(screenX);
                drawTSprite0_2Onf10(screenX);
                drawTSprite1_2Ong10(screenX);
                drawTSprite2_2Onh10(screenX);
                // Draw sprites from O industrial tileset - h2-h4, i2-i4, j2-j4
                drawOSprite0_1Onh2(screenX);
                drawOSprite1_1Oni2(screenX);
                drawOSprite1_1Onj2(screenX);
                drawOSprite0_1Onh3(screenX);
                drawOSprite1_1Oni3(screenX);
                drawOSprite1_1Onj3(screenX);
                drawOSprite0_2Onh4(screenX);
                drawOSprite1_2Oni4(screenX);
                drawOSprite2_2Onj4(screenX);
                
                // Draw sprites from O industrial tileset - E10-H10 and E11-F11
                drawOSprite0_0OnE10(screenX);
                drawOSprite1_0OnF10(screenX);
                drawOSprite1_0OnG10(screenX);
                drawOSprite2_0OnH10(screenX);
                drawOSprite0_2OnE11(screenX);
                drawOSprite2_2OnF11(screenX);
                
                drawTSprite1_1Oni10(screenX);
                drawTSprite1_1One10(screenX);
                drawTSprite2_1Onj10(screenX);
                drawTSprite0_1OnU10(screenX);
                drawTSprite1_1OnV10Plus(screenX);
                
                // Draw sprites from T industrial tileset - row 11
                drawTSprite0_3OnU11(screenX);
                drawTSprite1_3OnV11Plus(screenX);
                drawTSprite0_0OnK11(screenX);
                drawTSprite2_0OnL11(screenX);
                drawTSprite0_2OnZ11(screenX);
                drawTSprite1_2Ona11(screenX);
                drawTSprite2_2Onb11(screenX);
                drawTSprite1_3Oni11(screenX);
                drawTSprite5_0Onj11(screenX);
                
                // Draw sprites from T industrial tileset - row 12
                drawTSprite0_0OnO12(screenX);
                drawTSprite1_0OnP12(screenX);
                drawTSprite1_0OnQ12(screenX);
                drawTSprite2_0OnR12(screenX);
                drawTSprite0_2OnZ12(screenX);
                drawTSprite1_2Ona12(screenX);
                drawTSprite2_2Onb12(screenX);
                drawTSprite2_2Onj12(screenX);
                
                // Draw sprites from T industrial tileset - row 13
                drawTSprite0_3OnZ13(screenX);
                drawTSprite1_3Ona13(screenX);
                drawTSprite2_3Onb13(screenX);
                drawTSprite2_2Onj13(screenX);
                
                // Draw sprites from T industrial tileset - rows 14-15
                drawTSprite2_2Onj14(screenX);
                drawTSprite2_3Onj15(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on E6 coordinates
                drawSprite1_0OnE6(screenX);
                
                // Draw sprite 2.0 from O industrial tileset on F6 coordinates
                drawSprite2_0OnF6(screenX);
                
                // Draw sprite 3.1 from third industrial tileset (T) on G4 coordinates
                drawSprite3_1OnG4(screenX);
                
                // Draw sprite 3.2 from third industrial tileset (T) on G5 coordinates
                drawSprite3_2OnG5(screenX);
                
                // Draw sprite 3.2 from third industrial tileset (T) on G6 coordinates
                drawSprite3_2OnG6(screenX);
                
                // Draw sprite 3.3 from third industrial tileset (T) on G7 coordinates
                drawSprite3_3OnG7(screenX);
                
                
                
                
                
                // Draw sprite 0.2 from O industrial tileset on B17 coordinates
                drawSprite0_2OnB17(screenX);
                
                // Draw sprite 1.2 from O industrial tileset on C17-J17 coordinates
                drawSprite1_2OnC17J17(screenX);
                
                // Draw sprite 1.2 from O industrial tileset on K17-Y17 coordinates
                drawSprite1_2OnK17Y17(screenX);
                
                // Draw sprite 2.2 from O industrial tileset on k17 coordinates
                drawSprite2_2OnK17(screenX);
                
                // Draw sprite 1.1 from O industrial tileset on C16-R16 coordinates
                drawSprite1_1OnC16R16(screenX);
                
                // Draw sprite 1.0 from O industrial tileset on C15-R15 coordinates
                drawSprite1_0OnC15R15(screenX);
                

            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
                
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
                
                // Draw sprite 0.2 from O industrial tileset on B17 coordinates
                drawSprite0_2OnB17(screenX);
                
                // Draw sprite 1.2 from O industrial tileset on C17-J17 coordinates
                drawSprite1_2OnC17J17(screenX);
                
                // Draw sprite 1.2 from O industrial tileset on K17-Y17 coordinates
                drawSprite1_2OnK17Y17(screenX);
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
        
        // Draw portal between columns j and k (around rows 2-4) - only for first location
        if (gameState.currentLocation === 0) {
            // Position portal to the right, more towards column k
            const portalX = locationX + (36.5 * 32) - 40; // Shifted right, more towards column k
            const portalScreenX = portalX - cameraX;
                 
                 // Portal animation
                 const portalPulse = Math.sin(Date.now() * 0.005) * 0.2 + 1;
                 const portalGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                 
                                 // Portal should be at the top of the grid (around rows 2-4)
                const portalHeight = 120;
                const portalY = 2 * 32 - 11; // Position at row 2 (middle position) - moved up by 11 pixels
            
            // Check if all enemies are dead
            const allEnemiesDead = enemies.length === 0 || enemies.every(enemy => enemy.health <= 0);
                 
                 if (portalSprite.complete) {
                     // Draw main portal
                     ctx.save();
                     
                     // Apply black and white filter if enemies are still alive
                     if (!allEnemiesDead) {
                         ctx.filter = 'grayscale(100%)';
                     }
                     
                     ctx.drawImage(portalSprite, portalScreenX, portalY, 80, 120);
                     ctx.restore();
                     
                     // Draw soft portal glow effect only on front side
                     ctx.save();
                     ctx.globalAlpha = portalGlow * 0.3; // Much softer glow
                     
                     // Apply black and white filter to glow if enemies are still alive
                     if (!allEnemiesDead) {
                         ctx.filter = 'grayscale(100%)';
                     }
                     
                     ctx.drawImage(portalSprite, portalScreenX - 3, portalY - 3, 86, 126);
                     ctx.restore();
                     
                     // Draw soft portal particles only on front side
                     for (let i = 0; i < 6; i++) {
                         const angle = (Date.now() * 0.001 + i * 60) * Math.PI / 180; // Slower rotation
                         const particleX = portalScreenX + 40 + Math.cos(angle) * (25 + Math.sin(Date.now() * 0.005) * 5); // Smaller radius
                         const particleY = portalY + 60 + Math.sin(angle) * (25 + Math.sin(Date.now() * 0.005) * 5);
                         
                         // Use black and white particles if enemies are alive, colored if all dead
                         if (allEnemiesDead) {
                             ctx.fillStyle = `rgba(255, 100, 255, ${0.4 - i * 0.05})`; // Colored particles
                         } else {
                             ctx.fillStyle = `rgba(128, 128, 128, ${0.4 - i * 0.05})`; // Gray particles
                         }
                         
                         ctx.beginPath();
                         ctx.arc(particleX, particleY, 1.5 + Math.sin(Date.now() * 0.01 + i) * 0.5, 0, Math.PI * 2); // Smaller particles
                         ctx.fill();
                     }
                 } else {
                     // Fallback portal with animation
                     if (allEnemiesDead) {
                         ctx.fillStyle = `rgba(0, 0, 255, ${portalGlow})`; // Blue when enemies dead
                         ctx.strokeStyle = `rgba(255, 100, 255, ${portalGlow})`; // Purple border
                     } else {
                         ctx.fillStyle = `rgba(64, 64, 64, ${portalGlow})`; // Gray when enemies alive
                         ctx.strokeStyle = `rgba(128, 128, 128, ${portalGlow})`; // Gray border
                     }
                     
                     ctx.fillRect(portalScreenX, portalY, 80, 120);
                     
                     // Animated border
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
                 // Toxin special ability visual removed
        if (false) {
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
                 ctx.fillStyle = player.character.color; // Toxin special ability color removed
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else if (player.character.name === 'Chameleon' && characterSprites.chameleon && characterSprites.chameleon.complete) {
             try {
                 ctx.save();
                 
                 // Apply transparency effect if camouflage is active
                 if (chameleonCamouflage.active) {
                     ctx.globalAlpha = chameleonCamouflage.transparency;
                 }
                 
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
                 
                 // Apply transparency effect if camouflage is active
                 if (chameleonCamouflage.active) {
                     ctx.globalAlpha = chameleonCamouflage.transparency;
                 }
                 
                 ctx.fillRect(screenX, player.y, player.width, player.height);
                 ctx.globalAlpha = 1.0; // Reset alpha
             }
         } else if (player.character.name === 'Troub' && characterSprites.troub && characterSprites.troub.complete) {
             try {
                 ctx.save();
                 
                 // Apply glow effect if critical strike is ready or active
                 if (troubCriticalStrike.criticalReady || troubCriticalStrike.criticalActive) {
                     ctx.shadowColor = '#ffaa00';
                     ctx.shadowBlur = 20 * troubCriticalStrike.glowIntensity;
                     ctx.globalAlpha = 0.8 + (0.2 * troubCriticalStrike.glowIntensity);
                 }
                 
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
                 
                 // Apply glow effect if critical strike is ready or active
                 if (troubCriticalStrike.criticalReady || troubCriticalStrike.criticalActive) {
                     ctx.shadowColor = '#ffaa00';
                     ctx.shadowBlur = 20 * troubCriticalStrike.glowIntensity;
                     ctx.globalAlpha = 0.8 + (0.2 * troubCriticalStrike.glowIntensity);
                 }
                 
                 ctx.fillRect(screenX, player.y, player.width, player.height);
                 ctx.globalAlpha = 1.0; // Reset alpha
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
    
    // Reset global alpha at the end of drawPlayer
    ctx.globalAlpha = 1.0;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const screenX = enemy.x - cameraX;
        
        // Only draw if enemy is visible on screen
        if (screenX > -enemy.width && screenX < canvas.width) {
            // Draw PNG enemy, platform walker, dragon, or test enemy
            if (enemy.type === 'png' || enemy.type === 'platform_walker' || enemy.type === 'dragon' || enemy.type === 'test') {
                // Determine enemy direction based on player position
                const enemyDirection = enemy.direction;
                
                                // Draw Dragon enemy sprite
                if (enemy.type === 'dragon' && enemySprites.dragon && enemySprites.dragon.complete) {
 
                    try {
                        ctx.save();
                        // Check if this is the W16 dragon (should always face left/reflected)
                        const isW16Dragon = Math.abs(enemy.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (22 * 32))) < 5;
                        // Check if this is the e10 dragon (should always face left)
                        const isE10Dragon = Math.abs(enemy.spawnX - ((gameState.currentLocation * LOCATION_WIDTH) + (30 * 32))) < 5;
                        
                        if (isW16Dragon || isE10Dragon) {
                            // W16 and e10 dragons always face left (reflected)
                            ctx.scale(-1, 1);
                            ctx.drawImage(enemySprites.dragon, -(screenX + 80), enemy.y, 80, 48);
                        } else if (enemyDirection === 1) {
                            // Flip dragon horizontally when facing right (original sprite faces left)
                            ctx.scale(-1, 1);
                            ctx.drawImage(enemySprites.dragon, -(screenX + 80), enemy.y, 80, 48);
                        } else {
                            // Draw normally when facing left (original direction)
                            ctx.drawImage(enemySprites.dragon, screenX, enemy.y, 80, 48);
                        }
                        ctx.restore();
                    } catch (error) {
                        console.error('Error drawing Dragon enemy sprite:', error);
                        // Fallback to colored rectangle
                        ctx.fillStyle = '#8B4513'; // Brown color for dragon
                        ctx.fillRect(screenX, enemy.y, 80, 48);
                    }
                }
                // Draw Forest enemy sprite (platform_walker)
                else if (enemy.type === 'platform_walker' && enemySprites.forestEnemy && enemySprites.forestEnemy.complete) {
                    try {
                        ctx.save();
                        if (enemyDirection === -1) {
                            // Flip enemy horizontally when facing left
                            ctx.scale(-1, 1);
                            ctx.drawImage(enemySprites.forestEnemy, -(screenX + 80), enemy.y, 80, 48);
                        } else {
                            // Draw normally when facing right
                            ctx.drawImage(enemySprites.forestEnemy, screenX, enemy.y, 80, 48);
                        }
                        ctx.restore();
                    } catch (error) {
                        console.error('Error drawing Forest enemy sprite:', error);
                        // Fallback to colored rectangle
                        ctx.fillStyle = '#00FF00'; // Green color for platform_walker
                        ctx.fillRect(screenX, enemy.y, 80, 48);
                    }
                }
                // Draw PNG enemy sprite exactly like character sprites
                else if (enemySprites.pngEnemy && enemySprites.pngEnemy.complete) {
                    try {
                        ctx.save();
                        if (enemyDirection === -1) {
                            // Flip enemy horizontally when facing left
                            ctx.scale(-1, 1);
                            ctx.drawImage(enemySprites.pngEnemy, -(screenX + 80), enemy.y, 80, 48);
                        } else {
                            // Draw normally when facing right
                            ctx.drawImage(enemySprites.pngEnemy, screenX, enemy.y, 80, 48);
                        }
                        ctx.restore();
                    } catch (error) {
                        console.error('Error drawing PNG enemy sprite:', error);
                        // Fallback to colored rectangle
                        ctx.fillStyle = '#FF6B6B';
                        ctx.fillRect(screenX, enemy.y, 80, 48);
                    }
                } else {
                    // Fallback to colored rectangle while sprite loads
                    if (enemy.type === 'dragon') {
                        ctx.fillStyle = '#8B4513'; // Brown color for dragon
                    } else if (enemy.type === 'platform_walker') {
                        ctx.fillStyle = '#00FF00'; // Green color for platform_walker
                    } else {
                        ctx.fillStyle = '#FF6B6B'; // Red color for others
                    }
                    ctx.fillRect(screenX, enemy.y, 80, 48);
                }
                

                
                // Draw enemy health bar for all enemies (to show bleeding effect)
                const healthBarWidth = 60;
                const healthBarHeight = 4;
                const healthBarX = screenX + 10;
                const healthBarY = enemy.y - 10;
                
                // Calculate health percentage
                let maxHealth;
                if (enemy.type === 'platform_walker') {
                    maxHealth = 108;
                } else if (enemy.type === 'dragon') {
                    maxHealth = 30;
                } else {
                    maxHealth = 30;
                }
                
                const healthPercentage = enemy.health / maxHealth;
                
                // Background (gray)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
                
                // Health bar (green to red based on health)
                const healthWidth = Math.max(0, healthBarWidth * healthPercentage); // Prevent negative width
                if (healthPercentage > 0.6) {
                    ctx.fillStyle = '#00FF00'; // Green
                } else if (healthPercentage > 0.3) {
                    ctx.fillStyle = '#FFFF00'; // Yellow
                } else {
                    ctx.fillStyle = '#FF0000'; // Red
                }
                ctx.fillRect(healthBarX, healthBarY, healthWidth, healthBarHeight);
                

                

            }
            // Draw regular fire enemies and horizontal enemies
            else if (enemy.type === 'fire' || enemy.type === 'horizontal') {
                // Determine enemy direction based on movement direction
                const enemyDirection = enemy.direction;
                
                // Draw stable colored rectangles for all enemies
                if (enemy.type === 'horizontal') {
                    // Use different colors for different locations
                        ctx.fillStyle = gameState.currentLocation === 1 ? '#00FF00' : '#0000FF';
                    ctx.fillRect(screenX, enemy.y, 80, 48);
                } else if (enemy.type === 'fire') {
                    ctx.fillStyle = '#FF6B6B';
                    ctx.fillRect(screenX, enemy.y, 80, 48);
                }
                

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
            // Smaller size for dragon fireballs
            const isDragonFireball = projectile.owner === 'enemy';
            const sizeMultiplier = isDragonFireball ? 0.4 : 1.0; // Dragon fireballs 40% of normal size
            
            // Draw fire projectile with trail effect
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/2 + 3) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Main projectile
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/2) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/3) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire trail particles (smaller for dragon)
            const trailCount = isDragonFireball ? 1 : 2; // Fewer trail particles for dragon
            for (let i = 0; i < trailCount; i++) {
                const trailX = screenX - projectile.velocityX * (i + 1) * 0.5;
                const trailY = projectile.y - projectile.velocityY * (i + 1) * 0.5;
                ctx.fillStyle = `rgba(255, 170, 0, ${0.6 - i * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, (3 - i) * sizeMultiplier, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // Draw dragon fireballs with the same logic but from separate array
    dragonFireballs.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Dragon fireballs are always small size (0.4 multiplier)
            const sizeMultiplier = 0.4;
            
            // Draw fire projectile with trail effect
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/2 + 3) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Main projectile
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/2) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, (projectile.width/3) * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire trail particles (1 particle for dragon)
            const trailX = screenX - 3.0 * 0.5; // Fixed velocity for trail
            const trailY = projectile.y;
            ctx.fillStyle = 'rgba(255, 170, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, 3 * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawArrowProjectiles() {
    arrowProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Check if this is a critical arrow (high damage)
            const isCritical = projectile.damage > 30;
            
            // Draw arrow sprite if available
            if (arrowSprite && arrowSprite.complete) {
                try {
                    ctx.save();
                    
                    // Apply glow effect for critical arrows
                    if (isCritical) {
                        ctx.shadowColor = '#ffaa00';
                        ctx.shadowBlur = 15;
                        ctx.globalAlpha = 0.9;
                    }
                    
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
                    ctx.fillStyle = isCritical ? '#ffaa00' : '#8B4513';
                    ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
                }
            } else {
                // Fallback to colored rectangle
                ctx.fillStyle = isCritical ? '#ffaa00' : '#8B4513';
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
                        ctx.drawImage(origamiAttackSprite, -screenX - projectile.width, projectile.y - 3, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(origamiAttackSprite, screenX, projectile.y - 3, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    ctx.fillStyle = '#ff6b6b';
                    ctx.fillRect(screenX, projectile.y - 3, projectile.width, projectile.height);
                }
            } else {
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(screenX, projectile.y - 3, projectile.width, projectile.height);
            }
        }
    });
}

function drawToxinAttackAnimation() {
    // RADICAL DEBUG: Always draw fire animation for Toxin character
    if (player.character && player.character.name === 'Toxin') {
        const screenX = player.x - cameraX;
        const testY = player.y + player.height / 2 + 5;
        const testX = player.direction > 0 ? screenX + player.width + 32 : screenX - 15;
        
        // Draw fire animation instead of lime rectangle with blinking
        if (toxinAttackSprite && toxinAttackSprite.complete && toxinAttackAnimation.visible) {
            const fireWidth = 30; // 30 pixels for both sides
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
            const fireWidth = 30; // 30 pixels for both sides
            ctx.fillStyle = 'lime';
            ctx.fillRect(testX, testY, fireWidth, 15);
        }
    }
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
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Press SPACE to return to character selection', canvas.width / 2, canvas.height / 2 + 30);
}

function drawGameWonScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME COMPLETED', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('All enemies defeated!', canvas.width / 2, canvas.height / 2 + 30);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Press SPACE to return to character selection', canvas.width / 2, canvas.height / 2 + 80);
}

// Main game loop
function gameLoop() {
    // Safety check - make sure canvas and context are initialized
    if (!canvas || !ctx) {
        console.error('Canvas or context not initialized!');
        return;
    }
    
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
        

        
        // Update enemies - optimized with visibility check
        const currentLocation = gameState.currentLocation;
        enemies.forEach(enemy => {
            // Only update enemies that are visible on screen or close to it
            const enemyScreenX = enemy.x - cameraX;
            if (enemyScreenX > -100 && enemyScreenX < canvas.width + 100) {
                enemy.update(player);
            }
        });
        
        // Check for victory - if all enemies are defeated on second location
        if (enemies.length === 0 && currentLocation === 1 && !gameState.gameWon && !gameState.gameOver) {
            gameState.gameWon = true;
        }
        

        
        drawEnemies();
        
        drawFireProjectiles();
        drawArrowProjectiles();
        drawToxinProjectiles();
        drawOrigamiProjectiles();
        drawChameleonProjectiles();
        drawToxinAttackAnimation();
        drawPlayer();
        
        // Draw platform indicators for all locations - HIDDEN FOR PRODUCTION
        // drawPlatformIndicators(cameraX);
        
        // Draw yellow box for enemy shooting zone S12+17, S13+17, S14+17, S15+17 (HIDDEN)
        // if (gameState.currentLocation === 1) {
        //     const ctx = canvas.getContext('2d');
        //     const tileSize = 32;
        //     
        //     // Calculate zone coordinates
        //     const zoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (18 * 32); // S column
        //     const zoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (35 * 32); // j column (end of map)
        //     const zoneStartY = 12 * 32; // Row 12
        //     const zoneEndY = 32 * 32; // Row 32 (S15+17)
        //     
        //     // Draw yellow box
        //     ctx.save();
        //     ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Semi-transparent yellow
        //     ctx.fillRect(zoneStartX - cameraX, zoneStartY, zoneEndX - zoneStartX, zoneEndY - zoneStartY);
        //     ctx.restore();
        // }
        
        // Draw blue box for zone T2-g2, T3-g3, T4-g4, T5-g5 (HIDDEN)
        // if (gameState.currentLocation === 1) {
        //     const ctx = canvas.getContext('2d');
        //     const tileSize = 32;
        //     
        //     // Calculate blue zone coordinates - T2-g2, T3-g3, T4-g4, T5-g5
        //     const blueZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (19 * 32); // T column
        //     const blueZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (33 * 32); // g column (33 = 6+27)
        //     const blueZoneStartY = 2 * 32; // Row 2
        //     const blueZoneEndY = 6 * 32; // Row 5 (включая T5-g5)
        //     
        //     // Draw blue box
        //     ctx.save();
        //     ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent blue
        //     ctx.fillRect(blueZoneStartX - cameraX, blueZoneStartY, blueZoneEndX - blueZoneStartX, blueZoneEndY - blueZoneStartY);
        //     ctx.restore();
        // }
        
        // Draw purple box for zone Z13-j13, Z14-j14 (first location) (HIDDEN)
        // if (gameState.currentLocation === 0) {
        //     const ctx = canvas.getContext('2d');
        //     const tileSize = 32;
        //     
        //     // Calculate purple zone coordinates - Z13-j13, Z14-j14
        //     const purpleZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (25 * 32); // Z column
        //     const purpleZoneEndX = (gameState.currentLocation * LOCATION_WIDTH) + (36 * 32); // j column
        //     const purpleZoneStartY = 13 * 32; // Row 13
        //     const purpleZoneEndY = 15 * 32; // Row 14 (включая Z14-j14)
        //     
        //     // Draw purple box
        //     ctx.save();
        //     ctx.fillStyle = 'rgba(128, 0, 128, 0.3)'; // Semi-transparent purple
        //     ctx.fillRect(purpleZoneStartX - cameraX, purpleZoneStartY, purpleZoneEndX - purpleZoneStartX, purpleZoneEndY - purpleZoneStartY);
        //     ctx.restore();
        //     
        //     // Draw orange box for dragon activation zone
        //     const dragonZoneStartX = (gameState.currentLocation * LOCATION_WIDTH) + (23 * 32); // From X column (23, excludes U,V,W)
        //     const dragonZoneEndX = (gameState.currentLocation + 1) * LOCATION_WIDTH; // Until end of location
        //     const dragonZoneStartY = 7 * 32; // From row 7
        //     const dragonZoneEndY = 12 * 32; // 2 rows below platform
        //     
        //     ctx.save();
        //     ctx.fillStyle = 'rgba(255, 165, 0, 0.3)'; // Semi-transparent orange
        //     ctx.fillRect(dragonZoneStartX - cameraX, dragonZoneStartY, dragonZoneEndX - dragonZoneStartX, dragonZoneEndY - dragonZoneStartY);
        //     ctx.restore();
        // }
        
        // Draw game over screen if player is dead
        if (gameState.gameOver) {
            drawGameOverScreen();
        }
        
        // Draw game won screen if all enemies are defeated
        if (gameState.gameWon) {
            drawGameWonScreen();
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


// Initialize event listeners (called after canvas is initialized)
function initializeEventListeners() {
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
}

// Load all game resources
function loadGameResources() {
    try {
        console.log('Loading game resources...');
        
        // Load all background images
        loadHomeBackground();
        loadForestBackground();
        loadStreetBackground();
        loadCastleBackground();
        loadIslandBackground();
        loadPortalBackground();
        loadHyperspaceBackground();
        
        // Load tilesets
        loadIndustrialTiles();
        loadNewIndustrialTiles();
        loadThirdIndustrialTiles();
        loadFourthIndustrialTiles();
        loadOIndustrialTiles();
        loadTIndustrialTiles();
        
        // Load splash and UI images
        loadSplashBackground();
        loadCharacterSelectionBackground();
        loadStartButton();
        loadZargatesLogo();
        
        // Load character images
        loadOrigamiCharacter();
        loadTroubCharacter();
        loadToxinCharacter();
        loadChameleonCharacter();
        
        // Load sprites
        loadOrigamiSprite();
        loadFireEnemySprite();
        loadPngEnemySprite();
        loadForestEnemySprite();
        loadDragonEnemySprite();
        loadArrowSprite();
        loadToxinAttackSprite();
        loadOrigamiAttackSprite();
        loadToxinBulletSprite();
        loadChameleonAttackSprite();
        
        // Toxin sounds removed
        
        console.log('All resources loaded successfully!');
        return true;
    } catch (error) {
        console.error('Error loading game resources:', error);
        return false;
    }
}

// Don't initialize enemies at start - they will be added when entering Forest location

// Wait for DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', function() {
    if (initializeCanvas()) {
        console.log('Canvas initialized successfully!');
        initializeEventListeners();
        console.log('Event listeners initialized!');
        if (loadGameResources()) {
            console.log('Game initialized successfully!');
            gameLoop();
        } else {
            console.error('Failed to load game resources!');
        }
    } else {
        console.error('Failed to initialize canvas!');
    }
});

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
    
    // Calculate visible area to optimize rendering
    const visibleStartY = Math.max(0, Math.floor(-screenX / tileSize));
    const visibleEndY = Math.min(19, Math.ceil((canvas.width - screenX) / tileSize));
    
    // Only draw tiles that are visible on screen
    for (let y = visibleStartY; y < visibleEndY; y++) {
        const screenY = y * tileSize;
        const screenGridX = screenX + 0;
        if (screenGridX >= -tileSize && screenGridX <= canvas.width) {
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
    
    // Calculate visible columns to optimize rendering
    const visibleStartCol = Math.max(1, Math.floor(-screenX / tileSize));
    const visibleEndCol = Math.min(37, Math.ceil((canvas.width - screenX) / tileSize));
    
    // B-l = columns 1-37 (B=1, l=37) - покрываем до l18
    for (let col = visibleStartCol; col <= visibleEndCol; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 18 * tileSize;
        if (screenGridX >= -tileSize && screenGridX <= canvas.width) {
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
    
    // Calculate visible columns to optimize rendering
    const visibleStartCol = Math.max(12, Math.floor(-screenX / tileSize));
    const visibleEndCol = Math.min(37, Math.ceil((canvas.width - screenX) / tileSize));
    
    // M18 до конца локации (M=12, конец=37)
    for (let col = visibleStartCol; col < visibleEndCol; col++) { // M=12 до конца
        const screenGridX = screenX + col * tileSize;
        const screenY = 18 * tileSize;
        if (screenGridX >= -tileSize && screenGridX <= canvas.width) {
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
function checkSpriteCollisions(playerX, playerY, playerWidth, playerHeight, currentLocation, playerVelocityY) {
    const tileSize = 32;
    const locationStart = currentLocation * LOCATION_WIDTH;
    
    // Check collisions for "Дом" location (first location)
    if (currentLocation === 0) {
        // Define collision areas
        const collisionAreas = [
            // B1-B16 wall - completely blocked
            { x: 1, y: 1, width: 1, height: 16, type: 'wall' },
            // B1 to end of map wall - completely blocked
            { x: 1, y: 1, width: 36, height: 1, type: 'wall' },
            // W4-W10 vertical pipe - special pipe logic
            { x: 22, y: 4, width: 1, height: 7, type: 'pipe' },
            // l1-l16 vertical wall - completely blocked
            { x: 37, y: 1, width: 1, height: 16, type: 'wall' },

            // C16-X16 platform - player can stand on this
            { x: 2, y: 16, width: 22, height: 1, type: 'platform' },

            // Z15-j15 platform - player can stand on this
            { x: 25, y: 15, width: 10, height: 1, type: 'platform' },
            // Y14 platform - player can stand on this
            { x: 24, y: 14, width: 1, height: 1, type: 'platform' },
            // Q10-V10 platform - player can stand on this
            { x: 16, y: 10, width: 6, height: 1, type: 'platform' },
            // X10-c10 platform - player can stand on this (extended for dragon)
            { x: 23, y: 10, width: 6, height: 1, type: 'platform' },
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
            // Y15 wall - completely blocked
{ x: 24, y: 15, width: 1, height: 1, type: 'wall' },
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
            // k14 wall - completely blocked
{ x: 36, y: 14, width: 1, height: 1, type: 'wall' },
// k15 wall - completely blocked
{ x: 36, y: 15, width: 1, height: 1, type: 'wall' },
            // j15 platform - player can stand on this
            { x: 35, y: 15, width: 1, height: 1, type: 'platform' },
            // k15 platform - player can stand on this
            { x: 36, y: 15, width: 1, height: 1, type: 'platform' }
        ];
        
        // Platform overlap check removed for performance - platforms are pre-configured
        
        // Check each collision area - optimized with early exit
        for (const area of collisionAreas) {
            const areaX = locationStart + area.x * tileSize;
            const areaY = area.y * tileSize;
            const areaWidth = area.width * tileSize;
            const areaHeight = area.height * tileSize;
            
            // Quick bounds check before full AABB
            if (playerX + playerWidth < areaX || playerX > areaX + areaWidth ||
                playerY + playerHeight < areaY || playerY > areaY + areaHeight) {
                continue; // Skip this area - no collision possible
            }
            
            // Full AABB collision detection
            if (playerX < areaX + areaWidth &&
                playerX + playerWidth > areaX &&
                playerY < areaY + areaHeight &&
                playerY + playerHeight > areaY) {
                
                // Collision detected - process it
                
                if (area.type === 'platform') {
                    // Platform collision - only block going up through platform from below
                    const playerBottom = playerY + playerHeight;
                    const platformTop = areaY;
                    
                    // Only block if player is trying to go up through platform from below AND is very close
                    if (playerBottom <= platformTop + 1 && playerY < areaY && playerVelocityY > 0) {
                        return { collision: true, type: 'blocked' };
                    }
                    // Allow standing on top of platform
                    else if (playerY >= areaY - playerHeight && playerY < areaY) {
                        return { collision: true, type: 'platform', y: areaY - playerHeight };
                    }
                    // Otherwise, no collision - allow normal movement including jumping
                    return { collision: false };
                } else if (area.type === 'pipe') {
                    // Pipe collision - block movement but keep velocities for jumping
                    return { collision: true, type: 'pipe' };
                } else if (area.type === 'wall') {
                    // Wall collision - completely blocked, no movement allowed
                    return { collision: true, type: 'blocked' };
                }
            }
        }
    }
    
    // Check collisions for "Лес" location (second location) - EXACT COPY of first location logic
    if (currentLocation === 1) {
        // Define collision areas - same structure as first location
        const collisionAreas = [
            // PLATFORMS
            // C15-R15 platform - player can stand on this (main platform)
            { x: 2, y: 15, width: 16, height: 1, type: 'platform' },
            // C6-F6 platform - new upper platform
            { x: 2, y: 6, width: 4, height: 1, type: 'platform' },
            // G4-L4 platform - new highest platform
            { x: 6, y: 4, width: 6, height: 1, type: 'platform' },
            // S16-j16 platform - new bottom platform
            { x: 18, y: 16, width: 18, height: 1, type: 'platform' },
            // M4-O4 platform - T pack sprite area
            { x: 12, y: 4, width: 3, height: 1, type: 'platform' },
            // G6 platform - single tile platform
            { x: 6, y: 6, width: 1, height: 1, type: 'platform' },
            // R6-b6 platform - horizontal line platform
            { x: 17, y: 6, width: 11, height: 1, type: 'platform' },
            // U10-j10 platform - long horizontal platform
            { x: 20, y: 10, width: 16, height: 1, type: 'platform' },
            // f8-h8 platforms - individual sprite platforms
            { x: 31, y: 8, width: 1, height: 1, type: 'platform' }, // f8
            { x: 32, y: 8, width: 1, height: 1, type: 'platform' }, // g8
            { x: 33, y: 8, width: 1, height: 1, type: 'platform' }, // h8
            // E10-H10 platform - row 10 left side
            { x: 4, y: 10, width: 4, height: 1, type: 'platform' },
            // K11-L11 platform - central platform row 11
            { x: 10, y: 11, width: 2, height: 1, type: 'platform' },
            // O12-R12 platform - central platform
            { x: 14, y: 12, width: 4, height: 1, type: 'platform' },
            // h4-j4 platform - new platform
            { x: 33, y: 4, width: 3, height: 1, type: 'platform' },
            // h15 platform removed - no longer needed
            
            // WALLS
            // B1-B16 vertical wall - completely blocked
            { x: 1, y: 1, width: 1, height: 16, type: 'wall' },
            // C1 horizontal wall to end - completely blocked
            { x: 2, y: 1, width: 36, height: 1, type: 'wall' },
            // k1-k16 vertical wall - completely blocked
            { x: 36, y: 1, width: 1, height: 16, type: 'wall' },
            // S2-S7 vertical wall - T pack sprite area wall (extended)
            { x: 18, y: 2, width: 1, height: 6, type: 'wall' },
            // G5 single pipe - special pipe logic
            { x: 6, y: 5, width: 1, height: 1, type: 'pipe' },
            // f9-g9 pipes - special pipe logic
            { x: 31, y: 9, width: 1, height: 1, type: 'pipe' }, // f9
            { x: 32, y: 9, width: 1, height: 1, type: 'pipe' }, // g9
            // h9 wall - keep as wall (removed from list)
            // h2-j4 area completely removed - all tiles now passable
            // Z-a-b removed - now passable areas
        ];
        
        // EXACT SAME logic as first location
        for (const area of collisionAreas) {
            const areaX = locationStart + area.x * tileSize;
            const areaY = area.y * tileSize;
            const areaWidth = area.width * tileSize;
            const areaHeight = area.height * tileSize;
            
            // Debug collision check for second location

            
            // Simple AABB collision detection - EXACT COPY
            if (playerX < areaX + areaWidth &&
                playerX + playerWidth > areaX &&
                playerY < areaY + areaHeight &&
                playerY + playerHeight > areaY) {
                
                // Collision detected - process it
                
                if (area.type === 'platform') {
                    // Platform collision - DEBUG version
                    const playerBottom = playerY + playerHeight;
                    const platformTop = areaY;
                    

                    
                    // Allow standing on top of platform (only when actually falling/landing)
                    if (playerY >= areaY - playerHeight && playerY < areaY && playerVelocityY > 0) {
            
                        return { collision: true, type: 'platform', y: areaY - playerHeight };
                    }
                    // Check if player is standing ON the platform (not falling through it)
                    else if (Math.abs(playerY + playerHeight - areaY) <= 2 && playerVelocityY >= 0) {

                        return { collision: false }; // Allow horizontal movement
                    }
                    // Allow horizontal movement in all other cases
                    else {

                        return { collision: false };
                    }
                    

                } else if (area.type === 'wall') {
                    // Wall collision - completely blocked, no movement allowed
                    return { collision: true, type: 'blocked' };
                }
            }
        }
    }
    
    return { collision: false };
} 

// Function to draw platform indicators for the first location
function drawPlatformIndicators(screenX) {
    if (gameState.currentLocation !== 0 && gameState.currentLocation !== 1) return; // Only for "Дом" and "Лес" locations
    
    console.log('🎯 Drawing platform indicators for location:', gameState.currentLocation, 'screenX:', screenX);
    
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
        // I14 platform removed - no longer needed
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
    
    // Draw platforms for first location
    if (gameState.currentLocation === 0) {
        for (const platform of platforms) {
            const x = screenX + platform.x * tileSize;
            const y = platform.y * tileSize;
            const width = platform.width * tileSize;
            const height = platform.height * tileSize;
            
            ctx.fillRect(x, y, width, height);
            
            // Debug: log platform positions

        }
    }
    
    // Draw platforms for second location ("Лес")
    if (gameState.currentLocation === 1) {

        // Define platforms for second location
        const secondLocationPlatforms = [
            // C15-R15 platform - player can stand on this (main platform)
            { x: 2, y: 15, width: 16, height: 1 },
            // C6-F6 platform - new upper platform
            { x: 2, y: 6, width: 4, height: 1 },
            // G4-L4 platform - new highest platform
            { x: 6, y: 4, width: 6, height: 1 },
            // S16-j16 platform - new bottom platform
            { x: 18, y: 16, width: 18, height: 1 },
            // M4-O4 platform - T pack sprite area
            { x: 12, y: 4, width: 3, height: 1 },
            // G6 platform - single tile platform
            { x: 6, y: 6, width: 1, height: 1 },
            // R6-b6 platform - horizontal line platform
            { x: 17, y: 6, width: 11, height: 1 },
            // U10-j10 platform - long horizontal platform
            { x: 20, y: 10, width: 16, height: 1 },
            // f8-h8 platforms - individual sprite platforms
            { x: 31, y: 8, width: 1, height: 1 }, // f8
            { x: 32, y: 8, width: 1, height: 1 }, // g8
            { x: 33, y: 8, width: 1, height: 1 }, // h8
            // E10-H10 platform - row 10 left side
            { x: 4, y: 10, width: 4, height: 1 },
            // K11-L11 platform - central platform row 11
            { x: 10, y: 11, width: 2, height: 1 },
            // O12-R12 platform - central platform
            { x: 14, y: 12, width: 4, height: 1 },
            // h4-j4 platform - new platform
            { x: 33, y: 4, width: 3, height: 1 },
            // h15 platform removed - no longer needed
        ];
        
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Make sure green color is set
        
        for (const platform of secondLocationPlatforms) {
            // Fix coordinates: screenX is already the camera offset, so use platform coordinates directly
            const x = platform.x * tileSize;
            const y = platform.y * tileSize;
            const width = platform.width * tileSize;
            const height = platform.height * tileSize;
            
            ctx.fillRect(x, y, width, height);
            
            // Debug: log platform positions for second location

        }
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
        { x: 22, y: 10, width: 1, height: 1 },
        // l1-l16 vertical wall blocks
        { x: 37, y: 1, width: 1, height: 1 },
        { x: 37, y: 2, width: 1, height: 1 },
        { x: 37, y: 3, width: 1, height: 1 },
        { x: 37, y: 4, width: 1, height: 1 },
        { x: 37, y: 5, width: 1, height: 1 },
        { x: 37, y: 6, width: 1, height: 1 },
        { x: 37, y: 7, width: 1, height: 1 },
        { x: 37, y: 8, width: 1, height: 1 },
        { x: 37, y: 9, width: 1, height: 1 },
        { x: 37, y: 10, width: 1, height: 1 },
        { x: 37, y: 11, width: 1, height: 1 },
        { x: 37, y: 12, width: 1, height: 1 },
        { x: 37, y: 13, width: 1, height: 1 },
        { x: 37, y: 14, width: 1, height: 1 },
        { x: 37, y: 15, width: 1, height: 1 },
        { x: 37, y: 16, width: 1, height: 1 },
        // k14-k15 wall blocks
        { x: 36, y: 14, width: 1, height: 1 },
        { x: 36, y: 15, width: 1, height: 1 },
        // Y15 wall block
        { x: 24, y: 15, width: 1, height: 1 }
    ];
    
    // Draw walls only for first location
    if (gameState.currentLocation === 0) {
        for (const block of wallBlocks) {
            const x = screenX + block.x * tileSize;
            const y = block.y * tileSize;
            const width = block.width * tileSize;
            const height = block.height * tileSize;
            
            ctx.fillRect(x, y, width, height);
        }
    }
    
    // Draw walls for second location ("Лес")
    if (gameState.currentLocation === 1) {

        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Make sure red color is set
        
        // Add walls for the forest location
        const secondLocationWalls = [
            // Edge walls to prevent falling off
            { x: 0, y: 0, width: 1, height: 18 },  // Left wall
            { x: 37, y: 0, width: 1, height: 18 }, // Right wall
            { x: 0, y: 0, width: 38, height: 1 },  // Top wall
            { x: 0, y: 17, width: 38, height: 1 }, // Bottom wall
            
            // Interior walls
            // B1-B16 vertical wall
            { x: 1, y: 1, width: 1, height: 16 },
            // C1 horizontal wall to end
            { x: 2, y: 1, width: 36, height: 1 },
            // k1-k16 vertical wall
            { x: 36, y: 1, width: 1, height: 16 },
            // S2-S7 vertical wall - T pack sprite area wall (extended)
            { x: 18, y: 2, width: 1, height: 6 },
            // G5 now pipe - removed from walls
            // f9-g9 now pipes - removed from walls
            // h9 removed completely
            // h2-j4 area completely removed - all tiles now passable (no visual indicators)
            // Z-a-b removed - now passable areas
        ];
        
        for (const wall of secondLocationWalls) {
            // Fix coordinates: use wall coordinates directly
            const x = wall.x * tileSize;
            const y = wall.y * tileSize;
            const width = wall.width * tileSize;
            const height = wall.height * tileSize;
            
            ctx.fillRect(x, y, width, height);

        }
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
    chameleonAttackSprite.src = 'https://amber-quick-egret-833.mypinata.cloud/ipfs/bafkreies4udpli5erj45fylfmnhoyr7nsbzbvlpu2pqs77lh2vl6vpqtqu';
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

// Function drawSprite0_0OnI14 removed - no longer needed

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

// Function to draw sprite 0.0 from new industrial tileset (1_Industrial_Tileset_1.png) on I14 coordinates
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

// Function to draw sprite 0.2 from O industrial tileset on B17 coordinates
function drawSprite0_2OnB17(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.2)
    const spriteY = 2; // row 2 (спрайт 0.2)
    
    // B17 (B=1, 17=17) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.2 from O industrial tileset on C17-J17 coordinates
function drawSprite1_2OnC17J17(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.2)
    const spriteY = 2; // row 2 (спрайт 1.2)
    
    // C17-J17 (C=2, J=9, 17=17) - горизонтальная линия
    for (let col = 2; col <= 9; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 17 * tileSize; // строка 17
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                oIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.2 from O industrial tileset on K17 coordinates
function drawSprite2_2OnK17(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.2)
    const spriteY = 2; // row 2 (спрайт 2.2)
    
    // K17 (K=10, 17=17) - одна клетка
    const screenGridX = screenX + 10 * tileSize; // K = колонка 10
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.2 from O industrial tileset on K17-Y17 coordinates
function drawSprite1_2OnK17Y17(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.2)
    const spriteY = 2; // row 2 (спрайт 1.2)
    
    // K17-Y17 (K=10, Y=35, 17=17) - горизонтальная линия
    for (let col = 10; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 17 * tileSize; // строка 17
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                oIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 0.1 from O industrial tileset on B2-B16 coordinates
function drawSprite0_1OnB2B16(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.1)
    const spriteY = 1; // row 1 (спрайт 0.1)
    
    // B2-B16 (B=1, строки 2-16) - вертикальный столбец
    for (let row = 2; row <= 16; row++) {
        const screenGridX = screenX + 1 * tileSize; // B = колонка 1
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                oIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 0.0 from O industrial tileset on B1 coordinates
function drawSprite0_0OnB1(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // B1 (B=1, 1=1) - одна клетка
    const screenGridX = screenX + 1 * tileSize; // B = колонка 1
    const screenY = 1 * tileSize; // строка 1
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from O industrial tileset on C1-Z1 coordinates
function drawSprite1_0OnC1Z1(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // C1-Z1 (C=2, Z=35, 1=1) - горизонтальная линия
    for (let col = 2; col <= 35; col++) {
        const screenGridX = screenX + col * tileSize;
        const screenY = 1 * tileSize; // строка 1
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                oIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 2.0 from O industrial tileset on k1 coordinates
function drawSprite2_0OnK1(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // k1 (k=36, 1=1) - одна клетка
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 1 * tileSize; // строка 1
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.2 from O industrial tileset on k17 coordinates
function drawSprite2_2OnK17(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.2)
    const spriteY = 2; // row 2 (спрайт 2.2)
    
    // k17 (k=36, 17=17) - одна клетка
    const screenGridX = screenX + 36 * tileSize; // k = колонка 36
    const screenY = 17 * tileSize; // строка 17
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.1 from O industrial tileset on k2-k16 coordinates
function drawSprite2_1OnK2K16(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.1)
    const spriteY = 1; // row 1 (спрайт 2.1)
    
    // k2-k16 (k=36, строки 2-16) - вертикальный столбец
    for (let row = 2; row <= 16; row++) {
        const screenGridX = screenX + 36 * tileSize; // k = колонка 36
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(
                oIndustrialTilesSprite,
                spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
                screenGridX, screenY, tileSize, tileSize
            );
        }
    }
}

// Function to draw sprite 1.1 from O industrial tileset on C6 coordinates
function drawSprite1_1OnC6(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.1)
    const spriteY = 1; // row 1 (спрайт 1.1)
    
    // C6 (C=2, 6=6) - одна клетка
    const screenGridX = screenX + 2 * tileSize; // C = колонка 2
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from O industrial tileset on D6 coordinates
function drawSprite1_0OnD6(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // D6 (D=3, 6=6) - одна клетка
    const screenGridX = screenX + 3 * tileSize; // D = колонка 3
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 1.0 from O industrial tileset on E6 coordinates
function drawSprite1_0OnE6(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 1; // column 1 (спрайт 1.0)
    const spriteY = 0; // row 0 (спрайт 1.0)
    
    // E6 (E=4, 6=6) - одна клетка
    const screenGridX = screenX + 4 * tileSize; // E = колонка 4
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 2.0 from O industrial tileset on F6 coordinates
function drawSprite2_0OnF6(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 2; // column 2 (спрайт 2.0)
    const spriteY = 0; // row 0 (спрайт 2.0)
    
    // F6 (F=5, 6=6) - одна клетка
    const screenGridX = screenX + 5 * tileSize; // F = колонка 5
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}





// Function to draw sprite 0.0 from O industrial tileset on G4 coordinates
function drawSprite0_0OnG4(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 0; // column 0 (спрайт 0.0)
    const spriteY = 0; // row 0 (спрайт 0.0)
    
    // G4 (G=6, 4=4) - одна клетка
    const screenGridX = screenX + 6 * tileSize; // G = колонка 6
    const screenY = 4 * tileSize; // строка 4
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            oIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}






// Function to draw sprite 3.3 from third industrial tileset (T) on G7 coordinates
function drawSprite3_3OnG7(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.3)
    const spriteY = 3; // row 3 (спрайт 3.3)
    
    // G7 (G=6, 7=7) - одна клетка
    const screenGridX = screenX + 6 * tileSize; // G = колонка 6
    const screenY = 7 * tileSize; // строка 7
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.2 from third industrial tileset (T) on G6 coordinates
function drawSprite3_2OnG6(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // G6 (G=6, 6=6) - одна клетка
    const screenGridX = screenX + 6 * tileSize; // G = колонка 6
    const screenY = 6 * tileSize; // строка 6
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.2 from third industrial tileset (T) on G5 coordinates
function drawSprite3_2OnG5(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.2)
    const spriteY = 2; // row 2 (спрайт 3.2)
    
    // G5 (G=6, 5=5) - одна клетка
    const screenGridX = screenX + 6 * tileSize; // G = колонка 6
    const screenY = 5 * tileSize; // строка 5
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

// Function to draw sprite 3.1 from third industrial tileset (T) on G4 coordinates
function drawSprite3_1OnG4(screenX) {
    if (!thirdIndustrialTilesSprite || !thirdIndustrialTilesSprite.complete) return;
    
    const tileSize = 32;
    const spriteX = 3; // column 3 (спрайт 3.1)
    const spriteY = 1; // row 1 (спрайт 3.1)
    
    // G4 (G=6, 4=4) - одна клетка
    const screenGridX = screenX + 6 * tileSize; // G = колонка 6
    const screenY = 4 * tileSize; // строка 4
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(
            thirdIndustrialTilesSprite,
            spriteX * tileSize, spriteY * tileSize, tileSize, tileSize,
            screenGridX, screenY, tileSize, tileSize
        );
    }
}

function drawSprite1_1OnC16R16(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1;
    for (let col = 2; col <= 17; col++) { // C=2, R=17
        const screenGridX = screenX + col * tileSize;
        const screenY = 16 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

function drawSprite1_0OnC15R15(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0;
    for (let col = 2; col <= 16; col++) { // C=2, Q=16 (exclude R=17)
        const screenGridX = screenX + col * tileSize;
        const screenY = 15 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

// New sprite functions for second location (Лес)
function drawSprite2_0OnR15(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0; // Sprite 2.0 from O pack
    const screenGridX = screenX + 17 * tileSize; // R=17
    const screenY = 15 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawSprite1_0OnS16Plus(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0;
    for (let col = 18; col <= 33; col++) { // S=18, 16 cells horizontal
        const screenGridX = screenX + col * tileSize;
        const screenY = 16 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

function drawSprite2_0OnJ16(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0;
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 16 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawSprite1_0OnI16(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0;
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 16 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - 3x3 grid M4-O6
function drawTSprite0_1OnM4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 12 * tileSize; // M=12
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_1OnN4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 13 * tileSize; // N=13
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_1OnO4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 1; // Sprite 2.1
    const screenGridX = screenX + 14 * tileSize; // O=14
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_2OnM5(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 12 * tileSize; // M=12
    const screenY = 5 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_2OnN5(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 13 * tileSize; // N=13
    const screenY = 5 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_2OnO5(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 14 * tileSize; // O=14
    const screenY = 5 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_3OnM6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 3; // Sprite 0.3
    const screenGridX = screenX + 12 * tileSize; // M=12
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_3OnN6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    const screenGridX = screenX + 13 * tileSize; // N=13
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_3OnO6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 3; // Sprite 2.3
    const screenGridX = screenX + 14 * tileSize; // O=14
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - S column
function drawTSprite5_3OnS1(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 5, spriteY = 3; // Sprite 5.3
    const screenGridX = screenX + 18 * tileSize; // S=18
    const screenY = 1 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite3_2OnS2S5(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 3, spriteY = 2; // Sprite 3.2
    for (let row = 2; row <= 5; row++) { // S2 to S5
        const screenGridX = screenX + 18 * tileSize; // S=18
        const screenY = row * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

function drawTSprite5_2OnS6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 5, spriteY = 2; // Sprite 5.2
    const screenGridX = screenX + 18 * tileSize; // S=18
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - rows 6-7
function drawTSprite0_1OnR6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 17 * tileSize; // R=17
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_1OnT6Plus(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    for (let col = 19; col <= 26; col++) { // T=19, 8 cells horizontal
        const screenGridX = screenX + col * tileSize;
        const screenY = 6 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

function drawTSprite0_3OnR7(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 3; // Sprite 0.3
    const screenGridX = screenX + 17 * tileSize; // R=17
    const screenY = 7 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_3OnS7(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    const screenGridX = screenX + 18 * tileSize; // S=18
    const screenY = 7 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_3OnT7Plus(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    for (let col = 19; col <= 26; col++) { // T=19, 8 cells horizontal
        const screenGridX = screenX + col * tileSize;
        const screenY = 7 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

// T Pack sprite functions - column b
function drawTSprite2_1Onb6(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 1; // Sprite 2.1
    const screenGridX = screenX + 27 * tileSize; // b=27
    const screenY = 6 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_3Onb7(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 3; // Sprite 2.3
    const screenGridX = screenX + 27 * tileSize; // b=27
    const screenY = 7 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - rows 8-10
function drawTSprite0_1Onf8(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 31 * tileSize; // f=31
    const screenY = 8 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_1Ong8(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 32 * tileSize; // g=32
    const screenY = 8 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_1Onh8(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 1; // Sprite 2.1
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 8 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - new additions
function drawTSprite1_1One10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 30 * tileSize; // e=30
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_1Onj10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 1; // Sprite 2.1
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_2Onf9(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 31 * tileSize; // f=31
    const screenY = 9 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_2Ong9(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 32 * tileSize; // g=32
    const screenY = 9 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_2Onh9(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 9 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_2Onf10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 31 * tileSize; // f=31
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_2Ong10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 32 * tileSize; // g=32
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_2Onh10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - new row 10 additions
function drawTSprite1_1Oni10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_1OnU10(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 20 * tileSize; // U=20
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_1OnV10Plus(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    for (let col = 21; col <= 29; col++) { // V=21, +9 cells horizontal
        const screenGridX = screenX + col * tileSize;
        const screenY = 10 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

// T Pack sprite functions - row 11
function drawTSprite0_3OnU11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 3; // Sprite 0.3
    const screenGridX = screenX + 20 * tileSize; // U=20
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_3OnV11Plus(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    for (let col = 21; col <= 33; col++) { // V=21, +13 cells horizontal
        const screenGridX = screenX + col * tileSize;
        const screenY = 11 * tileSize;
        if (screenGridX >= 0 && screenGridX <= canvas.width) {
            ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
        }
    }
}

function drawTSprite1_3Oni11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite5_0Onj11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 5, spriteY = 0; // Sprite 5.0
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_2OnZ11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 25 * tileSize; // Z=25
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_2Ona11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 26 * tileSize; // a=26
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_2Onb11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 27 * tileSize; // b=27
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_0OnK11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 0; // Sprite 0.0
    const screenGridX = screenX + 10 * tileSize; // K=10
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_0OnL11(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0; // Sprite 2.0
    const screenGridX = screenX + 11 * tileSize; // L=11
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// O Pack sprite functions - h2-h4, i2-i4, j2-j4
function drawOSprite0_1Onh2(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 2 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_1Oni2(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 2 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_1Onj2(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 2 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite0_1Onh3(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 1; // Sprite 0.1
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 3 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_1Oni3(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 3 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_1Onj3(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 1; // Sprite 1.1
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 3 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite0_2Onh4(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 33 * tileSize; // h=33
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_2Oni4(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 34 * tileSize; // i=34
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite2_2Onj4(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// O Pack sprite functions - E10-H10 and E11-F11
function drawOSprite0_0OnE10(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 0; // Sprite 0.0
    const screenGridX = screenX + 4 * tileSize; // E=4
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_0OnF10(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 5 * tileSize; // F=5
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite1_0OnG10(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 6 * tileSize; // G=6
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite2_0OnH10(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0; // Sprite 2.0
    const screenGridX = screenX + 7 * tileSize; // H=7
    const screenY = 10 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite0_2OnE11(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 4 * tileSize; // E=4
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawOSprite2_2OnF11(screenX) {
    if (!oIndustrialTilesSprite || !oIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 5 * tileSize; // F=5
    const screenY = 11 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(oIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - K4-L4 row
function drawTSprite1_0OnK4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 10 * tileSize; // K=10
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_0OnL4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0; // Sprite 2.0
    const screenGridX = screenX + 11 * tileSize; // L=11
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - H4-K4 row
function drawTSprite0_0OnH4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 0; // Sprite 0.0
    const screenGridX = screenX + 7 * tileSize; // H=7
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_0OnI4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 8 * tileSize; // I=8
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_0OnJ4(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 9 * tileSize; // J=9
    const screenY = 4 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}


// T Pack sprite functions - row 12
function drawTSprite0_0OnO12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 0; // Sprite 0.0
    const screenGridX = screenX + 14 * tileSize; // O=14
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_0OnP12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 15 * tileSize; // P=15
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_0OnQ12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 0; // Sprite 1.0
    const screenGridX = screenX + 16 * tileSize; // Q=16
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_0OnR12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 0; // Sprite 2.0
    const screenGridX = screenX + 17 * tileSize; // R=17
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - Z, a, b columns rows 12-13
function drawTSprite0_2OnZ12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 2; // Sprite 0.2
    const screenGridX = screenX + 25 * tileSize; // Z=25
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_2Ona12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 2; // Sprite 1.2
    const screenGridX = screenX + 26 * tileSize; // a=26
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_2Onb12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 27 * tileSize; // b=27
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite0_3OnZ13(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 0, spriteY = 3; // Sprite 0.3
    const screenGridX = screenX + 25 * tileSize; // Z=25
    const screenY = 13 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite1_3Ona13(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 1, spriteY = 3; // Sprite 1.3
    const screenGridX = screenX + 26 * tileSize; // a=26
    const screenY = 13 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

function drawTSprite2_3Onb13(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 3; // Sprite 2.3
    const screenGridX = screenX + 27 * tileSize; // b=27
    const screenY = 13 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}

// T Pack sprite functions - j column rows 12-15
function drawTSprite2_2Onj12(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 12 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}



function drawTSprite2_2Onj13(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 13 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}



function drawTSprite2_2Onj14(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 2; // Sprite 2.2
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 14 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}



function drawTSprite2_3Onj15(screenX) {
    if (!tIndustrialTilesSprite || !tIndustrialTilesSprite.complete) return;
    const tileSize = 32;
    const spriteX = 2, spriteY = 3; // Sprite 2.3
    const screenGridX = screenX + 35 * tileSize; // j=35
    const screenY = 15 * tileSize;
    if (screenGridX >= 0 && screenGridX <= canvas.width) {
        ctx.drawImage(tIndustrialTilesSprite, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, screenGridX, screenY, tileSize, tileSize);
    }
}
