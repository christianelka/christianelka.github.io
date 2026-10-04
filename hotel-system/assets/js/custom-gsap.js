//  Custom GSAP js start //


// ** plan ***
if (document.querySelector(".plan-down")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".plan-down",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".plan-down", 
      {
        x: 200,
        y: -80,
      },  
      { 
        x: -100,
        y: 0,
        duration: 1.6
      } 
    );
  }
 
if (document.querySelector(".plan-down2")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".plan-down2",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".plan-down2", 
      {
        x: -200,
        y: -80,
      },  
      { 
        x: 100,
        y: 0,
        duration: 1.6
      } 
    );
  }
 
// ***truck 
if (document.querySelector(".truck")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".truck",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".truck", 
      {
        x: 0,
      },  
      { 
        x: 200,
        duration: 1.2
      } 
    );
}
// ***train 
if (document.querySelector(".train")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".train",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".train", 
      {
        x: 0,
      },  
      { 
        x: -100,
        duration: 1.2
      } 
    );
}


// ***ship 
if (document.querySelector(".ship")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".ship",
        start: "top 70%",
        end: "bottom 0%",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".ship", 
      {
        x: 100,
      },  
      { 
        x: -100,
        duration: 1.2
      } 
    );
  }  

// ** zoom-img *
if (document.querySelector(".zoom-img img")) { 
    let transWayLT = gsap.timeline({
      scrollTrigger: {
        trigger: ".zoom-img img",
        scrub: 2,  
        markers: false,
      }
    });
    transWayLT.fromTo(".zoom-img img", 
      {
        scale: 1
      },  
      { 
        scale: 1.5,
        duration: .5
      } 
    );
}  
// ** big-img-zoom *

if ($('.tv-hero-thumb-wrap').length > 0) {
  ScrollTrigger.create({
    trigger: ".tv-hero-thumb-wrap",
    start: "top 65",
    end: "bottom 0%",
    pin: ".tv-hero-thumb",
    pinSpacing: false,
  });
}
