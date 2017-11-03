var resourceLoadCompleted = false;
var resourcesToLoad = 0;
var resourcesLoaded = 0;

var imgMask;
var imgBowl;
var imgBowlShine;
var imgBowlGlow;
var imgBowlGlowMask;
var imgBowlShadow;
var imgFish;
var imgLogo;
var imgNeedle;

function LoadResources() {
    resourcesLoaded = 0;
    resourcesToLoad = 10;

    imgMask = new Image();
    imgMask.onload = ResourceLoadComplete;
    imgMask.src = "Images/Mask.png";

    imgBowl = new Image();
    imgBowl.onload = ResourceLoadComplete;
    imgBowl.src = "Images/Bowl.png";

    imgBowlShine = new Image();
    imgBowlShine.onload = ResourceLoadComplete;
    imgBowlShine.src = "Images/BowlShine.png";

    imgBowlGlow = new Image();
    imgBowlGlow.onload = ResourceLoadComplete;
    imgBowlGlow.src = "Images/BowlGlow.png";

    imgBowlGlowMask = new Image();
    imgBowlGlowMask.onload = ResourceLoadComplete;
    imgBowlGlowMask.src = "Images/BowlGlowMask.png";

    imgFish = new Image();
    imgFish.onload = ResourceLoadComplete;
    imgFish.src = "Images/FishStrip.png";

    imgBowlShadow = new Image();
    imgBowlShadow.onload = ResourceLoadComplete;
    imgBowlShadow.src = "Images/BowlShadow.png";

    imgLogo = new Image();
    imgLogo.onload = ResourceLoadComplete;
    imgLogo.src = "Images/Logo.png";

    imgGauge = new Image();
    imgGauge.onload = ResourceLoadComplete;
    imgGauge.src = "Images/Gauge.png";

    imgNeedle = new Image();
    imgNeedle.onload = ResourceLoadComplete;
    imgNeedle.src = "Images/Needle.png";
}


function ResourceLoadComplete() {
    resourcesLoaded++;
    if (resourcesLoaded == resourcesToLoad) {
        resourceLoadCompleted = true;
        setTimeout(FinishLoading, INTRODUCTION_DELAY);
    }
}
