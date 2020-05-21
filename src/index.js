import Phaser from "phaser";
import player1 from "./assets/player/moving/pit_move.png";
import player2 from "./assets/player/moving/dark_pit_move.png";
import largeGround from "./assets/world/ground-large.png";
import smallGround from "./assets/world/ground-small.png";
import arrow from "./assets/player/projectile/arrow.png";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    key: "main",
    preload: preload,
    create: create,
    update: update,
  },
};

let player_1,
    p1_health,
    cursors_p1,
    player_2,
    p2_health,
    cursors_p2,
    reset_button,
    p1_arrows,
    p2_arrows,
    platforms,
    camera

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("pit_move", player1, {
    frameWidth: 16,
    frameHeight: 24,
  });
  this.load.spritesheet("dark_pit_move", player2, {
    frameWidth: 16,
    frameHeight: 24,
  });
  this.load.image("large_ground", largeGround);
  this.load.image("small_ground", smallGround);
  this.load.image("arrow", arrow);
}

function create() {
  cursors_p1 = this.input.keyboard.addKeys("W, S, A, D, G");
  cursors_p2 = this.input.keyboard.createCursorKeys();
  reset_button = this.input.keyboard.addKeys("R");

  camera = this.cameras.main;

  player_1 = this.physics.add
    .sprite(100, 300, "pit_move")
    .setScale(2)
    .setSize(9, 24)
    .setOffset(4.5, 0);
  player_2 = this.physics.add
    .sprite(700, 300, "dark_pit_move")
    .setScale(2)
    .setSize(9, 24)
    .setOffset(4.5, 0);
  player_1.flipX;
  //Start game with x flipped
  player_2.flipX = true;

  //Starting counter of arrows.
  player_1.arrow_count = 0;
  player_2.arrow_count = 0;

  p1_arrows = this.physics.add.group();
  p2_arrows = this.physics.add.group();

  player_1.setCollideWorldBounds(true);
  player_2.setCollideWorldBounds(true);

  platforms = this.physics.add.staticGroup();

  //player start platforms
  platforms.create(100, 400, "large_ground");
  platforms.create(700, 400, "large_ground");

  //generate ground tiles
  for (let i = 0; i < 864; i += 32) {
    platforms.create(i, 600, "large_ground");
  }

  // generate random platforms
  for (let i = 0; i < Math.floor(Math.random() * 40); i++) {
    platforms.create(
      Math.floor(Math.random() * 100) * 10,
      Math.floor(Math.random() * 40) * 10,
      "large_ground"
    );
  }

  // platforms.create(50, 250, 'large_ground');
  // platforms.create(750, 220, 'large_ground');

  const frames = [
    {
      key: "p1stand",
      frames: this.anims.generateFrameNumbers("pit_move", { start: 1, end: 1 }),
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "p1fly",
      frames: this.anims.generateFrameNumbers("pit_move", { start: 3, end: 4 }),
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "p1mid-air",
      frames: this.anims.generateFrameNumbers("pit_move", { start: 3, end: 4 }),
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "p1walk",
      frames: this.anims.generateFrameNumbers("pit_move", { start: 1, end: 3 }),
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "p1shoot",
      frames: this.anims.generateFrameNumbers("pit_move", { start: 0, end: 1 }),
      frameRate: 0,
      repeat: 1,
    },
    {
      key: "p2stand",
      frames: this.anims.generateFrameNumbers("dark_pit_move", {
        start: 1,
        end: 1,
      }),
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "p2fly",
      frames: this.anims.generateFrameNumbers("dark_pit_move", {
        start: 3,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "p2mid-air",
      frames: this.anims.generateFrameNumbers("dark_pit_move", {
        start: 3,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "p2walk",
      frames: this.anims.generateFrameNumbers("dark_pit_move", {
        start: 1,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "p2shoot",
      frames: this.anims.generateFrameNumbers("dark_pit_move", {
        start: 0,
        end: 1,
      }),
      frameRate: 0,
      repeat: 1,
    },
  ];

  frames.forEach((frame) => {
    this.anims.create(frame);
  });

  //Physics colliders with players and platforms.
  this.physics.add.collider(player_1, platforms);
  this.physics.add.collider(player_2, platforms);
  this.physics.add.collider(player_1, player_2);

  //arrow health collisions
  this.physics.add.overlap(player_2, p1_arrows, killPlayer);
  this.physics.add.overlap(player_1, p2_arrows, killPlayer);
  //arrow platform collision
  this.physics.add.overlap(p1_arrows, platforms, destroyArrow);
  this.physics.add.overlap(p2_arrows, platforms, destroyArrow);

  player_1.health = 3;
  player_2.health = 3;

  p1_health = this.add.text(10, 10, `Player 1: ${player_1.health}`);
  p2_health = this.add.text(10, 30, `Player 2: ${player_2.health}`);
}

function update() {
  //Reset game on R
  if (reset_button.R.isDown) {
    this.scene.restart();
  }

  //The counter for how much time between arrows.
  player_1.arrow_count++;
  player_2.arrow_count++;

  console.log(player_1.arrow_count, player_2.arrow_count);

  let p1Movement = cursors_p1.D.isDown - cursors_p1.A.isDown;
  let p2Movement = cursors_p2.right.isDown - cursors_p2.left.isDown;
  //Player move controls;

  movePlayer(player_1, "p1", p1Movement, cursors_p1.W, cursors_p1.G);
  movePlayer(player_2, "p2", p2Movement, cursors_p2.up, cursors_p2.space);

}


function fireArrow(player, who) {
  if (player.active) {
    if (who === "p1") {
      if (player.flipX) {
        let arrow = p1_arrows
          .create(player.x - 16, player.y, "arrow")
          .setScale(3)
          .setSize(8, 2)
          .setOffset(0, 0.5);
        arrow.setVelocityX(-600);
        arrow.body.setAllowGravity(false);
        arrow.flipX = true;
      } else {
        let arrow = p1_arrows
          .create(player.x + 16, player.y, "arrow")
          .setScale(3)
          .setSize(8, 2)
          .setOffset(0, 0.5);
        arrow.setVelocityX(600);
        arrow.body.setAllowGravity(false);
        arrow.flipX = false;
      }
    } else {
      if (player.flipX) {
        let arrow = p2_arrows
          .create(player.x - 16, player.y, "arrow")
          .setScale(3)
          .setSize(8, 2)
          .setOffset(0, 0.5);
        arrow.setVelocityX(-600);
        arrow.body.setAllowGravity(false);
        arrow.flipX = true;
      } else {
        let arrow = p2_arrows
          .create(player.x + 16, player.y, "arrow")
          .setScale(3)
          .setSize(8, 2)
          .setOffset(0, 0.5);
        arrow.setVelocityX(600);
        arrow.body.setAllowGravity(false);
        arrow.flipX = false;
      }
    }
  }
}

function killPlayer(player, arrow) {
  arrow.disableBody(true, true);
  player.health--;
  camera.shake(250, 0.008);
  p1_health.setText(`Player 1: ${player_1.health}`);
  p2_health.setText(`Player 2: ${player_2.health}`);
  if (player.health <= 0) {
    player.disableBody(true, true);
  }
}

function movePlayer (player, playerName, moveSpeed, jumpKey, shootKey){

  let keyDuration = Phaser.Math.RoundTo(jumpKey.getDuration() / 60, 0);

  if(moveSpeed) player.flipX = moveSpeed > 0 ? false : true;

  if (moveSpeed && player.body.touching.down) {
    player.setVelocityX(160 * moveSpeed);
    player.anims.play(`${playerName}walk`, true);
    
  } else if (jumpKey.isDown && keyDuration < 1) {
    player.anims.play(`${playerName}fly`, true);
    player.setVelocityY(-230);
  } else if (moveSpeed && !player.body.touching.down) {
    player.setVelocityX(160 * moveSpeed);
    player.anims.play(`${playerName}mid-air`, true);
  } else if (shootKey.isDown) {
    player.setVelocityX(0);
    player.anims.play(`${playerName}shoot`, true);
    if (player.arrow_count > 30) {
      player.anims.play(`${playerName}stand`, true);
      fireArrow(player, playerName);
      player.arrow_count = 0;
    }
  } else if (player.body.touching.down) {
    player.setVelocityX(0);
    player.anims.play(`${playerName}stand`, true);
  } else {
    player.setVelocityX(0);
    player.anims.play(`${playerName}mid-air`, true);
  }
}

function destroyArrow(arrow) {
  arrow.destroy();
}
