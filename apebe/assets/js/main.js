(function ($) {
	"use strict";

	var windowOn = $(window);


	///////////////////////////////////////////////////
	// 07. Sticky Header Js
	windowOn.on('scroll', function () {
		var scroll = windowOn.scrollTop();
		if (scroll < 400) {
			$("#header-sticky").removeClass("header-sticky");
		} else {
			$("#header-sticky").addClass("header-sticky");
		}
	});

	if ($('.tv-header-height').length > 0) {
		var headerHeight = document.querySelector(".tv-header-height");
		var setHeaderHeight = headerHeight.offsetHeight;
		$(".tv-header-height").each(function () {
			$(this).css({
				'height': setHeaderHeight + 'px'
			});
		});

		$(".tv-header-height .header-sticky").each(function () {
			$(this).css({
				'height': 'inherit',
			});
		});
	}

	// 08. Nice Select Js
	$('select').niceSelect();

	////////////////////////////////////////////////////
	// 11. Data CSS Js
	$("[data-background").each(function () {
		$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
	});

	$("[data-width]").each(function () {
		$(this).css("width", $(this).attr("data-width"));
	});

	$("[data-bg-color]").each(function () {
		$(this).css("background-color", $(this).attr("data-bg-color"));
	});

	// accordion
	$(".accordion-items").on("click", function () {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$(this).addClass("active").siblings().removeClass("active");
		}
	});


	////////////////////////////////////////////////////
	// 12. Counter Js
	if ($(".purecounter").length) {
		new PureCounter({
			filesizing: true,
			selector: ".filesizecount",
			pulse: 2,
		});
		new PureCounter();
	}
	////////////////////////////////////////////////////
	// 14. magnificPopup Js
	$('.popup-image').magnificPopup({
		type: 'image',
		gallery: {
			enabled: true
		}
	});

	////////////////////////////////////////////////////
	// 15. MagnificPopup video view Js
	$(".popup-video").magnificPopup({
		type: "iframe",
	});

	////////////////////////////////////////////////////
	//26.isotope
	$('.grid').imagesLoaded(function () {
		// init Isotope
		var $grid = $('.grid').isotope({
			itemSelector: '.grid-item',
			percentPosition: true,
			masonry: {
				columnWidth: '.grid-item',
			},

		});
		// filter items on button click
		$('.masonary-menu').on('click', 'button', function () {
			var filterValue = $(this).attr('data-filter');
			$grid.isotope({
				filter: filterValue,
				animationOptions: {
					duration: 100,
					easing: "linear",
					queue: true
				}
			});

		});
		//for menu active class
		$('.masonary-menu button').on('click', function (event) {
			$(this).siblings('.active').removeClass('active');
			$(this).addClass('active');
			event.preventDefault();
		});

	});


	if ($('.tv-menu-content').length && $('.tv-menu-mobile').length) {
		let navContent = document.querySelector(".tv-menu-content").outerHTML;
		let mobileNavContainer = document.querySelector(".tv-menu-mobile");
		mobileNavContainer.innerHTML = navContent;

		let arrow = $(".tv-menu-mobile .has-dropdown > a");

		arrow.each(function () {
			let self = $(this);
			let arrowBtn = document.createElement("BUTTON");
			arrowBtn.classList.add("dropdown-toggle-btn");
			arrowBtn.innerHTML = "<i class='fal fa-angle-right'></i>";
			self.append(function () {
				return arrowBtn;
			});

			self.find("button").on("click", function (e) {
				e.preventDefault();
				let self = $(this);
				self.toggleClass("dropdown-opened");
				self.parent().toggleClass("expanded");
				self.parent().parent().addClass("dropdown-opened").siblings().removeClass("dropdown-opened");
				self.parent().parent().children(".tv-submenu").slideToggle();
			});

		});
	}

	///////////////////////////////////////////////////
	// 03. scroll-to-target 
	windowOn.on('scroll', function () {
		var scroll = windowOn.scrollTop();
		if (scroll < 500) {
			$('.scroll-to-target').removeClass('open');

		} else {
			$('.scroll-to-target').addClass('open');
		}
	});

	///////////////////////////////////////////////////
	// 04. Scroll Up Js
	if ($('.scroll-to-target').length) {
		$(".scroll-to-target").on('click', function () {
			var target = $(this).attr('data-target');
			// animate
			$('html, body').animate({
				scrollTop: $(target).offset().top
			}, 1000);

		});
	}

	////////////////////////////////////////////////////
	// 09. Sidebar Js
	$(".tv-menu-bar").on("click", function () {
		$(".itoffcanvas").addClass("opened");
		$(".body-overlay").addClass("apply");
	});
	$(".close-btn").on("click", function () {
		$(".itoffcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});
	$(".body-overlay").on("click", function () {
		$(".itoffcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});

	////////////////////////////////////////////////////
	// 03. Search Js
	$(".search-open-btn").on("click", function () {
		$(".search__popup").addClass("search-opened");
	});

	$(".search-close-btn").on("click", function () {
		$(".search__popup").removeClass("search-opened");
	});

	///////////////////////////////////////////////////
	// wow animation
	// var wow = new WOW(
	// 	{
	// 	  mobile: true,
	// 	}
	//   );
	//   wow.init();
	// var windowOn = $(window);

	//One Page Scroll Js
	function scrollNav() {
		$('.tv-onepage-menu li').click(function () {
			$(".tv-onepage-menu li.active").removeClass("active");
			$(this).addClass("active");

			$('html, body').stop().animate({
				scrollTop: $($(this).attr('href')).offset().top - 80
			}, 300);
			return false;
		});
	}
	scrollNav();

	// jarallax
	if ($('.jarallax').length > 0) {
		$('.jarallax').jarallax({
		   speed: 0.3, 
		});
	}

	 	// hover reveal start
	const hoverItem = document.querySelectorAll(".tv-service-reveal-item");
	function moveImage(e, hoverItem, index) {
		const item = hoverItem.getBoundingClientRect();
		const x = e.clientX - item.x;
		const y = e.clientY - item.y;
		if (hoverItem.children[index]) {
			hoverItem.children[index].style.transform = `translate(${x}px, ${y}px)`;
		}
	}
	hoverItem.forEach((item, i) => {
		item.addEventListener("mousemove", (e) => {
			setInterval(moveImage(e, item, 1), 50);
		});
	});
	// hover reveal end


	////////////////////////////////////////////////////
	// 16. Cart Quantity Js
	$('.cart-minus').on('click', function () {
		var $input = $(this).parent().find('input');
		var count = parseInt($input.val()) - 1;
		count = count < 1 ? 1 : count;
		$input.val(count);
		$input.change();
		return false;
	});

	$('.cart-plus').on('click', function () {
		var $input = $(this).parent().find('input');
		$input.val(parseInt($input.val()) + 1);
		$input.change();
		return false;
	});


	// 20. Show Login Toggle Js
	$('#showlogin').on('click', function () {
		$('#checkout-login').slideToggle(900);
	});


	$('#cbox').on('click', function () {

		$('#cbox_info').slideToggle(900);
	
	});


	$('#showcoupon').on('click', function () {

		$('#checkout_coupon').slideToggle(900);
	});

	// for range
	if ($.fn.slider && $("#slider-range").length) {
		$("#slider-range").slider({
			range: true,
			min: 0,
			max: 1200,
			values: [80, 700],
			slide: function (event, ui) {
				$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
			}
		});
		$("#amount").val("$" + $("#slider-range").slider("values", 0) +
			" - $" + $("#slider-range").slider("values", 1));
	}


	// split text animation
	if ($('.tv-spltv-text').length > 0) {
		var st = $(".tv-spltv-text");
		if(st.length == 0) return;
		gsap.registerPlugin(SplitText);
		st.each(function(index, el) {
			el.split = new SplitText(el, {
				type: "lines,words,chars",
				linesClass: "tv-spltv-line"
			});
			gsap.set(el, { perspective: 400 });
	
			if( $(el).hasClass('tv-spltv-in-right') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					x: "50",
					ease: "Back.easeOut",
				});
			}
			if( $(el).hasClass('tv-spltv-in-left') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					x: "-50",
					ease: "circ.out",
				});
			}
			if( $(el).hasClass('tv-spltv-in-up') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					y: "80",
					ease: "circ.out",
				});
			}
			if( $(el).hasClass('tv-spltv-in-down') ){
				gsap.set(el.split.chars, {
					opacity: 0,
					y: "-80",
					ease: "circ.out",
				});
			}
			el.anim = gsap.to(el.split.chars, {
				scrollTrigger: {
					trigger: el,
					start: "top 90%",
				},
				x: "0",
				y: "0",
				rotateX: "0",
				scale: 1,
				opacity: 1,
				duration: 0.4,
				stagger: 0.02,
			});
		});	
	}
	
    // Text Animation
    let splitTextLines = gsap.utils.toArray(".tv-text-anim p");
    splitTextLines.forEach(splitTextLine => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: 'top 90%',
          duration: 2,
          end: 'bottom 60%',
          scrub: false,
          markers: false,
          toggleActions: 'play none none none'
        }
      });
      const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
      gsap.set(splitTextLine, { perspective: 400 });
      itemSplitted.split({ type: "lines" })
      tl.from(itemSplitted.lines, { duration: 1, delay: 0.5, opacity: 0, rotationX: -80, force3D: true, transformOrigin: "top center -50", stagger: 0.1 });
    });

	// IT Fade Animation 
	let fadeArray_items = document.querySelectorAll(".tv-fade-anim");
	if (fadeArray_items.length > 0) {
		const fadeArray = gsap.utils.toArray(".tv-fade-anim")
		fadeArray.forEach((item, i) => {

			var fade_direction = "bottom"
			var onscroll_value = 1
			var duration_value = 1.15
			var fade_offset = 50
			var delay_value = 0.15
			var ease_value = "power2.out"

			if (item.getAttribute("data-fade-offset")) {
				fade_offset = item.getAttribute("data-fade-offset");
			}
			if (item.getAttribute("data-duration")) {
				duration_value = item.getAttribute("data-duration");
			}

			if (item.getAttribute("data-fade-from")) {
				fade_direction = item.getAttribute("data-fade-from");
			}
			if (item.getAttribute("data-on-scroll")) {
				onscroll_value = item.getAttribute("data-on-scroll");
			}
			if (item.getAttribute("data-delay")) {
				delay_value = item.getAttribute("data-delay");
			}
			if (item.getAttribute("data-ease")) {
				ease_value = item.getAttribute("data-ease");
			}

			let animation_settings = {
				opacity: 0,
				ease: ease_value,
				duration: duration_value,
				delay: delay_value,
			}

			if (fade_direction == "top") {
				animation_settings['y'] = -fade_offset
			}
			if (fade_direction == "left") {
				animation_settings['x'] = -fade_offset;
			}

			if (fade_direction == "bottom") {
				animation_settings['y'] = fade_offset;
			}

			if (fade_direction == "right") {
				animation_settings['x'] = fade_offset;
			}

			if (onscroll_value == 1) {
				animation_settings['scrollTrigger'] = {
					trigger: item,
					start: 'top 85%',
				}
			}
			gsap.from(item, animation_settings);
		})
	}


	
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
	if ($('#smooth-wrapper').length && $('#smooth-content').length) {
		gsap.config({
			nullTargetWarn: false,
		});
		let smoother = ScrollSmoother.create({
			smooth: 2,
			effects: true,
			smoothTouch: 0.1,
			normalizeScroll: false,
			ignoreMobileResize: true,

		});
	}

	// pricing tab custom js

	document.addEventListener("DOMContentLoaded", function () {
		const tabButtons = document.querySelectorAll('#price-tab .nav-link');
	
		tabButtons.forEach((tabBtn) => {
		  tabBtn.addEventListener('click', function () {
			const target = this.getAttribute('data-bs-target'); // #left-price-monthly or #left-price-yearly
			const isMonthly = target === '#left-price-monthly';
	
			const rightMonthly = document.getElementById('right-price-monthly');
			const rightYearly = document.getElementById('right-price-yearly');
	
			if (isMonthly) {
			  rightMonthly.classList.add('show', 'active');
			  rightYearly.classList.remove('show', 'active');
			} else {
			  rightMonthly.classList.remove('show', 'active');
			  rightYearly.classList.add('show', 'active');
			}
		  });
		});
	  });


	// contactform input filed  js

	document.addEventListener('DOMContentLoaded', function () {
		const fileWrapper = document.querySelector('.it-contact-input-file');
		if (!fileWrapper) return; // Exit if the element doesn't exist
	  
		const fileInput = fileWrapper.querySelector('input[type="file"]');
		const browseBtn = fileWrapper.querySelector('.browse-btn');
		const fileNameText = document.getElementById('file-name'); // Optional
	  
		if (fileInput && browseBtn) {
		  // Open file dialog when clicking on the browse button
		  browseBtn.addEventListener('click', (e) => {
			e.preventDefault(); // Prevent unexpected behavior
			fileInput.click();
		  });
	  
		  // Update file name when file selected
		  fileInput.addEventListener('change', function () {
			if (fileNameText && this.files.length > 0) {
			  fileNameText.textContent = 'Selected file: ' + this.files[0].name;
			}
		  });
		}
	  });
	  

	//   horizontal accordion js

	// const horizontalAccordions = $(".accordion.width");

	// horizontalAccordions.each((index, element) => {
	//   const accordion = $(element);
	//   const collapse = accordion.find(".collapse");
	
	//   // Mark collapsed initially
	//   collapse.not(".show").each((index, el) => {
	// 	$(el).parent().find("[data-bs-toggle='collapse']").addClass("collapsed");
	// 	$(el).removeClass("show"); // force reset
	//   });
	
	//   // Hide header of the visible (open) collapse
	//   collapse.filter(".show").each((index, el) => {
	// 	$(el).siblings(".card-header").hide();
	//   });
	
	//   // Hover event to expand
	//   accordion.find("[data-bs-toggle='collapse']").hover(function () {
	// 	const targetSelector = $(this).attr("data-bs-target");
	// 	const target = $(targetSelector);
	
	// 	if (!target.hasClass("show")) {
	// 	  // Collapse all
	// 	  collapse.removeClass("show");
	// 	  accordion.find(".card-header").show();
	// 	  accordion.find("[data-bs-toggle='collapse']").addClass("collapsed");
	
	// 	  // Expand target
	// 	  target.addClass("show");
	// 	  $(this).removeClass("collapsed");
	// 	  target.siblings(".card-header").hide();
	// 	}
	//   });
	// });
	
	
	

	

	 
})(jQuery);