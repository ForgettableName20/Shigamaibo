document.getElementById('name-form').addEventListener('submit', async (e) =>
{
    e.preventDefault();
    const petName = document.getElementById('pet-name').value;

    try
    {
        const res = await fetch('http://localhost:3000/pet/create', 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: petName })
        });

        const data = await res.json();
        console.log('Pet created:', data);

        if (!data.id)
        {
            throw new Error('No pet ID returned from backend');
        }

        localStorage.setItem('petId', data.id);
        window.location.href = 'game.html';
    }
    catch (err)
    {
        console.error('Error creating pet:', err);
        alert('Could not create pet. Check your backend server.');
    }
});