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
      debug: false
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
let player_2;
let arrows;
let arrow_count = 0;
let platforms;
let cursors;

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet('pit_move', player, { frameWidth: 16, frameHeight: 24 });
  this.load.image('large_ground', largeGround);
  this.load.image('small_ground', smallGround);
  this.load.image('arrow', arrow)
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  player_1 = this.physics.add.sprite(100, 300, 'pit_move').setScale(2);
  player_2 = this.physics.add.sprite(700, 300, 'pit_move').setScale(2);
  arrows = this.physics.add.group();

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
  for (let i = 0; i < Math.floor(Math.random() * 40); i++) {
    platforms.create(Math.floor(Math.random() * 100) * 10, Math.floor(Math.random() * 40) * 10, 'large_ground');
  }

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
  // this.physics.add.collider(arrows, player_1);
  this.physics.add.collider(arrows, platforms);
  this.physics.add.overlap(player_2, arrows, killPlayer, null, this);

  player_2.health = 3;
}

function update() {

  player_1.flipX
  //We'll have to change this later
  player_2.flipX = true;
  // console.log(player_1.body.touching.down)
  //Player 1 move controls
  //The counter for how much time between arrows.
  arrow_count++
  
  if (cursors.right.isDown && player_1.body.touching.down) {
    player_1.setVelocityX(160);
    player_1.anims.play('walk', true);
    player_1.flipX = false
  } else if (cursors.left.isDown && player_1.body.touching.down) {
    player_1.setVelocityX(-160);
    player_1.anims.play('walk', true);
    player_1.flipX = true
  } else if (cursors.up.isDown) {
    player_1.anims.play('fly', true);
    player_1.setVelocityY(-230);
  } else if (cursors.right.isDown && !player_1.body.touching.down) {
    player_1.setVelocityX(160);
    player_1.anims.play('mid-air', true);
    player_1.flipX = false
  } else if (cursors.left.isDown && !player_1.body.touching.down) {
    player_1.setVelocityX(-160);
    player_1.anims.play('mid-air', true);
    player_1.flipX = true
  } else if (cursors.space.isDown) {
    player_1.setVelocityX(0);
    player_1.anims.play('shoot', true);
    if (arrow_count > 20) {
      fireArrow();
      arrow_count = 0;
    }
  } else if (player_1.body.touching.down) {
    player_1.setVelocityX(0);
    player_1.anims.play('stand', true);
  } else {
    player_1.setVelocityX(0);
    player_1.anims.play('mid-air', true);
  }

  //player 2 move controls
  // if (cursors.right.isDown && player_2.body.touching.down) {
  //   player_2.setVelocityX(160);
  //   player_2.anims.play('walk', true);
  //   player_2.flipX = false
  // } else if (cursors.left.isDown && player_2.body.touching.down) {
  //   player_2.setVelocityX(-160);
  //   player_2.anims.play('walk', true);
  //   player_2.flipX = true
  // } else if (cursors.up.isDown) {
  //   player_2.anims.play('fly', true);
  //   player_2.setVelocityY(-230);
  // } else if (cursors.right.isDown && !player_2.body.touching.down) {
  //   player_2.setVelocityX(160);
  //   player_2.anims.play('mid-air', true);
  //   player_2.flipX = false
  // } else if (cursors.left.isDown && !player_2.body.touching.down) {
  //   player_2.setVelocityX(-160);
  //   player_2.anims.play('mid-air', true);
  //   player_2.flipX = true
  // } else if(player_2.body.touching.down){
  //   player_2.setVelocityX(0);
  //   player_2.anims.play('stand', true);
  // } else {
  // player_2.setVelocityX(0);
  //   player_2.anims.play('mid-air', true);
  // }
}

function fireArrow() {
  if (player_1.flipX) {
    let arrow = arrows.create(player_1.x - 16, player_1.y, 'arrow').setScale(3);
    arrow.setVelocityX(-600);
    arrow.body.setAllowGravity(false);
    arrow.flipX = true;
    arrow.setBounceY(0.06);
  } else {
    let arrow = arrows.create(player_1.x + 16, player_1.y, 'arrow').setScale(3);
    arrow.setVelocityX(600);
    arrow.body.setAllowGravity(false);
    arrow.flipX = false;
    arrow.setBounceY(0.06);
  }
}

function killPlayer(player_2, arrow){
  arrow.disableBody(true, true);
  player_2.health--
  if(player_2.health <= 0 ){
    player_2.disableBody(true, true);
  }
}