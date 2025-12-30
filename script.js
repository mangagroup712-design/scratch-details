const searchTrigger = document.getElementById('search-trigger');
const searchInput = document.querySelector('.search-input');


function openSearchBar() {


    const searchInput = document.getElementById('username-input');
    const btn = document.getElementById('search-button');
    searchInput.classList.toggle('active');
    btn.classList.toggle('active');
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    }
}

document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getStringValue();
});


function getStringValue(){
    const container = document.getElementById('container');
    container.classList.add('appear');    
    
    const inputElement = document.getElementById('username-input');
    let val = inputElement.value.trim();
    console.log(val);

    if (!val) 
        return;

    const detail = fetch(`https://trampoline.turbowarp.org/proxy/users/${val}`)
    .then(response => response.json())
    .then(data => {
        let username = data.username;
        let userid = data.id;
        const element1id = document.getElementById('user-icon');
        element1id.innerHTML = `<img src="https://cdn2.scratch.mit.edu/get_image/user/${userid}_90x90.png?v=" alt="User Icon" />`;
        let userhistory = data.history["joined"];
        let country = data.profile.country;
        let status = data.profile.status;
        let bio = data.profile.bio;
        const element2id = document.getElementById('user-detail');
        element2id.innerHTML = `
            <p style="font-size: 500%;">${username}</p>
            <br><p style="font-size: 1rem;">Joined: ${userhistory}</br>
            <br>Region: ${country}</br>
            <br>Status: ${status}</br>
            <br>Bio: ${bio}</br>
            `;    

    });

}
