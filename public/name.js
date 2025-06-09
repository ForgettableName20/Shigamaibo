//import { getOrCreateUser } from './users.js';

document.addEventListener('DOMContentLoaded', () =>
{
    const regForm = document.getElementById('registering-form');
    const usernameInput = document.getElementById('user-name');
    const petNameInput = document.getElementById('pet-name');
    const errorMessage = document.getElementById('error-message');

    if (localStorage.getItem('userId') && localStorage.getItem('petId')) {
        window.location.href = 'game.html';
        return;
    }

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const petName = petNameInput.value.trim();

        if (!username || !petName) {
            errorMessage.innerText = 'Please fill in both fields.';
            return;
        }



        try {
            const res = await fetch('http://localhost:3000/setup',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, petName })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Setup failed');
            }

            if (!data.userId || !data.petId)
            {
                throw new Error('Missing userId or petId in response');
            }

            localStorage.setItem('userId', data.userId);
            localStorage.setItem('petId', data.petId);
            localStorage.setItem('username', username);

            window.location.href = 'game.html';
        }
        catch (err)
        {
            console.error('Error setting up:', err);
            errorMessage.innerText = err.message || 'Something went wrong';
        }
    });
});