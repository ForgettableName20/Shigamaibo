﻿const petId = localStorage.getItem('petId');
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
    fetch(`http://localhost:3000/pet/${petId}`)
        .then(res => res.json())
        .then(pet =>
        {
            //console.log('Pet response:', pet);

            if (pet.dead) {
                alert('💀 Your pet died cause you neglected them. 😡');
                localStorage.removeItem('petId');
                window.location.href = 'index.html';
            }

            document.getElementById('pet-name').textContent = pet.name;
            document.getElementById('happiness').textContent = pet.hap;
            document.getElementById('hunger').textContent = pet.hunger;
            document.getElementById('health').textContent = pet.health;
        })
        .catch(err => {
            console.error('Failed to load pet:', err);
        });
}

function feedPet() {
    fetch(`http://localhost:3000/pet/feed`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId })
    })
        .then(() => loadPet());
}

function playWithPet() {
    fetch(`http://localhost:3000/pet/play`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId })
    })
        .then(() => loadPet());
}

//loadPet();