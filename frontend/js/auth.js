// Auth.js - Gestion de l'authentification et des rôles

let currentUserData = null;

// Initialiser l'auth listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await loadUserRole(user);
        updateUI(user);
    } else {
        currentUserData = null;
        updateUI(null);
    }
});

// Charger le rôle de l'utilisateur depuis Firestore
async function loadUserRole(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
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
        
        let roleButtons = '';
        
        // Bouton Admin pour les admins
        if (role === 'admin') {
            roleButtons += `<a href="admin.html" class="btn-auth" style="background: #326891; color: white;">Admin</a>`;
        }
        
        // Bouton Éditeur pour les éditeurs et admins
        if (role === 'admin' || role === 'editor') {
            roleButtons += `<a href="editor.html" class="btn-auth" style="background: #27ae60; color: white;">Éditeur</a>`;
        }

        authButtons.innerHTML = `
            ${roleButtons}
            <a href="profile.html" class="user-profile-link" title="Mon profil">
                <span class="user-welcome">Bonjour, ${displayName}</span>
            </a>
            <span class="user-role-badge role-${role}">${getRoleName(role)}</span>
            <button class="btn-auth" onclick="logout()">Déconnexion</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn-auth">Connexion</a>
            <a href="register.html" class="btn-subscribe">S'abonner</a>
        `;
    }
}

// Obtenir le nom du rôle en français
function getRoleName(role) {
    const names = {
        'admin': 'Admin',
        'editor': 'Éditeur',
        'subscriber': 'Abonné',
        'visitor': 'Visiteur'
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

// Vérifier les permissions

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

function canDeleteAny() {
    return currentUserData && currentUserData.role === 'admin';
}

// Vérifier si l'utilisateur a un rôle minimum requis
function requireRole(minRole) {
    const roleHierarchy = ['visitor', 'subscriber', 'editor', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(currentUserData?.role || 'visitor');
    const requiredRoleIndex = roleHierarchy.indexOf(minRole);
    return userRoleIndex >= requiredRoleIndex;
}

// Obtenir les initiales d'un nom
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
