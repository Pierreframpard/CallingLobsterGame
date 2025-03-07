const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let lobster;
let phones;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;

function preload() {
    // Chargement des assets
    this.load.image('background', 'assets/background_brutalist.png');  // Fond de ville brutaliste
    this.load.spritesheet('lobster', 'assets/lobster_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.image('phone', 'assets/phone_obstacle.png');  // Obstacle (téléphone)
    this.load.audio('bgMusic', 'assets/background_music.mp3');
}

function create() {
    // Ajout du décor avec un ajustement correct
    this.background = this.add.tileSprite(0, 0, 1600, 400, 'background').setOrigin(0, 0);

    // Vérification des dimensions de la spritesheet du homard
    const lobsterTexture = this.textures.get('lobster');
    if (lobsterTexture) {
        const source = lobsterTexture.getSourceImage();
        if (source.width !== 256 || source.height !== 256) {
            console.warn('Dimensions inattendues pour la spritesheet du homard:', source.width, source.height);
        }
    }

    // Création du homard avec un bon ancrage
    lobster = this.physics.add.sprite(100, 300, 'lobster').setDisplaySize(64, 64);
    lobster.setCollideWorldBounds(true);
    lobster.setBounce(0.1);
    lobster.setOrigin(0.5, 1);
    
    // Animation du homard
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('lobster', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: [{ key: 'lobster', frame: 4 }],
        frameRate: 10
    });

    lobster.play('run');

    // Groupe des téléphones
    phones = this.physics.add.group();

    // Génération des téléphones
    this.time.addEvent({
        delay: 1500,  // Chaque 1.5 secondes
        callback: spawnPhone,
        callbackScope: this,
        loop: true
    });

    // Score
    scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', fill: '#FFF' });

    // Collisions
    this.physics.add.collider(lobster, phones, hitPhone, null, this);

    // Contrôles
    cursors = this.input.keyboard.createCursorKeys();

    // Activer le défilement du jeu
    this.cameras.main.setBounds(0, 0, 1600, 400);
    this.cameras.main.setViewport(0, 0, 800, 400);
    this.physics.world.setBounds(0, 0, 1600, 400);
    this.cameras.main.startFollow(lobster);

    // Musique de fond
    this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
    this.bgMusic.play();
}

function update() {
    if (gameOver) return;

    // Défilement du fond
    this.background.tilePositionX += 4; // Augmenter légèrement la vitesse pour un meilleur effet visuel

    // Saut du homard
    if (Phaser.Input.Keyboard.JustDown(cursors.space) && lobster.body.blocked.down) {
        lobster.setVelocityY(-450);
        lobster.anims.play('jump', true);
    } else if (lobster.body.blocked.down) {
        lobster.anims.play('run', true); // Forcer le retour à l'animation de course dès qu'il touche le sol
    }

    // Incrémenter le score
    score += 0.02;
    scoreText.setText('Score: ' + Math.floor(score));
}

function spawnPhone() {
    if (gameOver) return;

    const phone = phones.create(850, 350, 'phone'); // Position plus basse
    phone.setDisplaySize(40, 40); // Taille fixe pour éviter qu'il soit trop grand
    phone.setVelocityX(-200);
    phone.setImmovable(true);
    phone.body.allowGravity = false; // Empêcher la chute des téléphones
    phone.setCollideWorldBounds(true);

    // Supprimer le téléphone une fois hors écran
    phone.checkWorldBounds = true;
    phone.outOfBoundsKill = true;
}

function hitPhone() {
    gameOver = true;
    lobster.setTint(0xff0000);
    lobster.anims.stop();
    this.physics.pause();
    scoreText.setText('Game Over - Score: ' + Math.floor(score));
}