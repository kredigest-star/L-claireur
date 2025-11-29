// Menu Mobile - Compatible avec index.html
(function() {
    function initMenu() {
        // Boutons dans le header
        const menuBtn = document.querySelector('.menu-btn');
        const navMenu = document.querySelector('.main-nav');
        const navList = document.querySelector('.nav-list');

        console.log('Menu init - menuBtn:', menuBtn, 'navMenu:', navMenu);

        // Toggle menu mobile
        if (menuBtn && navMenu) {
            menuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Menu clicked!');
                
                navMenu.classList.toggle('active');
                
                // Change icon
                const icon = this.querySelector('i');
                if (icon) {
                    if (navMenu.classList.contains('active')) {
                        icon.className = 'fas fa-times';
                    } else {
                        icon.className = 'fas fa-bars';
                    }
                }
            });
        }

        // Fermer quand on clique ailleurs
        document.addEventListener('click', function(e) {
            if (navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                    navMenu.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            }
        });

        // Fermer quand on clique sur un lien
        if (navList) {
            navList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        const icon = menuBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-bars';
                    }
                });
            });
        }
    }

    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenu);
    } else {
        initMenu();
    }
})();
