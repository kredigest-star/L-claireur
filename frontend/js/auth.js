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
        
        // Bouton Admin (rouge) - seulement pour admin
        if (role === 'admin') {
            buttons += `
                <div class="dropdown">
                    <button class="btn-admin dropdown-toggle">
                        <i class="fas fa-crown"></i> Admin
                    </button>
                    <div class="dropdown-menu">
                        <a href="admin.html"><i class="fas fa-tachometer-alt"></i> Tableau de bord</a>
                        <a href="admin.html#users"><i class="fas fa-users"></i> Utilisateurs</a>
                        <a href="admin.html#requests"><i class="fas fa-user-clock"></i> Demandes</a>
                        <a href="admin.html#articles"><i class="fas fa-newspaper"></i> Articles</a>
                        <div class="dropdown-divider"></div>
                        <a href="admin-settings.html"><i class="fas fa-cog"></i> Paramètres site</a>
                    </div>
                </div>
            `;
        }
        
        // Bouton Éditeur (vert) - pour admin ET editor
        if (role === 'admin' || role === 'editor') {
            buttons += `
                <div class="dropdown">
                    <button class="btn-editor dropdown-toggle">
                        <i class="fas fa-pen"></i> Éditeur
                    </button>
                    <div class="dropdown-menu">
                        <a href="editor.html"><i class="fas fa-plus"></i> Nouvel article</a>
                        <a href="editor.html#my-articles"><i class="fas fa-file-alt"></i> Mes articles</a>
                        <a href="editor.html#drafts"><i class="fas fa-save"></i> Brouillons</a>
                        <div class="dropdown-divider"></div>
                        <a href="editor-settings.html"><i class="fas fa-cog"></i> Paramètres éditeur</a>
                    </div>
                </div>
            `;
        }

        // Nom utilisateur avec dropdown
        buttons += `
            <div class="dropdown">
                <button class="btn-user dropdown-toggle">
                    <span class="user-avatar">${getInitials(displayName)}</span>
                    ${displayName}
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <div class="dropdown-header">
                        <strong>${displayName}</strong>
                        <span class="user-role-badge ${role}">${getRoleName(role)}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="profile.html"><i class="fas fa-user"></i> Mon profil</a>
                    <a href="profile.html#favorites"><i class="fas fa-heart"></i> Favoris</a>
                    <a href="profile.html#comments"><i class="fas fa-comments"></i> Mes commentaires</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="logout(); return false;" class="logout-link">
                        <i class="fas fa-sign-out-alt"></i> Déconnexion
                    </a>
                </div>
            </div>
        `;

        authButtons.innerHTML = buttons;
        
        // Activer les dropdowns
        initDropdowns();
        
    } else {
        // Non connecté
        authButtons.innerHTML = `
            <a href="login.html" class="btn-login">Connexion</a>
            <a href="register.html" class="btn-subscribe">S'abonner</a>
        `;
    }
}

function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.parentElement;
            
            // Fermer les autres dropdowns
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active');
        });
    });

    // Fermer quand on clique ailleurs
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown.active').forEach(d => {
            d.classList.remove('active');
        });
    });
}

function getRoleName(role) {
    const names = {
        'admin': 'Admin',
        'editor': 'Éditeur',
        'subscriber': 'Abonné'
    };
    return names[role] || 'Visiteur';
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
