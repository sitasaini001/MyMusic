console.log("Let's write javascript");

let currentSong = new Audio;
let songs;
let currFolder;


async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    let response = await a.text();

    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop());

        }
    }

    // list of all songs
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    console.log(songs);
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert"src="music.svg" alt="">
                            <div class="info">
                               <div> ${(song.replaceAll("%20", " "))}</div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                            <img class="invert"src="play.svg"alt="">
                        </div>
                        </li> `;



    }

    //attach event listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(item => {
        item.addEventListener("click", () => {
            console.log(item.querySelector(".info").firstElementChild.innerHTML);
            playMusic(item.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })

    return songs;

}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}




playMusic = (track, pause = false) => {
    if (!pause) {
        currentSong.play();
        play.src = "play.svg"
    }
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();
    play.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00.00/00.00";

}




async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            //get metadata of each folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
                    <div class="play-circle">
                        <button aria-label="Play">

                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                focusable="false">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                            </svg>
                        </button>
                    </div>
                  <div class="content">
                    <img height="175px" width="40px" src="/songs/${folder}/cover.jpg" alt="">
                       
                    <h3>${response.title}</h3>
                    <p>${response.descroption}</p>
                  </div>
                </div>`


            //load the playlist whenever card is clicked

            Array.from(document.getElementsByClassName("card")).forEach(e => {
                e.addEventListener("click", async item => {
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

                })
            })
        }

    }




}

async function main() {
    // get the list of first song
    await getSongs(`songs/Chill_vibes`);
    playMusic(songs[0], true);


    displayAlbums();

    // display all the albums


    //attach an event listner to play previous,play and next

    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "play.svg"
        }
    })

    //listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)}/
        ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime /
            currentSong.duration) * 100 + "%";
    })

    //add an event listner to seekbar 

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;

    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = "0";
        document.querySelector(".left").style.display = "block";

    })

    //add event listener to close
    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%";
    });


    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1400) {
            document.querySelector(".left").style.left = "0";
            document.querySelector(".left").style.display = "block";
        }
    });

    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.display = "none";
    });



    //add event listener to previous button
    previous.addEventListener("click", () => {

        if (!songs || songs.length === 0) return;


        console.log("previous clicked");
        console.log(songs, currentSong.src);

        let index = songs.indexOf(currentSong.src.split("/").pop())
        if (index > 0) {
            playMusic(songs[index - 1]);
        }


    });

    //add event listener to next button
    next.addEventListener("click", () => {

        if (!songs || songs.length === 0) return;


        console.log("next clicked");

        let index = songs.indexOf(currentSong.src.split("/").pop())
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }

    });

    // add event to volume button

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
    });

    // add an event listener in mute the track


    document.querySelector(".volume>img").addEventListener("click", e => {

        // console.log("changing", e.target.src);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })





}

main()




