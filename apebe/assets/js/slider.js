(function ($) {
	"use strict";
	

	////////////////////////////////////////////////////
	// 13. Swiper Js
	var it_text_slider = new Swiper(".tv-text-slider-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		spaceBetween: 0,
		centeredSlides: true,
		allowTouchMove: false,
		speed: 2500,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	  });
	
	////////////////////////////////////////////////////
	// 13. Swiper Js
	var it_text_slider = new Swiper(".tv-brand-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		spaceBetween: 85,
		centeredSlides: true,
		allowTouchMove: false,
		speed: 2500,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	  }); 	  

////////////////////////////////////////////////////
	//  Swiper Js
	const heroslider1 = new Swiper('.tv-slider-active', {
		slidesPerView: 1,
		loop: true,
		autoplay: true,
		effect:'fade',
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 1,
			},
			'1200': {
				slidesPerView: 1,
			},
			'992': {
				slidesPerView: 1,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		
		pagination: {
			el: '.swiper-pagination', 
			clickable: true,
			renderBullet: function (index, className) {
				return '<span class="' + className + '">' + (index + 1) + '</span>';
			},
		},
		
		
	});
////////////////////////////////////////////////////
	//  Swiper Js
	const heroslider2 = new Swiper('.tv-slider-active2', {
		slidesPerView: 1,
		loop: true,
		autoplay: true,
		effect:'fade',
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 1,
			},
			'1200': {
				slidesPerView: 1,
			},
			'992': {
				slidesPerView: 1,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		navigation: {
			prevEl: '.arrow-prev',
			nextEl: '.arrow-next',
		},
		pagination: {
			el: '.swiper-pagination', 
			clickable: true,
			renderBullet: function (index, className) {
				return '<span class="' + className + '">' + (index + 1) + '</span>';
			},
		},
		
	});


	
////////////////////////////////////////////////////
	//  Swiper Js
	const heroslider3 = new Swiper('.tv-hero-slider-active-3', {
		slidesPerView: 1,
		loop: true,
		autoplay: true,
		effect:'fade',
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 1,
			},
			'1200': {
				slidesPerView: 1,
			},
			'992': {
				slidesPerView: 1,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		navigation: {
			prevEl: '.arrow-prev',
			nextEl: '.arrow-next',
		},

		
		
		
		
	});

	////////////////////////////////////////////////////
	//  Swiper Js
	const testimonialswiper = new Swiper('.tv-testi-slider-active', {
		speed:1500,
		loop: true, 
		effect: "cards",
		slidesPerView: 1,
        spaceBetween: 35,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 1,
			},
			'1200': {
				slidesPerView: 1,
			},
			'992': {
				slidesPerView: 1,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},	
		navigation: {
			prevEl: '.arrow-prev',
			nextEl: '.arrow-next',
		},		
		
	  });
	////////////////////////////////////////////////////
	//  Swiper Js
	const testimonialswiper2 = new Swiper('.tv-testimonial-slider-active2', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 3,
			},
			'1200': {
				slidesPerView: 2,
			},
			'992': {
				slidesPerView: 2,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},	
		navigation: {
			prevEl: '.arrow-prev',
			nextEl: '.arrow-next',
		},		
		
	  });
	
	////////////////////////////////////////////////////
	//  Swiper Js
	const service_slider = new Swiper('.tv-service-slider-active', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 3,
			},
			'1200': {
				slidesPerView: 3,
			},
			'992': {
				slidesPerView: 2,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},	
		
	  });
	////////////////////////////////////////////////////
	//  Swiper Js
	const project_slider = new Swiper('.tv-project-slider-active', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 4,
				centeredSlides: true,
			},
			'1200': {
				slidesPerView: 4,
				centeredSlides: true,
			},
			'992': {
				slidesPerView: 3,
				centeredSlides: true,
			},
			'768': {
				slidesPerView: 2,
				centeredSlides: true,
			},
			'576': {
				slidesPerView: 2,
			},
			'0': {
				slidesPerView: 1,
				centeredSlides: true,
			},
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},	
		
	  });
	////////////////////////////////////////////////////
	//  Swiper Js
	const testi_slider3 = new Swiper('.tv-testi-slider-active3', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		centeredSlides: true,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 2,
				centeredSlides: true,
			},
			'1200': {
				slidesPerView: 2,
				centeredSlides: true,
			},
			'992': {
				slidesPerView: 2,
				centeredSlides: true,
			},
			'768': {
				slidesPerView: 1,
				centeredSlides: true,
			},
			'576': {
				slidesPerView: 1,
				centeredSlides: true,
			},
			'0': {
				slidesPerView: 1,
				centeredSlides: true,
			},
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},	
		
	  });
	////////////////////////////////////////////////////
	//  Swiper Js
	const brand_slider = new Swiper('.tv-brand-slider-active', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 5,
			},
			'1200': {
				slidesPerView: 5,
			},
			'992': {
				slidesPerView: 5,
			},
			'768': {
				slidesPerView: 4,
			},
			'576': {
				slidesPerView: 3,
			},
			'0': {
				slidesPerView: 3,
			},
		},	
		
	  });



	////////////////////////////////////////////////////
// Swiper Js
const teamswiper = new Swiper('.tv-team-slide-active', {
    speed: 1500,
    loop: true,
    rtl: false, // make sure container is not RTL
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 35,

    autoplay: {
        delay: 4500,
        reverseDirection: true, // ← autoplay goes rightward
    },

    breakpoints: {
        '1200': { slidesPerView: 1 },
        '992': { slidesPerView: 1 },
        '768': { slidesPerView: 1 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    },

    navigation: {
        prevEl: '.arrow-prev',
        nextEl: '.arrow-next',
    },

    pagination: {
        el: ".tv-team-pagination",
        clickable: true,
        renderBullet: function (index, className) {
            let images = [
                "assets/img/team/team-1-1.png",
                "assets/img/team/team-1-2.png",
                "assets/img/team/team-1-3.png"
            ];
            return `<span class="${className}"><img src="${images[index]}" alt="Thumb ${index + 1}"></span>`;
        }
    },
});


////////////////////////////////////////////////////
	//  Swiper Js
	const team_slider2 = new Swiper('.tv-team-slider-active2', {
		speed:1500,
		loop: true,
		slidesPerView: 1,
        spaceBetween: 30,
		autoplay: true,
		autoplay: {
			delay: 4500,
		},
		breakpoints: {
			'1400': {
				slidesPerView: 4,
			},
			'1200': {
				slidesPerView: 4,
			},
			'992': {
				slidesPerView: 3,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 2,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		navigation: {
			prevEl: '.arrow-prev',
			nextEl: '.arrow-next',
		},
		
	  });




	




})(jQuery);