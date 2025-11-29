// Auth.js - Gestion de l'authentification et des rôles

let currentUserData = null;

// Initialiser l'auth quand Firebase est prêt
function initAuth() {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        // Attendre que Firebase soit chargé
        setTimeout(initAuth, 100);
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserRole(user);
            updateUI(user);
        } else {
            currentUserData = null;
            updateUI(null);
        }
    });
}

// Démarrer l'initialisation
initAuth();

// Charger le rôle de l'utilisateur depuis Firestore
async function loadUserRole(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            console.log('User role:', currentUserData.role); // Debug
        } else {
            // Créer le profil si inexistant
            currentUserData = {
                email: user.email,
                displayName: user.displayName || '',
                role: 'subscriber',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(user.uid).set(currentUserData);
        }
    } catch (error) {
        console.error('Erreur chargement rôle:', error);
        currentUserData = { role: 'subscriber' };
    }
}

// Mettre à jour l'interface selon l'état de connexion
function updateUI(user) {
    const authButtons = document.getElementById('auth-buttons');
    if (!authButtons) return;

    if (user && currentUserData) {
        const displayName = currentUserData.displayName || user.displayName || user.email.split('@')[0];
        const role = currentUserData.role || 'subscriber';
        
        console.log('Updating UI for role:', role); // Debug

        let buttons = '';
        
        // Bouton Admin (rouge) - seulement pour admin
        if (role === 'admin') {
            buttons += `<a href="admin.html" style="
                display: inline-block;
                padding: 8px 16px;
                background: #e74c3c;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 14px;
                font-weight: 600;
                margin-right: 8px;
            ">Admin</a>`;
        }
        
        // Bouton Éditeur (vert) - pour admin ET editor
        if (role === 'admin' || role === 'editor') {
            buttons += `<a href="editor.html" style="
                display: inline-block;
                padding: 8px 16px;
                background: #27ae60;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 14px;
                font-weight: 600;
                margin-right: 8px;
            ">Éditeur</a>`;
        }

        // Nom d'utilisateur avec lien vers profil
        buttons += `<a href="profile.html" style="
            color: #326891;
            text-decoration: none;
            font-family: 'Source Sans Pro', sans-serif;
            font-weight: 600;
            margin-right: 8px;
        ">${displayName}</a>`;

        // Badge de rôle
        let badgeColor = '#27ae60'; // subscriber = vert
        if (role === 'admin') badgeColor = '#e74c3c';
        if (role === 'editor') badgeColor = '#3498db';
        
        buttons += `<span style="
            display: inline-block;
            padding: 4px 10px;
            background: ${badgeColor};
            color: white;
            border-radius: 50px;
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 12px;
            font-weight: 600;
            margin-right: 10px;
        ">${getRoleName(role)}</span>`;

        // Bouton déconnexion
        buttons += `<button onclick="logout()" style="
            padding: 8px 16px;
            background: #666;
            color: white;
            border: none;
            border-radius: 4px;
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 14px;
            cursor: pointer;
        ">Déconnexion</button>`;

        authButtons.innerHTML = buttons;
    } else {
        // Non connecté
        authButtons.innerHTML = `
            <a href="login.html" style="
                color: #326891;
                text-decoration: none;
                font-family: 'Source Sans Pro', sans-serif;
                font-weight: 600;
                margin-right: 15px;
            ">Connexion</a>
            <a href="register.html" style="
                display: inline-block;
                padding: 8px 16px;
                background: #326891;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 14px;
                font-weight: 600;
            ">S'abonner</a>
        `;
    }
}

// Obtenir le nom du rôle en français
function getRoleName(role) {
    const names = {
        'admin': 'Admin',
        'editor': 'Éditeur',
        'subscriber': 'Abonné'
    };
    return names[role] || 'Visiteur';
}

// Déconnexion
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erreur déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    });
}

// Fonctions de vérification des permissions
function canComment() {
    return currentUserData && ['subscriber', 'editor', 'admin'].includes(currentUserData.role);
}

function canWriteArticle() {
    return currentUserData && ['editor', 'admin'].includes(currentUserData.role);
}

function canPublish() {
    return currentUserData && currentUserData.role === 'admin';
}

function canManageUsers() {
    return currentUserData && currentUserData.role === 'admin';
}

// Obtenir les initiales d'un nom
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
