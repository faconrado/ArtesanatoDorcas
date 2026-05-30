var swiper = new Swiper(".swiper", {
    direction: "horizontal",
    cssMode: true,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
},
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    mousewheel: true,
    keyboard: true,
    scrollbar: {
      el: ".swiper-scrollbar",
    },  
});