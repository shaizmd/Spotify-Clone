let currentSong = new Audio();
let songs;
let currentFolder;
function convert(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSceonds = Math.floor(seconds % 60);
  const formatMin = String(minutes).padStart(2, "0");
  const formatSec = String(remainingSceonds).padStart(2, "0");
  return `${formatMin}:${formatSec}`;
}
async function getSongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currentFolder}/`)[1]);
    }
  }
  //Show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const i of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
              <img src="assets/music.svg" alt="" />
              <div class="info">
                <div>${i.replaceAll("%20", " ")}</div>
                <div>Song Artist</div>
              </div>
              <div class="playnow">
                  <span>Play Now</span>
                  <img src="assets/play.svg" alt="" />
              </div>
            </li>`;
  }
  //Attach an event listener for each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
const playMusic = (track, pause = false) => {
  currentSong.src = `${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "assets/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track.slice(0, -4)) + `<div class="like">
  <img src="assets/like.svg" alt="">
</div>`;
  document.querySelector(".songtime").innerHTML = "00:00/00.00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    {
      if (e.href.includes("/songs")) {
        let folder = e.href.split("/").slice(-2)[0];

        //Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          ` <div  data-folder="${folder}"  class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="45"
                  height="42"
                  class="bi bi-play-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <!-- Outer circle color -->
                  <circle cx="8" cy="8" r="8" fill="#1ed65f" />
                  <!-- Play button color -->
                  <path
                    d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"
                    fill="black"
                  />
                </svg>
              </div>
              <img
                src="songs/${folder}/cover.jpeg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
      }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  }
}

async function main() {
  songs = await getSongs("songs/ncs");
  playMusic(songs[0], true);
  //Display all the Albums on the page
  displayAlbums();

  //Attach an event listener to play previous and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "assets/play.svg";
    }
  });
  //listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convert(
      currentSong.currentTime
    )}/${convert(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".progress").style.width =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  // Add an event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //Add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // previous.addEventListener("click", () => {
  //   let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  //   if (index + 1 >= 0) {
  //     playMusic(songs[index - 1]);
  //   }
  // });
  // next.addEventListener("click", () => {
  //   currentSong.pause();
  //   let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  //   if (index + 1 < songs.length) {
  //     playMusic(songs[index + 1]);
  //   }
  //chatgpt code for next and previous buttons
  document.querySelector('.previous').addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]); // Play the previous song
    } else {
      playMusic(songs[0]); // Stay on the first song
    }
  });

  document.querySelector('.next').addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]); // Play the next song
    } else {
      playMusic(songs[songs.length - 1]); // Stay on the last song
    }
  });
  //Event listener that automatically shifts to the next songs after the current song has ended
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]); // Play the next song
    }
  });

  //Event for voulme
  /*
    document.querySelector(".range").addEventListener("change",(e)=>{
        currentSong.volume.parseInt(e.target.value/100)
    })
    */
  // Initial loop state
// Initial loop state
let isLooping = false;

// Select the loop div and SVG element (assuming SVG is inside <img>)
const loop = document.querySelector(".loop");
const svgImage = loop.querySelector("img"); // Assuming <img> tag is used instead of <svg>

loop.addEventListener("click", () => {
    isLooping = !isLooping; // Toggle loop state

    if (isLooping) {
        svgImage.src = "assets/loop2.svg"; // Change to active loop image
        currentSong.loop = true; // Enable looping
    } else {
        svgImage.src = "assets/loop1.svg"; // Change to inactive loop image
        currentSong.loop = false; // Disable looping
    }
});
// Initial states
let isShuffling = false;

// Select the shuffle div and image element
const shuffle = document.querySelector(".shuffle");
const shuffleImage = shuffle.querySelector("img");

// Function to get a random song index different from the current one
const getRandomSongIndex = (currentIndex, songs) => {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentIndex); // Ensure it's not the current song
    return randomIndex;
};

// Function to play a random song
const playRandomSong = () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    let randomIndex = getRandomSongIndex(currentIndex, songs);
    playMusic(songs[randomIndex]); // Play the random song from the songs folder
};

// Add event listener for shuffle functionality
shuffle.addEventListener("click", () => {
    isShuffling = !isShuffling; // Toggle shuffle state

    if (isShuffling) {
        shuffleImage.src = "assets/shuffle2.svg"; // Change to active shuffle image
        playRandomSong(); // Start playing a random song immediately
    } else {
        shuffleImage.src = "assets/shuffle.svg"; // Change to inactive shuffle image
    }
});

// Function to play the next song, either shuffled or sequential
const playNextSong = () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    let nextIndex;

    if (isShuffling) {
        nextIndex = getRandomSongIndex(currentIndex, songs); // Get random song
    } else {
        nextIndex = (currentIndex + 1) % songs.length; // Play next sequential song
    }

    playMusic(songs[nextIndex]); // Play the chosen song
};

// Example: Add event listener to the 'Next' button to use playNextSong
next.addEventListener("click", playNextSong);



}
main();
