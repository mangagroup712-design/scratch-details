document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getStringValue();
});

const USERNAME_PATTERN = /^[a-zA-Z0-9_\-]{3,20}$/;

const activeCards = new Map();

function showError(msg) {
    const input = document.getElementById('username-input');
    input.classList.add('input-error');
    let err = document.getElementById('input-error-msg');
    if (!err) {
        err = document.createElement('div');
        err.id = 'input-error-msg';
        input.parentElement.appendChild(err);
    }
    err.textContent = msg;
    setTimeout(() => {
        const errEl = document.getElementById('input-error-msg');
        if (!errEl) return;
        errEl.classList.add('hide');
        setTimeout(() => {
            document.getElementById('username-input').classList.remove('input-error');
            const e2 = document.getElementById('input-error-msg');
            if (e2) e2.remove();
        }, 500);
    }, 4000);
}

function clearError() {
    document.getElementById('username-input').classList.remove('input-error');
    const err = document.getElementById('input-error-msg');
    if (err) err.remove();
}

function removeCard(username) {
    const card = activeCards.get(username);
    if (!card) return;
    card.classList.remove('appear');
    void card.offsetWidth;
    card.classList.add('hide');
    setTimeout(() => {
        card.remove();
        activeCards.delete(username);
    }, 800);
}

function createUserCard(username, userid, userhistory, country, status, bio) {
    if (activeCards.has(username.toLowerCase())) return;

    const wrapper = document.getElementById('container-wrapper');
    const card = document.createElement('div');
    card.className = 'container';

    card.innerHTML = `
        <div class="user-info">
            <div class="user-icon">
                <img src="https://cdn2.scratch.mit.edu/get_image/user/${userid}_90x90.png?v=" alt="User Icon" />
            </div>
            <div class="user-detail">
                <a href="https://scratch.mit.edu/users/${username}" target="_blank">
                    <p class="username-text">${username}</p>
                </a>
                <p>Joined: ${userhistory}</p>
                <p>Region: ${country}</p>
                <p>Status: ${status}</p>
                <p>Bio: ${bio}</p>
            </div>
        </div>
    `;

    wrapper.appendChild(card);
    activeCards.set(username.toLowerCase(), card);

    void card.offsetWidth;
    card.classList.add('appear');

    const info = card.querySelector('.user-info');
    const icon = card.querySelector('.user-icon');
    setTimeout(() => {
        void info.offsetWidth;
        info.classList.add('appear');
        void icon.offsetWidth;
        icon.classList.add('appear');
    }, 400);
}

function getStringValue() {
    const inputElement = document.getElementById('username-input');
    let val = inputElement.value.trim();

    if (!val) {
        showError('Error: Please enter a username.');
        return;
    }

    const names = val.split(',').map(v => v.trim()).filter(v => v.length > 0);

    for (const name of names) {
        if (!USERNAME_PATTERN.test(name)) {
            showError(`Error: "${name}" contains invalid characters or is too short/long.`);
            return;
        }
    }

    clearError();

    const newNames = new Set(names.map(n => n.toLowerCase()));


    for (const [username] of activeCards) {
        if (!newNames.has(username)) {
            removeCard(username);
        }
    }


    names.forEach((name, i) => {
        if (activeCards.has(name.toLowerCase())) return;
        setTimeout(() => {
            fetch(`https://trampoline.turbowarp.org/proxy/users/${name}`)
            .then(response => response.json())
            .then(data => {
                createUserCard(
                    data.username,
                    data.id,
                    data.history["joined"],
                    data.profile.country,
                    data.profile.status,
                    data.profile.bio
                );
            })
            .catch(() => {
                showError(`Error: Could not find user "${name}".`);
            });
        }, i * 200);
    });
}

function toggleMenu() {
    document.getElementById('menu-btn').classList.toggle('open');
    document.getElementById('nav-menu').classList.toggle('open');
}

const page = location.pathname.split('/').pop();
if (page === 'Users.html' || page === '') document.getElementById('nav-users').classList.add('active');
if (page === 'ServerHealth.html') document.getElementById('nav-serverhealth').classList.add('active');

document.addEventListener('click', (e) => {
    if (!e.target.closest('#header') && !e.target.closest('#nav-menu')) {
        document.getElementById('menu-btn').classList.remove('open');
        document.getElementById('nav-menu').classList.remove('open');
    }
});
