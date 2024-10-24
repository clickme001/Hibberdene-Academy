document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Navigation toggle for mobile
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Dropdown functionality
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropbtn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (dropdownToggle && dropdownContent) {
            dropdownToggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdownContent.classList.toggle('active');
                }
            });

            // Close dropdown when a link inside is clicked
            dropdownContent.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navMenu.classList.remove('active');
                        dropdowns.forEach(d => {
                            const content = d.querySelector('.dropdown-content');
                            if (content) content.classList.remove('active');
                        });
                    }
                });
            });
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navMenu.contains(event.target) || (navToggle && navToggle.contains(event.target));
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            dropdowns.forEach(dropdown => {
                const content = dropdown.querySelector('.dropdown-content');
                if (content) content.classList.remove('active');
            });
        }
    });

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    let currentIndex = 0;

    function showSlide(index) {
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[index].classList.add('active');
        adjustCarouselImage(carouselItems[index].querySelector('img'));
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        showSlide(currentIndex);
    }

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // Auto-advance slides every 5 seconds
    setInterval(nextSlide, 5000);

    // Function to adjust carousel image
    function adjustCarouselImage(img) {
        const container = img.closest('.carousel-item');
        const containerAspect = container.offsetWidth / container.offsetHeight;
        const imgAspect = img.naturalWidth / img.naturalHeight;

        if (imgAspect > containerAspect) {
            img.style.width = '100%';
            img.style.height = 'auto';
        } else {
            img.style.width = 'auto';
            img.style.height = '100%';
        }
    }

    // Adjust all carousel images on load and resize
    function adjustAllCarouselImages() {
        carouselItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete) {
                adjustCarouselImage(img);
            } else {
                img.addEventListener('load', () => adjustCarouselImage(img));
            }
        });
    }

    window.addEventListener('resize', adjustAllCarouselImages);
    adjustAllCarouselImages();

});
