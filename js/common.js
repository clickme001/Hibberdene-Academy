document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Navigation toggle for mobile
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Dropdown functionality
    if (dropdowns.length > 0) {
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
    }

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

    // Add hover effects for faculty profiles
    const facultyProfiles = document.querySelectorAll('.faculty-profile');
    if (facultyProfiles.length > 0) {
        facultyProfiles.forEach(profile => {
            profile.addEventListener('mouseenter', () => {
                profile.style.transform = 'scale(1.05)';
                profile.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                profile.style.transition = 'all 0.3s ease';
            });

            profile.addEventListener('mouseleave', () => {
                profile.style.transform = 'scale(1)';
                profile.style.boxShadow = 'none';
            });
        });
    }
});
