"use strict";

// brighten/dim thumbnail, replace main img, highlight default thumbnail
const specificImgs = document.querySelectorAll(".specificImg");

specificImgs.forEach((specificImg) => {
    specificImg.classList.add("darken");
    specificImg.addEventListener("click", () => {
        specificImgs.forEach((specificImg) => {
            specificImg.classList.add("darken");
        });
        specificImg.classList.remove("darken");
    });
});

let zoomImg = document.getElementById("zoom-img");
let zoomImgBgUrl = zoomImg.style.backgroundImage.slice(0, zoomImg.style.backgroundImage.lastIndexOf('")') + 2);
zoomImg.classList.add("imgRefresh");

specificImgs.forEach((specificImg) => {
    let specificImgBgUrl = `url("${decodeURI(specificImg.src.slice(specificImg.src.indexOf("/uploads")))}")`;

    if (zoomImgBgUrl == specificImgBgUrl) {
        specificImg.classList.add("activeThumbnail");
        specificImg.classList.remove("darken");
    }
    specificImg.addEventListener("click", () => {
        specificImg.classList.remove("darken");
        zoomImg.classList.remove("imgRefresh");
        zoomImg.offsetWidth;
        zoomImg.classList.add("imgRefresh");
        zoomImg.style.backgroundImage = specificImgBgUrl;
 
        specificImgs.forEach((specificImg) => {
            specificImg.classList.remove("activeThumbnail");
        });
        specificImg.classList.add("activeThumbnail");

        
    });
});

// zoom into cursor hovered img area
const zoomOnCursorArea = function (target) {
    const container = document.getElementById(target);
    let imgsrc = container.currentStyle || window.getComputedStyle(container, false);
    imgsrc = imgsrc.backgroundImage.slice(4, -1).replace(/"/g, "");
    let img = new Image();
    img.src = imgsrc;

    img.onload = function () {
        const imgWidth = img.naturalWidth,
        imgHeight = img.naturalHeight,
        ratio = imgHeight / imgWidth;

        container.onmousemove = function (e) {
            const boxWidth = container.clientWidth,
            rect = e.target.getBoundingClientRect(),
            xPos = e.clientX - rect.left,
            yPos = e.clientY - rect.top,
            xPercent = xPos / (boxWidth / 100) + "%",
            yPercent = yPos / ((boxWidth * ratio) / 100) + "%";
    
            Object.assign(container.style, {
                backgroundPosition: xPercent + ' ' + yPercent,
                backgroundSize: imgWidth + 'px'
            });
        };
        
        container.onmouseleave = function (e) {
            Object.assign(container.style, {
                backgroundPosition: 'center',
                backgroundSize: 'cover'
            });
        };
    };
};
  
window.addEventListener("load", function(){
    zoomOnCursorArea("zoom-img");
});