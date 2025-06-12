const petId = localStorage.getItem('petId');
const username = localStorage.getItem('username');
const usernameDisplay = document.getElementById('user-name');


if (!petId)
{
    alert('No pet found! Please create one.');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {

    if (username && usernameDisplay) {
        usernameDisplay.innerText = username;
    }

    loadPet();
});

function loadPet()
{
    const petImage = document.getElementById('pet-image');

    fetch(`http://localhost:3000/pet/${petId}`)
        .then(res => res.json())
        .then(pet =>
        {
            //console.log('Pet response:', pet);

            if (pet.dead)
            {
                alert('💀 Your pet died cause you neglected them. 😡');
                localStorage.removeItem('petId');
                window.location.href = 'index.html';
            }

            if (pet.health < 40)
            {
                petImage.src = 'GormIdleSad.gif';
            }
            else if (pet.health < 80) 
            {
                petImage.src = 'GormIdleOk.gif';
            }

            document.getElementById('pet-name').textContent = pet.name;
            document.getElementById('happiness').textContent = pet.hap;
            document.getElementById('hunger').textContent = pet.hunger;
            document.getElementById('health').textContent = pet.health;
        })
        .catch(err =>
        {
            console.error('Failed to load pet:', err);
        });
}

function feedPet() {

    const petImage = document.getElementById('pet-image');

    fetch(`http://localhost:3000/pet/feed`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: petId })
        })

    .then(() => fetch(`http://localhost:3000/pet/${petId}`))
    .then(res => res.json())
    .then(pet => {

        if (pet.hunger != 0) {
            petImage.src = 'GormEating.gif';
        }

        loadPet();
        setTimeout(() => {
            if (pet.health < 40) {
                petImage.src = 'GormIdleSad.gif';
            } else if (pet.health < 80) {
                petImage.src = 'GormIdleOk.gif';
            } else {
                petImage.src = 'GormIdleHap.gif';
            }
        }, 1500);
    });
}

function playWithPet() {

    const petImage = document.getElementById('pet-image');

    petImage.src = 'GormPlay.gif';

    fetch(`http://localhost:3000/pet/play`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId })
    })
        .then(() => fetch(`http://localhost:3000/pet/${petId}`))
        .then(res => res.json())
        .then(pet => {

            loadPet();
            setTimeout(() => {
                if (pet.health < 40) {
                    petImage.src = 'GormIdleSad.gif';
                } else if (pet.health < 80) {
                    petImage.src = 'GormIdleOk.gif';
                } else {
                    petImage.src = 'GormIdleHap.gif';
                }
            }, 1300);
        });
}

//loadPet();