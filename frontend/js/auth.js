// Auth.js - Gestion de l'authentification et des rôles
let currentUserData = null;

function initAuth() {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
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

initAuth();

async function loadUserRole(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            console.log('Rôle chargé:', currentUserData.role);
        } else {
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

function updateUI(user) {
    const authButtons = document.getElementById('auth-buttons');
    if (!authButtons) return;

    if (user && currentUserData) {
        const displayName = currentUserData.displayName || user.displayName || user.email.split('@')[0];
        const role = currentUserData.role || 'subscriber';

        let buttons = '';
        
        // Bouton Admin (rouge)
        if (role === 'admin') {
            buttons += `<a href="admin.html" class="btn-admin">Admin</a>`;
        }
        
        // Bouton Éditeur (vert) - pour admin ET editor
        if (role === 'admin' || role === 'editor') {
            buttons += `<a href="editor.html" class="btn-editor">Éditeur</a>`;
        }

        // Nom utilisateur
        buttons += `<a href="profile.html" class="user-name">${displayName}</a>`;

        // Badge de rôle
        let badgeClass = 'badge-subscriber';
        let badgeText = 'Abonné';
        if (role === 'admin') { badgeClass = 'badge-admin'; badgeText = 'Admin'; }
        if (role === 'editor') { badgeClass = 'badge-editor'; badgeText = 'Éditeur'; }
        
        buttons += `<span class="user-badge ${badgeClass}">${badgeText}</span>`;
        buttons += `<button onclick="logout()" class="btn-logout">Déconnexion</button>`;

        authButtons.innerHTML = buttons;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn-login">Connexion</a>
            <a href="register.html" class="btn-subscribe">S'abonner</a>
        `;
    }
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erreur déconnexion:', error);
    });
}

// Permissions
function canComment() {
    return currentUserData && ['subscriber', 'editor', 'admin'].includes(currentUserData.role);
}

function canLike() {
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
