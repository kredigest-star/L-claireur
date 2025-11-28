// Auth & Roles Management
const AUTH = {
    user: null,
    role: 'visitor',
    
    init: function() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                await this.loadUserRole(user.uid);
                this.updateUI();
            } else {
                this.user = null;
                this.role = 'visitor';
                this.updateUI();
            }
        });
    },

    loadUserRole: async function(uid) {
        try {
            const db = firebase.firestore();
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.role = doc.data().role || 'subscriber';
            } else {
                // Créer le document utilisateur s'il n'existe pas
                await db.collection('users').doc(uid).set({
                    email: this.user.email,
                    displayName: this.user.displayName || this.user.email.split('@')[0],
                    role: 'subscriber',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                this.role = 'subscriber';
            }
        } catch (error) {
            console.error('Erreur chargement rôle:', error);
            this.role = 'subscriber';
        }
    },

    updateUI: function() {
        const authButtons = document.getElementById('auth-buttons');
        if (!authButtons) return;

        if (this.user) {
            const name = this.user.displayName || this.user.email.split('@')[0];
            let menuItems = '';
            
            // Menu selon le rôle
            if (this.role === 'admin') {
                menuItems = `
                    <a href="admin.html" class="btn-role">Admin</a>
                    <a href="editor.html" class="btn-role">Éditeur</a>
                `;
            } else if (this.role === 'editor') {
                menuItems = `
                    <a href="editor.html" class="btn-role">Éditeur</a>
                `;
            }

            authButtons.innerHTML = `
                ${menuItems}
                <span class="user-welcome">Bonjour, ${name}</span>
                <span class="user-role-badge role-${this.role}">${this.getRoleName()}</span>
                <button class="btn-auth" id="btn-logout">Déconnexion</button>
            `;
            
            document.getElementById('btn-logout').addEventListener('click', () => {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'index.html';
                });
            });
        } else {
            authButtons.innerHTML = `
                <a href="login.html" class="btn-auth">Connexion</a>
                <a href="register.html" class="btn-subscribe">S'abonner</a>
            `;
        }
    },

    getRoleName: function() {
        const names = {
            'admin': 'Admin',
            'editor': 'Éditeur',
            'subscriber': 'Abonné',
            'visitor': 'Visiteur'
        };
        return names[this.role] || 'Visiteur';
    },

    // Vérifications de permissions
    canComment: function() {
        return ['subscriber', 'editor', 'admin'].includes(this.role);
    },

    canWriteArticle: function() {
        return ['editor', 'admin'].includes(this.role);
    },

    canPublish: function() {
        return this.role === 'admin';
    },

    canManageUsers: function() {
        return this.role === 'admin';
    },

    canDeleteAny: function() {
        return this.role === 'admin';
    },

    requireRole: function(requiredRole, redirectUrl = 'index.html') {
        const roleHierarchy = ['visitor', 'subscriber', 'editor', 'admin'];
        const userLevel = roleHierarchy.indexOf(this.role);
        const requiredLevel = roleHierarchy.indexOf(requiredRole);
        
        if (userLevel < requiredLevel) {
            alert('Accès non autorisé');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        AUTH.init();
    }
});

window.AUTH = AUTH;
