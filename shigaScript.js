const petId = localStorage.getItem('petId');

if (!petId) {
    alert('No pet found! Please create one first.');
    window.location.href = 'index.html';
}

function loadPet() {
    fetch(`http://localhost:3000/pet/${petId}`)
        .then(res => res.json())
        .then(pet => {
            document.getElementById('pet-name').textContent = pet.name;
            document.getElementById('happiness').textContent = pet.happiness;
            document.getElementById('hunger').textContent = pet.hunger;
        })
        .catch(err => {
            console.error('Failed to load pet:', err);
        });
}

function feedPet() {
    fetch(`http://localhost:3000/pet/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId })
    })
        .then(() => loadPet());
}

function playWithPet() {
    fetch(`http://localhost:3000/pet/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId })
    })
        .then(() => loadPet());
}

loadPet();