"use strict";

// dim sibling elems
const albumCovers = document.querySelectorAll(".album-covers");

albumCovers.forEach((albumCover) => {
    albumCover.addEventListener("mouseenter", () => {
        albumCovers.forEach((albumCover) => {
            albumCover.classList.add("darken");
        });
        albumCover.classList.remove("darken");
    });
});
albumCovers.forEach((albumCover) => {
    albumCover.addEventListener("mouseleave", () => {
        albumCovers.forEach((albumCover) => {
            albumCover.classList.remove("darken");
            albumCover.classList.add("brighten");
        });
    });
});

// disable 2nd click to submit btn
const uploadBtn = document.querySelector(".uploadBtn");
uploadBtn.addEventListener("click", () => uploadBtn.style.display = "none");