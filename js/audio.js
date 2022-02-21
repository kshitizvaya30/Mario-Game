const audioFireFlowerShot = "../Assests/audio/audioFireFlowerShot.mp3";
const audioCompleteLevel = "../Assests/audio/audioCompleteLevel.mp3";
const audioDescend = "../Assests/audio/audioDescend.mp3";
const audioDie = "../Assests/audio/audioDie.mp3";
const audioFireworkBurst = "../Assests/audio/audioFireworkBurst.mp3";
const audioFireworkWhistle = "../Assests/audio/audioFireworkWhistle.mp3";
const audioGameOver = "../Assests/audio/audioGameOver.mp3";
const audioJump = "../Assests/audio/audioJump.mp3";
const audioLosePowerUp = "../Assests/audio/audioLosePowerUp.mp3";
const audioMusicLevel1 = "../Assests/audio/audioMusicLevel1.mp3";
const audioObtainPower = "../Assests/audio/audioWinLevel.mp3";
const audiogoombaSquash = "../Assests/audio/goombaSquash.mp3";

export const audio = {
  fireFlowerShot: new Howl({
    src: [audioFireFlowerShot],
    volume: 0.1,
  }),
  completeLevel: new Howl({
    src: [audioCompleteLevel],
    volume: 0.1,
  }),
  descend: new Howl({
    src: [audioDescend],
    volume: 0.1,
  }),
  die: new Howl({
    src: [audioDie],
    volume: 0.1,
  }),
  fireworkBurst: new Howl({
    src: [audioFireworkBurst],
    volume: 0.1,
  }),
  fireworkWhistle: new Howl({
    src: [audioFireworkWhistle],
    volume: 0.1,
  }),
  gameOver: new Howl({
    src: [audioGameOver],
    volume: 0.1,
  }),
  jump: new Howl({
    src: [audioJump],
    volume: 0.1,
  }),
  losePowerUp: new Howl({
    src: [audioLosePowerUp],
    volume: 0.1,
  }),
  musicLevel1: new Howl({
    src: [audioMusicLevel1],
    volume: 0.1,
    loop : true, 
    autoplay:true, 
  }),
  obtainPower: new Howl({
    src: [audioObtainPower],
    volume: 0.1,
  }),
  goombaSquash: new Howl({
    src: [audiogoombaSquash],
    volume: 0.3,
  }),
};
