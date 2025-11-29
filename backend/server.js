const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Firebase (remplace avec tes infos)
const FIREBASE_PROJECT_ID = 'TON-PROJECT-ID'; // Remplace par ton Project ID Firebase
const SITE_URL = 'https://TON-USERNAME.github.io/leclaireur'; // Remplace par ton URL GitHub Pages
const SITE_NAME = "L'Éclaireur";

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: "Backend L'Éclaireur actif",
        endpoints: {
            share: '/share/:articleId'
        }
    });
});

// Route de partage avec meta tags pour réseaux sociaux
app.get('/share/:articleId', async (req, res) => {
    const { articleId } = req.params;
    
    try {
        // Récupérer l'article depuis Firestore via l'API REST
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles/${articleId}`;
        
        const response = await fetch(firestoreUrl);
        
        if (!response.ok) {
            return res.redirect(`${SITE_URL}/article.html?id=${articleId}`);
        }
        
        const data = await response.json();
        const fields = data.fields;
        
        // Extraire les données de l'article
        const title = fields.title?.stringValue || 'Article';
        const excerpt = fields.excerpt?.stringValue || fields.content?.stringValue?.substring(0, 200) || '';
        const image = fields.image?.stringValue || '';
        const category = fields.category?.stringValue || '';
        const authorName = fields.authorDisplayName?.stringValue || fields.authorName?.stringValue || 'Auteur';
        
        // URL de l'article
        const articleUrl = `${SITE_URL}/article.html?id=${articleId}`;
        
        // Générer la page HTML avec les meta tags
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | ${SITE_NAME}</title>
    
    <!-- Meta tags standard -->
    <meta name="description" content="${escapeHtml(excerpt)}">
    <meta name="author" content="${escapeHtml(authorName)}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(excerpt)}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:locale" content="fr_FR">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${articleUrl}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(excerpt)}">
    <meta name="twitter:image" content="${image}">
    
    <!-- WhatsApp -->
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    
    <!-- Redirection automatique -->
    <meta http-equiv="refresh" content="0;url=${articleUrl}">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .loading {
            text-align: center;
            color: #666;
        }
        .loading h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        .loading p {
            color: #999;
        }
        .loading a {
            color: #326891;
        }
    </style>
</head>
<body>
    <div class="loading">
        <h1>${SITE_NAME}</h1>
        <p>Redirection vers l'article...</p>
        <p><a href="${articleUrl}">Cliquez ici si vous n'êtes pas redirigé</a></p>
    </div>
    
    <script>
        window.location.href = "${articleUrl}";
    </script>
</body>
</html>`;
        
        res.send(html);
        
    } catch (error) {
        console.error('Erreur:', error);
        res.redirect(`${SITE_URL}/article.html?id=${articleId}`);
    }
});

// Fonction pour échapper le HTML
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

app.listen(PORT, () => {
    console.log(`Serveur L'Éclaireur démarré sur le port ${PORT}`);
});
