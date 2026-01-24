function updateAuthUI(user) {
    console.log('Updating auth UI with user:', user);
    
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutLink = document.getElementById('logout-link');
    
    console.log('Found elements:', { loginLink, signupLink, logoutLink });
    
    if (loginLink && signupLink && logoutLink) {
        if (user) {
            // User is logged in
            console.log('User is logged in, hiding login/signup');
            loginLink.style.display = 'none';
            signupLink.style.display = 'none';
            logoutLink.style.display = 'block';
            
            // Force visibility change
            loginLink.classList.add('hidden');
            signupLink.classList.add('hidden');
            logoutLink.classList.remove('hidden');
            
            // Optionally show user email or name
            if (user.email) {
                logoutLink.textContent = `Logout (${user.email.split('@')[0]})`;
            }
        } else {
            // User is not logged in
            console.log('User is not logged in, showing login/signup');
            loginLink.style.display = 'block';
            signupLink.style.display = 'block';
            logoutLink.style.display = 'none';
            
            // Force visibility change
            loginLink.classList.remove('hidden');
            signupLink.classList.remove('hidden');
            logoutLink.classList.add('hidden');
            
            logoutLink.textContent = 'Logout';
        }
        
        // Force a reflow to ensure changes are applied
        document.body.offsetHeight;
        
        console.log('Auth UI updated. Current display states:', {
            loginDisplay: loginLink.style.display,
            signupDisplay: signupLink.style.display,
            logoutDisplay: logoutLink.style.display
        });
    } else {
        console.log('Some auth elements not found');
    }
}

// Wait for Firebase to be available with multiple detection methods
function waitForFirebase(callback, maxAttempts = 100) {
    let attempts = 0;
    
    const checkFirebase = () => {
        attempts++;
        console.log(`Checking for Firebase... attempt ${attempts}`);
        
        // Check multiple ways Firebase might be available
        const hasFirebase = window.firebase && window.firebase.auth;
        const hasAuth = window.auth; // From init firebase.js
        const hasGlobalAuth = window.firebaseAuth;
        
        console.log('Firebase detection:', { hasFirebase, hasAuth, hasGlobalAuth, windowKeys: Object.keys(window).filter(k => k.includes('firebase') || k.includes('auth')) });
        
        if (hasFirebase || hasAuth || hasGlobalAuth) {
            console.log('Firebase found, initializing auth');
            callback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkFirebase, 50); // Check more frequently
        } else {
            console.log('Firebase not found after all attempts, using fallback');
            initializeFallback();
        }
    };
    
    checkFirebase();
}

// Enhanced Firebase auth initialization with multiple auth sources
function initializeFirebaseAuth() {
    console.log('Initializing Firebase auth');
    
    // Try different ways to access Firebase auth
    let auth = null;
    if (window.auth) {
        auth = window.auth;
        console.log('Using window.auth');
    } else if (window.firebase && window.firebase.auth) {
        auth = window.firebase.auth();
        console.log('Using window.firebase.auth()');
    } else if (window.firebaseAuth) {
        auth = window.firebaseAuth;
        console.log('Using window.firebaseAuth');
    }
    
    if (!auth) {
        console.error('No Firebase auth found, falling back');
        initializeFallback();
        return;
    }
    
    // Set up auth state listener
    auth.onAuthStateChanged((user) => {
        console.log('Firebase auth state changed:', user);
        updateAuthUI(user);
        
        // Sync with localStorage for compatibility
        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userEmail', user.email || '');
        } else {
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userEmail');
        }
    });
    
    // Add logout handler
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Logout clicked');
            try {
                await auth.signOut();
                console.log('Firebase signOut successful');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
    
    // Force immediate auth state check
    const currentUser = auth.currentUser;
    if (currentUser) {
        console.log('Found current user immediately:', currentUser);
        updateAuthUI(currentUser);
    }
}

// Fallback for when Firebase isn't available
function initializeFallback() {
    console.log('Using localStorage fallback');
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    updateAuthUI(loggedIn ? { email: localStorage.getItem('userEmail') } : null);
    
    // Add logout handler
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }
}

// Legacy functions for compatibility
function setLoggedIn() {
    localStorage.setItem('loggedIn', 'true');
    updateAuthUI({ email: localStorage.getItem('userEmail') });
}

function isLoggedIn() {
    if (window.auth && window.auth.currentUser) {
        return window.auth.currentUser !== null;
    }
    if (window.firebase && window.firebase.auth) {
        return window.firebase.auth().currentUser !== null;
    }
    return localStorage.getItem('loggedIn') === 'true';
}

// Make functions globally available for debugging
window.updateAuthUI = updateAuthUI;
window.setLoggedIn = setLoggedIn;
window.isLoggedIn = isLoggedIn;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting auth immediately');
    
    // Try immediate initialization first
    if (window.firebase || window.auth || window.firebaseAuth) {
        console.log('Firebase already available, initializing immediately');
        initializeFirebaseAuth();
    } else {
        // Wait for Firebase with shorter initial delay
        console.log('Firebase not immediately available, waiting...');
        setTimeout(initializeAuth, 100);
    }
    
    setTimeout(() => {
        console.log('Backup auth check after 1 second');
        if (!isAuthInitialized) {
            initializeAuth();
        }
    }, 1000);
});

let isAuthInitialized = false;

function initializeAuth() {
    if (isAuthInitialized) {
        console.log('Auth already initialized, skipping');
        return;
    }
    
    console.log('Starting auth initialization');
    waitForFirebase(() => {
        isAuthInitialized = true;
        initializeFirebaseAuth();
    });
}