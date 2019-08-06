import Phaser from "phaser";
import player from './assets/player/moving/pit_move.png';
import largeGround from './assets/world/ground-large.png';
import smallGround from './assets/world/ground-small.png';
import arrow from './assets/player/projectile/arrow.png';

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};

let player_1;
let p1_health;
let p2_health;
let cursors_p1;
let player_2;
let cursors_p2;
let reset_button;
let p1_arrows;
let p2_arrows;
let p1_arrow_count = 0;
let p2_arrow_count = 0;
let platforms;
let camera;

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet('pit_move', player, { frameWidth: 16, frameHeight: 24 });
  this.load.image('large_ground', largeGround);
  this.load.image('small_ground', smallGround);
  this.load.image('arrow', arrow)
}

function create() {
  cursors_p1 = this.input.keyboard.addKeys('W,S,A,D,G');
  cursors_p2 = this.input.keyboard.createCursorKeys();
  reset_button = this.input.keyboard.addKeys('R');

  camera = this.cameras.main;

  player_1 = this.physics.add.sprite(100, 300, 'pit_move').setScale(2).setSize(9, 24).setOffset(4.5, 0);
  player_2 = this.physics.add.sprite(700, 300, 'pit_move').setScale(2).setSize(9, 24).setOffset(4.5, 0);
  player_1.flipX
  //Start game with x flipped
  player_2.flipX = true

  p1_arrows = this.physics.add.group();
  p2_arrows = this.physics.add.group();

  player_1.setCollideWorldBounds(true);
  player_2.setCollideWorldBounds(true);


  platforms = this.physics.add.staticGroup();

  //player start platforms
  platforms.create(100, 400, 'large_ground');
  platforms.create(700, 400, 'large_ground');

  //generate ground tiles
  for (let i = 0; i < 864; i += 32) {
    platforms.create(i, 600, 'large_ground');
  }

  //generate random platforms
  // for (let i = 0; i < Math.floor(Math.random() * 40); i++) {
  //   platforms.create(Math.floor(Math.random() * 100) * 10, Math.floor(Math.random() * 40) * 10, 'large_ground');
  // }

  // platforms.create(50, 250, 'large_ground');
  // platforms.create(750, 220, 'large_ground');


  this.anims.create({
    key: 'stand',
    frames: this.anims.generateFrameNumbers('pit_move', { start: 1, end: 1 }),
    frameRate: 12,
    repeat: -1
  });

  this.anims.create({
    key: 'fly',
    frames: this.anims.generateFrameNumbers('pit_move', { start: 3, end: 4 }),
    frameRate: 8,
    repeat: -1
  });

  this.anims.create({
    key: 'mid-air',
    frames: this.anims.generateFrameNumbers('pit_move', { start: 3, end: 4 }),
    frameRate: 8,
    repeat: -1
  });

  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('pit_move', { start: 1, end: 3 }),
    frameRate: 12,
    repeat: -1
  });

  this.anims.create({
    key: 'shoot',
    frames: this.anims.generateFrameNumbers('pit_move', { start: 0, end: 1 }),
    frameRate: 0,
    repeat: 1
  });

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
  if(reset_button.R.isDown){
    this.scene.restart();
  }
  //The counter for how much time between arrows.
  p1_arrow_count++
  p2_arrow_count++

  //Player 1 move controls
  if (cursors_p1.D.isDown && player_1.body.touching.down) {
    player_1.setVelocityX(160);
    player_1.anims.play('walk', true);
    player_1.flipX = false
  } else if (cursors_p1.A.isDown && player_1.body.touching.down) {
    player_1.setVelocityX(-160);
    player_1.anims.play('walk', true);
    player_1.flipX = true
  } else if (cursors_p1.W.isDown) {
    player_1.anims.play('fly', true);
    player_1.setVelocityY(-230);
  } else if (cursors_p1.D.isDown && !player_1.body.touching.down) {
    player_1.setVelocityX(160);
    player_1.anims.play('mid-air', true);
    player_1.flipX = false
  } else if (cursors_p1.A.isDown && !player_1.body.touching.down) {
    player_1.setVelocityX(-160);
    player_1.anims.play('mid-air', true);
    player_1.flipX = true
  } else if (cursors_p1.G.isDown) {
    player_1.setVelocityX(0);
    player_1.anims.play('shoot', true);
    if (p1_arrow_count > 30) {
      player_1.anims.play('stand', true);
      fireArrow(player_1, 'player_1');
      p1_arrow_count = 0;
    }
  } else if (player_1.body.touching.down) {
    player_1.setVelocityX(0);
    player_1.anims.play('stand', true);
  } else {
    player_1.setVelocityX(0);
    player_1.anims.play('mid-air', true);
  }

  // player 2 move controls
  if (cursors_p2.right.isDown && player_2.body.touching.down) {
    player_2.setVelocityX(160);
    player_2.anims.play('walk', true);
    player_2.flipX = false
  } else if (cursors_p2.left.isDown && player_2.body.touching.down) {
    player_2.setVelocityX(-160);
    player_2.anims.play('walk', true);
    player_2.flipX = true
  } else if (cursors_p2.up.isDown) {
    player_2.anims.play('fly', true);
    player_2.setVelocityY(-230);
  } else if (cursors_p2.right.isDown && !player_2.body.touching.down) {
    player_2.setVelocityX(160);
    player_2.anims.play('mid-air', true);
    player_2.flipX = false
  } else if (cursors_p2.left.isDown && !player_2.body.touching.down) {
    player_2.setVelocityX(-160);
    player_2.anims.play('mid-air', true);
    player_2.flipX = true
  } else if (cursors_p2.space.isDown) {
    player_2.setVelocityX(0);
    player_2.anims.play('shoot', true);
    if (p2_arrow_count > 30) {
      player_2.anims.play('stand', true);
      fireArrow(player_2, 'player_2');
      p2_arrow_count = 0;
    }
  } else if (player_2.body.touching.down) {
    player_2.setVelocityX(0);
    player_2.anims.play('stand', true);
  } else {
    player_2.setVelocityX(0);
    player_2.anims.play('mid-air', true);
  }

  function fireArrow(player, who) {
    if (player.active) {
      if (who === "player_1") {
        if (player.flipX) {
          let arrow = p1_arrows.create(player.x - 16, player.y, 'arrow').setScale(3).setSize(8, 2).setOffset(0, 0.5);
          console.log(arrow)
          arrow.setVelocityX(-600);
          arrow.body.setAllowGravity(false);
          arrow.flipX = true;
          arrow.setBounceY(0.06);
        } else {
          let arrow = p1_arrows.create(player.x + 16, player.y, 'arrow').setScale(3).setSize(8, 2).setOffset(0, 0.5);
          console.log(arrow)
          arrow.setVelocityX(600);
          arrow.body.setAllowGravity(false);
          arrow.flipX = false;
          arrow.setBounceY(0.06);
        }
      } else {
        if (player.flipX) {
          let arrow = p2_arrows.create(player.x - 16, player.y, 'arrow').setScale(3).setSize(8, 2).setOffset(0, 0.5);
          console.log(arrow)
          arrow.setVelocityX(-600);
          arrow.body.setAllowGravity(false);
          arrow.flipX = true;
          arrow.setBounceY(0.06);
        } else {
          let arrow = p2_arrows.create(player.x + 16, player.y, 'arrow').setScale(3).setSize(8, 2).setOffset(0, 0.5);
          console.log(arrow)
          arrow.setVelocityX(600);
          arrow.body.setAllowGravity(false);
          arrow.flipX = false;
          arrow.setBounceY(0.06);
        }
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

function destroyArrow(arrow) {
  arrow.destroy();
}