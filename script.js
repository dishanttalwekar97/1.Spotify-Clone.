console.log("Lets write JavaScript");

// Global vars
let currentSong = new Audio();
let currentFolder = "";

// Format time (mm:ss)
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

// Load and play a song
async function playMusic(track, pause = false) {
    currentSong.src = `song/${currentFolder}/` + track;
    if (!pause) {
        await currentSong.play();
        play.src = "svg/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// Fetch and load songs from an album
async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`song/${folder}/info.json`);
    let data = await response.json();

    let songs = data.songs;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (let song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="svg/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
            </div>
            <div class="playnow">
                <img class="invert" src="svg/play.svg" alt="">
            </div>
        </li>`;
    }

    // Bind click events
    Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

// Display albums
async function displayAlbums() {
    console.log("Displaying albums");
    let folders = ["Badshah", "Arijit"]; // 👈 Add more album folder names here

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of folders) {
        try {
            let metaResponse = await fetch(`song/${folder}/info.json`);
            let meta = await metaResponse.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg viewBox="0 0 24 24">
                            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                        </svg>
                    </div>
                    <img src="song/${folder}/cover.jpg" alt="">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
        } catch (error) {
            console.error("Error fetching metadata for", folder, error);
        }
    }

    // Card click → load songs
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async () => {
            let folder = e.dataset.folder;
            let songs = await getSongs(folder);
            playMusic(songs[0]);
        });
    });
}

// Main
async function main() {
    await displayAlbums();

    // Controls
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svg/pause.svg";
        } else {
            currentSong.pause();
            play.src = "svg/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Volume
    document.querySelector(".volume input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
