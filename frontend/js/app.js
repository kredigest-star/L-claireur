document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate();
    loadArticles();
    initNewsletter();
});

function setCurrentDate() {
    var dateEl = document.getElementById('current-date');
    if (dateEl) {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var date = new Date().toLocaleDateString('fr-FR', options);
        dateEl.textContent = date.charAt(0).toUpperCase() + date.slice(1);
    }
}

function loadArticles() {
    var container = document.getElementById('articles-container');
    if (!container) return;

    var articles = [
        {
            title: "Les enjeux climatiques au cœur du sommet international",
            excerpt: "Les dirigeants mondiaux se réunissent pour définir les nouvelles orientations environnementales.",
            category: "Monde",
            image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800",
            author: "Sophie Martin",
            date: "Aujourd'hui"
        },
        {
            title: "L'intelligence artificielle transforme la santé",
            excerpt: "Les avancées en IA permettent des diagnostics plus précis et des traitements personnalisés.",
            category: "Sciences",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
            author: "Dr. Pierre Lemaire",
            date: "Hier"
        },
        {
            title: "Les marchés réagissent aux mesures économiques",
            excerpt: "Les places boursières connaissent une volatilité accrue suite aux annonces des banques centrales.",
            category: "Économie",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
            author: "Marie Dubois",
            date: "Il y a 2 jours"
        },
        {
            title: "Le nouveau musée national ouvre ses portes",
            excerpt: "Après cinq années de travaux, le musée propose une expérience immersive unique.",
            category: "Culture",
            image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800",
            author: "Claire Bernard",
            date: "Il y a 3 jours"
        },
        {
            title: "Préparation intensive avant les compétitions",
            excerpt: "Les athlètes nationaux entament leur dernière phase de préparation sportive.",
            category: "Sports",
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
            author: "Thomas Petit",
            date: "Il y a 4 jours"
        },
        {
            title: "Débat sur les réformes à l'Assemblée",
            excerpt: "L'Assemblée examine les propositions de modernisation des institutions.",
            category: "Politique",
            image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800",
            author: "Jean-Paul Moreau",
            date: "Il y a 5 jours"
        }
    ];

    var html = '';
    for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        html += '<article class="article-card">';
        html += '<div class="article-card-image">';
        html += '<img src="' + article.image + '" alt="' + article.title + '">';
        html += '</div>';
        html += '<span class="article-card-category">' + article.category + '</span>';
        html += '<h3 class="article-card-title">' + article.title + '</h3>';
        html += '<p class="article-card-excerpt">' + article.excerpt + '</p>';
        html += '<div class="article-card-meta">';
        html += '<span>' + article.author + '</span> · <span>' + article.date + '</span>';
        html += '</div>';
        html += '</article>';
    }
    container.innerHTML = html;
}

function initNewsletter() {
    var form = document.getElementById('newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn = form.querySelector('button');
            btn.textContent = '✓ Inscrit !';
            btn.style.background = '#27ae60';
            setTimeout(function() {
                btn.textContent = "S'inscrire";
                btn.style.background = '';
                form.querySelector('input').value = '';
            }, 2000);
        });
    }
}
