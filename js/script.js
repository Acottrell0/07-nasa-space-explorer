// Use your own key from https://api.nasa.gov/ for higher request limits.
// DEMO_KEY works for testing and prevents the app from failing with an invalid key.
const NASA_API_KEY = 'qMBQ9r6hdPFzHwgPDhqRcJLKjLCLzLBwQjNKGmDr';

// Find the page elements we will use.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');

setupDateInputs(startInput, endInput);

// Fun space facts. One is picked at random each time the page loads.
const spaceFacts = [
	'A day on Venus is longer than its year: it takes 243 Earth days to spin once, but only 225 to orbit the Sun.',
	'Neutron stars are so dense that a teaspoon of their material would weigh about a billion tons on Earth.',
	'There are more stars in the universe than grains of sand on all of Earth\'s beaches.',
	'Footprints left on the Moon by Apollo astronauts could last millions of years because there is no wind to erase them.',
	'Saturn is less dense than water. In a big enough bathtub, it would float.',
	'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
	'Olympus Mons on Mars is the tallest volcano in the solar system, nearly three times the height of Mount Everest.',
	'The International Space Station orbits Earth about every 90 minutes, so astronauts see around 16 sunrises a day.',
	'Jupiter\'s Great Red Spot is a storm wider than Earth that has been raging for at least 350 years.',
	'Space is completely silent because there is no air for sound waves to travel through.',
	'The Milky Way and the Andromeda galaxy are on course to collide in about 4.5 billion years.',
	'One million Earths could fit inside the Sun.'
];

const spaceFactElement = document.getElementById('spaceFact');
spaceFactElement.textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		gallery.innerHTML = '<p class="message error-message">Please choose a valid date range.</p>';
		return;
	}

	gallery.innerHTML = '<p class="message loading-message">Loading space photos...</p>';
	getImagesButton.disabled = true;

	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(NASA_API_KEY)}&start_date=${startDate}&end_date=${endDate}`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || data.msg || 'NASA could not return the images.');
		}

		if (!Array.isArray(data)) {
			throw new Error('NASA returned an unexpected response. Check your API key and try again.');
		}

		const images = data.filter((item) => item.media_type === 'image' && (item.url || item.hdurl));
		displayGallery(images);
	} catch (error) {
		gallery.innerHTML = `<p class="message error-message">${error.message}</p>`;
	} finally {
		getImagesButton.disabled = false;
	}
}

function displayGallery(images) {
	if (images.length === 0) {
		gallery.innerHTML = '<p class="message">No image results were found for those dates.</p>';
		return;
	}

	gallery.innerHTML = images.map((image, index) => `
		<button class="gallery-item" type="button" data-image-index="${index}">
			<img src="${image.url || image.hdurl}" alt="${image.title}" referrerpolicy="no-referrer" onerror="this.hidden = true; this.insertAdjacentHTML('afterend', '<span class=&quot;message error-message&quot;>This NASA image could not be loaded.</span>')" />
			<span class="gallery-item-date">${image.date}</span>
			<strong>${image.title}</strong>
		</button>
	`).join('');

	gallery.querySelectorAll('.gallery-item').forEach((item, index) => {
		item.addEventListener('click', () => openModal(images[index]));
	});
}

function openModal(image) {
	modalImage.src = image.url || image.hdurl;
	modalImage.alt = image.title;
	modalDate.textContent = image.date;
	modalTitle.textContent = image.title;
	modalExplanation.textContent = image.explanation;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
	closeModalButton.focus();
}

function closeModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
}

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
		closeModal();
	}
});

// Load the default date range as soon as the page opens.
getSpaceImages();
