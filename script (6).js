/*==================================================
 Smile Cattery at Lightwood
 script.js  (merged)
==================================================*/


/*==================================================
CAT OF THE WEEK — DATA
==================================================*/

const CAT_SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQkncTck63DcRq0OD90XuwoG5yq8QV7C6VdgHj8UUG23KfTcXockDhvOfwrjcBFXNgMJiR2hbWfnYAD/pub?output=csv";

const FALLBACK_CAT = {

    name: "Bella",

    photo: "images/cat-week.jpg",

    description:
    "Bella has loved relaxing in her heated suite and watching the birds from her window this week.",

    facebook:
    "https://www.facebook.com/smilecatterysheffield/?locale=en_GB"

};

let catOfWeek = FALLBACK_CAT;


/*==================================================
CSV PARSER
==================================================*/

function parseCSV(text){

    const rows=[];

    let row=[];

    let field="";

    let inQuotes=false;

    for(let i=0;i<text.length;i++){

        const char=text[i];

        if(inQuotes){

            if(char === '"' && text[i+1] === '"'){

                field+='"';

                i++;

            }

            else if(char === '"'){

                inQuotes=false;

            }

            else{

                field+=char;

            }

        }

        else{

            if(char === '"'){

                inQuotes=true;

            }

            else if(char === ","){

                row.push(field);

                field="";

            }

            else if(char === "\n"){

                row.push(field);

                rows.push(row);

                row=[];

                field="";

            }

            else if(char !== "\r"){

                field+=char;

            }

        }

    }

    if(field.length || row.length){

        row.push(field);

        rows.push(row);

    }

    return rows;

}


/*==================================================
GOOGLE DRIVE IMAGE
==================================================*/

function toDirectDriveImage(url){

    if(!url) return "";

    const match=url.match(/[-\w]{25,}/);

    if(match){

        return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;

    }

    return url;

}


/*==================================================
 GUEST STORIES — FADE TRANSITION
==================================================*/

function fadeGuest(callback){

    const elements=[

        document.getElementById("catPhoto"),
        document.getElementById("homeCatPhoto"),

        document.getElementById("catName"),
        document.getElementById("homeCatName"),

        document.getElementById("catDescription")

    ];

    elements.forEach(element=>{

        if(element){

            element.style.transition="opacity .35s ease";

            element.style.opacity="0";

        }

    });

    setTimeout(()=>{

        callback();

        elements.forEach(element=>{

            if(element){

                element.style.opacity="1";

            }

        });

    },300);

}


/*==================================================
 APPLY GUEST STORY TO PAGE
==================================================*/

function applyCat(){

    const catName=document.getElementById("catName");
    const catPhoto=document.getElementById("catPhoto");
    const catDescription=document.getElementById("catDescription");
    const facebookButton=document.getElementById("facebookButton");

    const homeCatPhoto=document.getElementById("homeCatPhoto");
    const homeCatName=document.getElementById("homeCatName");

    const image=new Image();

    image.src=catOfWeek.photo;

    image.onload=()=>{

        if(catPhoto){

            catPhoto.src=catOfWeek.photo;
            catPhoto.alt=catOfWeek.name;

        }

        if(homeCatPhoto){

            homeCatPhoto.src=catOfWeek.photo;
            homeCatPhoto.alt=catOfWeek.name;

        }

    };

    if(catName){

        catName.textContent=catOfWeek.name;

    }

    if(homeCatName){

        homeCatName.textContent=catOfWeek.name;

    }

    if(catDescription){

        catDescription.textContent=catOfWeek.description;

    }

    if(facebookButton){

        facebookButton.href=catOfWeek.facebook;

    }

}


/*==================================================
 LOADING MESSAGE (shown while the sheet is fetched)
==================================================*/

const loadingName=document.getElementById("catName");

if(loadingName){

    loadingName.textContent="Looking for this week's guest...";

}


/*==================================================
 LOAD GUEST OF THE WEEK
==================================================*/

async function loadCatOfWeek(){

    try{

        const response=await fetch(

            CAT_SHEET_CSV_URL,

            {

                cache:"no-store"

            }

        );

        if(!response.ok){

            throw new Error();

        }

        const text=await response.text();

        const rows=parseCSV(text);

        const headers=rows[0].map(

            header=>header.trim().toLowerCase()

        );

        const latest=rows[rows.length-1];

        const get=(field)=>{

            const index=headers.findIndex(

                header=>header.includes(field)

            );

            return index!==-1

                ? latest[index]?.trim()

                : "";

        };

        catOfWeek={

            name:get("name") || FALLBACK_CAT.name,

            photo:get("photo")

                ? toDirectDriveImage(get("photo"))

                : FALLBACK_CAT.photo,

            description:

                get("description")

                || FALLBACK_CAT.description,

            facebook:

                get("facebook")

                || FALLBACK_CAT.facebook

        };

    }

    catch(error){

        console.warn(

            "Guest of the Week couldn't be loaded. Using fallback."

        );

        catOfWeek=FALLBACK_CAT;

    }

    fadeGuest(()=>{

        applyCat();

    });

}

loadCatOfWeek();


/*==================================================
PAGE NAVIGATION
==================================================*/

const pages = document.querySelectorAll(".page");
const navigation = document.getElementById("navigation");
const navLinks = document.querySelectorAll("#navigation a, .footer-links a");
const pageButtons = document.querySelectorAll("[data-page]");
const menuButton=document.getElementById("menuButton");

function showPage(pageName){

    pages.forEach(page=>{

        page.classList.remove("active-page");

    });

    const currentPage=document.getElementById(pageName);

    if(currentPage){

        currentPage.classList.add("active-page");

    }

    navLinks.forEach(link=>{

        link.classList.toggle(

            "active",

            link.dataset.page===pageName

        );

    });

    if(navigation){

        navigation.classList.remove("open");

    }

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

    if(typeof carouselOverflowChecks!=="undefined"){

        setTimeout(()=>{

            carouselOverflowChecks.forEach(check=>check());

        },50);

    }

}

pageButtons.forEach(button=>{

    button.addEventListener("click",event=>{

        event.preventDefault();

        const page=button.dataset.page;

        if(page){

            showPage(page);

        }

    });

});


/*==================================================
MOBILE MENU
==================================================*/

if(menuButton && navigation){

    menuButton.addEventListener("click",()=>{

        navigation.classList.toggle("open");

    });

}


/*==================================================
CLICK OUTSIDE MENU
==================================================*/

document.addEventListener("click",event=>{

    if(

        navigation

        &&

        navigation.classList.contains("open")

        &&

        !navigation.contains(event.target)

        &&

        menuButton

        &&

        !menuButton.contains(event.target)

    ){

        navigation.classList.remove("open");

    }

});


/*==================================================
ESC CLOSES MENU
==================================================*/

document.addEventListener("keydown",event=>{

    if(event.key==="Escape" && navigation){

        navigation.classList.remove("open");

    }

});


/*==================================================
BACK TO TOP BUTTON
==================================================*/

const backTop=document.createElement("button");

backTop.id="backTop";

backTop.setAttribute("aria-label","Back to top");

backTop.innerHTML="↑";

document.body.appendChild(backTop);

window.addEventListener("scroll",()=>{

    if(window.scrollY>300){

        backTop.classList.add("show");

    }

    else{

        backTop.classList.remove("show");

    }

});

backTop.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


/*==================================================
CURRENT YEAR
==================================================*/

const year=document.getElementById("year");

if(year){

    year.textContent=new Date().getFullYear();

}


/*==================================================
PAGE FADE ON LOAD
==================================================*/

window.addEventListener("load",()=>{

    document.body.classList.add("loaded");

});


/*==================================================
 LIGHTBOX
==================================================*/

const galleryLinks=document.querySelectorAll(".gallery-image");
const lightbox=document.getElementById("lightbox");
const lightboxImage=document.getElementById("lightboxImage");
const lightboxClose=document.getElementById("lightboxClose");
const lightboxPrev=document.getElementById("lightboxPrev");
const lightboxNext=document.getElementById("lightboxNext");

let currentImageIndex=0;

function openLightbox(index){

    if(!lightbox || !lightboxImage || !galleryLinks.length) return;

    currentImageIndex=index;

    const image=galleryLinks[currentImageIndex];

    lightboxImage.style.opacity="0";

    lightboxImage.src=image.href;

    lightboxImage.alt=image.querySelector("img")?.alt || "";

    lightbox.classList.add("show");

    document.body.style.overflow="hidden";

    lightboxImage.onload=()=>{

        lightboxImage.style.opacity="1";

    };

}

function closeLightbox(){

    if(!lightbox) return;

    lightbox.classList.remove("show");

    document.body.style.overflow="";

}

function nextImage(){

    currentImageIndex++;

    if(currentImageIndex>=galleryLinks.length){

        currentImageIndex=0;

    }

    openLightbox(currentImageIndex);

}

function previousImage(){

    currentImageIndex--;

    if(currentImageIndex<0){

        currentImageIndex=galleryLinks.length-1;

    }

    openLightbox(currentImageIndex);

}

galleryLinks.forEach((image,index)=>{

    image.addEventListener("click",e=>{

        e.preventDefault();

        openLightbox(index);

    });

});

if(lightboxClose){

    lightboxClose.addEventListener("click",closeLightbox);

}

if(lightboxPrev){

    lightboxPrev.addEventListener("click",previousImage);

}

if(lightboxNext){

    lightboxNext.addEventListener("click",nextImage);

}

if(lightbox){

    lightbox.addEventListener("click",e=>{

        if(e.target===lightbox){

            closeLightbox();

        }

    });

}

document.addEventListener("keydown",e=>{

    if(!lightbox || !lightbox.classList.contains("show")) return;

    switch(e.key){

        case "Escape":

            closeLightbox();

        break;

        case "ArrowRight":

            nextImage();

        break;

        case "ArrowLeft":

            previousImage();

        break;

    }

});


/*==================================================
 MOBILE SWIPE FOR LIGHTBOX
==================================================*/

let startX=0;

if(lightbox){

    lightbox.addEventListener("touchstart",e=>{

        startX=e.changedTouches[0].clientX;

    });

    lightbox.addEventListener("touchend",e=>{

        const endX=e.changedTouches[0].clientX;

        const difference=startX-endX;

        if(Math.abs(difference)<50) return;

        if(difference>0){

            nextImage();

        }

        else{

            previousImage();

        }

    });

}


/*==================================================
 IMAGE PRELOAD FOR GALLERY
==================================================*/

galleryLinks.forEach(link=>{

    const preload=new Image();

    preload.src=link.href;

});


/*==================================================
 BOARDING PASS PRICE CALCULATOR
==================================================*/

const calcCats = document.getElementById("calcCats");
const calcNights = document.getElementById("calcNights");
const calcResult = document.getElementById("calcResult");
const calcBreakdown = document.getElementById("calcBreakdown");


function updateCalculator(){

    if(
        !calcCats ||
        !calcNights ||
        !calcResult
    ){
        return;
    }


    /* ==========================================
    GET SELECTED CAT INFORMATION
    ========================================== */

    const selectedOption =
        calcCats.options[calcCats.selectedIndex];

    const dailyRate =
        parseFloat(selectedOption.value) || 0;

    const numberOfCats =
        parseInt(selectedOption.dataset.cats, 10) || 1;


    /* ==========================================
    GET LENGTH OF STAY
    ========================================== */

    let days =
        parseInt(calcNights.value, 10);


    if(
        isNaN(days) ||
        days < 1
    ){

        days = 1;

    }


    /* ==========================================
    CALCULATE TOTAL
    ========================================== */

    const total =
        dailyRate * days;


    /* ==========================================
    UPDATE BOARDING PASS TOTAL
    ========================================== */

    calcResult.textContent =
        "£" +
        total.toLocaleString(
            "en-GB",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    /* ==========================================
    UPDATE BOARDING PASS BREAKDOWN
    ========================================== */

    if(calcBreakdown){

        const catWord =
            numberOfCats === 1
                ? "cat"
                : "cats";

        const dayWord =
            days === 1
                ? "day"
                : "days";


        calcBreakdown.textContent =
            numberOfCats +
            " " +
            catWord +
            " × " +
            days +
            " " +
            dayWord;

    }

}


/*==================================================
 CALCULATOR EVENT LISTENERS
==================================================*/

if(
    calcCats &&
    calcNights
){

    calcCats.addEventListener(
        "change",
        updateCalculator
    );


    calcNights.addEventListener(
        "input",
        updateCalculator
    );


    calcNights.addEventListener(
        "change",
        function(){

            let days =
                parseInt(
                    calcNights.value,
                    10
                );


            if(
                isNaN(days) ||
                days < 1
            ){

                calcNights.value = 1;

            }


            updateCalculator();

        }
    );


    updateCalculator();

}

/*==================================================
 PHOTO CARD CAROUSELS
==================================================*/

const carouselOverflowChecks=[];

document.querySelectorAll(".cards").forEach(track=>{

    const wrapper=document.createElement("div");

    wrapper.className="cards-carousel";

    track.parentNode.insertBefore(wrapper,track);

    wrapper.appendChild(track);

    const prevBtn=document.createElement("button");

    prevBtn.className="carousel-arrow carousel-prev";

    prevBtn.setAttribute("aria-label","Previous photo");

    prevBtn.innerHTML="&#10094;";

    const nextBtn=document.createElement("button");

    nextBtn.className="carousel-arrow carousel-next";

    nextBtn.setAttribute("aria-label","Next photo");

    nextBtn.innerHTML="&#10095;";

    wrapper.appendChild(prevBtn);

    wrapper.appendChild(nextBtn);

    const scrollAmount=()=>{

        const card=track.querySelector(".card");

        return card ? card.getBoundingClientRect().width+24 : 300;

    };

    prevBtn.addEventListener("click",()=>{

        track.scrollBy({left:-scrollAmount(),behavior:"smooth"});

    });

    nextBtn.addEventListener("click",()=>{

        track.scrollBy({left:scrollAmount(),behavior:"smooth"});

    });

    const updateOverflowState=()=>{

        const overflowing=track.scrollWidth>track.clientWidth+4;

        wrapper.classList.toggle("has-overflow",overflowing);

    };

    carouselOverflowChecks.push(updateOverflowState);

    updateOverflowState();

    window.addEventListener("resize",updateOverflowState);

});


/*==================================================
 SCROLL REVEAL (staggered + varied directions)
==================================================*/

const revealGroups=document.querySelectorAll(

".feature-grid,.pricing-grid,.team-grid,.cards,.highlight-grid,.routine-grid,.feature-strip,.memoriam-grid"

);

revealGroups.forEach(group=>{

    const items=Array.from(group.children);

    items.forEach((item,index)=>{

        const direction=index%3;

        item.classList.add(

            "reveal",

            direction===0 ? "reveal-up" : direction===1 ? "reveal-left" : "reveal-right"

        );

        item.style.transitionDelay=(index*90)+"ms";

    });

});

const soloRevealItems=document.querySelectorAll(

".welcome-box,.about-text,.vip-card"

);

soloRevealItems.forEach(item=>{

    item.classList.add("reveal","reveal-up");

});

const revealObserver=new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("visible");

            revealObserver.unobserve(entry.target);

        }

    });

},{

    threshold:.15

});

document.querySelectorAll(".reveal").forEach(item=>{

    revealObserver.observe(item);

});


/*==================================================
 BUTTON RIPPLE
==================================================*/

document.querySelectorAll(".button").forEach(button=>{

    button.addEventListener("click",function(e){

        const rect=this.getBoundingClientRect();

        const ripple=document.createElement("span");

        ripple.className="ripple";

        ripple.style.left=(e.clientX-rect.left)+"px";

        ripple.style.top=(e.clientY-rect.top)+"px";

        this.appendChild(ripple);

        setTimeout(()=>{

            ripple.remove();

        },600);

    });

});


/*==================================================
 WEBSITE READY
==================================================*/

console.log(

"%c🐾 Smile Cattery Website Loaded",

"color:#3f5945;font-size:16px;font-weight:bold;"

);

/*==================================================
 END OF SCRIPT
==================================================*/
